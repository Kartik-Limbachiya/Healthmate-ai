"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { auth } from "@/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi there! I am your AI HealthMate. Tell me about your age, weight, height, and fitness goals, and I'll find a personalized regimen for you!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          messages: newMessages,
          userId: userId
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Handle when google API throws a deeply nested JSON error object
        const errMsg = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
        throw new Error(errMsg || "Failed to get response");
      }
      setMessages((prev) => [...prev, data]);
    } catch (error: any) {
      console.error(error);
      
      let errorText = "Sorry, I am having trouble connecting to the server. Please try again later.";
      
      // Check for Gemini API quota limits
      if (error.message.includes('429') || error.message.includes('Quota') || error.message.includes('exceeded')) {
        errorText = "API Rate Limit Exceeded: The Google Gemini API key has run out of its free quota. Please wait a minute or upgrade your billing details.";
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
      <div className="flex items-center space-x-2 mb-6">
        <Bot className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">HealthMate AI Coach</h1>
      </div>
      
      <div className="flex-1 bg-card border rounded-lg shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
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
