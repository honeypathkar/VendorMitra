"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface ProfileTabProps {
  user: any;
}

export function ProfileTab({ user }: ProfileTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Manage your supplier profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                defaultValue={user?.businessName || ""}
              />
            </div>
            <div>
              <Label htmlFor="contact-person">Contact Person</Label>
              <Input id="contact-person" defaultValue={user?.name || ""} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email || ""}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" defaultValue={user?.phone || ""} />
            </div>
            <div>
              <Label htmlFor="business-type">Business Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wholesaler">Wholesaler</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                  <SelectItem value="manufacturer">Manufacturer</SelectItem>
                  <SelectItem value="retailer">Retailer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="gst">GST Number</Label>
              <Input id="gst" placeholder="Enter GST number" />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Business Address</Label>
            <Textarea
              id="address"
              placeholder="Enter your complete business address"
            />
          </div>
          <div>
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your business and products"
            />
          </div>
          <Button>Update Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
}
