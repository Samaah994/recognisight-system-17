
import { useState } from "react";
import { Upload, FileUp, Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

interface ExcelRow {
  email: string;
  password: string;
  full_name: string;
  employee_id: string;
  department: string;
}

const BulkUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

        let successCount = 0;
        let errorCount = 0;

        for (const row of jsonData) {
          try {
            // Sign up user with Supabase Auth
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
              email: row.email,
              password: row.password,
              options: {
                data: {
                  full_name: row.full_name,
                  employee_id: row.employee_id,
                  department: row.department.toUpperCase(),
                },
              },
            });

            if (signUpError) throw signUpError;

            if (authData.user) {
              // Create profile entry
              const { error: profileError } = await supabase.from("profiles").insert({
                id: authData.user.id,
                full_name: row.full_name,
                employee_id: row.employee_id,
                department: row.department.toUpperCase() as "IT" | "HR" | "FINANCE" | "OPERATIONS" | "MARKETING" | "SALES" | "ADMIN",
              });

              if (profileError) throw profileError;

              // Mark initial attendance
              const { error: attendanceError } = await supabase.from("attendance").insert({
                user_id: authData.user.id,
                status: "PRESENT",
                date: new Date().toISOString().split('T')[0],
              });

              if (attendanceError) throw attendanceError;

              successCount++;
            }
          } catch (error) {
            console.error("Error processing row:", row, error);
            errorCount++;
          }
        }

        toast({
          title: "Upload Complete",
          description: `Successfully processed ${successCount} users. ${errorCount} errors encountered.`,
        });
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Error uploading users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload users",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bulk Upload Users</h1>
        <Button onClick={() => navigate("/")}>
          <Home className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="max-w-xl mx-auto mt-8">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Upload className="w-12 h-12 text-gray-400" />
            <div className="text-center">
              <h3 className="text-lg font-medium">Upload Excel File</h3>
              <p className="text-sm text-gray-500 mt-1">
                Upload an Excel file containing user data
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="file-upload">
                <Button disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FileUp className="w-4 h-4 mr-2" />
                      Select File
                    </>
                  )}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium mb-4">Instructions</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Prepare an Excel file with the following columns:
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>email (required)</li>
                <li>password (required)</li>
                <li>full_name (required)</li>
                <li>employee_id (required)</li>
                <li>department (required)</li>
              </ul>
            </li>
            <li>Ensure all required fields are filled</li>
            <li>Department should be one of: IT, HR, FINANCE, OPERATIONS, MARKETING, SALES, ADMIN</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;
