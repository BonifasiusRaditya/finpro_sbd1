"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/sidebarAdmin";
import DownloadIcon from "@/components/ui/DownloadIcon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function HomePage() {
  const stuntingData = [
    { month: "Nov 2023", value: 1580 },
    { month: "Dec 2023", value: 2270 },
    { month: "Jan 2024", value: 3560 },
    { month: "Feb 2024", value: 2550 },
    { month: "Mar 2024", value: 1540 },
    { month: "Apr 2024", value: 5530 },
    { month: "May 2024", value: 20520 },
    { month: "Jun 2024", value: 5510 },
    { month: "Jul 2024", value: 1505 },
    { month: "Aug 2024", value: 2503 },
    { month: "Sep 2024", value: 3501 },
    { month: "Oct 2024", value: 2000 },
    { month: "Nov 2024", value: 1000 },
  ];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />


      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px]">
          <h1 className="text-lg font-semibold">Food Distribution Report</h1>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Tabs defaultValue="chart">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chart">Graphic View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>

            {/* Graphic View */}
            <TabsContent value="chart">
              <Card>
                <CardHeader>
                  <CardTitle>Penyebaran Makanan di Indonesia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stuntingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Table View */}
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
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Jumlah</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stuntingData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.month}</TableCell>
                          <TableCell>{item.value}</TableCell>
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