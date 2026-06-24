import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { StaggerChild } from './AnimatedSection';

export default function PartyInfoForm({ title, icon: Icon = User, data, onChange, allowMultiple = false }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <StaggerChild>
      <Card className="border-2 border-border/50 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
            <Icon className="w-5 h-5 text-secondary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Full Name / Corporation Name</Label>
              <Input 
                placeholder="Enter name"
                value={data?.name || ''} 
                onChange={(e) => update('name', e.target.value)} 
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Address / Office Address</Label>
              <Input 
                placeholder="Enter address"
                value={data?.address || ''} 
                onChange={(e) => update('address', e.target.value)} 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">TIN No.</Label>
              <Input
                placeholder="000-000-000-000"
                value={data?.tin || ''}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                  let formatted = digits;
                  if (digits.length > 9) formatted = digits.slice(0,3)+'-'+digits.slice(3,6)+'-'+digits.slice(6,9)+'-'+digits.slice(9);
                  else if (digits.length > 6) formatted = digits.slice(0,3)+'-'+digits.slice(3,6)+'-'+digits.slice(6);
                  else if (digits.length > 3) formatted = digits.slice(0,3)+'-'+digits.slice(3);
                  update('tin', formatted);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Civil Status</Label>
              <Select value={data?.civilStatus || ''} onValueChange={(v) => update('civilStatus', v)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nationality</Label>
              <Input 
                placeholder="e.g., Filipino"
                value={data?.nationality || ''} 
                onChange={(e) => update('nationality', e.target.value)} 
              />
            </div>
            {allowMultiple && (
              <div className="space-y-1.5">
               <Label className="text-xs text-muted-foreground">Number of Buyers/Donees/Heirs</Label>
               <Input 
                 type="number"
                 placeholder="1"
                 min="1"
                 value={data?.numberOfPeople || 1} 
                 onChange={(e) => update('numberOfPeople', parseInt(e.target.value, 10) || 1)} 
               />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </StaggerChild>
  );
}