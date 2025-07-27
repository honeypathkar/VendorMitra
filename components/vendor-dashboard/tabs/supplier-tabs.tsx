import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, MessageSquare, Filter } from "lucide-react";

interface SuppliersTabProps {
  suppliers: any[];
}

export function SuppliersTab({ suppliers }: SuppliersTabProps) {
  const formatAddress = (supplier: any) => {
    if (supplier.profile?.address) {
      const { address, city, state, pincode } = supplier.profile;
      return `${address}, ${city}, ${state} - ${pincode}`;
    }
    return supplier.address || "Location not specified";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Suppliers</h2>
        <div className="flex items-center space-x-4">
          <Input placeholder="Search suppliers..." className="w-64" />
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {suppliers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Suppliers Found
            </h3>
            <p className="text-gray-500">
              No suppliers have registered in your area yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier: any) => (
            <Card key={supplier._id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {supplier.businessName || supplier.name}
                </CardTitle>
                <CardDescription>
                  {supplier.businessType || "Supplier"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {formatAddress(supplier)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{supplier.phone || "Phone not available"}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      View Items
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
