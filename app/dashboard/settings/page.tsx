"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: "light", label: "Terang", icon: Sun },
    { value: "dark", label: "Gelap", icon: Moon },
    { value: "system", label: "Sistem", icon: Monitor },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">
          Sesuaikan tampilan dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tema</CardTitle>
          <CardDescription>Pilih tampilan terang, gelap, atau mengikuti sistem.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {options.map((opt) => {
              const active = theme === opt.value;
              return (
                <Button
                  key={opt.value}
                  variant={active ? "default" : "outline"}
                  onClick={() => setTheme(opt.value)}
                  className={cn("h-auto flex-col gap-2 py-4", !active && "hover:border-primary/50")}
                >
                  <opt.icon className="size-5" />
                  <span className="text-sm">{opt.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifikasi</CardTitle>
          <CardDescription>
            Pengaturan notifikasi email akan hadir sebentar lagi.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
