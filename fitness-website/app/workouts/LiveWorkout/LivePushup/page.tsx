"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Wifi, WifiOff } from "lucide-react";
import { auth, db, rtdb } from "@/firebase-config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref as rtdbRef, get as rtdbGet, set as rtdbSet, update as rtdbUpdate } from "firebase/database";

export default function LivePushup() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processedImgRef = useRef<HTMLImageElement>(null);
  
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [pushupCount, setPushupCount] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentForm, setCurrentForm] = useState<string>("Fix Form");
  const [repStats, setRepStats] = useState<{ correct: number; incorrect: number }>({ correct: 0, incorrect: 0 });
  
  const analysisInterval = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;
  const [connection, setConnection] = useState<"connecting" | "connected" | "error" | "closed">("closed");
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [isRetrying, setIsRetrying] = useState(false);
  const sessionStartRef = useRef<number | null>(null);

  // WebSocket URL
  const WEBSOCKET_URL = "wss://new-pushups-analyzer-api.onrender.com/ws/live_pushup";
  const API_BASE_URL = "https://new-pushups-analyzer-api.onrender.com";

  // Pre-warm the Render server (useful for free-tier cold starts)
  const prewarmServer = async (maxWaitMs: number = 90000) => {
    const start = Date.now();
    let attempt = 0;
    const endpoints = [
      `${API_BASE_URL}/health`,
      `${API_BASE_URL}/`
    ];

    const fetchWithTimeout = async (url: string, timeoutMs: number) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
        return res.ok;
      } catch (_) {
        return false;
      } finally {
        clearTimeout(id);
      }
    };

    while (Date.now() - start < maxWaitMs) {
      attempt += 1;
      const okHealth = await fetchWithTimeout(endpoints[0], 5000);
      const okRoot = okHealth ? true : await fetchWithTimeout(endpoints[1], 5000);
      if (okHealth || okRoot) return true;
      const delay = Math.min(8000, 1000 + attempt * 1000);
      await new Promise(r => setTimeout(r, delay));
    }
    return false;
  };

  // Connect to WebSocket with improved error handling
  const connectWebSocket = (isRetry = false) => {
    try {
      // Clear any existing connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      setConnection("connecting");
      setErrorDetails("");
      
      const attemptMsg = isRetry 
        ? `🔄 Retry attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts}...`
        : "🔌 Connecting to pushup analysis server...";
      
      setFeedback(prev => [...prev.slice(-3), attemptMsg]);
      
      console.log(`[WebSocket] ${attemptMsg}`);
      console.log(`[WebSocket] Connecting to: ${WEBSOCKET_URL}`);
      
      const ws = new WebSocket(WEBSOCKET_URL);
      ws.binaryType = 'blob';
      wsRef.current = ws;

      // Set connection timeout (extended for cold starts)
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.error("[WebSocket] Connection timeout after 90s");
          ws.close();
          handleConnectionFailure("Connection timeout. Server may be sleeping.");
        }
      }, 90000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log("[WebSocket] ✅ Connection established");
        setConnection("connected");
        reconnectAttempts.current = 0; // Reset retry counter
        setIsRetrying(false);
        setFeedback(prev => [...prev.slice(-3), "✅ Connected! Starting camera..."]);
        startCamera();
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log(`[WebSocket] Closed - Code: ${event.code}, Reason: ${event.reason}, Clean: ${event.wasClean}`);
        setConnection("closed");
        
        if (analyzing) {
          const wasAbnormal = !event.wasClean;
          const msg = wasAbnormal 
            ? `⚠️ Connection lost unexpectedly (Code: ${event.code})`
            : "Connection closed";
          
          setFeedback(prev => [...prev.slice(-3), msg]);
          
          // Try to reconnect if it was abnormal closure during active session
          if (wasAbnormal && reconnectAttempts.current < maxReconnectAttempts) {
            attemptReconnect();
          } else {
            setAnalyzing(false);
            if (analysisInterval.current) {
              clearInterval(analysisInterval.current);
              analysisInterval.current = null;
            }
          }
        }
      };

      ws.onerror = (event) => {
        clearTimeout(connectionTimeout);
        // WebSocket errors are often opaque, so we provide helpful context
        console.error("[WebSocket] Error occurred:", event);
        setConnection("error");
        
        const errorMsg = "Could not connect to server. The server might be:\n" +
                        "• Starting up (wait 30-60s on free tier)\n" +
                        "• Temporarily down\n" +
                        "• Unreachable due to network issues";
        
        setErrorDetails(errorMsg);
        setFeedback(prev => [...prev.slice(-3), "❌ Connection error"]);
        
        // Don't immediately fail - the onclose handler will trigger retry logic
      };

      ws.onmessage = (event) => {
        if (event.data instanceof Blob) {
          handleProcessedFrame(event.data);
        } else {
          try {
            const data = JSON.parse(event.data);
            handleJsonFeedback(data);
          } catch (e) {
            if (typeof event.data === 'string') {
              setFeedback(prev => [...prev.slice(-3), event.data]);
            }
          }
        }
      };

    } catch (error) {
      console.error("[WebSocket] Setup error:", error);
      setConnection("error");
      const errorMsg = error instanceof Error ? error.message : String(error);
      setErrorDetails(`Setup error: ${errorMsg}`);
      setFeedback(prev => [...prev.slice(-3), "❌ Failed to establish connection"]);
    }
  };

  // Attempt to reconnect with exponential backoff
  const attemptReconnect = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      setErrorDetails("Maximum reconnection attempts reached. Please restart the session.");
      setAnalyzing(false);
      return;
    }

    setIsRetrying(true);
    reconnectAttempts.current++;
    
    // Exponential backoff: 2s, 4s, 8s
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 8000);
    
    console.log(`[WebSocket] Reconnecting in ${delay/1000}s (attempt ${reconnectAttempts.current})`);
    setFeedback(prev => [...prev.slice(-3), `Reconnecting in ${delay/1000}s...`]);
    
    setTimeout(async () => {
      await prewarmServer(30000);
      connectWebSocket(true);
    }, delay);
  };

  // Handle connection failure
  const handleConnectionFailure = (reason: string) => {
    setConnection("error");
    setErrorDetails(reason);
    setFeedback(prev => [...prev.slice(-3), `❌ ${reason}`]);
    
    if (reconnectAttempts.current < maxReconnectAttempts) {
      attemptReconnect();
    }
  };

  // Handle processed frames from server
  const handleProcessedFrame = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    
    if (processedImgRef.current) {
      processedImgRef.current.onload = () => URL.revokeObjectURL(url);
      processedImgRef.current.onerror = () => {
        console.error("[Frame] Failed to load image");
        URL.revokeObjectURL(url);
      };
      processedImgRef.current.src = url;
    }
  };

  // Handle JSON feedback
  const handleJsonFeedback = (data: any) => {
    if (data.feedback && typeof data.feedback === 'string') {
      setFeedback(prev => [...prev.slice(-3), data.feedback]);
      setCurrentForm(data.feedback);
    }
    
    if (data.count !== undefined) {
      setPushupCount(data.count);
    }

    if (typeof data.correct_reps === 'number' || typeof data.incorrect_reps === 'number') {
      setRepStats(prev => ({
        correct: typeof data.correct_reps === 'number' ? data.correct_reps : prev.correct,
        incorrect: typeof data.incorrect_reps === 'number' ? data.incorrect_reps : prev.incorrect,
      }));
    }
  };

  // Start the workout session
  const startWorkout = async () => {
    console.log("[Session] Starting workout session");
    setFeedback(["📋 Initializing session..."]);
    setPushupCount(0);
    setCurrentForm("Fix Form");
    setRepStats({ correct: 0, incorrect: 0 });
    reconnectAttempts.current = 0;
    sessionStartRef.current = Date.now();
    // Pre-warm Render server to reduce WS cold-start failures
    setFeedback(prev => [...prev.slice(-3), "🌐 Warming up server (Render free tier)..."]);
    const warmed = await prewarmServer();
    if (warmed) {
      setFeedback(prev => [...prev.slice(-3), "✅ Server awake. Connecting..."]);
    } else {
      setFeedback(prev => [...prev.slice(-3), "⚠️ Server might still be waking. Attempting connection..."]);
    }
    connectWebSocket();
  };

  // Initialize camera
  const startCamera = async () => {
    console.log("[Camera] Requesting camera access");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 480 },
          height: { ideal: 360 },
          facingMode: "user"
        }
      });
      
      console.log("[Camera] Camera access granted");
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          if (!videoRef.current) return;
          
          videoRef.current.play()
            .then(() => {
              console.log("[Camera] Video playing");
              setPermissionGranted(true);
              setAnalyzing(true);
              
              if (canvasRef.current) {
                const width = videoRef.current!.videoWidth || 480;
                const height = videoRef.current!.videoHeight || 360;
                canvasRef.current.width = width;
                canvasRef.current.height = height;
              }
              
              setFeedback(prev => [...prev.slice(-3), "📹 Camera active! Start your pushups!"]);
            })
            .catch(err => {
              console.error("[Camera] Play error:", err);
              setFeedback(prev => [...prev, "❌ Error starting video"]);
            });
        };
      }
    } catch (error) {
      console.error("[Camera] Access error:", error);
      setFeedback(prev => [...prev, "❌ Camera access denied"]);
      setConnection("error");
      setErrorDetails("Camera access denied. Please enable camera permissions.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  // End workout
  const endWorkout = () => {
    console.log("[Session] Ending workout");
    setAnalyzing(false);
    
    if (analysisInterval.current) {
      clearInterval(analysisInterval.current);
      analysisInterval.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    stopCamera();
    setPermissionGranted(false);
    setConnection("closed");
    reconnectAttempts.current = 0;
    setIsRetrying(false);
    setFeedback(prev => [...prev.slice(-3), "✅ Session ended. Great work! 💪"]);

    // Persist session data
    saveSession().catch((e) => console.error("[Session] Save error", e));
  };

  const saveSession = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const durationSec = sessionStartRef.current ? Math.round((Date.now() - sessionStartRef.current) / 1000) : 0;
    const totalReps = Math.max(pushupCount, repStats.correct + repStats.incorrect);
    const calories = Math.round(totalReps * 0.5); // simple heuristic

    // Firestore: add workout document
    await addDoc(collection(db, "workouts"), {
      userId: user.uid,
      type: "pushup",
      totalReps,
      correctReps: repStats.correct,
      incorrectReps: repStats.incorrect,
      durationSec,
      calories,
      date: serverTimestamp(),
    });

    // Realtime DB: aggregate stats
    const statsRef = rtdbRef(rtdb, `workoutStats/${user.uid}`);
    const snap = await rtdbGet(statsRef);
    const prev = snap.exists() ? snap.val() : {};
    await rtdbSet(statsRef, {
      totalSessions: (prev.totalSessions || 0) + 1,
      totalDuration: (prev.totalDuration || 0) + durationSec,
      totalCaloriesBurned: (prev.totalCaloriesBurned || 0) + calories,
      correctPostures: (prev.correctPostures || 0) + repStats.correct,
      incorrectPostures: (prev.incorrectPostures || 0) + repStats.incorrect,
      lastWorkout: new Date().toISOString(),
    });
  };

  // Capture and send frames
  const captureAndAnalyze = () => {
    if (!analyzing || !videoRef.current || !canvasRef.current) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    // Backpressure: avoid piling up unsent data
    if (wsRef.current.bufferedAmount > 512 * 1024) {
      return;
    }
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.readyState < 2) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(blob);
        }
      }, "image/jpeg", 0.6);
    } catch (error) {
      console.error("[Frame] Capture error:", error);
    }
  };

  // Frame capture interval
  useEffect(() => {
    if (analyzing && connection === "connected") {
      analysisInterval.current = setInterval(captureAndAnalyze, 200);
    } else {
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
        analysisInterval.current = null;
      }
    }
    
    return () => {
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
      }
    };
  }, [analyzing, connection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      stopCamera();
      if (analysisInterval.current) clearInterval(analysisInterval.current);
    };
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Card className="border-primary/20 border-2">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Live Pushup Analyzer</CardTitle>
          <p className="text-center text-muted-foreground">Get real-time feedback on your pushup form</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status Alert */}
          {(connection === "connecting" || isRetrying) && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                {isRetrying 
                  ? `Reconnecting... (Attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`
                  : "Connecting to server... This may take 30-60 seconds on first connection."}
              </AlertDescription>
            </Alert>
          )}

          {connection === "error" && !isRetrying && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="whitespace-pre-line">
                {errorDetails || "Connection error. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          {/* Video Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Your Webcam */}
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden border-2 border-blue-500">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover" 
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {!permissionGranted && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                  <div className="text-center">
                    <div className="animate-pulse text-4xl mb-2">📹</div>
                    <p>Waiting for camera...</p>
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-4 text-white text-center font-semibold flex items-center justify-center gap-2">
                {connection === "connected" ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                Your Webcam
              </div>
            </div>

            {/* Processed Feed */}
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden border-2 border-green-500">
              <img 
                ref={processedImgRef}
                className="w-full h-full object-cover"
                alt="Processed feed"
              />
              
              {connection === "connecting" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
                  <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2" />
                    <p>Connecting...</p>
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-4 text-white text-center font-semibold">
                Processed API Feed
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-lg text-center border-2 border-green-500">
              <div className="text-5xl font-bold text-green-600 dark:text-green-400">{Math.max(pushupCount, repStats.correct + repStats.incorrect)}</div>
              <div className="text-sm text-muted-foreground mt-2">Total Reps</div>
            </div>

            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-6 rounded-lg text-center border-2 border-emerald-500">
              <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{repStats.correct}</div>
              <div className="text-sm text-muted-foreground mt-2">Correct Reps</div>
            </div>

            <div className="bg-rose-100 dark:bg-rose-900/30 p-6 rounded-lg text-center border-2 border-rose-500">
              <div className="text-4xl font-bold text-rose-600 dark:text-rose-400">{repStats.incorrect}</div>
              <div className="text-sm text-muted-foreground mt-2">Incorrect Reps</div>
            </div>
          </div>

          <div className={`p-6 rounded-lg text-center border-2 ${
            currentForm === "Fix Form" 
              ? "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500" 
              : "bg-blue-100 dark:bg-blue-900/30 border-blue-500"
          }`}>
            <div className={`text-3xl font-bold ${
              currentForm === "Fix Form" 
                ? "text-yellow-600 dark:text-yellow-400" 
                : "text-blue-600 dark:text-blue-400"
            }`}>
              {currentForm}
            </div>
            <div className="text-sm text-muted-foreground mt-2">Current Status</div>
          </div>
          
          {/* Feedback Log */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-h-48 overflow-y-auto border-2">
            <h3 className="font-semibold mb-2 text-sm text-muted-foreground flex items-center">
              📋 Feedback Log:
            </h3>
            <div className="space-y-1">
              {feedback.map((msg, idx) => (
                <div key={idx} className="text-sm p-2 rounded bg-muted">
                  {msg}
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            {!permissionGranted ? (
              <Button
                size="lg"
                onClick={startWorkout}
                disabled={connection === "connecting" || isRetrying}
                className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg font-semibold"
              >
                {connection === "connecting" || isRetrying ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isRetrying ? "Reconnecting..." : "Connecting..."}
                  </>
                ) : (
                  <>🚀 Start Pushup Session</>
                )}
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="lg"
                onClick={endWorkout}
                className="px-8 py-6 text-lg font-semibold"
              >
                ⏹️ End Session
              </Button>
            )}
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/workouts")}
              className="px-8 py-6 text-lg font-semibold"
            >
              ⬅️ Back to Workouts
            </Button>
          </div>

          {/* Instructions */}
          {!permissionGranted && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Tips for best results:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Position yourself in side view so full body is visible</li>
                  <li>Ensure good lighting</li>
                  <li>First connection may take 30-60 seconds (free tier server)</li>
                  <li>Keep your body aligned during pushups</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 