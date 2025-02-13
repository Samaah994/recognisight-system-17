
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Camera, Loader2 } from "lucide-react";
import * as faceapi from "face-api.js";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState<string>("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsCameraActive(true);
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
        return null;
      }

      return Array.from(detections.descriptor);
    } catch (error) {
      console.error("Error capturing face:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to capture face. Please try again.",
      });
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      } else {
        let faceDescriptor = null;
        if (stream) {
          faceDescriptor = await captureFace();
          if (!faceDescriptor) {
            setIsLoading(false);
            return;
          }
        }

        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              employee_id: employeeId,
              department: department,
            },
          },
        });
        if (signUpError) throw signUpError;

        if (faceDescriptor && data.user) {
          const { error: faceDataError } = await supabase.from("face_data").insert({
            user_id: data.user.id,
            descriptor: faceDescriptor,
          });
          if (faceDataError) throw faceDataError;
        }

        toast({
          title: "Success!",
          description: "Account created successfully!",
        });
        navigate("/welcome");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
      stopCamera();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? "Sign in to your account" : "Create new account"}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="Employee ID"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select required value={department} onValueChange={setDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="FINANCE">Finance</SelectItem>
                      <SelectItem value="OPERATIONS">Operations</SelectItem>
                      <SelectItem value="SALES">Sales</SelectItem>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  {!isCameraActive ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={startCamera}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take a Picture
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
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={stopCamera}
                      >
                        Stop Camera
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isLogin ? "Sign in" : "Register"}
            </Button>
          </div>
        </form>

        <div className="text-sm text-center">
          <Button
            type="button"
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
