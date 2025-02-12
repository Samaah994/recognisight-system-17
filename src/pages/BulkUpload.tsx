
import { useState } from "react";
import { Upload, FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";

const BulkUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

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
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        for (const row of jsonData) {
          const { error } = await supabase.from("profiles").insert({
            employee_id: row.employee_id,
            full_name: row.full_name,
            department: row.department.toUpperCase(),
          });

          if (error) throw error;
        }

        toast({
          title: "Success",
          description: `Successfully uploaded ${jsonData.length} users`,
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
                <li>employee_id (required)</li>
                <li>full_name (required)</li>
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
