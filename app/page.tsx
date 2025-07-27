"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Store, MapPin, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(loginForm.email, loginForm.password);
      // Redirect based on role after successful login
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (currentUser.role === "admin") {
        router.push("/admin/dashboard");
      } else if (currentUser.role === "supplier") {
        router.push("/supplier/dashboard");
      } else {
        router.push("/vendor/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardNavigation = () => {
    if (user) {
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "supplier") {
        router.push("/supplier/dashboard");
      } else {
        router.push("/vendor/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-yellow-600/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="p-3 bg-orange-600 rounded-2xl">
              <ShoppingCart className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              VendorMitra
            </h1>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Connect Street Food Vendors with
            <span className="block text-orange-600">
              Raw Material Suppliers
            </span>
          </h2>

          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Streamline your procurement process with voice ordering, smart
            supplier matching, and real-time inventory management. Join
            thousands of vendors and suppliers already using VendorMitra.
          </p>

          {/* Show user info if logged in */}
          {user && (
            <div className="max-w-md mx-auto mb-8">
              <Card className="border-2 border-orange-200 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                  <CardTitle className="text-2xl">
                    Welcome back, {user.name}! 👋
                  </CardTitle>
                  <CardDescription className="text-lg">
                    You are logged in as{" "}
                    <span className="font-semibold text-orange-600">
                      {user.role}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Button
                    onClick={handleDashboardNavigation}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-lg py-6"
                  >
                    Go to{" "}
                    {user.role === "admin"
                      ? "Admin"
                      : user.role === "supplier"
                      ? "Supplier"
                      : "Vendor"}{" "}
                    Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Login/Register Tabs - Only show if not logged in */}
          {!user && (
            <div className="max-w-md mx-auto">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-white"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="data-[state=active]:bg-white"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl">Welcome Back</CardTitle>
                      <CardDescription>
                        Enter your credentials to continue
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={loginForm.email}
                            onChange={(e) =>
                              setLoginForm({
                                ...loginForm,
                                email: e.target.value,
                              })
                            }
                            placeholder="Enter your email"
                            required
                            className="h-12"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={loginForm.password}
                            onChange={(e) =>
                              setLoginForm({
                                ...loginForm,
                                password: e.target.value,
                              })
                            }
                            placeholder="Enter your password"
                            required
                            className="h-12"
                          />
                        </div>
                        {error && (
                          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                            {error}
                          </div>
                        )}
                        <Button
                          type="submit"
                          className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-lg"
                          disabled={loading}
                        >
                          {loading ? "Logging in..." : "Login"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="register">
                  <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        Join VendorMitra
                      </CardTitle>
                      <CardDescription>
                        Create your account to get started
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/vendor/register">
                          <Button
                            variant="outline"
                            className="w-full h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 hover:border-orange-300 hover:bg-gradient-to-br hover:from-orange-100 hover:to-yellow-100 transition-all duration-300"
                          >
                            <ShoppingCart className="h-8 w-8 text-orange-600" />
                            <span className="font-semibold">
                              Register as Vendor
                            </span>
                          </Button>
                        </Link>
                        <Link href="/supplier/register">
                          <Button
                            variant="outline"
                            className="w-full h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 hover:border-green-300 hover:bg-gradient-to-br hover:from-green-100 hover:to-blue-100 transition-all duration-300"
                          >
                            <Store className="h-8 w-8 text-green-600" />
                            <span className="font-semibold">
                              Register as Supplier
                            </span>
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">Why Choose VendorMitra?</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed specifically for the street food
              ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-yellow-50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">
                  Smart Supplier Discovery
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed">
                  Find the closest and cheapest suppliers with our intelligent
                  matching system and interactive maps.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-blue-50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Voice Ordering</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed">
                  Place orders using voice commands in Hindi or English - just
                  speak your requirements naturally.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Price Trends</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed">
                  Make informed decisions with historical price data and market
                  trend analysis.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-orange-100">Active Vendors</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-orange-100">Trusted Suppliers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-orange-100">Orders Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-orange-100">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold">VendorMitra</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Connecting street food vendors with reliable suppliers across
                India. Making procurement simple and efficient.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">For Vendors</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">
                  Voice Ordering
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Supplier Discovery
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Price Tracking
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Order Management
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">For Suppliers</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">
                  Inventory Management
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Order Processing
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Analytics Dashboard
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Customer Reviews
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">
                  Help Center
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Contact Us
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Documentation
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Community
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>
              &copy; 2024 VendorMitra. All rights reserved. Made with ❤️ for the
              street food community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
