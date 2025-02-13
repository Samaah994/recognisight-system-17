
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

const Welcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50/50">
      <h1 className="text-4xl font-bold mb-4">Welcome, {user?.user_metadata.full_name}!</h1>
      <p className="text-xl text-gray-600 mb-8">You have successfully registered.</p>
      <Button onClick={() => navigate("/")} className="flex items-center gap-2">
        <Home className="w-4 h-4" />
        Go to Dashboard
      </Button>
    </div>
  );
};

export default Welcome;
