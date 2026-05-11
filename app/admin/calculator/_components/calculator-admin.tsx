"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import {
  upsertProjectType, deleteProjectType,
  upsertFeatureOption, deleteFeatureOption,
  upsertAddOnOption, deleteAddOnOption,
  updateCalculatorConfig,
} from "@/lib/actions/calculator";

type Props = {
  data: {
    projectTypes: any[];
    features: any[];
    addOns: any[];
    config: any;
  };
};

export function CalculatorAdmin({ data }: Props) {
  return (
    <Tabs defaultValue="types">
      <TabsList>
        <TabsTrigger value="types">Jenis Proyek</TabsTrigger>
        <TabsTrigger value="features">Fitur</TabsTrigger>
        <TabsTrigger value="addons">Add-On</TabsTrigger>
        <TabsTrigger value="config">Pengaturan</TabsTrigger>
      </TabsList>

      <TabsContent value="types" className="mt-4">
        <ProjectTypesTab items={data.projectTypes} />
      </TabsContent>
      <TabsContent value="features" className="mt-4">
        <FeaturesTab items={data.features} projectTypes={data.projectTypes} />
      </TabsContent>
      <TabsContent value="addons" className="mt-4">
        <AddOnsTab items={data.addOns} />
      </TabsContent>
      <TabsContent value="config" className="mt-4">
        <ConfigTab config={data.config} />
      </TabsContent>
    </Tabs>
  );
}

