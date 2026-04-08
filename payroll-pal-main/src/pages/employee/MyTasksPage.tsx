import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo } from "lucide-react";

const MyTasksPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Tasks</h1>
        <p className="text-muted-foreground mt-2">Track your assigned tasks and deadlines.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-primary" />
            Assigned to Me
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Task view is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyTasksPage;
