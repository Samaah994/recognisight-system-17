
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, Camera } from "lucide-react";

const Recognition = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Fetch user's face data if it exists
  const { data: faceData } = useQuery({
    queryKey: ["faceData", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("face_data")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);
        setIsModelLoading(false);
      } catch (error) {
        console.error("Error loading models:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load face recognition models",
        });
      }
    };

    loadModels();
  }, [toast]);

  // Start video stream
  const startVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to access camera. Please check permissions.",
      });
    }
  };

  // Stop video stream
  const stopVideo = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVideo();
    };
  }, []);

  // Capture and process face
  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const detections = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No face detected. Please try again.",
        });
        return;
      }

      if (!faceData) {
        // Store face descriptor for new user
        const { error } = await supabase.from("face_data").insert({
          user_id: user?.id,
          descriptor: Array.from(detections.descriptor),
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Face data registered successfully!",
        });
      } else {
        // Compare with stored descriptor for attendance
        const storedDescriptor = new Float32Array(faceData.descriptor);
        const distance = faceapi.euclideanDistance(detections.descriptor, storedDescriptor);
        
        if (distance < 0.6) { // Threshold for face match
          const { error } = await supabase.from("attendance").insert({
            user_id: user?.id,
            status: "PRESENT",
          });

          if (error) throw error;

          toast({
            title: "Success",
            description: "Attendance marked successfully!",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Face verification failed. Please try again.",
          });
        }
      }
    } catch (error) {
      console.error("Error processing face:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while processing. Please try again.",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  if (isModelLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-gray-600">Loading face recognition models...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Face Recognition</h1>
          <p className="text-gray-600">
            {!faceData
              ? "Register your face for attendance tracking"
              : "Verify your face to mark attendance"}
          </p>
        </div>

        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
          {!stream ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button onClick={startVideo}>
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="absolute top-0 left-0" />
            </>
          )}
        </div>

        <div className="flex justify-center gap-4">
          {stream && (
            <>
              <Button
                onClick={captureFace}
                disabled={isCapturing}
                className="w-40"
              >
                {isCapturing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    {!faceData ? "Register Face" : "Mark Attendance"}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={stopVideo}
                className="w-40"
              >
                Stop Camera
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recognition;
