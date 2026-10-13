"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createProjectAction,
  type ProjectActionState,
} from "@/lib/actions/project";
import { ADMIN_ROUTES } from "@/lib/routes";

export function ProjectCreateForm({
  clients,
}: {
  clients: { id: string; name: string; email: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const empty: ProjectActionState = { ok: false };
      const result = await createProjectAction(empty, fd);
      if (result.ok && result.projectId) {
        toast.success(result.message ?? "Proyek dibuat");
        router.push(ADMIN_ROUTES.projectDetail(result.projectId));
        router.refresh();
      } else {
        toast.error(result.message ?? "Gagal");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-3xl space-y-5 p-6">
        <div className="space-y-2">
          <Label htmlFor="title">Judul proyek</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="Misal: Website E-Commerce"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            required
            placeholder="Jelaskan scope dan tujuan proyek..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientId">Client</Label>
          <Select name="clientId" required>
            <SelectTrigger id="clientId">
              <SelectValue placeholder="Pilih client…" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}, {c.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              placeholder="Pilih tanggal deadline"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Budget (IDR)</Label>
            <Input
              id="budget"
              name="budget"
              type="number"
              placeholder="25000000"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} size="lg">
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Menyimpan…
              </>
            ) : (
              "Buat Proyek"
            )}
          </Button>
        </div>
      </Card>
    </form>
  );
}
