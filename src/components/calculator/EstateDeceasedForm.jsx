import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Plus, X } from 'lucide-react';
import { StaggerChild } from './AnimatedSection';

export default function EstateDeceasedForm({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });
  const heirs = data?.heirs || [''];

  const addHeir = () => update('heirs', [...heirs, '']);
  const removeHeir = (index) => update('heirs', heirs.filter((_, i) => i !== index));
  const updateHeir = (index, value) => {
    const newHeirs = [...heirs];
    newHeirs[index] = value;
    update('heirs', newHeirs);
  };

  return (
    <StaggerChild>
      <Card className="border-2 border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
            <User className="w-5 h-5 text-secondary" />
            Deceased Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Name of the Deceased</Label>
              <Input placeholder="Full name" value={data?.name || ''} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Date of Death</Label>
              <Input type="date" value={data?.dateOfDeath || ''} onChange={(e) => update('dateOfDeath', e.target.value)} />
              {data?.dateOfDeath && (
                <p className="text-xs text-secondary font-medium">
                  {new Date(data.dateOfDeath) >= new Date('2018-01-01') ? 'TRAIN Law applies (6% flat rate)' : 'Pre-TRAIN Law (5%-20% progressive)'}
                </p>
              )}
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Address of the Property</Label>
              <Input placeholder="Enter address" value={data?.address || ''} onChange={(e) => update('address', e.target.value)} />
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
              <Input placeholder="e.g., Filipino" value={data?.nationality || ''} onChange={(e) => update('nationality', e.target.value)} />
            </div>
          </div>

          <div className="pt-3 border-t space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-primary">Name of Heirs</Label>
              <Button variant="outline" size="sm" onClick={addHeir} className="text-secondary border-secondary/30 hover:bg-secondary/10">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Heir
              </Button>
            </div>
            {heirs.map((heir, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input 
                  placeholder={`Heir ${index + 1}`} 
                  value={heir} 
                  onChange={(e) => updateHeir(index, e.target.value)} 
                />
                {heirs.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeHeir(index)} className="shrink-0 text-destructive hover:text-destructive">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </StaggerChild>
  );
}