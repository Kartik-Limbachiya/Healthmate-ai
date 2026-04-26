"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Volume2, VolumeX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthGuard from "@/lib/auth-guard";
import { useAuth } from "@/lib/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase-config";
import { speak, stopSpeaking, setTTSEnabled, getTTSEnabled } from "@/lib/tts-utils";

const INITIAL_MESSAGE = { role: "assistant", content: "Hi there! I am your AI HealthMate. Tell me about your age, weight, height, and fitness goals, and I'll find a personalized regimen for you!" };

function ChatbotContent() {
  const { user, getIdToken } = useAuth();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsState] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`chat_${user.uid}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) {
            setMessages(parsed);
          }
        } catch (e) {
          console.error("Failed to parse chat history");
        }
      }
    }
  }, [user]);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`chat_${user.uid}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleTTS = () => {
    const newState = !ttsEnabled;
    setTtsState(newState);
    setTTSEnabled(newState);
    if (!newState) stopSpeaking();
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      setMessages([INITIAL_MESSAGE]);
      if (user) localStorage.removeItem(`chat_${user.uid}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Fetch profile data if authenticated
      let profileData = null;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            profileData = userDoc.data();
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      }

      // Get Firebase ID token for server-side auth
      const idToken = await getIdToken();

      // Get local timezone start/end of day for accurate database querying
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      // Fetch today's meals directly on the client to avoid backend index/timezone mismatches
      let todaysMeals: any[] = [];
      try {
        const { collection, query, where, getDocs, Timestamp } = await import("firebase/firestore");
        const q = query(
          collection(db, "meals"),
          where("userId", "==", user.uid),
          where("date", ">=", Timestamp.fromDate(startOfDay)),
          where("date", "<=", Timestamp.fromDate(endOfDay))
        );
        const querySnapshot = await getDocs(q);
        todaysMeals = querySnapshot.docs.map(doc => doc.data());
      } catch (err) {
        console.error("Client side meals fetch failed:", err);
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          messages: newMessages,
          userId: user?.uid,
          profile: profileData,
          todaysMeals,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errMsg = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
        throw new Error(errMsg || "Failed to get response");
      }

      setMessages((prev) => [...prev, data]);

      // Speak the response if TTS is enabled
      if (ttsEnabled && data.content) {
        speak(data.content);
      }
    } catch (error: any) {
      console.error(error);

      let errorText = "Sorry, I am having trouble connecting to the server. Please try again later.";

      if (error.message?.includes('429') || error.message?.includes('Quota') || error.message?.includes('exceeded')) {
        errorText = "API Rate Limit Exceeded. The system will automatically try a backup AI provider on your next message.";
      } else if (error.message?.includes('401')) {
        errorText = "Authentication required. Please log in to use the AI Coach.";
      } else if (error.message) {
        errorText = `Error: ${error.message}`;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorText }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bot className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">HealthMate AI Coach</h1>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={clearChat}
            title="Clear Chat History"
          >
            <Trash2 className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTTS}
            title={ttsEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
          >
            {ttsEnabled ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-card border rounded-lg shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-white'}`}>
                  {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-white shadow-sm border border-white/10'}`}>
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className={`${i > 0 ? 'mt-2' : ''}`}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%] flex-row">
                <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-muted">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="p-4 rounded-lg bg-muted flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSubmit} className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell me about your fitness goals..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="h-12 w-12 shrink-0">
              <span className="sr-only">Send</span>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ChatbotPage() {
  return (
    <AuthGuard>
      <ChatbotContent />
    </AuthGuard>
  );
}

