"use client";

import Sidebar from "@/components/sidebarStudent";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function QRPage() {
  const qrValue = "studentId-12345"; //data dummy cugs

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />

      <div className="flex flex-col">
        <header className="flex h-14 items-center border-b bg-muted/40 px-4 lg:h-[60px]">
          <h1 className="text-lg font-semibold">QR Code</h1>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center p-6">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-center text-xl font-bold">
                QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Tunjukan QR ini kepada petugas
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
