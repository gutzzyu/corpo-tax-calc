// Philippine Tax Computation Engine

// ========== AUTO CWT RATE ==========
export function getAutoCWTRate(taxBase) {
  if (!taxBase || taxBase <= 0) return { rate: 0, label: '0%', desc: 'No value' };
  if (taxBase <= 500000) return { rate: 0.015, label: '1.5%', desc: '≤ ₱500,000' };
  if (taxBase <= 2000000) return { rate: 0.03, label: '3.0%', desc: '₱500,001 – ₱2,000,000' };
  return { rate: 0.05, label: '5.0%', desc: '> ₱2,000,000' };
}

// ========== SALE OF REAL PROPERTY ==========
export function computeSaleRealProperty(data) {
  const {
    sellingPrice = 0,
    fairMarketValue = 0,
    area = 0,
    zonalValue = 0,
    isTradeOrBusiness = false,
    isVATRegistered = false,
    hasImprovement = false,
    improvementAmount = 0,
  } = data;

  const areaTimesZonal = area * zonalValue;
  const taxBase = Math.max(sellingPrice, fairMarketValue, areaTimesZonal) + (hasImprovement ? improvementAmount : 0);

  if (isTradeOrBusiness) {
    // Auto CWT rate based on taxable base
    const cwtInfo = getAutoCWTRate(taxBase);
    const cwt = taxBase * cwtInfo.rate;
    // VAT only if VAT-registered (gross receipts >= P3M)
    const vat = isVATRegistered ? sellingPrice * 0.12 : 0;
    const dst = taxBase * 0.015;
    const transferTax = taxBase * 0.0075;

    return {
      taxBase,
      sellingPrice,
      fairMarketValue,
      areaTimesZonal,
      isTradeOrBusiness: true,
      isVATRegistered,
      cwtRate: cwtInfo.rate,
      cwtLabel: cwtInfo.label,
      cwtDesc: cwtInfo.desc,
      cwt,
      vat,
      dst,
      transferTax,
      totalTax: cwt + vat + dst + transferTax,
      breakdown: [
        { label: 'Tax Base (Highest Value)', value: taxBase },
        { label: `Creditable Withholding Tax (CWT) ${cwtInfo.label} — ${cwtInfo.desc}`, value: cwt },
        ...(isVATRegistered ? [{ label: 'Value Added Tax (VAT) 12% (VAT Registered)', value: vat }] : []),
        { label: 'Documentary Stamp Tax (DST) 1.5%', value: dst },
        { label: 'Transfer Tax 0.75%', value: transferTax },
      ],
    };
  }

  const cgt = taxBase * 0.06;
  const dst = taxBase * 0.015;
  const transferTax = taxBase * 0.0075;

  return {
    taxBase,
    sellingPrice,
    fairMarketValue,
    areaTimesZonal,
    isTradeOrBusiness: false,
    cgt,
    dst,
    transferTax,
    totalTax: cgt + dst + transferTax,
    breakdown: [
      { label: 'Tax Base (Highest Value)', value: taxBase },
      { label: 'Capital Gains Tax (CGT) 6%', value: cgt },
      { label: 'Documentary Stamp Tax (DST) 1.5%', value: dst },
      { label: 'Transfer Tax 0.75%', value: transferTax },
    ],
  };
}

