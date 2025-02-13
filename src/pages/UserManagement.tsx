
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, Loader2, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const markAttendance = async (userId: string, status: string) => {
    try {
      const { error } = await supabase.from("attendance").insert({
        user_id: userId,
        status: status,
        date: new Date().toISOString().split('T')[0],
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Attendance marked as ${status.toLowerCase()}`,
      });
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark attendance",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <div className="flex gap-4">
            <Button onClick={() => navigate("/")}>
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button onClick={() => window.location.href = "/register"}>
              Add New User
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.employee_id}</TableCell>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell className="capitalize">{user.department.toLowerCase()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600"
                        onClick={() => markAttendance(user.id, "PRESENT")}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => markAttendance(user.id, "ABSENT")}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
