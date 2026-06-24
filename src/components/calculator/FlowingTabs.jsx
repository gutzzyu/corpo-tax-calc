import React from 'react';
import { motion } from 'framer-motion';

export default function FlowingTabs({ tabs, activeTab, onTabChange, variant = 'primary', layoutId }) {
  const bgClass = variant === 'primary' ? 'bg-muted' : 'bg-secondary/10';
  const resolvedLayoutId = layoutId || `tab-bg-${variant}`;
  
  return (
    <div className={`relative flex ${bgClass} rounded-2xl p-1.5 gap-1`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-colors duration-300 z-10"
          style={{ color: activeTab === tab.id ? (variant === 'primary' ? 'white' : 'white') : 'hsl(var(--muted-foreground))' }}
        >
          {tab.icon && <tab.icon className="w-4 h-4" />}
          <span>{tab.label}</span>
          {activeTab === tab.id && (
            <motion.div
              layoutId={resolvedLayoutId}
              className={`absolute inset-0 rounded-xl ${variant === 'primary' ? 'bg-primary' : 'bg-secondary'} shadow-lg`}
              style={{ zIndex: -1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}