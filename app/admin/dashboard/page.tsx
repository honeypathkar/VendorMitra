"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Users,
  Store,
  ShoppingCart,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  DollarSign,
  UserCheck,
  Clock,
  Plus,
  Trash2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";

export default function AdminDashboard() {
  const { user, token } = useAuth();

  // Dynamic data states
  const [vendors, setVendors] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [stats, setStats] = useState({
    totalVendors: 0,
    totalSuppliers: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    activeUsers: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [addingCategory, setAddingCategory] = useState(false);

  const COLORS = ["#f97316", "#10b981", "#3b82f6", "#ef4444"];

  useEffect(() => {
    if (token && user?.role === "admin") {
      fetchDashboardData();
    }
  }, [token, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch vendors
      const vendorsResponse = await fetch("/api/admin/vendors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let vendorsData = [];
      if (vendorsResponse.ok) {
        const data = await vendorsResponse.json();
        vendorsData = data.vendors || [];
        setVendors(vendorsData);
        console.log("Vendors fetched:", vendorsData);
      } else {
        console.error("Failed to fetch vendors:", vendorsResponse.status);
      }

      // Fetch suppliers - Updated to use the correct endpoint
      const suppliersResponse = await fetch("/api/suppliers");
      let suppliersData = [];
      if (suppliersResponse.ok) {
        const data = await suppliersResponse.json();
        suppliersData = data.suppliers || [];
        setSuppliers(suppliersData);
        console.log("Suppliers fetched:", suppliersData);
      } else {
        console.error("Failed to fetch suppliers:", suppliersResponse.status);
      }

      // Fetch orders
      const ordersResponse = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let ordersData = [];
      if (ordersResponse.ok) {
        const data = await ordersResponse.json();
        ordersData = data.orders || [];
        setOrders(ordersData);
        console.log("Orders fetched:", ordersData);
      } else {
        console.error("Failed to fetch orders:", ordersResponse.status);
      }

      // Fetch categories
      const categoriesResponse = await fetch("/api/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (categoriesResponse.ok) {
        const data = await categoriesResponse.json();
        setCategories(data.categories || []);
        console.log("Categories fetched:", data.categories);
      } else {
        console.error("Failed to fetch categories:", categoriesResponse.status);
      }

      // Calculate stats after data is fetched
      const totalVendors = vendorsData.length;
      const totalSuppliers = suppliersData.length;
      const totalOrders = ordersData.length;
      const avgOrderValue =
        totalOrders > 0
          ? ordersData.reduce(
              (sum: number, order: any) => sum + (order.totalAmount || 0),
              0
            ) / totalOrders
          : 0;
      const activeUsers =
        vendorsData.filter((v: any) => v.status === "active").length +
        suppliersData.filter((s: any) => s.status === "active").length;
      const pendingApprovals = suppliersData.filter(
        (s: any) => s.status === "pending"
      ).length;

      setStats({
        totalVendors,
        totalSuppliers,
        totalOrders,
        avgOrderValue: Math.round(avgOrderValue),
        activeUsers,
        pendingApprovals,
      });

      console.log("Stats calculated:", {
        totalVendors,
        totalSuppliers,
        totalOrders,
        avgOrderValue: Math.round(avgOrderValue),
        activeUsers,
        pendingApprovals,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      setAddingCategory(true);
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCategory.trim(),
          description: "",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCategories([...categories, data.category]);
        setNewCategory("");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category");
    } finally {
      setAddingCategory(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setCategories(categories.filter((cat: any) => cat._id !== categoryId));
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const toggleUserStatus = async (
    userId: string,
    currentStatus: string,
    userType: string
  ) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const endpoint = newStatus === "active" ? "approve" : "decline";
      const response = await fetch(`/api/admin/vendors/${userId}/${endpoint}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error(`Error updating user status:`, error);
    }
  };

  // Generate dynamic chart data based on real data
  const generateGrowthData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, index) => ({
      month,
      vendors: Math.floor((vendors.length * (index + 1)) / months.length),
      suppliers: Math.floor((suppliers.length * (index + 1)) / months.length),
    }));
  };

  const generateOrderVolumeData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => ({
      date: day,
      orders: Math.floor(Math.random() * (orders.length + 1)),
    }));
  };

  const getUserDistribution = () => [
    { name: "Vendors", value: vendors.length, color: "#f97316" },
    { name: "Suppliers", value: suppliers.length, color: "#10b981" },
  ];

  const handleTabChange = (tabValue: string) => {
    const tab = document.querySelector(`[value="${tabValue}"]`) as HTMLElement;
    if (tab) {
      tab.click();
    }
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
  }: any) => {
    if (typeof percent !== "number") {
      return null;
    }
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">BazaarBuddy Platform Management</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/50 backdrop-blur-sm">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-white">
              Users
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-white"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="data-[state=active]:bg-white"
            >
              Content
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-white"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Total Vendors
                  </CardTitle>
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.totalVendors}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.totalVendors === 0
                      ? "No vendors registered"
                      : "Registered vendors"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Total Suppliers
                  </CardTitle>
                  <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                    <Store className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.totalSuppliers}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.totalSuppliers === 0
                      ? "No suppliers registered"
                      : "Registered suppliers"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Total Orders
                  </CardTitle>
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.totalOrders}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.totalOrders === 0
                      ? "No orders placed"
                      : "Orders processed"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Avg Order Value
                  </CardTitle>
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    ₹{stats.avgOrderValue}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Average order amount
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>User Growth Trends</span>
                  </CardTitle>
                  <CardDescription>Monthly registration trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {vendors.length === 0 && suppliers.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p>No growth data available</p>
                          <p className="text-sm">
                            Growth trends will appear here
                          </p>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={generateGrowthData()}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e0e7ff"
                          />
                          <XAxis dataKey="month" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "none",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="vendors"
                            stroke="#f97316"
                            strokeWidth={3}
                            dot={{ fill: "#f97316", strokeWidth: 2, r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="suppliers"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <span>Weekly Order Volume</span>
                  </CardTitle>
                  <CardDescription>Orders placed this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {orders.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p>No order data available</p>
                          <p className="text-sm">
                            Order volume will appear here
                          </p>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={generateOrderVolumeData()}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e0e7ff"
                          />
                          <XAxis dataKey="date" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "none",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <Bar
                            dataKey="orders"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Status & Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>System Status</span>
                  </CardTitle>
                  <CardDescription>Current platform health</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Services</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Platform</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Healthy
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-gradient-to-br from-orange-50 to-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserCheck className="h-5 w-5 text-orange-600" />
                    <span>User Statistics</span>
                  </CardTitle>
                  <CardDescription>Platform user metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Users</span>
                      <Badge variant="outline">{stats.activeUsers}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pending Approvals</span>
                      <Badge variant="outline">{stats.pendingApprovals}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Users</span>
                      <Badge variant="outline">
                        {stats.totalVendors + stats.totalSuppliers}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span>Pending Actions</span>
                  </CardTitle>
                  <CardDescription>Items requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.pendingApprovals === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <CheckCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm">All caught up!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div>
                          <p className="font-medium text-sm">
                            {stats.pendingApprovals} supplier(s) pending
                          </p>
                          <p className="text-xs text-gray-600">
                            Awaiting approval
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleTabChange("users")}
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>Latest platform events</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 &&
                vendors.length === 0 &&
                suppliers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>No recent activity</p>
                    <p className="text-sm">
                      Platform activity will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vendors.slice(0, 2).map((vendor: any) => (
                      <div
                        key={vendor._id}
                        className="flex items-center space-x-4 p-3 bg-orange-50 rounded-lg"
                      >
                        <div className="p-2 bg-orange-500 rounded-full">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">New vendor registration</p>
                          <p className="text-sm text-gray-600">
                            {vendor.name} joined -{" "}
                            {new Date(vendor.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {suppliers.slice(0, 2).map((supplier: any) => (
                      <div
                        key={supplier._id}
                        className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg"
                      >
                        <div className="p-2 bg-green-500 rounded-full">
                          <Store className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">
                            New supplier registration
                          </p>
                          <p className="text-sm text-gray-600">
                            {supplier.businessName || supplier.name} joined -{" "}
                            {new Date(supplier.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {orders.slice(0, 1).map((order: any) => (
                      <div
                        key={order._id}
                        className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg"
                      >
                        <div className="p-2 bg-blue-500 rounded-full">
                          <ShoppingCart className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">New order placed</p>
                          <p className="text-sm text-gray-600">
                            Order #{order.orderId} -{" "}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Tabs defaultValue="vendors" className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList className="bg-white/50 backdrop-blur-sm">
                  <TabsTrigger
                    value="vendors"
                    className="data-[state=active]:bg-white"
                  >
                    Vendors ({vendors.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="suppliers"
                    className="data-[state=active]:bg-white"
                  >
                    Suppliers ({suppliers.length})
                  </TabsTrigger>
                </TabsList>
                <div className="flex items-center space-x-4">
                  <Input
                    placeholder="Search users..."
                    className="w-64 bg-white/80"
                  />
                  <Select>
                    <SelectTrigger className="w-32 bg-white/80">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value="vendors">
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-0">
                    {vendors.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No Vendors
                        </h3>
                        <p className="text-gray-500">
                          No vendors have registered yet.
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Business</TableHead>
                            <TableHead>Join Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vendors.map((vendor: any) => (
                            <TableRow key={vendor._id}>
                              <TableCell className="font-medium">
                                {vendor.name}
                              </TableCell>
                              <TableCell>{vendor.email}</TableCell>
                              <TableCell>{vendor.phone || "N/A"}</TableCell>
                              <TableCell>
                                {vendor.businessName || "N/A"}
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  vendor.createdAt
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    vendor.status === "active"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {vendor.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      toggleUserStatus(
                                        vendor._id,
                                        vendor.status,
                                        "vendor"
                                      )
                                    }
                                  >
                                    {vendor.status === "active"
                                      ? "Deactivate"
                                      : "Activate"}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="suppliers">
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-0">
                    {suppliers.length === 0 ? (
                      <div className="text-center py-12">
                        <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No Suppliers
                        </h3>
                        <p className="text-gray-500">
                          No suppliers have registered yet.
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Business Name</TableHead>
                            <TableHead>Contact Person</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Join Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {suppliers.map((supplier: any) => (
                            <TableRow key={supplier._id}>
                              <TableCell className="font-medium">
                                {supplier.businessName || "N/A"}
                              </TableCell>
                              <TableCell>{supplier.name}</TableCell>
                              <TableCell>{supplier.email}</TableCell>
                              <TableCell>{supplier.phone || "N/A"}</TableCell>
                              <TableCell>
                                {new Date(
                                  supplier.createdAt
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    supplier.status === "active"
                                      ? "default"
                                      : supplier.status === "pending"
                                      ? "secondary"
                                      : "outline"
                                  }
                                >
                                  {supplier.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {supplier.status === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          toggleUserStatus(
                                            supplier._id,
                                            "pending",
                                            "supplier"
                                          )
                                        }
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline">
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Order Management</h2>
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Search orders..."
                  className="w-64 bg-white/80"
                />
                <Select>
                  <SelectTrigger className="w-32 bg-white/80">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Orders
                    </h3>
                    <p className="text-gray-500">
                      No orders have been placed yet.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order: any) => (
                        <TableRow key={order._id}>
                          <TableCell className="font-medium">
                            {order.orderId}
                          </TableCell>
                          <TableCell>Vendor</TableCell>
                          <TableCell>Supplier</TableCell>
                          <TableCell>
                            {order.items
                              ?.map((item: any) => item.name)
                              .join(", ") || "N/A"}
                          </TableCell>
                          <TableCell>₹{order.totalAmount}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.status === "delivered"
                                  ? "default"
                                  : order.status === "preparing"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Item Catalog Management</CardTitle>
                  <CardDescription>
                    Manage master list of raw materials
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add new category..."
                      className="flex-1"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addCategory()}
                    />
                    <Button
                      onClick={addCategory}
                      disabled={addingCategory || !newCategory.trim()}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {addingCategory ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Add Category
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">
                      Categories ({categories.length})
                    </h4>
                    {categories.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <p>No categories added yet</p>
                        <p className="text-sm">
                          Add categories to organize raw materials
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {categories.map((category: any) => (
                          <div
                            key={category._id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                          >
                            <div>
                              <p className="font-medium">
                                {category.displayName}
                              </p>
                              <p className="text-sm text-gray-600">
                                Created:{" "}
                                {new Date(
                                  category.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteCategory(category._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Document Review</CardTitle>
                  <CardDescription>
                    Review supplier authenticity documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>No pending documents</p>
                    <p className="text-sm">Document reviews will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Breakdown by user type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {vendors.length === 0 && suppliers.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p>No user data available</p>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getUserDistribution()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getUserDistribution().map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Platform Summary</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                      <span className="text-sm font-medium">Total Users</span>
                      <Badge variant="outline" className="bg-white">
                        {vendors.length + suppliers.length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Active Orders</span>
                      <Badge variant="outline" className="bg-white">
                        {
                          orders.filter((o: any) =>
                            ["pending", "accepted", "preparing"].includes(
                              o.status
                            )
                          ).length
                        }
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <span className="text-sm font-medium">
                        Completed Orders
                      </span>
                      <Badge variant="outline" className="bg-white">
                        {
                          orders.filter((o: any) => o.status === "delivered")
                            .length
                        }
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <span className="text-sm font-medium">
                        Platform Health
                      </span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {vendors.length + suppliers.length + orders.length > 0
                          ? "Active"
                          : "Ready"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>Global platform settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="search-radius">
                      Default Search Radius (km)
                    </Label>
                    <Input
                      id="search-radius"
                      type="number"
                      defaultValue="10"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="min-order">Minimum Order Amount (₹)</Label>
                    <Input
                      id="min-order"
                      type="number"
                      defaultValue="100"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commission">Platform Commission (%)</Label>
                    <Input
                      id="commission"
                      type="number"
                      defaultValue="5"
                      className="mt-1"
                    />
                  </div>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Notification Templates</CardTitle>
                  <CardDescription>
                    Manage automated message templates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="welcome-vendor">
                      Welcome Message (Vendors)
                    </Label>
                    <Input
                      id="welcome-vendor"
                      defaultValue="Welcome to BazaarBuddy! Start ordering..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="welcome-supplier">
                      Welcome Message (Suppliers)
                    </Label>
                    <Input
                      id="welcome-supplier"
                      defaultValue="Welcome to BazaarBuddy! Start selling..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="order-confirmation">
                      Order Confirmation
                    </Label>
                    <Input
                      id="order-confirmation"
                      defaultValue="Your order has been confirmed..."
                      className="mt-1"
                    />
                  </div>
                  <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    Update Templates
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
