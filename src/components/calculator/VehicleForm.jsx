import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car } from 'lucide-react';
import { StaggerChild } from './AnimatedSection';

export default function VehicleForm({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <StaggerChild>
      <Card className="border-2 border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
            <Car className="w-5 h-5 text-secondary" />
            Vehicle Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Plate Number</Label>
              <Input placeholder="e.g., ABC 1234" value={data?.plateNumber || ''} onChange={(e) => update('plateNumber', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Color of the Vehicle</Label>
              <Input placeholder="e.g., White" value={data?.color || ''} onChange={(e) => update('color', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Name of the Owner</Label>
              <Input placeholder="Enter owner name" value={data?.ownerName || ''} onChange={(e) => update('ownerName', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Brand</Label>
              <Input placeholder="e.g., Toyota" value={data?.brand || ''} onChange={(e) => update('brand', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Vehicle Value</Label>
              <Input type="number" placeholder="0.00" value={data?.vehicleValue || ''} onChange={(e) => update('vehicleValue', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </StaggerChild>
  );
}