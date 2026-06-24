import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calculator, FileDown, Home, Car, Building, Building2 } from 'lucide-react';
import {
  computeSaleRealProperty,
  computeDonationRealProperty,
  computeSaleStocksListed,
  computeSaleStocksNonListed,
} from '@/lib/taxComputations';
import { generateTaxPDF } from '@/lib/pdfGenerator';
import PartyInfoForm from './PartyInfoForm';
import LandForm from './LandForm';
import StocksForm from './StocksForm';
import VehicleForm from './VehicleForm';
import TaxResultsDisplay from './TaxResultsDisplay';
import FlowingTabs from './FlowingTabs';
import AnimatedSection, { StaggerChild } from './AnimatedSection';

// ─── Property type lists ──────────────────────────────────────────────────
const realPropertyTypes = [
  { id: 'land',     label: 'Land',        icon: Home },
  { id: 'building', label: 'Building',    icon: Building },
  { id: 'condo',    label: 'Condominium', icon: Building2 },
];

const personalPropertyTypes = [
  { id: 'stocks',   label: 'Stocks',   icon: Calculator },
  { id: 'vehicles', label: 'Vehicles', icon: Car },
];

const propertyCategories = [
  { id: 'real',     label: 'Real Property',     icon: Home },
  { id: 'personal', label: 'Personal Property', icon: Car },
];

// ─── Main Component ───────────────────────────────────────────────────────
// KEY FIX: The `mode` prop (sale/donation) is passed in from Calculator.jsx.
// Each time the parent switches tabs, a NEW instance of this component is
// mounted because we add `key={mode}` in Calculator.jsx.
// This guarantees all local state is fully reset when switching between
// Sale, Donation, and Estate — no stale data bleeds across tabs.
export default function SaleDonationTab({ mode }) {
  const [propertyCategory, setPropertyCategory] = useState('real');
  const [propertyType, setPropertyType]         = useState('land');
  const [sellerInfo, setSellerInfo]             = useState({});
  const [buyerInfo, setBuyerInfo]               = useState({});
  const [propertyData, setPropertyData]         = useState({});
  const [results, setResults]                   = useState(null);

  const handleCategoryChange = (cat) => {
    setPropertyCategory(cat);
    setPropertyType(cat === 'real' ? 'land' : 'stocks');
    setPropertyData({});
    setResults(null);
  };

  const handlePropertyTypeChange = (type) => {
    setPropertyType(type);
    setPropertyData({});
    setResults(null);
  };

  const handleCompute = () => {
    let res = null;
    const numberOfHeirs = buyerInfo?.numberOfPeople || 1;
    const compData = { ...propertyData, numberOfHeirs };

    if (propertyCategory === 'real') {
      res = mode === 'sale'
        ? computeSaleRealProperty(compData)
        : computeDonationRealProperty(compData);
    } else {
      if (propertyType === 'stocks') {
        res = propertyData.stockType === 'listed'
          ? computeSaleStocksListed(compData)
          : computeSaleStocksNonListed(compData);
      } else if (propertyType === 'vehicles') {
        res = mode === 'sale'
          ? computeSaleRealProperty({ ...compData, sellingPrice: propertyData.vehicleValue || 0 })
          : computeDonationRealProperty({ ...compData, fairMarketValue: propertyData.vehicleValue || 0 });
      }
    }
    setResults(res);
  };

  const handleDownload = () => {
    generateTaxPDF({
      computation_type: mode,
      seller_info: sellerInfo,
      buyer_info: buyerInfo,
      property_details: propertyData,
      computation_result: results,
    });
  };

  const currentTypes = propertyCategory === 'real' ? realPropertyTypes : personalPropertyTypes;

  return (
    <div className="space-y-6">
      {/* Section title */}
      <StaggerChild>
        <div className="text-center mb-2">
          <h2 className="text-2xl font-bold text-primary">
            {mode === 'sale' ? 'Sale Tax Calculator' : 'Donation Tax Calculator'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'sale'
              ? 'Calculate capital gains tax on property sales'
              : "Calculate donor's tax on property donations"}
          </p>
        </div>
      </StaggerChild>

      {/* Real / Personal Property category tabs */}
      <StaggerChild>
        <div className="max-w-sm mx-auto">
          <FlowingTabs
            tabs={propertyCategories}
            activeTab={propertyCategory}
            onTabChange={handleCategoryChange}
            variant="secondary"
            layoutId={`sub-tab-bg-${mode}`}
          />
        </div>
      </StaggerChild>

      {/* Property Type Selector */}
      <AnimatedSection keyProp={`${mode}-${propertyCategory}-types`}>
        <StaggerChild>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <Building2 className="w-4 h-4 text-secondary" />
              Select Property Type
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentTypes.map((type) => {
                const isActive = propertyType === type.id;
                return (
                  <motion.button
                    key={type.id}
                    onClick={() => handlePropertyTypeChange(type.id)}
                    whileTap={{ scale: 0.97 }}
                    className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      isActive
                        ? 'border-secondary bg-secondary/5 shadow-md'
                        : 'border-border hover:border-secondary/40 hover:shadow-sm bg-background'
                    }`}
                  >
                    <type.icon
                      className={`w-5 h-5 flex-shrink-0 transition-colors ${
                        isActive ? 'text-secondary' : 'text-muted-foreground'
                      }`}
                    />
                    <span
                      className={`font-medium text-sm ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {type.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId={`prop-indicator-${mode}`}
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
      </AnimatedSection>

      {/* Party Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PartyInfoForm
          title={mode === 'sale' ? 'Seller Information' : 'Donor Information'}
          data={sellerInfo}
          onChange={setSellerInfo}
        />
        <PartyInfoForm
          title={mode === 'sale' ? 'Buyer Information' : 'Donee Information'}
          data={buyerInfo}
          onChange={setBuyerInfo}
          allowMultiple={true}
        />
      </div>

      {/* Property Details — switches based on category + type */}
      {propertyCategory === 'real' && (
        <motion.div
          key={`${mode}-real-${propertyType}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <LandForm
            data={propertyData}
            onChange={setPropertyData}
            mode={mode}
            showClassification={propertyType === 'land'}
          />
        </motion.div>
      )}
      {propertyCategory === 'personal' && propertyType === 'stocks' && (
        <motion.div
          key={`${mode}-personal-stocks`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <StocksForm data={propertyData} onChange={setPropertyData} />
        </motion.div>
      )}
      {propertyCategory === 'personal' && propertyType === 'vehicles' && (
        <motion.div
          key={`${mode}-personal-vehicles`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <VehicleForm data={propertyData} onChange={setPropertyData} />
        </motion.div>
      )}

      {/* Compute Button */}
      <motion.div whileTap={{ scale: 0.98 }}>
        <Button onClick={handleCompute} className="w-full h-12 text-base font-semibold gap-2">
          <Calculator className="w-5 h-5" />
          Compute Tax
        </Button>
      </motion.div>

      {/* Results */}
      {results && (
        <AnimatedSection keyProp={`results-${mode}`}>
          <TaxResultsDisplay results={results} />
          <div className="mt-4">
            <Button onClick={handleDownload} variant="outline" className="w-full gap-2">
              <FileDown className="w-4 h-4" />
              Download BIR Form PDF
            </Button>
          </div>
        </AnimatedSection>
      )}
    </div>
  );
}
