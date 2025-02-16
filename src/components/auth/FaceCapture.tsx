
import { useRef, useState, useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import * as faceapi from "face-api.js";

interface FaceCaptureProps {
  onFaceCapture: (descriptor: number[]) => void;
}

export const FaceCapture = ({ onFaceCapture }: FaceCaptureProps) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isModelsLoading, setIsModelsLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelsLoading(false);
        console.log("Face-api models loaded successfully");
      } catch (error) {
        console.error("Error loading face-api models:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load face recognition models. Please check your internet connection.",
        });
      }
    };
    loadModels();
  }, [toast]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setStream(mediaStream);
      setIsCameraActive(true);
      console.log("Camera started successfully");
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to access camera. Please check permissions.",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const captureFace = async () => {
    if (!videoRef.current || isCapturing) return;
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

      onFaceCapture(Array.from(detections.descriptor));
    } catch (error) {
      console.error("Error capturing face:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to capture face. Please try again.",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="space-y-4">
      {!isCameraActive ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={startCamera}
          disabled={isModelsLoading}
        >
          {isModelsLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Camera className="w-4 h-4 mr-2" />
          )}
          {isModelsLoading ? "Loading models..." : "Take a Picture"}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={captureFace}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Capture Face"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={stopCamera}
            >
              Stop Camera
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
