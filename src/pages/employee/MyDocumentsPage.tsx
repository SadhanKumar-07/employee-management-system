import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder } from "lucide-react";

const MyDocumentsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Documents</h1>
        <p className="text-muted-foreground mt-2">View and upload your personal documents.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            Your Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Document view is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyDocumentsPage;
