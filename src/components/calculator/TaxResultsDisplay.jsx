import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/taxComputations';

export default function TaxResultsDisplay({ results, title = 'Tax Computation Results' }) {
  if (!results) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card className="border-2 border-secondary/30 shadow-lg bg-gradient-to-br from-card to-secondary/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
            <Calculator className="w-5 h-5 text-secondary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {results.breakdown?.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3 }}
              className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                item.isTotal
                  ? 'bg-primary/5 border border-primary/20 font-bold'
                  : item.isProperty
                  ? 'hover:bg-muted/50 pl-6'
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <ArrowRight className={`w-3 h-3 ${item.isProperty ? 'text-muted-foreground' : 'text-secondary'}`} />
                <span className={`text-sm ${item.isTotal ? 'font-bold text-primary' : item.isProperty ? 'text-muted-foreground' : 'text-muted-foreground'}`}>{item.label}</span>
                {item.note && <span className="text-xs text-secondary">({item.note})</span>}
              </div>
              <span className={`font-semibold text-sm ${item.isTotal ? 'text-primary' : 'text-foreground'}`}>{formatCurrency(item.value)}</span>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (results.breakdown?.length || 0) * 0.06 + 0.1 }}
            className="mt-4 pt-4 border-t-2 border-secondary/20"
          >
            <div className="flex items-center justify-between px-3 py-3 bg-primary/5 rounded-xl">
              <span className="font-bold text-primary">TOTAL TAX DUE</span>
              <span className="text-xl font-bold text-secondary">{formatCurrency(results.totalTax)}</span>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}