// ========== DONATION OF REAL PROPERTY ==========
export function computeDonationRealProperty(data) {
  const { fairMarketValue = 0, area = 0, zonalValue = 0, hasImprovement = false, improvementAmount = 0, numberOfHeirs = 1 } = data;

  const areaTimesZonal = area * zonalValue;
  const taxBase = Math.max(fairMarketValue, areaTimesZonal) + (hasImprovement ? improvementAmount : 0);
  const exemption = 250000 * numberOfHeirs;
  const netGift = Math.max(taxBase - exemption, 0);
  const donorsTax = netGift * 0.06;
  const dst = taxBase * 0.015;
  const transferTax = taxBase * 0.0075;

  return {
    taxBase,
    fairMarketValue,
    areaTimesZonal,
    standardDeduction: exemption,
    netGift,
    donorsTax,
    dst,
    transferTax,
    totalTax: donorsTax + dst + transferTax,
    breakdown: [
      { label: 'Tax Base (Highest of FMV or Area × Zonal)', value: taxBase },
      { label: `Less: Annual Exemption (₱250k × ${numberOfHeirs})`, value: exemption },
      { label: 'Net Gift', value: netGift },
      { label: "Donor's Tax 6%", value: donorsTax },
      { label: 'Documentary Stamp Tax (DST) 1.5%', value: dst },
      { label: 'Transfer Tax 0.75%', value: transferTax },
    ],
  };
}

// ========== SALE OF STOCKS - LISTED ==========
export function computeSaleStocksListed(data) {
  const { grossSalesValue = 0, isTradeOrBusiness = false, sellingPrice = 0, acquisitionCost = 0 } = data;

  const stt = grossSalesValue * 0.001;
  const vat = isTradeOrBusiness ? (sellingPrice || grossSalesValue) * 0.12 : 0;
  const netGain = grossSalesValue - acquisitionCost;

  return {
    grossSalesValue,
    acquisitionCost,
    netGain,
    stt,
    vat,
    dst: 0,
    totalTax: stt + vat,
    breakdown: [
      { label: 'Gross Sales Value', value: grossSalesValue },
      { label: 'Less: Acquisition Cost', value: acquisitionCost },
      { label: 'Net Capital Gain / (Loss) — informational', value: netGain },
      { label: 'Stock Transaction Tax (STT) 0.1%', value: stt },
      ...(isTradeOrBusiness ? [{ label: 'Value Added Tax (VAT) 12%', value: vat }] : []),
      { label: 'DST', value: 0, note: 'Exempt (CMEPA / R.A. 11534)' },
    ],
  };
}

