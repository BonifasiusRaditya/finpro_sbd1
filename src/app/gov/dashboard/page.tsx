"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGovernmentAuth } from "@/hooks/useGovernmentAuth";
import { GovernmentAPI } from "@/services/GovernmentAPI";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import GovernmentSidebar from "@/components/sidebarGovernment";
import Link from "next/link";

interface DashboardData {
  overview: {
    total_schools: number;
    total_students: number;
    new_schools_30d: number;
    total_menus: number;
    active_menus: number;
    recent_menus: number;
    menus_this_week: number;
    total_allocations: number;
    total_portions_allocated: number;
    total_budget_allocated: number;
    upcoming_allocations: number;
    today_allocations: number;
    recent_allocations: number;
    total_distributions: number;
    unique_students_served: number;
    today_distributions: number;
    yesterday_distributions: number;
    week_distributions: number;
    month_distributions: number;
    total_distribution_value: number;
    avg_menu_price: number;
    avg_allocation_quantity: number;
  };
  efficiency: {
    overall_distribution_rate: number;
    overall_participation_rate: number;
    active_schools: number;
    recently_active_schools: number;
    distribution_growth: number;
    participation_growth: number;
  };
  school_performance: Array<{
    id: string;
    name: string;
    npsn: string;
    total_students: number;
    total_distributions: number;
    unique_students_served: number;
    participation_rate: number;
    recent_distributions: number;
    today_distributions: number;
  }>;
  daily_trends: Array<{
    date: string;
    distributions: number;
    unique_students: number;
    active_schools: number;
    total_value: number;
  }>;
  menu_popularity: Array<{
    id: string;
    name: string;
    date: string;
    price_per_portion: number;
    distribution_count: number;
    total_allocated: number;
    utilization_rate: number;
    schools_served: number;
  }>;
  recent_activities: Array<{
    activity_type: string;
    title: string;
    description: string;
    timestamp: string;
    entity_id: string;
  }>;
}

export default function GovernmentDashboard() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useGovernmentAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
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
      loadDashboard();
    }
  }, [isAuthenticated, startDate, endDate]);

  const loadDashboard = async () => {
    try {
      setIsLoadingDashboard(true);
      setError("");
      const data = await GovernmentAPI.getDashboard({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setDashboard(data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load dashboard"
      );
    } finally {
      setIsLoadingDashboard(false);
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

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case "school_created":
        return (
          <svg
            className="w-4 h-4 text-blue-500"
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
        );
      case "menu_created":
        return (
          <svg
            className="w-4 h-4 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        );
      case "allocation_created":
        return (
          <svg
            className="w-4 h-4 text-purple-500"
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
        );
      default:
        return (
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const getGrowthIndicator = (value: number) => {
    if (value > 0) {
      return (
        <span className="text-green-600 text-sm flex items-center">
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 17l9.2-9.2M17 17V7H7"
            />
          </svg>
          +{value}
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="text-red-600 text-sm flex items-center">
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 7l-9.2 9.2M7 7v10h10"
            />
          </svg>
          {value}
        </span>
      );
    }
    return <span className="text-gray-500 text-sm">No change</span>;
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
          <h1 className="text-lg font-semibold">Government Dashboard</h1>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Provincial Overview</h2>
              <p className="text-muted-foreground">
                Comprehensive monitoring of the Free Nutritious Meals program
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
              <Button variant="outline" onClick={loadDashboard}>
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

          {isLoadingDashboard ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : dashboard ? (
            <>
              {/* Key Metrics */}
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
                      {dashboard.overview.total_schools}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{dashboard.overview.new_schools_30d} this month
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
                      {dashboard.overview.total_students.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dashboard.overview.unique_students_served.toLocaleString()}{" "}
                      served
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Today&apos;s Distributions
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
                      {dashboard.overview.today_distributions.toLocaleString()}
                    </div>
                    <div className="flex items-center">
                      {getGrowthIndicator(
                        dashboard.efficiency.distribution_growth
                      )}
                    </div>
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
                        dashboard.overview.total_budget_allocated
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(
                        dashboard.overview.total_distribution_value
                      )}{" "}
                      distributed
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Efficiency Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Program Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Distribution Rate</span>
                        <span>
                          {formatPercentage(
                            dashboard.efficiency.overall_distribution_rate
                          )}
                        </span>
                      </div>
                      <Progress
                        value={dashboard.efficiency.overall_distribution_rate}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Student Participation</span>
                        <span>
                          {formatPercentage(
                            dashboard.efficiency.overall_participation_rate
                          )}
                        </span>
                      </div>
                      <Progress
                        value={dashboard.efficiency.overall_participation_rate}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Active Schools</span>
                        <span>
                          {dashboard.efficiency.recently_active_schools} /{" "}
                          {dashboard.efficiency.active_schools}
                        </span>
                      </div>
                      <Progress
                        value={
                          (dashboard.efficiency.recently_active_schools /
                            dashboard.efficiency.active_schools) *
                          100
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Avg Cost per Meal</span>
                        <span>
                          {formatCurrency(dashboard.overview.avg_menu_price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Top Performing Schools */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Schools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboard.school_performance.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">
                            No school performance data available
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Schools will appear here once they start
                            distributing meals
                          </p>
                        </div>
                      ) : (
                        dashboard.school_performance
                          .slice(0, 5)
                          .map((school, index) => (
                            <div
                              key={school.id}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <Badge variant="outline">#{index + 1}</Badge>
                                <div>
                                  <p className="font-medium">{school.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    NPSN: {school.npsn}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {school.total_students} students
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {formatPercentage(school.participation_rate)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {school.total_distributions} meals
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {school.unique_students_served} students
                                  served
                                </p>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboard.recent_activities.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">
                            No recent activities
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Activities will appear here when schools, menus, or
                            allocations are created
                          </p>
                        </div>
                      ) : (
                        dashboard.recent_activities
                          .slice(0, 5)
                          .map((activity, index) => (
                            <div key={index} className="flex items-start gap-3">
                              {getActivityIcon(activity.activity_type)}
                              <div className="flex-1">
                                <p className="font-medium">{activity.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {activity.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(
                                    activity.timestamp
                                  ).toLocaleDateString("id-ID", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Link href="/gov/schools/create">
                      <Button className="w-full" variant="outline">
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add School
                      </Button>
                    </Link>
                    <Link href="/gov/menus/create">
                      <Button className="w-full" variant="outline">
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Create Menu
                      </Button>
                    </Link>
                    <Link href="/gov/allocations/create">
                      <Button className="w-full" variant="outline">
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Allocate Menu
                      </Button>
                    </Link>
                    <Link href="/gov/analytics">
                      <Button className="w-full" variant="outline">
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
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        View Analytics
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No dashboard data available
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
