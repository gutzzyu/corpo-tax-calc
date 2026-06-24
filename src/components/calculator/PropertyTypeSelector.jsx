import React from 'react';
import { motion } from 'framer-motion';
import { Home, Building, Building2, TrendingUp, Car, Shield } from 'lucide-react';
import { StaggerChild } from './AnimatedSection';

const realPropertyTypes = [
  { id: 'land', label: 'Land', icon: Home },
  { id: 'building', label: 'Building', icon: Building },
  { id: 'condo', label: 'Condominium', icon: Building2 },
];

const personalPropertyTypes = [
  { id: 'stocks', label: 'Stocks', icon: TrendingUp },
  { id: 'vehicles', label: 'Vehicles', icon: Car },
  { id: 'securities', label: 'Securities', icon: Shield },
];

export default function PropertyTypeSelector({ category, selected, onSelect }) {
  const types = category === 'real' ? realPropertyTypes : personalPropertyTypes;

  return (
    <StaggerChild>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <Building2 className="w-4 h-4 text-secondary" />
          Select Property Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {types.map((type) => {
            const isActive = selected === type.id;
            return (
              <motion.button
                key={type.id}
                onClick={() => onSelect(type.id)}
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                  isActive 
                    ? 'border-secondary bg-secondary/5 shadow-md' 
                    : 'border-border hover:border-secondary/40 hover:shadow-sm'
                }`}
              >
                <type.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-secondary' : 'text-muted-foreground'}`} />
                <span className={`font-medium text-sm ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{type.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="property-check"
                    className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-secondary"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </StaggerChild>
  );
}