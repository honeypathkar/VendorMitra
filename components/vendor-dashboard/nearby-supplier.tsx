import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone } from "lucide-react";

interface NearbySuppliersProps {
  suppliers: any[];
}

export function NearbySuppliers({ suppliers }: NearbySuppliersProps) {
  const formatAddress = (supplier: any) => {
    if (supplier.profile?.address) {
      const { address, city, state, pincode } = supplier.profile;
      return `${address}, ${city}, ${state} - ${pincode}`;
    }
    return supplier.address || "Location not specified";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nearby Suppliers</CardTitle>
        <CardDescription>Suppliers in your area</CardDescription>
      </CardHeader>
      <CardContent>
        {suppliers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>No suppliers available</p>
            <p className="text-sm">
              Suppliers will appear here when they register
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.slice(0, 4).map((supplier: any) => (
              <div key={supplier._id} className="p-4 border rounded-lg">
                <div className="mb-2">
                  <h4 className="font-medium">
                    {supplier.businessName || supplier.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {supplier.businessType || "Supplier"}
                  </p>
                </div>
                <div className="flex items-start space-x-2 text-sm text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">
                    {formatAddress(supplier)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    View Items
                  </Button>
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