// --- Project Types Tab ---
function ProjectTypesTab({ items }: { items: any[] }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<any>(null);

  function handleSubmit(fd: FormData) {
    const depFields = fd.get("dependentFields") as string;
    start(async () => {
      await upsertProjectType(editing?.id ?? null, {
        name: fd.get("name") as string,
        slug: fd.get("slug") as string,
        description: fd.get("description") as string,
        basePrice: Number(fd.get("basePrice")),
        icon: fd.get("icon") as string || "code2",
        dependentFields: depFields ? JSON.parse(depFields) : [],
        order: Number(fd.get("order") || 0),
        active: true,
      });
      toast.success(editing ? "Diperbarui" : "Ditambahkan");
      setEditing(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Hapus jenis proyek ini?")) return;
    start(async () => { await deleteProjectType(id); toast.success("Dihapus"); });
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <form action={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div><Label>Nama</Label><Input name="name" required defaultValue={editing?.name} key={editing?.id + "n"} /></div>
          <div><Label>Slug</Label><Input name="slug" required defaultValue={editing?.slug} key={editing?.id + "s"} /></div>
          <div><Label>Base Price</Label><Input name="basePrice" type="number" required defaultValue={editing?.basePrice} key={editing?.id + "p"} /></div>
          <div><Label>Icon</Label><Input name="icon" defaultValue={editing?.icon || "code2"} key={editing?.id + "i"} /></div>
          <div className="sm:col-span-2"><Label>Deskripsi</Label><Input name="description" defaultValue={editing?.description} key={editing?.id + "d"} /></div>
          <div><Label>Order</Label><Input name="order" type="number" defaultValue={editing?.order || 0} key={editing?.id + "o"} /></div>
          <div className="sm:col-span-2 lg:col-span-4">
            <Label>Dependent Fields (JSON)</Label>
            <Textarea name="dependentFields" rows={3} defaultValue={editing?.dependentFields ? JSON.stringify(editing.dependentFields, null, 2) : "[]"} key={editing?.id + "df"} className="font-mono text-xs" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>{pending && <Loader2 className="size-4 animate-spin" />}{editing ? "Update" : "Tambah"}</Button>
            {editing && <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Batal</Button>}
          </div>
        </form>
      </Card>
      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="font-medium">{item.name} <Badge variant="secondary" className="ml-2">{formatCurrency(Number(item.basePrice))}</Badge></div>
              <div className="text-xs text-muted-foreground">{item.slug} • {item.description}</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(item)}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}><Trash2 className="size-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// --- Features Tab ---
function FeaturesTab({ items, projectTypes }: { items: any[]; projectTypes: any[] }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<any>(null);

  function handleSubmit(fd: FormData) {
    start(async () => {
      await upsertFeatureOption(editing?.id ?? null, {
        name: fd.get("name") as string,
        description: fd.get("description") as string || undefined,
        price: Number(fd.get("price")),
        isMajor: fd.get("isMajor") === "on",
        disclaimer: fd.get("disclaimer") as string || undefined,
        projectTypeId: fd.get("projectTypeId") as string || null,
        order: Number(fd.get("order") || 0),
        active: true,
      });
      toast.success(editing ? "Diperbarui" : "Ditambahkan");
      setEditing(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Hapus fitur ini?")) return;
    start(async () => { await deleteFeatureOption(id); toast.success("Dihapus"); });
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <form action={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div><Label>Nama</Label><Input name="name" required defaultValue={editing?.name} key={editing?.id + "n"} /></div>
          <div><Label>Harga</Label><Input name="price" type="number" required defaultValue={editing?.price} key={editing?.id + "p"} /></div>
          <div><Label>Order</Label><Input name="order" type="number" defaultValue={editing?.order || 0} key={editing?.id + "o"} /></div>
          <div><Label>Deskripsi</Label><Input name="description" defaultValue={editing?.description} key={editing?.id + "d"} /></div>
          <div>
            <Label>Jenis Proyek (opsional)</Label>
            <select name="projectTypeId" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" defaultValue={editing?.projectTypeId || ""} key={editing?.id + "pt"}>
              <option value="">Semua</option>
              {projectTypes.map((pt) => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isMajor" defaultChecked={editing?.isMajor} key={editing?.id + "m"} /> Major</label>
          </div>
          <div className="sm:col-span-2 lg:col-span-3"><Label>Disclaimer</Label><Textarea name="disclaimer" rows={2} defaultValue={editing?.disclaimer} key={editing?.id + "dis"} /></div>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>{pending && <Loader2 className="size-4 animate-spin" />}{editing ? "Update" : "Tambah"}</Button>
            {editing && <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Batal</Button>}
          </div>
        </form>
      </Card>
      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="flex items-center gap-2 font-medium">
                {item.name}
                {item.isMajor && <Badge className="bg-amber-500 text-white"><Star className="size-3" /> Major</Badge>}
                <Badge variant="secondary">{formatCurrency(Number(item.price))}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">{item.projectType?.name || "Semua"} • {item.description || "-"}</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(item)}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}><Trash2 className="size-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// --- Add-Ons Tab ---
function AddOnsTab({ items }: { items: any[] }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<any>(null);

  function handleSubmit(fd: FormData) {
    start(async () => {
      await upsertAddOnOption(editing?.id ?? null, {
        name: fd.get("name") as string,
        description: fd.get("description") as string || undefined,
        pricePerMonth: Number(fd.get("pricePerMonth")),
        minMonths: Number(fd.get("minMonths") || 1),
        maxMonths: Number(fd.get("maxMonths") || 12),
        order: Number(fd.get("order") || 0),
        active: true,
      });
      toast.success(editing ? "Diperbarui" : "Ditambahkan");
      setEditing(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Hapus add-on ini?")) return;
    start(async () => { await deleteAddOnOption(id); toast.success("Dihapus"); });
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <form action={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div><Label>Nama</Label><Input name="name" required defaultValue={editing?.name} key={editing?.id + "n"} /></div>
          <div><Label>Harga/Bulan</Label><Input name="pricePerMonth" type="number" required defaultValue={editing?.pricePerMonth} key={editing?.id + "p"} /></div>
          <div><Label>Min Bulan</Label><Input name="minMonths" type="number" defaultValue={editing?.minMonths || 1} key={editing?.id + "min"} /></div>
          <div><Label>Max Bulan</Label><Input name="maxMonths" type="number" defaultValue={editing?.maxMonths || 12} key={editing?.id + "max"} /></div>
          <div><Label>Order</Label><Input name="order" type="number" defaultValue={editing?.order || 0} key={editing?.id + "o"} /></div>
          <div className="sm:col-span-2 lg:col-span-3"><Label>Deskripsi</Label><Input name="description" defaultValue={editing?.description} key={editing?.id + "d"} /></div>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>{pending && <Loader2 className="size-4 animate-spin" />}{editing ? "Update" : "Tambah"}</Button>
            {editing && <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Batal</Button>}
          </div>
        </form>
      </Card>
      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="font-medium">{item.name} <Badge variant="secondary">{formatCurrency(Number(item.pricePerMonth))}/bulan</Badge></div>
              <div className="text-xs text-muted-foreground">{item.minMonths}-{item.maxMonths} bulan • {item.description || "-"}</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(item)}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}><Trash2 className="size-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// --- Config Tab ---
function ConfigTab({ config }: { config: any }) {
  const [pending, start] = useTransition();

  function handleSubmit(fd: FormData) {
    start(async () => {
      await updateCalculatorConfig({
        featureDisclaimer: fd.get("featureDisclaimer") as string,
        revisionPolicy: fd.get("revisionPolicy") as string,
        freeRevisions: Number(fd.get("freeRevisions")),
        revisionPricePerItem: Number(fd.get("revisionPricePerItem")),
        urgencyMultiplier: Number(fd.get("urgencyMultiplier")),
        urgencyThresholdDays: Number(fd.get("urgencyThresholdDays")),
      });
      toast.success("Pengaturan disimpan");
    });
  }

  return (
    <Card className="p-4">
      <form action={handleSubmit} className="space-y-4 max-w-2xl">
        <div><Label>Disclaimer Fitur</Label><Textarea name="featureDisclaimer" rows={4} defaultValue={config?.featureDisclaimer || ""} /></div>
        <div><Label>Kebijakan Revisi</Label><Textarea name="revisionPolicy" rows={5} defaultValue={config?.revisionPolicy || ""} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Jatah Revisi Gratis</Label><Input name="freeRevisions" type="number" defaultValue={config?.freeRevisions ?? 2} /></div>
          <div><Label>Harga Revisi/Fitur</Label><Input name="revisionPricePerItem" type="number" defaultValue={config?.revisionPricePerItem ?? 300000} /></div>
          <div><Label>Multiplier Urgent (x)</Label><Input name="urgencyMultiplier" type="number" step="0.1" defaultValue={config?.urgencyMultiplier ?? 1.5} /></div>
          <div><Label>Threshold Urgent (hari)</Label><Input name="urgencyThresholdDays" type="number" defaultValue={config?.urgencyThresholdDays ?? 14} /></div>
        </div>
        <Button type="submit" disabled={pending}>{pending && <Loader2 className="size-4 animate-spin" />}Simpan Pengaturan</Button>
      </form>
    </Card>
  );
}
