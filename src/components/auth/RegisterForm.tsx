
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaceCapture } from "./FaceCapture";

interface RegisterFormProps {
  fullName: string;
  setFullName: (value: string) => void;
  employeeId: string;
  setEmployeeId: (value: string) => void;
  department: string;
  setDepartment: (value: string) => void;
  onFaceCapture: (descriptor: number[]) => void;
}

export const RegisterForm = ({
  fullName,
  setFullName,
  employeeId,
  setEmployeeId,
  department,
  setDepartment,
  onFaceCapture,
}: RegisterFormProps) => {
  return (
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
      <FaceCapture onFaceCapture={onFaceCapture} />
    </>
  );
};
