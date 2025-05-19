"use Admin";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Corrected the path to the 'table' component

export default function DashboardPage() {
  // Sample data
  const stuntingData = [
    { month: "Nov 2023", value: 21580 },
    { month: "Dec 2023", value: 21570 },
    // ... other months
    { month: "Nov 2024", value: 21500 },
  ];

  const scanResults = [
    { id: "001", date: "12/11/2024", time: "13:30", name: "Daffa A.", age: 5, menu: "Menu A", akg: 85 },
    // ... more data
  ];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
            <h1 className="font-semibold">Nusantap</h1>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium">
              <Button variant="ghost" className="w-full justify-start">
                Cart Menu
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Hasil Scan
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Generate Menu
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Peta Prevalensi
              </Button>
              <Button className="w-full justify-start gap-2 mt-4">
                <QrCodeIcon className="h-4 w-4" />
                Scan QR Code
              </Button>
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card>
              <CardHeader className="p-2 pt-0">
                <CardTitle>Notifikasi</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <Button variant="ghost" className="w-full justify-start">
                  Bantuan
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Pengaturan
                </Button>
                <div className="mt-2 text-sm">
                  <p>Daffa A. (Jawa Barat)</p>
                  <p className="text-muted-foreground">daffa.jabar@nusantap.id</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px]">
          <h1 className="text-lg font-semibold">Nasil Scan</h1>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Tabs defaultValue="main">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="main">Tab Utama</TabsTrigger>
              <TabsTrigger value="chart">Tab Grafik</TabsTrigger>
              <TabsTrigger value="table">Tab Tabel</TabsTrigger>
            </TabsList>

            <TabsContent value="main">
              <Card>
                <CardHeader>
                  <CardTitle>Presentase Stunting 12 Bulan Terakhir</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4 overflow-x-auto py-2">
                    {stuntingData.map((item) => (
                      <div key={item.month} className="flex flex-col items-center">
                        <Badge variant="outline">{item.value}</Badge>
                        <span className="text-xs text-muted-foreground mt-1">
                          {item.month}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="table">
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>Hasil Scan</CardTitle>
                  <div className="flex gap-2">
                    <Input placeholder="Cari nama atau menu" className="w-[200px]" />
                    <Button variant="outline">Filter by date</Button>
                    <Button variant="outline">Filter by age range</Button>
                    <Button>
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Umur</TableHead>
                        <TableHead>Menu</TableHead>
                        <TableHead>%AKG Terpenuhi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scanResults.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>{item.time}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.age}</TableCell>
                          <TableCell>{item.menu}</TableCell>
                          <TableCell>{item.akg}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-sm text-muted-foreground">
            Last updated: 12/11/2024 - 13:30 WIB
          </div>
        </main>
      </div>
    </div>
  );
}

// Icons (you should import these from your icon library)
function QrCodeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  );
}

function DownloadIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}