// ========== SALE OF STOCKS - NON-LISTED ==========
export function computeSaleStocksNonListed(data) {
  const {
    numberOfShares = 0,
    shareType = 'common',
    shareholdersEquity = 0,
    outstandingCapitalShares = 0,
    parValue = 0,
    sellingPrice = 0,
    sellingPricePerShare = 0,
    acquisitionCost = 0,
    acquisitionCostPerShare = 0,
    numberOfHeirs = 1,
  } = data;

  const numShares = parseFloat(numberOfShares) || 0;
  const spPerShare = parseFloat(sellingPricePerShare) || (numShares > 0 ? (parseFloat(sellingPrice) / numShares) : 0);
  const acPerShare = parseFloat(acquisitionCostPerShare) || (numShares > 0 ? (parseFloat(acquisitionCost) / numShares) : 0);

  let thresholdValPerShare = 0;
  let labelThreshold = '';

  if (shareType === 'common') {
    const outstanding = parseFloat(outstandingCapitalShares) || 0;
    thresholdValPerShare = outstanding > 0 ? (parseFloat(shareholdersEquity) / outstanding) : 0;
    labelThreshold = 'Book Value per Share (BV/s)';
  } else {
    thresholdValPerShare = parseFloat(parValue) || 0;
    labelThreshold = 'Par Value per Share (PV/s)';
  }

  // Transaction basis of the shares
  const transactionValue = spPerShare > 0 ? (spPerShare * numShares) : (thresholdValPerShare * numShares);

  // DST: ₱1.50 per ₱200 (0.75%) of par value. Fall back to transaction value if par value is not provided.
  const parValueNum = parseFloat(parValue) || 0;
  const dst = (parValueNum > 0 ? (parValueNum * numShares) : transactionValue) * 0.0075;

  // Notarization fee: 1/2 of 1% (0.5%) of transaction value
  const notarizationFee = transactionValue * 0.005;

  // Registration fee: 0.25% of transaction value
  const registrationFee = transactionValue * 0.0025;

  const totalFeesAndDst = dst + notarizationFee + registrationFee;

  const results = {
    bvps: thresholdValPerShare,
    thresholdValPerShare,
    labelThreshold,
    numberOfShares: numShares,
    sellingPrice: parseFloat(sellingPrice) || (spPerShare * numShares),
    acquisitionCost: parseFloat(acquisitionCost) || (acPerShare * numShares),
    sellingPricePerShare: spPerShare,
    acquisitionCostPerShare: acPerShare,
    shareType,
    dst,
    notarizationFee,
    registrationFee,
  };

  const netGain = (spPerShare - acPerShare) * numShares;
  const cgt = Math.max(0, netGain) * 0.15;
  const exemption = 250000 * numberOfHeirs;

  if (spPerShare >= thresholdValPerShare) {
    const totalTax = cgt + totalFeesAndDst;
    return {
      ...results,
      scenario: 'at_or_above_book',
      netGain,
      cgt,
      totalTax,
      breakdown: [
        { label: 'Share Type', value: shareType === 'common' ? 'Common (Non-Listed)' : 'Preferred (Non-Listed)', note: 'Type' },
        { label: labelThreshold, value: thresholdValPerShare },
        { label: 'Selling Price per Share (SP/s)', value: spPerShare },
        { label: 'Acquisition Cost per Share (AC/s)', value: acPerShare },
        { label: 'Net Gain = (SP/s - AC/s) × Shares', value: netGain },
        { label: 'Capital Gains Tax (CGT) 15%', value: cgt },
        { label: 'Documentary Stamp Tax (DST) — 0.75%', value: dst, note: '₱1.50 per ₱200 of par/value' },
        { label: 'Notarization Fee — 1/2 of 1% (0.5%)', value: notarizationFee },
        { label: 'Registration/Transfer Fee — 0.25%', value: registrationFee },
      ],
    };
  } else if (spPerShare === 0) {
    const grossGift = thresholdValPerShare * numShares;
    const taxableNetGift = Math.max(grossGift - exemption, 0);
    const donorsTax = taxableNetGift * 0.06;
    const totalTax = donorsTax + totalFeesAndDst;
    return {
      ...results,
      scenario: 'donation',
      grossGift,
      taxableNetGift,
      donorsTax,
      totalTax,
      breakdown: [
        { label: 'Share Type', value: shareType === 'common' ? 'Common (Non-Listed)' : 'Preferred (Non-Listed)', note: 'Type' },
        { label: labelThreshold, value: thresholdValPerShare },
        { label: 'Gross Gift = Threshold/s × Shares', value: grossGift },
        { label: `Less: Annual Exemption (₱250k × ${numberOfHeirs})`, value: exemption },
        { label: 'Taxable Net Gift', value: taxableNetGift },
        { label: "Donor's Tax 6%", value: donorsTax },
        { label: 'Documentary Stamp Tax (DST) — 0.75%', value: dst, note: '₱1.50 per ₱200 of par/value' },
        { label: 'Notarization Fee — 1/2 of 1% (0.5%)', value: notarizationFee },
        { label: 'Registration/Transfer Fee — 0.25%', value: registrationFee },
      ],
    };
  } else {
    // spPerShare < thresholdValPerShare (PARTIAL DONATION)
    const deemedGift = (thresholdValPerShare - spPerShare) * numShares;
    const donorsTax = Math.max(0, deemedGift - exemption) * 0.06;
    const totalTax = cgt + donorsTax + totalFeesAndDst;
    return {
      ...results,
      scenario: 'below_book',
      cgt,
      deemedGift,
      donorsTax,
      totalTax,
      breakdown: [
        { label: 'Share Type', value: shareType === 'common' ? 'Common (Non-Listed)' : 'Preferred (Non-Listed)', note: 'Type' },
        { label: labelThreshold, value: thresholdValPerShare },
        { label: 'Selling Price per Share (SP/s)', value: spPerShare },
        { label: 'Acquisition Cost per Share (AC/s)', value: acPerShare },
        { label: 'Net Gain = (SP/s - AC/s) × Shares', value: netGain },
        { label: 'Capital Gains Tax (CGT) 15%', value: cgt },
        { label: 'Deemed Gift = (Threshold/s - SP/s) × Shares', value: deemedGift },
        { label: `Donor's Tax = (Deemed Gift - Exemption) × 6%`, value: donorsTax, note: `Exemption applied: ₱${exemption}` },
        { label: 'Documentary Stamp Tax (DST) — 0.75%', value: dst, note: '₱1.50 per ₱200 of par/value' },
        { label: 'Notarization Fee — 1/2 of 1% (0.5%)', value: notarizationFee },
        { label: 'Registration/Transfer Fee — 0.25%', value: registrationFee },
      ],
    };
  }
}


