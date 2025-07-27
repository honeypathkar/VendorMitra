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

interface ProfileTabProps {
  user: any;
}

export function ProfileTab({ user }: ProfileTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Manage your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={user?.name || ""} />
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
              <Label htmlFor="business">Business Name</Label>
              <Input id="business" defaultValue={user?.businessName || ""} />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" placeholder="Enter your business address" />
          </div>
          <Button>Update Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
}
