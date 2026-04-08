import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

const PerformancePage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Performance Management</h1>
        <p className="text-muted-foreground mt-2">Track employee reviews, ratings, and feedback.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Employee Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Performance review functionality is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformancePage;
