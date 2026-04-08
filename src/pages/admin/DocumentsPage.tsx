import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder } from "lucide-react";

const DocumentsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Document Management</h1>
        <p className="text-muted-foreground mt-2">Manage employee documents, upload files, and secure storage.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            Company Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Document management functionality is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsPage;
