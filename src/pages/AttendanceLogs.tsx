import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";

const AttendanceLogs = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: logs, isLoading } = useQuery({
    queryKey: ["attendance-logs", format(selectedDate, "yyyy-MM")],
    queryFn: async () => {
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from("attendance")
        .select(`
          *,
          profiles (
            full_name,
            employee_id,
            department
          )
        `)
        .gte("date", startOfMonth.toISOString())
        .lte("date", endOfMonth.toISOString())
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const prepareChartData = () => {
    if (!logs) return [];

    const dailyAttendance: any = {};
    logs.forEach((log) => {
      const date = format(new Date(log.date), "MMM dd");
      if (!dailyAttendance[date]) {
        dailyAttendance[date] = { date, present: 0, absent: 0 };
      }
      if (log.status === "PRESENT") {
        dailyAttendance[date].present += 1;
      } else {
        dailyAttendance[date].absent += 1;
      }
    });

    return Object.values(dailyAttendance);
  };

  const exportToExcel = () => {
    if (!logs) return;

    const data = logs.map((log) => ({
      Date: format(new Date(log.date), "yyyy-MM-dd"),
      "Employee ID": log.profiles.employee_id,
      "Full Name": log.profiles.full_name,
      Department: log.profiles.department,
      Status: log.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, `attendance-${format(selectedDate, "yyyy-MM")}.xlsx`);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Attendance Logs</h1>
        <Button onClick={exportToExcel}>
          <Download className="w-4 h-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </div>

        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Monthly Attendance Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prepareChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" />
              <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{format(new Date(log.date), "MMM dd, yyyy")}</TableCell>
                <TableCell>{log.profiles.employee_id}</TableCell>
                <TableCell>{log.profiles.full_name}</TableCell>
                <TableCell className="capitalize">{log.profiles.department.toLowerCase()}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.status === "PRESENT"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {log.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AttendanceLogs;
