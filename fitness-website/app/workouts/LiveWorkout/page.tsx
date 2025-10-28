//app\workouts\LiveWorkout\page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LiveWorkout() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [counts, setCounts] = useState({ correct: 0, incorrect: 0 });
  const [feedback, setFeedback] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const analysisInterval = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [connection, setConnection] = useState<"connecting" | "connected" | "error" | "closed">("closed");
  const [errorDetails, setErrorDetails] = useState<string>("");

  // Attempt to connect to WebSocket and handle errors properly
  const connectWebSocket = () => {
    try {
      setConnection("connecting");
      setErrorDetails("");
      
      // Close any existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      // Use http/https protocol detection to determine ws/wss
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Get the WebSocket endpoint from your render.com API
      const wsUrl = "wss://squat-analyzer-api.onrender.com/ws/live_stream";
      
      console.log(`Connecting to WebSocket at: ${wsUrl}`);
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log("WebSocket connection established");
        setConnection("connected");
        setFeedback(prev => [...prev, "Connected to analysis server"]);
        // Now that connection is established, start camera
        startCamera();
      };
      
      wsRef.current.onclose = (event) => {
        console.log(`WebSocket closed with code: ${event.code}, reason: ${event.reason}`);
        setConnection("closed");
        
        if (analyzing) {
          // This was an unexpected close during analysis
          setFeedback(prev => [...prev.slice(-4), "Connection to server lost. Please try again."]);
          setAnalyzing(false);
          stopCamera();
        }
      };
      
      wsRef.current.onerror = (event) => {
        console.log("WebSocket error occurred");
        setConnection("error");
        setErrorDetails("Could not connect to the analysis server. The server might be down or unreachable.");
        setFeedback(prev => [...prev.slice(-4), "Connection error. Please try again later."]);
      };
      
      wsRef.current.onmessage = (event) => {
        if (event.data instanceof Blob) {
          // Handle binary data (processed frame)
          handleProcessedFrame(event.data);
        } else {
          // Handle text data (JSON feedback)
          try {
            const data = JSON.parse(event.data);
            handleJsonFeedback(data);
          } catch (e) {
            console.log("Received non-JSON message:", event.data);
            // If it's a text message, just add it to feedback
            if (typeof event.data === 'string') {
              setFeedback(prev => [...prev.slice(-4), event.data]);
            }
          }
        }
      };
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
      setConnection("error");
      setErrorDetails(`Error setting up connection: ${error instanceof Error ? error.message : String(error)}`);
      setFeedback(prev => [...prev.slice(-4), "Failed to establish connection. Please try again later."]);
    }
  };

  // Handle processed frames coming back from the server
  const handleProcessedFrame = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    
    img.onload = () => {
      if (displayCanvasRef.current) {
        const ctx = displayCanvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, displayCanvasRef.current.width, displayCanvasRef.current.height);
          ctx.drawImage(img, 0, 0, displayCanvasRef.current.width, displayCanvasRef.current.height);
        }
      }
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  };

  // Handle JSON feedback from the server
  const handleJsonFeedback = (data: any) => {
    // Handle feedback messages
    if (data.feedback && typeof data.feedback === 'string') {
      setFeedback(prev => [...prev.slice(-4), data.feedback]);
    } else if (Array.isArray(data.feedback)) {
      setFeedback(prev => [...prev.slice(-4), ...data.feedback.slice(-1)]);
    }
    
    // Handle squat counting
    if (data.is_correct !== undefined) {
      setCounts(prev => {
        if (data.is_correct) {
          return { correct: prev.correct + 1, incorrect: prev.incorrect };
        } else {
          return { correct: prev.correct, incorrect: prev.incorrect + 1 };
        }
      });
    }
  };

  // Start the workout session
  const startWorkout = async () => {
    setFeedback([]);
    setCounts({ correct: 0, incorrect: 0 });
    connectWebSocket();
  };

  // Initialize camera after WebSocket is connected
  const startCamera = async () => {
    try {
      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (!videoRef.current) return;
          
          videoRef.current.play()
            .then(() => {
              console.log("Camera started successfully");
              setPermissionGranted(true);
              setAnalyzing(true);
              
              // Set canvas dimensions
              if (canvasRef.current && displayCanvasRef.current) {
                const width = videoRef.current.videoWidth || 640;
                const height = videoRef.current.videoHeight || 480;
                
                canvasRef.current.width = width;
                canvasRef.current.height = height;
                displayCanvasRef.current.width = width;
                displayCanvasRef.current.height = height;
                
                // Initial display
                const ctx = displayCanvasRef.current.getContext('2d');
                if (ctx && videoRef.current) {
                  ctx.drawImage(videoRef.current, 0, 0, width, height);
                }
              }
            })
            .catch(err => {
              console.error("Error playing video:", err);
              setFeedback(prev => [...prev, "Error starting video. Please refresh and try again."]);
            });
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setFeedback(prev => [...prev, "Camera access required. Please enable permissions and refresh."]);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // End workout: stop analysis, camera, and close connections
  const endWorkout = () => {
    setAnalyzing(false);
    
    // Clear interval
    if (analysisInterval.current) {
      clearInterval(analysisInterval.current);
      analysisInterval.current = null;
    }
    
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Stop camera
    stopCamera();
    
    // Reset states
    setPermissionGranted(false);
    setConnection("closed");
  };

  // Capture a frame and send it to the server
  const captureAndAnalyze = () => {
    if (!analyzing || !videoRef.current || !canvasRef.current || 
        !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Make sure video is playing before capturing
      if (video.readyState < 2) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      // Capture the current frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Send the frame to the server
      canvas.toBlob((blob) => {
        if (blob && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(blob);
        }
      }, "image/jpeg", 0.8);
    } catch (error) {
      console.error("Error during frame capture:", error);
    }
  };

  // Set up frame capture interval when analyzing state changes
  useEffect(() => {
    if (analyzing) {
      // Send a frame every 200ms
      analysisInterval.current = setInterval(captureAndAnalyze, 200);
    } else if (analysisInterval.current) {
      clearInterval(analysisInterval.current);
      analysisInterval.current = null;
    }
    
    return () => {
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
        analysisInterval.current = null;
      }
    };
  }, [analyzing]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      stopCamera();
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
      }
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Card className="border-primary/20 border-2">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Live Squat Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {/* Hidden video element for capturing camera input */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="hidden" 
            />
            
            {/* Hidden canvas for processing frames */}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Display canvas for showing processed frames */}
            <canvas 
              ref={displayCanvasRef} 
              className="w-full h-full" 
            />
            
            {/* Connection status overlay */}
            {connection === "connecting" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xl">
                Connecting to analysis server...
              </div>
            )}
            
            {/* Error overlay */}
            {connection === "error" && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 text-red-700 text-xl p-4 text-center">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
                  <h3 className="font-bold text-xl mb-2">Connection Error</h3>
                  <p>{errorDetails || "Could not connect to the analysis server."}</p>
                  <p className="mt-2 text-sm">Please try again later or contact support if the issue persists.</p>
                </div>
              </div>
            )}
            
            {/* Counts display */}
            <div className="absolute bottom-4 left-4 bg-black/80 p-4 rounded-lg text-white">
              <div className="flex gap-8">
                <div>
                  <p className="text-2xl font-bold text-green-400">{counts.correct}</p>
                  <p className="text-sm">Correct Squats</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">{counts.incorrect}</p>
                  <p className="text-sm">Incorrect Form</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Feedback messages */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {feedback.map((msg, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg ${
                  msg.toLowerCase().includes("good") || msg.toLowerCase().includes("correct")
                    ? "bg-green-100 text-green-800"
                    : msg.toLowerCase().includes("error") || msg.toLowerCase().includes("connection") || msg.toLowerCase().includes("incorrect")
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {msg}
              </div>
            ))}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-4 justify-center">
            {!permissionGranted ? (
              <Button
                size="lg"
                onClick={startWorkout}
                disabled={connection === "connecting"}
                className="bg-green-600 hover:bg-green-700 px-8 py-4 text-lg"
              >
                {connection === "connecting" ? "Connecting..." : "Start Workout"}
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="lg"
                onClick={endWorkout}
                className="px-8 py-4 text-lg"
              >
                End Workout
              </Button>
            )}
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/workouts")}
              className="px-8 py-4 text-lg"
            >
              Back
            </Button>
            
            {/* New Upload Workout Button */}
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push("/workouts/UploadWorkout")}
              className="px-8 py-4 text-lg"
            >
              Upload Workout
            </Button>
          </div>
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-2 bg-gray-100 text-xs rounded">
              <p>Connection status: {connection}</p>
              <p>WebSocket state: {wsRef.current ? ["CONNECTING", "OPEN", "CLOSING", "CLOSED"][wsRef.current.readyState] : "null"}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
