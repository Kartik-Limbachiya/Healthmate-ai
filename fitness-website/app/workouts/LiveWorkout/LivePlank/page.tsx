"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Wifi, WifiOff } from "lucide-react";
import { auth, db, rtdb } from "@/firebase-config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref as rtdbRef, get as rtdbGet, set as rtdbSet } from "firebase/database";

export default function LivePlank() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processedImgRef = useRef<HTMLImageElement>(null);

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [connection, setConnection] = useState<"connecting" | "connected" | "error" | "closed">("closed");
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("Get into plank position");
  const [hasError, setHasError] = useState(false);
  const [holdTime, setHoldTime] = useState(0);
  const [quality, setQuality] = useState(0);
  const [errorCounts, setErrorCounts] = useState({ low_back: 0, high_back: 0 });

  const analysisInterval = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;
  const sessionStartRef = useRef<number | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_EXERCISE_API_URL || "https://exercise-correction-api.onrender.com";
  const WEBSOCKET_URL = API_BASE_URL.replace("https://", "wss://").replace("http://", "ws://") + "/ws/live_plank";

  const prewarmServer = async (maxWaitMs: number = 150000) => {
    const start = Date.now();
    let attempt = 0;
    const endpoints = [`${API_BASE_URL}/health`, `${API_BASE_URL}/`];
    const fetchWithTimeout = async (url: string, timeoutMs: number) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { cache: "no-store", signal: controller.signal });
        return res.ok;
      } catch { return false; }
      finally { clearTimeout(id); }
    };
    while (Date.now() - start < maxWaitMs) {
      attempt += 1;
      const okHealth = await fetchWithTimeout(endpoints[0], 5000);
      const okRoot = okHealth ? true : await fetchWithTimeout(endpoints[1], 5000);
      if (okHealth || okRoot) return true;
      const delay = Math.min(8000, 1000 + attempt * 1000);
      await new Promise((r) => setTimeout(r, delay));
    }
    return false;
  };

  const connectWebSocket = (isRetry = false) => {
    try {
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
      setConnection("connecting");
      setErrorDetails("");
      const attemptMsg = isRetry
        ? `🔄 Retry attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts}...`
        : "🔌 Connecting to plank analysis server...";
      setFeedback((prev) => [...prev.slice(-3), attemptMsg]);

      const ws = new WebSocket(WEBSOCKET_URL);
      ws.binaryType = "blob";
      wsRef.current = ws;

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close();
          handleConnectionFailure("Connection timeout. Server may be sleeping.");
        }
      }, 120000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        setConnection("connected");
        reconnectAttempts.current = 0;
        setIsRetrying(false);
        setFeedback((prev) => [...prev.slice(-3), "✅ Connected! Starting camera..."]);
        startCamera();
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        setConnection("closed");
        if (analyzing) {
          const wasAbnormal = !event.wasClean;
          setFeedback((prev) => [...prev.slice(-3), wasAbnormal ? `⚠️ Connection lost (Code: ${event.code})` : "Connection closed"]);
          if (wasAbnormal && reconnectAttempts.current < maxReconnectAttempts) attemptReconnect();
          else endWorkout(false);
        }
      };

      ws.onerror = () => {
        clearTimeout(connectionTimeout);
        setConnection("error");
        setErrorDetails("Could not connect to server. The server might be:\n• Starting up (wait 30-60s)\n• Temporarily down");
        setFeedback((prev) => [...prev.slice(-3), "❌ Connection error"]);
      };

      ws.onmessage = (event) => {
        if (event.data instanceof Blob) {
          handleProcessedFrame(event.data);
        } else {
          try { const data = JSON.parse(event.data); handleJsonFeedback(data); }
          catch { if (typeof event.data === "string") setFeedback((prev) => [...prev.slice(-3), event.data]); }
        }
      };
    } catch (error) {
      setConnection("error");
      setErrorDetails(`Setup error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const attemptReconnect = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) { setErrorDetails("Max reconnection attempts reached."); setAnalyzing(false); return; }
    setIsRetrying(true);
    reconnectAttempts.current += 1;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 8000);
    setFeedback((prev) => [...prev.slice(-3), `Reconnecting in ${delay / 1000}s...`]);
    setTimeout(async () => { await prewarmServer(30000); connectWebSocket(true); }, delay);
  };

  const handleConnectionFailure = (reason: string) => {
    setConnection("error");
    setErrorDetails(reason);
    if (reconnectAttempts.current < maxReconnectAttempts) attemptReconnect();
  };

  const handleProcessedFrame = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    if (processedImgRef.current) {
      processedImgRef.current.onload = () => URL.revokeObjectURL(url);
      processedImgRef.current.onerror = () => URL.revokeObjectURL(url);
      processedImgRef.current.src = url;
    }
  };

  const handleJsonFeedback = (data: any) => {
    if (data.feedback) { setFeedback((prev) => [...prev.slice(-3), data.feedback]); setCurrentStatus(data.feedback); }
    if (typeof data.has_error === "boolean") setHasError(data.has_error);
    if (typeof data.hold_time === "number") setHoldTime(data.hold_time);
    if (typeof data.quality === "number") setQuality(data.quality);
    if (data.error_counts) setErrorCounts(data.error_counts);
  };

  const startWorkout = async () => {
    setFeedback(["📋 Initializing session..."]);
    setCurrentStatus("Get into plank position");
    setHasError(false);
    setHoldTime(0);
    setQuality(0);
    setErrorCounts({ low_back: 0, high_back: 0 });
    reconnectAttempts.current = 0;
    sessionStartRef.current = Date.now();

    setFeedback((prev) => [...prev.slice(-3), "🌐 Warming up server..."]);
    const warmed = await prewarmServer();
    setFeedback((prev) => [...prev.slice(-3), warmed ? "✅ Server awake. Connecting..." : "⚠️ Server might still be waking..."]);
    connectWebSocket();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 480 }, height: { ideal: 360 }, facingMode: "user" } });
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        if (!videoRef.current) return;
        videoRef.current.play().then(() => {
          setPermissionGranted(true);
          setAnalyzing(true);
          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current!.videoWidth || 480;
            canvasRef.current.height = videoRef.current!.videoHeight || 360;
          }
          setFeedback((prev) => [...prev.slice(-3), "📹 Camera active! Get into plank position!"]);
        });
      };
    } catch {
      setFeedback((prev) => [...prev, "❌ Camera access denied"]);
      setConnection("error");
      setErrorDetails("Camera access denied.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const endWorkout = (save = true) => {
    setAnalyzing(false);
    if (analysisInterval.current) { clearInterval(analysisInterval.current); analysisInterval.current = null; }
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    stopCamera();
    setPermissionGranted(false);
    setConnection("closed");
    reconnectAttempts.current = 0;
    setIsRetrying(false);
    setFeedback((prev) => [...prev.slice(-3), "✅ Session ended. Great work! 🧘"]);
    if (save) saveSession().catch((e) => console.error("[Session] Save error", e));
  };

  const saveSession = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const durationSec = sessionStartRef.current ? Math.round((Date.now() - sessionStartRef.current) / 1000) : 0;
    const calories = Math.round(durationSec * 0.07); // ~4 cal/min for plank

    await addDoc(collection(db, "workouts"), {
      userId: user.uid, type: "plank",
      holdTimeSec: holdTime, quality,
      durationSec, calories,
      errorCounts, date: serverTimestamp(),
    });

    const statsRef = rtdbRef(rtdb, `workoutStats/${user.uid}`);
    const snap = await rtdbGet(statsRef);
    const prev = snap.exists() ? snap.val() : {};
    await rtdbSet(statsRef, {
      totalSessions: (prev.totalSessions || 0) + 1,
      totalDuration: (prev.totalDuration || 0) + durationSec,
      totalCaloriesBurned: (prev.totalCaloriesBurned || 0) + calories,
      lastWorkout: new Date().toISOString(),
    });
  };

  const captureAndAnalyze = () => {
    if (!analyzing || !videoRef.current || !canvasRef.current) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (wsRef.current.bufferedAmount > 512 * 1024) return;
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.readyState < 2) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob && wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(blob);
      }, "image/jpeg", 0.6);
    } catch (error) { console.error("[Frame] Capture error:", error); }
  };

  useEffect(() => {
    if (analyzing && connection === "connected") {
      analysisInterval.current = setInterval(captureAndAnalyze, 200);
    } else {
      if (analysisInterval.current) { clearInterval(analysisInterval.current); analysisInterval.current = null; }
    }
    return () => { if (analysisInterval.current) { clearInterval(analysisInterval.current); analysisInterval.current = null; } };
  }, [analyzing, connection]);

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      stopCamera();
      if (analysisInterval.current) clearInterval(analysisInterval.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Card className="border-primary/20 border-2">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Live Plank Analyzer</CardTitle>
          <p className="text-center text-muted-foreground">Hold your plank with perfect form — AI watches your posture</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {(connection === "connecting" || isRetrying) && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                {isRetrying ? `Reconnecting... (Attempt ${reconnectAttempts.current}/${maxReconnectAttempts})` : "Connecting to server... This may take 30-60 seconds."}
              </AlertDescription>
            </Alert>
          )}

          {connection === "error" && !isRetrying && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="whitespace-pre-line">{errorDetails || "Connection error."}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden border-2 border-blue-500">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              {!permissionGranted && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                  <div className="text-center"><div className="animate-pulse text-4xl mb-2">📹</div><p>Waiting for camera...</p></div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-4 text-white text-center font-semibold flex items-center justify-center gap-2">
                {connection === "connected" ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />} Your Webcam
              </div>
            </div>

            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden border-2 border-green-500">
              <img ref={processedImgRef} className="w-full h-full object-contain bg-black" alt="Processed feed" />
              {connection === "connecting" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
                  <div className="text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto mb-2" /><p>Connecting...</p></div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-4 text-white text-center font-semibold">Processed API Feed</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-violet-100 dark:bg-violet-900/30 p-6 rounded-lg text-center border-2 border-violet-500">
              <div className="text-5xl font-bold text-violet-600 dark:text-violet-400">{formatTime(holdTime)}</div>
              <div className="text-sm text-muted-foreground mt-2">Hold Time</div>
            </div>
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-6 rounded-lg text-center border-2 border-emerald-500">
              <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{quality}%</div>
              <div className="text-sm text-muted-foreground mt-2">Form Quality</div>
            </div>
            <div className="bg-rose-100 dark:bg-rose-900/30 p-6 rounded-lg text-center border-2 border-rose-500">
              <div className="text-4xl font-bold text-rose-600 dark:text-rose-400">{errorCounts.low_back + errorCounts.high_back}</div>
              <div className="text-sm text-muted-foreground mt-2">Errors Detected</div>
            </div>
          </div>

          <div className={`p-6 rounded-lg text-center border-2 ${
            hasError
              ? "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-600 dark:text-yellow-400"
              : "bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400"
          }`}>
            <div className="text-3xl font-bold">{currentStatus}</div>
            <div className="text-sm text-muted-foreground mt-2">Current Feedback</div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-h-48 overflow-y-auto border-2">
            <h3 className="font-semibold mb-2 text-sm text-muted-foreground">📋 Feedback Log:</h3>
            <div className="space-y-1">
              {feedback.map((msg, idx) => (<div key={idx} className="text-sm p-2 rounded bg-muted">{msg}</div>))}
            </div>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            {!permissionGranted ? (
              <Button size="lg" onClick={startWorkout} disabled={connection === "connecting" || isRetrying} className="bg-violet-600 hover:bg-violet-700 px-8 py-6 text-lg font-semibold">
                {connection === "connecting" || isRetrying ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />{isRetrying ? "Reconnecting..." : "Connecting..."}</>) : (<>🚀 Start Plank Session</>)}
              </Button>
            ) : (
              <Button variant="destructive" size="lg" onClick={() => endWorkout()} className="px-8 py-6 text-lg font-semibold">⏹️ End Session</Button>
            )}
            <Button variant="outline" size="lg" onClick={() => router.push("/workouts")} className="px-8 py-6 text-lg font-semibold">⬅️ Back to Workouts</Button>
          </div>

          {!permissionGranted && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Tips for best results:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Position camera to capture your full body from the side</li>
                  <li>Keep your body in a straight line from head to heels</li>
                  <li>Engage your core and avoid letting your hips sag or pike</li>
                  <li>First connection may take 30-60 seconds while server wakes up</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
