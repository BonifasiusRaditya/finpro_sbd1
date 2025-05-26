"use Admin";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Sidebar from "@/components/sidebarAdmin";

export default function HomePage() {
  // Sample data
  const stuntingData = [
    { month: "Nov 2023", value: 21580 },
    { month: "Dec 2023", value: 21570 },
    // ... other months
    { month: "Nov 2024", value: 21500 },
  ];

  const scanResults = [
    {
      id: "001",
      date: "12/11/2024",
      time: "13:30",
      name: "Daffa A.",
      age: 5,
      menu: "Menu A",
      akg: 85,
    },
    // ... more data
  ];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px]">
          <h1 className="text-lg font-semibold">Expenses Tracker</h1>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Tabs defaultValue="chart">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chart">Graphic View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>

            <TabsContent value="chart">
              <Card>ye</Card>
            </TabsContent>

            <TabsContent value="table">
              <Card>apa</Card>
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