// ========== ESTATE TAX ==========
export function computeEstateTax(data) {
  const { dateOfDeath, properties = [], isMarried = false, ordinaryDeductions = 0, numberOfHeirs = 1, heirs = [] } = data;
  const deathDate = new Date(dateOfDeath);
  const trainLawDate = new Date('2018-01-01');
  const isTRAINLaw = deathDate >= trainLawDate;

  // Derive actual heirs list and total count
  const actualHeirs = heirs.length > 0 ? heirs : Array(numberOfHeirs || 1).fill('');
  const finalNumberOfHeirs = actualHeirs.length;

  let grossEstate = 0;
  let familyHomeValue = 0;
  const propertyBreakdown = [];
  let extraFees = 0;
  const extraFeesBreakdown = [];

  properties.forEach((prop) => {
    let propValue = 0;
    let propLabel = prop.description || prop.propertyType || 'Property';

    if (prop.propertyType === 'land' || prop.propertyType === 'condo' || prop.propertyType === 'building') {
      const areaZonal = (prop.area || 0) * (prop.zonalValue || 0);
      propValue = Math.max(prop.fairMarketValue || 0, areaZonal);
      if (prop.hasImprovement) propValue += prop.improvementAmount || 0;
      const typeLabel = prop.propertyType.charAt(0).toUpperCase() + prop.propertyType.slice(1);
      propLabel = prop.description ? `${typeLabel} — ${prop.description}` : typeLabel;
    } else if (prop.propertyType === 'stocks') {
      if (prop.stockListing === 'listed') {
        propValue = (prop.marketPriceAtDeath || 0) * (prop.numberOfShares || 0);
      } else if (prop.stockListing === 'non-listed') {
        let bvps = 0;
        if (prop.shareType === 'common') {
          bvps = prop.outstandingShares > 0 ? (prop.shareholdersEquity || 0) / prop.outstandingShares : 0;
          propValue = bvps * (prop.numberOfShares || 0);
        } else if (prop.shareType === 'preferred') {
          propValue = (prop.parValue || 0) * (prop.numberOfShares || 0);
        }
        
        // Add formula changes logic for Estate Stocks!
        // DST, Notarization, Registration
        const parValueNum = parseFloat(prop.parValue) || 0;
        const numShares = parseFloat(prop.numberOfShares) || 0;
        const transactionValue = propValue;
        
        const dst = (parValueNum > 0 ? (parValueNum * numShares) : transactionValue) * 0.0075;
        const notarizationFee = transactionValue * 0.005;
        const registrationFee = transactionValue * 0.0025;
        
        extraFees += (dst + notarizationFee + registrationFee);
        extraFeesBreakdown.push(
          { label: `DST (Non-Listed Stocks${prop.description ? ' - ' + prop.description : ''})`, value: dst },
          { label: `Notarization Fee`, value: notarizationFee },
          { label: `Registration Fee`, value: registrationFee }
        );

      } else {
        propValue = prop.stockValue || 0;
      }
      propLabel = prop.description ? `Stocks — ${prop.description}` : 'Stocks';
      if (prop.stockTicker) propLabel += ` (${prop.stockTicker})`;
    } else if (prop.propertyType === 'vehicles') {
      propValue = prop.vehicleValue || 0;
      propLabel = prop.brand ? `Vehicle — ${prop.brand}` : 'Vehicle';
      if (prop.plateNumber) propLabel += ` (${prop.plateNumber})`;
    } else {
      propValue = prop.value || 0;
    }

    propertyBreakdown.push({ label: propLabel, value: propValue, isProperty: true });
    grossEstate += propValue;
    if (prop.isFamilyHome) {
      familyHomeValue = propValue;
    }
  });

  let standardDeduction, familyHomeDeductionMax, taxRate;

  if (isTRAINLaw) {
    standardDeduction = 5000000;
    familyHomeDeductionMax = 10000000;
    taxRate = 0.06;
  } else {
    standardDeduction = 1000000;
    familyHomeDeductionMax = 1000000;
    taxRate = null;
  }

  const familyHomeDeduction = Math.min(familyHomeValue, familyHomeDeductionMax);
  const heirsExemptionDeduction = finalNumberOfHeirs * 250000;
  const totalDeductions = standardDeduction + familyHomeDeduction + ordinaryDeductions + heirsExemptionDeduction;

  let netEstate = grossEstate - totalDeductions;
  if (isMarried) {
    netEstate = netEstate * 0.5;
  }
  netEstate = Math.max(netEstate, 0);

  let estateTax;
  if (isTRAINLaw) {
    estateTax = netEstate * 0.06;
  } else {
    estateTax = computeProgressiveEstateTax(netEstate);
  }

  const heirsBreakdown = actualHeirs.map((heir, idx) => {
    const name = heir.trim() || `Heir ${idx + 1}`;
    return { label: `Less: Heirs Exemption for ${name}`, value: 250000 };
  });

  return {
    isTRAINLaw,
    grossEstate,
    standardDeduction,
    familyHomeDeduction,
    ordinaryDeductions,
    totalDeductions,
    numberOfHeirs: finalNumberOfHeirs,
    heirsExemptionDeduction,
    extraFees,
    conjugalShare: isMarried ? (grossEstate - totalDeductions) * 0.5 : 0,
    netTaxableEstate: netEstate,
    estateTax,
    totalTax: estateTax + extraFees,
    breakdown: [
      ...propertyBreakdown,
      { label: 'Gross Estate (Total)', value: grossEstate, isTotal: true },
      { label: 'Less: Standard Deduction', value: standardDeduction },
      { label: 'Less: Family Home Deduction', value: familyHomeDeduction },
      { label: 'Less: Ordinary Deductions', value: ordinaryDeductions },
      ...heirsBreakdown,
      ...(isMarried ? [{ label: 'Less: Conjugal Share (50%)', value: (grossEstate - totalDeductions) * 0.5 }] : []),
      { label: 'Net Taxable Estate', value: netEstate },
      { label: isTRAINLaw ? 'Estate Tax 6% (TRAIN Law)' : 'Estate Tax (Progressive Rate)', value: estateTax },
      ...extraFeesBreakdown,
    ],
  };
}

function computeProgressiveEstateTax(netEstate) {
  const brackets = [
    { min: 0, max: 200000, rate: 0, fixed: 0 },
    { min: 200000, max: 500000, rate: 0.05, fixed: 0 },
    { min: 500000, max: 2000000, rate: 0.08, fixed: 15000 },
    { min: 2000000, max: 5000000, rate: 0.11, fixed: 135000 },
    { min: 5000000, max: 10000000, rate: 0.15, fixed: 465000 },
    { min: 10000000, max: Infinity, rate: 0.20, fixed: 1215000 },
  ];

  for (const bracket of brackets) {
    if (netEstate <= bracket.max) {
      return bracket.fixed + (netEstate - bracket.min) * bracket.rate;
    }
  }
  return 0;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function hectaresToSqm(hectares) {
  return hectares * 10000;
}