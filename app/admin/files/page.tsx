import { Download, File as FileIcon, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { formatDate } from "@/lib/utils";
import { FileUploader } from "@/components/dashboard/file-uploader";
import { FileCardActions } from "./_components/file-card-actions";
import { SearchFilterBar } from "@/components/shared/search-filter-bar";
import { DataPagination } from "@/components/shared/data-pagination";
import { ParamFilterSelect } from "@/components/shared/param-filter-select";
import type { Prisma } from "@prisma/client";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const fileTypeOptions = [
  { label: "Semua Tipe", value: "ALL" },
  { label: "Gambar", value: "IMAGE" },
  { label: "PDF", value: "PDF" },
  { label: "Dokumen", value: "DOCUMENT" },
];

export interface AdminFilesPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    page?: string;
  }>;
}

export default async function AdminFilesPage({
  searchParams,
}: AdminFilesPageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page) || 1);
  const PAGE_SIZE = 12;
  const q = sp?.q?.trim();
  const rawType = sp?.type?.trim()?.toUpperCase();

  const where: Prisma.FileWhereInput = {};
  if (q) {
    where.originalName = { contains: q, mode: "insensitive" };
  }

  if (rawType && rawType !== "ALL") {
    if (rawType === "IMAGE") {
      where.mimeType = { startsWith: "image/" };
    } else if (rawType === "PDF") {
      where.mimeType = { contains: "pdf" };
    } else if (rawType === "DOCUMENT") {
      where.OR = [
        { mimeType: { contains: "pdf" } },
        { mimeType: { contains: "word" } },
        { mimeType: { contains: "document" } },
        { mimeType: { contains: "text" } },
        { mimeType: { contains: "sheet" } },
      ];
    } else {
      where.mimeType = { contains: rawType.toLowerCase(), mode: "insensitive" };
    }
  }

  const [files, totalCount] = await safeDb(
    async () =>
      await Promise.all([
        prisma.file.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          include: {
            uploader: { select: { name: true } },
            project: { select: { title: true, id: true } },
          },
        }),
        prisma.file.count({ where }),
      ]),
    [[], 0]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">File Manager</h1>
        <p className="text-muted-foreground">
          Semua file yang diunggah ke platform.
        </p>
      </div>

      <FileUploader />

      <SearchFilterBar placeholder="Cari nama file..." searchParamKey="q">
        <ParamFilterSelect
          paramKey="type"
          options={fileTypeOptions}
          placeholder="Filter tipe file..."
        />
      </SearchFilterBar>

      {files.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          Belum ada file terunggah atau tidak ada file yang sesuai kriteria.
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {files.map((f) => {
              const isImage = f.mimeType.startsWith("image/");
              return (
                <Card
                  key={f.id}
                  className="p-4 transition-shadow hover:shadow-md"
                >
                  <div className="relative mb-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-muted">
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={f.url}
                        alt={f.originalName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FileIcon className="size-10 text-muted-foreground" />
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {isImage ? (
                          <ImageIcon className="size-3" />
                        ) : (
                          <FileIcon className="size-3" />
                        )}
                        {f.mimeType.split("/")[1]?.toUpperCase() ?? "FILE"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div
                      className="truncate text-sm font-medium"
                      title={f.originalName}
                    >
                      {f.originalName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatBytes(f.size)} · {formatDate(f.createdAt)}
                    </div>
                    {f.project && (
                      <div className="truncate text-xs text-muted-foreground">
                        Proyek: {f.project.title}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Upload: {f.uploader.name}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <a href={f.url} download={f.originalName}>
                        <Download className="size-3.5" />
                        Download
                      </a>
                    </Button>
                    <FileCardActions fileId={f.id} />
                  </div>
                </Card>
              );
            })}
          </div>

          <DataPagination
            currentPage={page}
            totalItems={totalCount}
            pageSize={PAGE_SIZE}
          />
        </div>
      )}
    </div>
  );
}
