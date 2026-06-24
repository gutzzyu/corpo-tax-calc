import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Gift, Landmark } from 'lucide-react';
import FlowingTabs from '@/components/calculator/FlowingTabs';
import SaleDonationTab from '@/components/calculator/SaleDonationTab';
import EstateTab from '@/components/calculator/EstateTab';

const mainTabs = [
  { id: 'sale', label: 'Sale', icon: Building2 },
  { id: 'donation', label: 'Donation', icon: Gift },
  { id: 'estate', label: 'Estate', icon: Landmark },
];

export default function Calculator() {
  const [activeTab, setActiveTab] = useState('sale');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs tracking-widest uppercase opacity-70 mb-2"
          >
            Sadsad Tamesis Legal and Accountancy Firm
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold"
          >
            Property Tax Calculator
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm opacity-60 mt-1"
          >
            Republic of the Philippines
          </motion.p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Main Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-lg mx-auto mb-8"
        >
          <FlowingTabs
            tabs={mainTabs}
            activeTab={activeTab}
            onTabChange={(t) => setActiveTab(t)}
            variant="primary"
          />
        </motion.div>

        {/*
          KEY FIX: We render the active tab directly using standard React conditional rendering
          and a simple motion.div. This forces an immediate synchronous unmount of the old tab, 
          which resets all states cleanly, and triggers a beautiful entrance animation for the new tab.
        */}
        <div className="relative">
          {activeTab === 'sale' && (
            <motion.div
              key="sale-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SaleDonationTab mode="sale" />
            </motion.div>
          )}
          {activeTab === 'donation' && (
            <motion.div
              key="donation-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SaleDonationTab mode="donation" />
            </motion.div>
          )}
          {activeTab === 'estate' && (
            <motion.div
              key="estate-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <EstateTab />
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            Property Tax Calculator • For reference purposes only
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Please consult with BIR for official computations
          </p>
        </div>
      </footer>
    </div>
  );
}