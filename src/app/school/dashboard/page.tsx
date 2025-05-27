"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSchoolAuth } from "@/hooks/useSchoolAuth";
import { SchoolAPI } from "@/services/SchoolAPI";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Sidebar from "@/components/sidebarSchool";
import Link from "next/link";

interface SchoolDashboardData {
  school: {
    id: string;
    name: string;
    npsn: string;
    school_id: string;
  };
  statistics: {
    total_students: number;
    active_allocations: number;
    total_quantity_allocated: number;
    total_distributed: number;
    total_available: number;
    meals_today: number;
    meals_this_week: number;
    meals_this_month: number;
  };
  allocations: Array<{
    allocation_id: string;
    menu_id: string;
    menu_name: string;
    menu_description?: string;
    menu_date: string;
    menu_image_url?: string;
    total_quantity: number;
    distributed_count: number;
    available_quantity: number;
    allocation_date: string;
  }>;
  last_updated: string;
}

export default function SchoolDashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useSchoolAuth();
  const [dashboardData, setDashboardData] =
    useState<SchoolDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/school/auth/login");
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

      const data = await SchoolAPI.getDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  const getProgressPercentage = (distributed: number, total: number) => {
    return total > 0 ? Math.round((distributed / total) * 100) : 0;
  };

  const getStatusBadge = (available: number, total: number) => {
    const percentage = getProgressPercentage(total - available, total);
    if (percentage === 100)
      return { variant: "secondary" as const, text: "Completed" };
    if (percentage >= 50)
      return { variant: "default" as const, text: "In Progress" };
    if (percentage > 0) return { variant: "outline" as const, text: "Started" };
    return { variant: "destructive" as const, text: "Not Started" };
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !dashboardData) {
    return null;
  }

  const { school, statistics, allocations } = dashboardData;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />

      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px]">
          <h1 className="text-lg font-semibold">School Dashboard</h1>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {school.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  School Dashboard - MBGku (Makan Bergizi Gratis)
                </p>
              </div>
              <div className="mt-4 md:mt-0 space-y-2">
                <Badge variant="outline" className="text-sm block">
                  NPSN: {school.npsn}
                </Badge>
                <Badge variant="outline" className="text-sm block">
                  ID: {school.school_id}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {statistics.total_students}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Meals Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {statistics.meals_today}
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

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {statistics.meals_this_month}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Active Allocations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">
                  {statistics.active_allocations}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Distributed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {statistics.total_distributed}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Available Meals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {statistics.total_available}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks for meal distribution management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/school/scan">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Scan QR Code
                  </Button>
                </Link>
                <Link href="/school/foodmenu">
                  <Button variant="outline" className="w-full">
                    View Menus
                  </Button>
                </Link>
                <Link href="/school/createaccount">
                  <Button variant="outline" className="w-full">
                    Add Student
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="allocations" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="allocations">Menu Allocations</TabsTrigger>
              <TabsTrigger value="overview">Distribution Overview</TabsTrigger>
            </TabsList>

            {/* Menu Allocations Tab */}
            <TabsContent value="allocations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Menu Allocations</CardTitle>
                  <CardDescription>
                    Current menu allocations and distribution status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {allocations.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Menu</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Allocated</TableHead>
                          <TableHead>Distributed</TableHead>
                          <TableHead>Available</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allocations.map((allocation) => {
                          const progress = getProgressPercentage(
                            allocation.distributed_count,
                            allocation.total_quantity
                          );
                          const status = getStatusBadge(
                            allocation.available_quantity,
                            allocation.total_quantity
                          );

                          return (
                            <TableRow key={allocation.allocation_id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {allocation.menu_name}
                                  </div>
                                  {allocation.menu_description && (
                                    <div className="text-sm text-gray-500">
                                      {allocation.menu_description}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {formatDate(allocation.allocation_date)}
                              </TableCell>
                              <TableCell className="font-medium">
                                {allocation.total_quantity}
                              </TableCell>
                              <TableCell className="font-medium text-green-600">
                                {allocation.distributed_count}
                              </TableCell>
                              <TableCell className="font-medium text-blue-600">
                                {allocation.available_quantity}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {progress}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={status.variant}>
                                  {status.text}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No menu allocations found</p>
                      <p className="text-sm">
                        Contact your provincial government for menu allocations
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Distribution Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribution Summary</CardTitle>
                    <CardDescription>
                      Overall meal distribution statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Total Allocated:
                      </span>
                      <span className="font-medium">
                        {statistics.total_quantity_allocated}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Total Distributed:
                      </span>
                      <span className="font-medium text-green-600">
                        {statistics.total_distributed}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Remaining:</span>
                      <span className="font-medium text-blue-600">
                        {statistics.total_available}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Distribution Rate:
                      </span>
                      <span className="font-medium">
                        {getProgressPercentage(
                          statistics.total_distributed,
                          statistics.total_quantity_allocated
                        )}
                        %
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest meal distribution activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="text-gray-600">Today:</span>
                        <span className="ml-2 font-medium">
                          {statistics.meals_today} meals distributed
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">This Week:</span>
                        <span className="ml-2 font-medium">
                          {statistics.meals_this_week} meals distributed
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">This Month:</span>
                        <span className="ml-2 font-medium">
                          {statistics.meals_this_month} meals distributed
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="ml-2 font-medium">
                          {formatDateTime(dashboardData.last_updated)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
