import { Download } from "lucide-react";

import { FileUploader } from "@/components/dashboard/file-uploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export interface ProjectFileItem {
  id: string;
  originalName: string;
  size: number;
  createdAt: Date;
  url: string;
}

interface ProjectFilesTabProps {
  projectId: string;
  files: ProjectFileItem[];
}

export function ProjectFilesTab({ projectId, files }: ProjectFilesTabProps) {
  return (
    <div>
      <FileUploader projectId={projectId} />
      {files.length === 0 ? (
        <Card className="mt-4 p-10 text-center text-muted-foreground">
          Belum ada file.
        </Card>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((f) => (
            <Card key={f.id} className="p-4 transition-shadow hover:shadow-md">
              <div className="mb-1 truncate font-medium">{f.originalName}</div>
              <div className="mb-3 text-xs text-muted-foreground">
                {(f.size / 1024).toFixed(1)} KB · {formatDate(f.createdAt)}
              </div>
              <Button asChild size="sm" variant="outline" className="w-full">
                <a href={f.url} download={f.originalName}>
                  <Download className="size-3.5" /> Download
                </a>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
