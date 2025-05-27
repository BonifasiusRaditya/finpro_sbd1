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
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface StudentMonitoringData {
  students: Array<{
    id: string;
    name: string;
    student_number: string;
    class: string;
    grade: string;
    address?: string;
    gender?: string;
    birth_date?: string;
    created_at: string;
    meal_statistics: {
      total_meals_received: number;
      meals_this_week: number;
      meals_this_month: number;
      last_meal_date?: string;
      total_meal_value: number;
      recent_meals: number;
      activity_status: string;
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
  filters: {
    classes: string[];
    grades: string[];
  };
  statistics: {
    total_students: number;
    active_students: number;
    never_claimed_students: number;
    total_meals_distributed: number;
    avg_meals_per_student: string;
    total_meal_value: number;
    activity_rate: string;
  };
}

export default function StudentMonitoringPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useSchoolAuth();
  const [monitoringData, setMonitoringData] =
    useState<StudentMonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/school/auth/login");
      return;
    }

    if (isAuthenticated) {
      fetchMonitoringData();
    }
  }, [
    isLoading,
    isAuthenticated,
    router,
    currentPage,
    search,
    selectedClass,
    selectedGrade,
    dateFrom,
    dateTo,
  ]);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await SchoolAPI.getStudentMonitoring({
        page: currentPage,
        limit: 10,
        search: search || undefined,
        class: selectedClass || undefined,
        grade: selectedGrade || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });

      setMonitoringData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load monitoring data"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
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

  const getActivityBadge = (status: string) => {
    const variants = {
      active: {
        variant: "default" as const,
        text: "Active",
        icon: CheckCircle,
      },
      moderate: {
        variant: "secondary" as const,
        text: "Moderate",
        icon: TrendingUp,
      },
      inactive: {
        variant: "outline" as const,
        text: "Inactive",
        icon: AlertCircle,
      },
      never_claimed: {
        variant: "destructive" as const,
        text: "Never Claimed",
        icon: AlertCircle,
      },
    };

    const config =
      variants[status as keyof typeof variants] || variants.never_claimed;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleClassFilter = (value: string) => {
    setSelectedClass(value === "all" ? "" : value);
    setCurrentPage(1);
  };

  const handleGradeFilter = (value: string) => {
    setSelectedGrade(value === "all" ? "" : value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedClass("");
    setSelectedGrade("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !monitoringData) {
    return null;
  }

  const { students, pagination, filters, statistics } = monitoringData;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />

      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px]">
          <h1 className="text-lg font-semibold">Student Monitoring</h1>
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
                  <Users className="h-4 w-4" />
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
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Active Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {statistics.active_students}
                </div>
                <p className="text-xs text-gray-500">
                  {statistics.activity_rate}% activity rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Meals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {statistics.total_meals_distributed}
                </div>
                <p className="text-xs text-gray-500">
                  Avg: {statistics.avg_meals_per_student} per student
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(statistics.total_meal_value)}
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
                Filter students by class, grade, or search by name/student
                number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search students..."
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <select
                  value={selectedClass || "all"}
                  onChange={(e) => handleClassFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Classes</option>
                  {filters.classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedGrade || "all"}
                  onChange={(e) => handleGradeFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Grades</option>
                  {filters.grades.map((grade) => (
                    <option key={grade} value={grade}>
                      Grade {grade}
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
          <Tabs defaultValue="students" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="students">Student List</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </div>

            {/* Student List Tab */}
            <TabsContent value="students" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Student Monitoring Data</CardTitle>
                  <CardDescription>
                    Detailed view of student meal participation and activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class/Grade</TableHead>
                        <TableHead>Total Meals</TableHead>
                        <TableHead>This Week</TableHead>
                        <TableHead>This Month</TableHead>
                        <TableHead>Last Meal</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-gray-500">
                                {student.student_number}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{student.class}</div>
                              <div className="text-gray-500">
                                Grade {student.grade}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {student.meal_statistics.total_meals_received}
                          </TableCell>
                          <TableCell className="text-green-600 font-medium">
                            {student.meal_statistics.meals_this_week}
                          </TableCell>
                          <TableCell className="text-blue-600 font-medium">
                            {student.meal_statistics.meals_this_month}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(student.meal_statistics.last_meal_date)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatCurrency(
                              student.meal_statistics.total_meal_value
                            )}
                          </TableCell>
                          <TableCell>
                            {getActivityBadge(
                              student.meal_statistics.activity_status
                            )}
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
                      of {pagination.total_count} students
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
                    <CardTitle>Activity Distribution</CardTitle>
                    <CardDescription>
                      Student activity levels breakdown
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Students:</span>
                      <span className="font-medium text-green-600">
                        {statistics.active_students}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Never Claimed:</span>
                      <span className="font-medium text-red-600">
                        {statistics.never_claimed_students}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Activity Rate:</span>
                      <span className="font-medium">
                        {statistics.activity_rate}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Meal Distribution</CardTitle>
                    <CardDescription>
                      Overall meal distribution statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Distributed:</span>
                      <span className="font-medium">
                        {statistics.total_meals_distributed}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average per Student:</span>
                      <span className="font-medium">
                        {statistics.avg_meals_per_student}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Value:</span>
                      <span className="font-medium">
                        {formatCurrency(statistics.total_meal_value)}
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
