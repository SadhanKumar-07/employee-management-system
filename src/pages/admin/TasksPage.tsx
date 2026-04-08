import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo } from "lucide-react";

const TasksPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Task & Project Management</h1>
        <p className="text-muted-foreground mt-2">Assign tasks to employees, track progress, and set deadlines.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-primary" />
            Active Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Task management functionality is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksPage;
