"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { StudentAPI } from "@/services/StudentAPI";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Sidebar from "@/components/sidebarStudent";

interface MealHistoryItem {
  id: string;
  received_at: string;
  menu_name: string;
  menu_description?: string;
  menu_date: string;
  price_per_portion: number;
  menu_image_url?: string;
  allocation_quantity: number;
  allocation_date: string;
}

interface MealStatistics {
  total_meals_claimed: number;
  meals_today: number;
  meals_this_week: number;
  meals_this_month: number;
  total_value: number;
}

interface AvailableMenu {
  allocation_id: string;
  menu_id: string;
  menu_name: string;
  menu_description?: string;
  menu_date: string;
  price_per_portion: number;
  menu_image_url?: string;
  total_quantity: number;
  distributed_count: number;
  available_quantity: number;
  allocation_date: string;
  already_claimed: boolean;
}

export default function StudentHomePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useStudentAuth();
  const [mealHistory, setMealHistory] = useState<MealHistoryItem[]>([]);
  const [statistics, setStatistics] = useState<MealStatistics | null>(null);
  const [availableMenus, setAvailableMenus] = useState<AvailableMenu[]>([]);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/student/auth/login");
      return;
    }

    if (isAuthenticated && user) {
      fetchDashboardData();
    }
  }, [isLoading, isAuthenticated, user, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch meal history and available menus in parallel
      const [historyData, menusData] = await Promise.all([
        StudentAPI.getMealHistory({ limit: 10 }),
        StudentAPI.getAvailableMenus(),
      ]);

      setMealHistory(historyData.meal_history);
      setStatistics(historyData.statistics);
      setAvailableMenus(menusData.available_menus);
      setHasClaimedToday(menusData.has_claimed_today);
      setCanClaim(menusData.can_claim);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar user={user} />
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user.name}!
              </h1>
              <p className="text-gray-600 mt-1">
                Student Dashboard - MBGku (Makan Bergizi Gratis)
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Badge variant="outline" className="text-sm">
                {user.student_number} • {user.class} • Grade {user.grade}
              </Badge>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Meals Claimed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {statistics.total_meals_claimed}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {statistics.meals_this_month}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {statistics.meals_this_week}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* QR Code Action */}
        <Card>
          <CardHeader>
            <CardTitle>Meal Claim QR Code</CardTitle>
            <CardDescription>
              Generate your QR code to claim today&apos;s meal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                <p>• QR Format: mbgku-{user.student_number}</p>
                <p>• Valid for today only</p>
                <p>• One meal per day limit</p>
              </div>
              <a
                href="/student/qr"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2"
              >
                Generate QR Code
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="today" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">Today&apos;s Menu</TabsTrigger>
            <TabsTrigger value="history">Meal History</TabsTrigger>
          </TabsList>

          {/* Today's Menu Tab */}
          <TabsContent value="today" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Today&apos;s Available Menus</CardTitle>
                <CardDescription>
                  {hasClaimedToday
                    ? "You have already claimed your meal for today"
                    : canClaim
                    ? "Available menus for today - you can claim one meal"
                    : "No menus available for today"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availableMenus.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableMenus.map((menu) => (
                      <Card key={menu.allocation_id} className="relative">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">
                              {menu.menu_name}
                            </CardTitle>
                            {menu.already_claimed && (
                              <Badge variant="secondary">Claimed</Badge>
                            )}
                          </div>
                          <CardDescription>
                            {menu.menu_description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Price per portion:</span>
                              <span className="font-medium">
                                {formatCurrency(menu.price_per_portion)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Available:</span>
                              <span className="font-medium">
                                {menu.available_quantity} /{" "}
                                {menu.total_quantity}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (menu.available_quantity /
                                      menu.total_quantity) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No menus available for today</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meal History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Meal History</CardTitle>
                <CardDescription>
                  Your recent meal claims and nutrition intake
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mealHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date Claimed</TableHead>
                        <TableHead>Menu</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mealHistory.map((meal) => (
                        <TableRow key={meal.id}>
                          <TableCell>
                            {formatDateTime(meal.received_at)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {meal.menu_name}
                          </TableCell>
                          <TableCell>
                            {meal.menu_description || "No description"}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(meal.price_per_portion)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No meal history found</p>
                    <p className="text-sm">
                      Start claiming meals to see your history here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
