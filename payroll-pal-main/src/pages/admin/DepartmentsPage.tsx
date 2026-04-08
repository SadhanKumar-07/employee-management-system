import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";

const DepartmentsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Departments & Roles</h1>
        <p className="text-muted-foreground mt-2">Manage organizational departments and assign roles.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Active Departments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Department management functionality is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentsPage;
