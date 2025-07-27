import { Button } from "@/components/ui/button";
import { ShoppingCart, Bell, User } from "lucide-react";

interface DashboardHeaderProps {
  user: any;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ShoppingCart className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {user?.name || "Vendor"}!
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
