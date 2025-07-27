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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Store, ArrowLeft, Mail, Shield } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Navigation from "@/components/navigation";

export default function SupplierRegister() {
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
  const [formData, setFormData] = useState({
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    businessType: "",
    gstNumber: "",
    operatingHours: "",
    deliveryRadius: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const sendOTP = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        setStep(2);
        setError("");
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          businessName: formData.businessName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          password: formData.password,
          role: "supplier",
          businessType: formData.businessType,
          gstNumber: formData.gstNumber,
          operatingHours: formData.operatingHours,
          deliveryRadius: formData.deliveryRadius,
          otp,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        router.push("/supplier/dashboard");
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    await sendOTP();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="p-3 bg-green-600 rounded-2xl">
                  <Store className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  BazaarBuddy
                </h1>
              </div>
              <CardTitle className="text-2xl">Register as Supplier</CardTitle>
              <CardDescription className="text-lg">
                {step === 1
                  ? "Join our platform to supply raw materials to street food vendors"
                  : "Verify your email address"}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
              {step === 1 ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            businessName: e.target.value,
                          })
                        }
                        placeholder="Your business name"
                        required
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input
                        id="contactPerson"
                        value={formData.contactPerson}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactPerson: e.target.value,
                          })
                        }
                        placeholder="Primary contact person"
                        required
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="business@example.com"
                        required
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+91 9876543210"
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Complete business address with landmarks"
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="City"
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) =>
                          setFormData({ ...formData, state: value })
                        }
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="delhi">Delhi</SelectItem>
                          <SelectItem value="mumbai">Mumbai</SelectItem>
                          <SelectItem value="bangalore">Bangalore</SelectItem>
                          <SelectItem value="kolkata">Kolkata</SelectItem>
                          <SelectItem value="chennai">Chennai</SelectItem>
                          <SelectItem value="punjab">Punjab</SelectItem>
                          <SelectItem value="haryana">Haryana</SelectItem>
                          <SelectItem value="uttar-pradesh">
                            Uttar Pradesh
                          </SelectItem>
                          <SelectItem value="rajasthan">Rajasthan</SelectItem>
                          <SelectItem value="gujarat">Gujarat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="pincode">PIN Code</Label>
                      <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) =>
                          setFormData({ ...formData, pincode: e.target.value })
                        }
                        placeholder="110001"
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select
                        value={formData.businessType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, businessType: value })
                        }
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wholesaler">Wholesaler</SelectItem>
                          <SelectItem value="distributor">
                            Distributor
                          </SelectItem>
                          <SelectItem value="farmer">
                            Farmer/Producer
                          </SelectItem>
                          <SelectItem value="retailer">Retailer</SelectItem>
                          <SelectItem value="manufacturer">
                            Manufacturer
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="gstNumber">GST Number</Label>
                      <Input
                        id="gstNumber"
                        value={formData.gstNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gstNumber: e.target.value,
                          })
                        }
                        placeholder="GST registration number"
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="operatingHours">Operating Hours</Label>
                      <Input
                        id="operatingHours"
                        value={formData.operatingHours}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            operatingHours: e.target.value,
                          })
                        }
                        placeholder="e.g., 6:00 AM - 8:00 PM"
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryRadius">
                        Delivery Radius (km)
                      </Label>
                      <Input
                        id="deliveryRadius"
                        type="number"
                        value={formData.deliveryRadius}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deliveryRadius: e.target.value,
                          })
                        }
                        placeholder="10"
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="Create a strong password (min 6 chars)"
                        required
                        minLength={6}
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">
                        Confirm Password *
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Confirm your password"
                        required
                        minLength={6}
                        className="h-12"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-200 flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <Link href="/" className="flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 bg-transparent"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      disabled={loading}
                    >
                      {loading ? "Sending OTP..." : "Continue"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full w-fit">
                      <Mail className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Check your email
                    </h3>
                    <p className="text-gray-600">
                      We've sent a verification code to{" "}
                      <strong>{formData.email}</strong>
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="otp">Enter verification code</Label>
                    <Input
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="h-12 text-center text-lg tracking-widest"
                    />
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-200 flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 h-12 bg-transparent"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={verifyOTP}
                      className="flex-1 h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? "Verifying..." : "Verify & Register"}
                    </Button>
                  </div>

                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={sendOTP}
                      disabled={loading}
                      className="text-green-600 hover:text-green-700"
                    >
                      Didn't receive code? Resend
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
