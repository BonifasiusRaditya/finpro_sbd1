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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/sidebarSchool";
import {
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";

interface FoodMenuData {
  menus: Array<{
    menu_id: string;
    name: string;
    description?: string;
    menu_date: string;
    price_per_portion: number;
    image_url?: string;
    nutritional_info?: string;
    allocation: {
      allocation_id: string;
      allocated_quantity: number;
      allocation_date: string;
      remaining_quantity: number;
    };
    distribution: {
      distributed_count: number;
      completion_rate: number;
      total_value_distributed: number;
      today_distributed: number;
      yesterday_distributed: number;
      week_distributed: number;
      avg_daily_distribution: number;
    };
    participation: {
      unique_students_served: number;
      repeat_students: number;
    };
    status: {
      menu_status: string;
      time_category: string;
    };
  }>;
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
  };
  statistics: {
    total_menus: number;
    upcoming_menus: number;
    today_menus: number;
    completed_menus: number;
    total_allocated_portions: number;
    total_distributed_portions: number;
    total_value_distributed: number;
    avg_completion_rate: number;
    overall_efficiency: string;
  };
  filters: {
    available_statuses: string[];
    sort_options: Array<{ value: string; label: string }>;
  };
}

export default function FoodMenuListPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useSchoolAuth();
  const [menuData, setMenuData] = useState<FoodMenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("allocation_date");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/school/auth/login");
      return;
    }

    if (isAuthenticated) {
      fetchMenuData();
    }
  }, [
    isLoading,
    isAuthenticated,
    router,
    currentPage,
    search,
    selectedStatus,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
  ]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await SchoolAPI.getFoodMenuList({
        page: currentPage,
        limit: 10,
        search: search || undefined,
        status: selectedStatus || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      setMenuData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menu data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: "default" as const, text: "Active", icon: Clock },
      completed: {
        variant: "secondary" as const,
        text: "Completed",
        icon: CheckCircle,
      },
      upcoming: {
        variant: "outline" as const,
        text: "Upcoming",
        icon: Calendar,
      },
      pending: {
        variant: "destructive" as const,
        text: "Pending",
        icon: Clock,
      },
    };

    const config =
      variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getTimeCategoryBadge = (category: string) => {
    const variants = {
      today: { variant: "default" as const, text: "Today" },
      tomorrow: { variant: "secondary" as const, text: "Tomorrow" },
      future: { variant: "outline" as const, text: "Future" },
      recent: { variant: "secondary" as const, text: "Recent" },
      past: { variant: "outline" as const, text: "Past" },
    };

    const config = variants[category as keyof typeof variants] || variants.past;

    return (
      <Badge variant={config.variant} className="text-xs">
        {config.text}
      </Badge>
    );
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setSelectedStatus(value === "all" ? "" : value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedStatus("");
    setDateFrom("");
    setDateTo("");
    setSortBy("allocation_date");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !menuData) {
    return null;
  }

  const { menus, pagination, statistics, filters } = menuData;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />

      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px]">
          <h1 className="text-lg font-semibold">Food Menu List</h1>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
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
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Total Menus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {statistics.total_menus}
                </div>
                <p className="text-xs text-gray-500">
                  {statistics.today_menus} today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Portions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {statistics.total_allocated_portions}
                </div>
                <p className="text-xs text-gray-500">
                  {statistics.total_distributed_portions} distributed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {statistics.overall_efficiency}%
                </div>
                <p className="text-xs text-gray-500">
                  Avg: {statistics.avg_completion_rate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(statistics.total_value_distributed)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
              <CardDescription>
                Filter menus by status, date range, or search by name
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search menus..."
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <select
                  value={selectedStatus || "all"}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Status</option>
                  {filters.available_statuses
                    .filter((s) => s !== "all")
                    .map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {filters.sort_options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <Input
                  type="date"
                  placeholder="From Date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />

                <div className="flex gap-2">
                  <Input
                    type="date"
                    placeholder="To Date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                  <Button variant="outline" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="menus" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="menus">Menu List</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </div>

            {/* Menu List Tab */}
            <TabsContent value="menus" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Food Menu Allocations</CardTitle>
                  <CardDescription>
                    Detailed view of menu allocations and distribution progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Menu</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Allocated</TableHead>
                        <TableHead>Distributed</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {menus.map((menu) => (
                        <TableRow key={menu.menu_id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{menu.name}</div>
                              {menu.description && (
                                <div className="text-sm text-gray-500">
                                  {menu.description}
                                </div>
                              )}
                              <div className="flex gap-1 mt-1">
                                {getTimeCategoryBadge(
                                  menu.status.time_category
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>
                                {formatDate(menu.allocation.allocation_date)}
                              </div>
                              <div className="text-gray-500">
                                {formatCurrency(menu.price_per_portion)}/portion
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {menu.allocation.allocated_quantity}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium text-green-600">
                                {menu.distribution.distributed_count}
                              </div>
                              <div className="text-gray-500">
                                Today: {menu.distribution.today_distributed}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${menu.distribution.completion_rate}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">
                                {menu.distribution.completion_rate.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatCurrency(
                              menu.distribution.total_value_distributed
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {menu.participation.unique_students_served}
                              </div>
                              <div className="text-gray-500">
                                +{menu.participation.repeat_students} repeat
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(menu.status.menu_status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      Showing{" "}
                      {(pagination.current_page - 1) * pagination.limit + 1} to{" "}
                      {Math.min(
                        pagination.current_page * pagination.limit,
                        pagination.total_count
                      )}{" "}
                      of {pagination.total_count} menus
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(pagination.current_page - 1)
                        }
                        disabled={!pagination.has_prev}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(pagination.current_page + 1)
                        }
                        disabled={!pagination.has_next}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Menu Status Distribution</CardTitle>
                    <CardDescription>
                      Breakdown of menu statuses
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Menus:</span>
                      <span className="font-medium text-green-600">
                        {statistics.completed_menus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Upcoming Menus:</span>
                      <span className="font-medium text-blue-600">
                        {statistics.upcoming_menus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Today&apos;s Menus:</span>
                      <span className="font-medium text-purple-600">
                        {statistics.today_menus}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribution Efficiency</CardTitle>
                    <CardDescription>
                      Overall distribution performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Overall Efficiency:</span>
                      <span className="font-medium">
                        {statistics.overall_efficiency}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Completion:</span>
                      <span className="font-medium">
                        {statistics.avg_completion_rate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Value:</span>
                      <span className="font-medium">
                        {formatCurrency(statistics.total_value_distributed)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleString("id-ID")}
          </div>
        </main>
      </div>
    </div>
  );
}
