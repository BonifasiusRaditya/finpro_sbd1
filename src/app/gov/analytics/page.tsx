"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGovernmentAuth } from "@/hooks/useGovernmentAuth";
import { GovernmentAPI } from "@/services/GovernmentAPI";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import GovernmentSidebar from "@/components/sidebarGovernment";

interface AnalyticsData {
  overview: {
    total_schools: number;
    total_students: number;
    total_menus: number;
    active_menus: number;
    total_allocations: number;
    active_allocations: number;
    total_distributions: number;
    unique_students_served: number;
    total_portions_allocated: number;
    total_budget_allocated: number;
    avg_menu_price: number;
  };
  recent_activity: {
    new_schools_30d: number;
    new_students_30d: number;
    new_menus_30d: number;
    new_allocations_30d: number;
    today_distributions: number;
    week_distributions: number;
    month_distributions: number;
  };
  efficiency: {
    distribution_rate: number;
    student_participation_rate: number;
    budget_utilization: number;
    avg_cost_per_meal: number;
  };
  trends: Array<{
    month: string;
    distributions: number;
    unique_students: number;
    total_value: number;
  }>;
  top_schools: Array<{
    id: string;
    name: string;
    npsn: string;
    total_distributions: number;
    unique_students_served: number;
    total_students: number;
    participation_rate: number;
  }>;
  menu_popularity: Array<{
    id: string;
    name: string;
    date: string;
    price_per_portion: number;
    distribution_count: number;
    total_allocated: number;
    utilization_rate: number;
  }>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useGovernmentAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/gov/auth/login");
      return;
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalytics();
    }
  }, [isAuthenticated, startDate, endDate]);

  const loadAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true);
      setError("");
      const data = await GovernmentAPI.getAnalytics({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setAnalytics(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load analytics"
      );
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <GovernmentSidebar />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px]">
          <h1 className="text-lg font-semibold">Analytics Dashboard</h1>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Analytics Overview</h2>
              <p className="text-muted-foreground">
                Comprehensive insights into the Free Nutritious Meals program
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
              <Input
                type="date"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
              <Button variant="outline" onClick={loadAnalytics}>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {isLoadingAnalytics ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : analytics ? (
            <>
              {/* Overview Statistics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Schools
                    </CardTitle>
                    <svg
                      className="h-4 w-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.overview.total_schools}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{analytics.recent_activity.new_schools_30d} this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Students
                    </CardTitle>
                    <svg
                      className="h-4 w-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.overview.total_students.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{analytics.recent_activity.new_students_30d} this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Distributions
                    </CardTitle>
                    <svg
                      className="h-4 w-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H6a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4z"
                      />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.overview.total_distributions.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.recent_activity.today_distributions} today
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Budget
                    </CardTitle>
                    <svg
                      className="h-4 w-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(
                        analytics.overview.total_budget_allocated
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Allocated budget
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Efficiency Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Efficiency Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Distribution Rate</span>
                        <span>
                          {formatPercentage(
                            analytics.efficiency.distribution_rate
                          )}
                        </span>
                      </div>
                      <Progress
                        value={analytics.efficiency.distribution_rate}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Student Participation</span>
                        <span>
                          {formatPercentage(
                            analytics.efficiency.student_participation_rate
                          )}
                        </span>
                      </div>
                      <Progress
                        value={analytics.efficiency.student_participation_rate}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Budget Utilization</span>
                        <span>
                          {formatCurrency(
                            analytics.efficiency.budget_utilization
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Avg Cost per Meal</span>
                        <span>
                          {formatCurrency(
                            analytics.efficiency.avg_cost_per_meal
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity (30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics.recent_activity.new_menus_30d}
                      </div>
                      <p className="text-sm text-muted-foreground">New Menus</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.recent_activity.new_allocations_30d}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        New Allocations
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {analytics.recent_activity.week_distributions}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Week Distributions
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {analytics.recent_activity.month_distributions}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Month Distributions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Schools */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Schools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>School Name</TableHead>
                          <TableHead>NPSN</TableHead>
                          <TableHead>Total Distributions</TableHead>
                          <TableHead>Students Served</TableHead>
                          <TableHead>Participation Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.top_schools.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              No school data available
                            </TableCell>
                          </TableRow>
                        ) : (
                          analytics.top_schools.map((school, index) => (
                            <TableRow key={school.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">#{index + 1}</Badge>
                                  {school.name}
                                </div>
                              </TableCell>
                              <TableCell>{school.npsn}</TableCell>
                              <TableCell>
                                {school.total_distributions.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                {school.unique_students_served} /{" "}
                                {school.total_students}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={school.participation_rate}
                                    className="w-16"
                                  />
                                  <span className="text-sm">
                                    {formatPercentage(
                                      school.participation_rate
                                    )}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Menu Popularity */}
              <Card>
                <CardHeader>
                  <CardTitle>Menu Popularity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Menu Name</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Distributions</TableHead>
                          <TableHead>Utilization Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.menu_popularity.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              No menu data available
                            </TableCell>
                          </TableRow>
                        ) : (
                          analytics.menu_popularity.map((menu, index) => (
                            <TableRow key={menu.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">#{index + 1}</Badge>
                                  {menu.name}
                                </div>
                              </TableCell>
                              <TableCell>
                                {new Date(menu.date).toLocaleDateString(
                                  "id-ID"
                                )}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(menu.price_per_portion)}
                              </TableCell>
                              <TableCell>
                                {menu.distribution_count.toLocaleString()} /{" "}
                                {menu.total_allocated.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={menu.utilization_rate}
                                    className="w-16"
                                  />
                                  <span className="text-sm">
                                    {formatPercentage(menu.utilization_rate)}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No analytics data available
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
