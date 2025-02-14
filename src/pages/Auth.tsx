
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        navigate("/welcome");
      } else {
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

        if (data.user) {
          // Add user profile with the correct department type
          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            full_name: fullName,
            employee_id: employeeId,
            department: department as "IT" | "HR" | "FINANCE" | "OPERATIONS" | "MARKETING" | "SALES" | "ADMIN",
          });
          if (profileError) throw profileError;

          // Mark attendance as present
          const { error: attendanceError } = await supabase.from("attendance").insert({
            user_id: data.user.id,
            status: "PRESENT",
            date: new Date().toISOString().split('T')[0],
          });
          if (attendanceError) throw attendanceError;
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
