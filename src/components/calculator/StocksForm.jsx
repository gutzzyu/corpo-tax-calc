import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Info } from 'lucide-react';
import { StaggerChild } from './AnimatedSection';

export default function StocksForm({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });
  const stockType = data?.stockType || '';

  return (
    <div className="space-y-4">
      <StaggerChild>
        <Card className="border-2 border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Stock Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={stockType} onValueChange={(v) => update('stockType', v)}>
              <SelectTrigger><SelectValue placeholder="Select stock type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="listed">Listed</SelectItem>
                <SelectItem value="non-listed">Non-Listed</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </StaggerChild>

      {stockType === 'listed' && (
        <motion.div
          key="listed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <ListedStockFields data={data} update={update} />
        </motion.div>
      )}
      {stockType === 'non-listed' && (
        <motion.div
          key="non-listed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <NonListedStockFields data={data} onChange={onChange} />
        </motion.div>
      )}
    </div>
  );
}

function ListedStockFields({ data, update }) {
  const [pseLoading, setPseLoading] = useState(false);
  const [pseMsg, setPseMsg] = useState('');

  const handlePSELookup = async () => {
    if (!data?.tickerSymbol) { setPseMsg('Please enter a stock ticker first.'); return; }
    setPseLoading(true);
    setPseMsg('');

    const ticker = data.tickerSymbol.trim().toUpperCase();

    // 1. Primary: PSE Edge (autocomplete + quote popup)
    try {
      const searchProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(
        `https://edge.pse.com.ph/autoComplete/searchCompanyNameSymbol.ax?term=${ticker}`
      )}`;
      const searchRes = await fetch(searchProxy, { signal: AbortSignal.timeout(8000) });
      const searchJson = await searchRes.json();
      const searchData = JSON.parse(searchJson.contents);

      if (Array.isArray(searchData) && searchData.length > 0) {
        const match = searchData.find(s =>
          s.symbol?.toUpperCase() === ticker || s.label?.toUpperCase().includes(ticker)
        ) || searchData[0];

        const securityId = match.securityId;
        if (securityId) {
          const quoteProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(
            `https://edge.pse.com.ph/common/template/qatoolkit/popupQuote.ax?securityId=${securityId}`
          )}`;
          const quoteRes = await fetch(quoteProxy, { signal: AbortSignal.timeout(8000) });
          const quoteJson = await quoteRes.json();
          const html = quoteJson.contents;

          const patterns = [
            /Close\s*<\/[^>]+>\s*<[^>]+>\s*([\d,]+\.?\d*)/i,
            /lastPrice['"]\s*>\s*([\d,]+\.?\d*)/i,
            /<td[^>]*class="[^"]*price[^"]*"[^>]*>\s*([\d,]+\.?\d*)/i,
            />([\d,]+\.\d{2})</g,
          ];

          let price = null;
          for (const pat of patterns) {
            const m = html.match(pat);
            if (m) { price = parseFloat(m[1].replace(/,/g, '')); if (price > 0) break; }
          }

          if (price && price > 0) {
            const grossSales = price * (data.numberOfShares || 0);
            update('sellingPrice', price);
            update('grossSalesValue', grossSales);
            update('stockName', match.label || ticker);
            setPseMsg(`✅ ${match.label || ticker}: ₱${price.toFixed(2)}/share — PSE Edge`);
            setPseLoading(false);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('PSE Edge failed:', e);
    }

    // 2. Fallback: Yahoo Finance (.PS suffix)
    try {
      const yhProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(
        `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}.PS?interval=1d&range=5d`
      )}`;
      const res = await fetch(yhProxy, { signal: AbortSignal.timeout(8000) });
      const json = await res.json();
      const parsed = JSON.parse(json.contents);
      const meta = parsed?.chart?.result?.[0]?.meta;

      if (meta?.regularMarketPrice) {
        const price = meta.regularMarketPrice;
        const companyName = meta.longName || meta.shortName || ticker;
        const grossSales = price * (data.numberOfShares || 0);
        update('sellingPrice', price);
        update('grossSalesValue', grossSales);
        update('stockName', companyName);
        setPseMsg(`✅ ${companyName} (${ticker}): ₱${price.toFixed(2)}/share — Yahoo Finance`);
        setPseLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Yahoo Finance failed:', e);
    }

      // 3. Final Fallback: Backend AI Proxy (Search Grounded)
      try {
        setPseMsg('🤖 Asking AI (Search Grounded)...');
        const prompt = `What is the latest closing price of ${ticker} on the Philippine Stock Exchange (PSE)? Return ONLY a JSON object with: price (number), info (string summary), company (string). No markdown.`;
        
        const aiResponse = await fetch('/api/ai/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        
        const result = await aiResponse.json();

        if (result?.price && result.price > 0) {
          const grossSales = result.price * (data.numberOfShares || 0);
          update('sellingPrice', result.price);
          update('grossSalesValue', grossSales);
          update('stockName', result.company || ticker);
          setPseMsg(`✅ ${result.company || ticker}: ₱${result.price.toFixed(2)}/share — AI Grounded Search`);
          setPseLoading(false);
          return;
        }
      } catch (e) {
        console.error('AI lookup failed:', e);
      }

    setPseMsg('❌ Could not retrieve price automatically. Please enter manually.');
    setPseLoading(false);
  };

  // Compute net gain for display
  const grossSales = data?.grossSalesValue || 0;
  const acquisitionCost = data?.acquisitionCost || 0;
  const netGain = grossSales - acquisitionCost;

  return (
    <Card className="border-2 border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-secondary" />
          Listed Stock Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Stock Name</Label>
            <Input placeholder="Company Name" value={data?.stockName || ''} onChange={(e) => update('stockName', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Stock Ticker</Label>
            <Input placeholder="e.g., GLO, TEL" value={data?.tickerSymbol || ''} onChange={(e) => update('tickerSymbol', e.target.value.toUpperCase())} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Transaction Date</Label>
            <Input type="date" value={data?.tradeDate || ''} onChange={(e) => update('tradeDate', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Number of Shares</Label>
            <Input type="number" placeholder="0" value={data?.numberOfShares || ''} onChange={(e) => update('numberOfShares', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Agreed Transfer Price (₱/share)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.00"
                value={data?.sellingPrice || ''}
                onChange={(e) => {
                  const price = parseFloat(e.target.value) || 0;
                  update('sellingPrice', price);
                  update('grossSalesValue', price * (data?.numberOfShares || 0));
                }}
              />
              <button
                type="button"
                onClick={handlePSELookup}
                disabled={pseLoading}
                className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 whitespace-nowrap disabled:opacity-60 flex items-center gap-1"
              >
                {pseLoading ? (
                  <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : '🔍'} PSE
              </button>
            </div>
            {pseMsg && (
              <p className={`text-xs mt-1 ${pseMsg.startsWith('✅') ? 'text-green-700' : 'text-destructive'}`}>
                {pseMsg}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground font-semibold">Gross Sales Value (₱) — auto-computed</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={data?.grossSalesValue || ''}
            onChange={(e) => update('grossSalesValue', parseFloat(e.target.value) || 0)}
            className="font-semibold"
          />
          {data?.numberOfShares > 0 && data?.sellingPrice > 0 && (
            <p className="text-xs text-muted-foreground">
              {data.numberOfShares.toLocaleString()} shares × ₱{Number(data.sellingPrice).toFixed(2)} = ₱{Number(data.grossSalesValue).toFixed(2)}
            </p>
          )}
        </div>

        {/* Acquisition Cost */}
        <div className="pt-3 border-t space-y-1.5">
          <Label className="text-xs text-muted-foreground font-semibold">
            Acquisition Cost (₱) — total original purchase cost
          </Label>
          <Input
            type="number"
            placeholder="0.00"
            value={data?.acquisitionCost || ''}
            onChange={(e) => update('acquisitionCost', parseFloat(e.target.value) || 0)}
          />
          <p className="text-xs text-muted-foreground">
            Enter the <strong>total cost</strong> when you originally bought these shares (price paid × shares + brokerage fees).
          </p>
          {grossSales > 0 && acquisitionCost > 0 && (
            <div className={`text-xs font-medium px-3 py-2 rounded-lg mt-1 ${netGain >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              Net Capital Gain / (Loss): ₱{netGain.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              <span className="text-muted-foreground font-normal ml-1">(informational — STT applies on gross sales regardless)</span>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 p-3 bg-secondary/5 rounded-lg border border-secondary/20">
          <Info className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            <strong>STT = Gross Sales Value × 0.1%</strong> — applies regardless of profit or loss. DST is exempt under CMEPA (R.A. 11534). If you are a Dealer in Securities, STT does not apply; you are taxed on Net Income instead.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function NonListedStockFields({ data, onChange }) {
  const shareType = data?.shareType || '';

  const handleNumberOfSharesChange = (rawValue) => {
    const shares = parseFloat(rawValue) || 0;
    const pricePerShare = parseFloat(data?.sellingPricePerShare) || 0;
    const costPerShare = parseFloat(data?.acquisitionCostPerShare) || 0;
    onChange({
      ...data,
      numberOfShares: rawValue,
      sellingPrice: shares > 0 && pricePerShare > 0 ? (shares * pricePerShare).toFixed(2) : data?.sellingPrice,
      acquisitionCost: shares > 0 && costPerShare > 0 ? (shares * costPerShare).toFixed(2) : data?.acquisitionCost,
    });
  };

  const handlePricePerShareChange = (rawValue) => {
    const pricePerShare = parseFloat(rawValue) || 0;
    const shares = parseFloat(data?.numberOfShares) || 0;
    onChange({
      ...data,
      sellingPricePerShare: rawValue,
      sellingPrice: shares > 0 && pricePerShare > 0 ? (shares * pricePerShare).toFixed(2) : data?.sellingPrice,
    });
  };

  const handleTotalPriceChange = (rawValue) => {
    const total = parseFloat(rawValue) || 0;
    const shares = parseFloat(data?.numberOfShares) || 0;
    onChange({
      ...data,
      sellingPrice: rawValue,
      sellingPricePerShare: shares > 0 && total > 0 ? (total / shares).toFixed(4) : data?.sellingPricePerShare,
    });
  };

  const handleAcquisitionCostPerShareChange = (rawValue) => {
    const costPerShare = parseFloat(rawValue) || 0;
    const shares = parseFloat(data?.numberOfShares) || 0;
    onChange({
      ...data,
      acquisitionCostPerShare: rawValue,
      acquisitionCost: shares > 0 && costPerShare > 0 ? (shares * costPerShare).toFixed(2) : data?.acquisitionCost,
    });
  };

  const handleTotalAcquisitionCostChange = (rawValue) => {
    const total = parseFloat(rawValue) || 0;
    const shares = parseFloat(data?.numberOfShares) || 0;
    onChange({
      ...data,
      acquisitionCost: rawValue,
      acquisitionCostPerShare: shares > 0 && total > 0 ? (total / shares).toFixed(4) : data?.acquisitionCostPerShare,
    });
  };

  const outstandingCapitalShares = parseFloat(data?.outstandingCapitalShares) || 0;
  const shareholdersEquity = parseFloat(data?.shareholdersEquity) || 0;
  const bvps = outstandingCapitalShares > 0
    ? (shareholdersEquity / outstandingCapitalShares).toFixed(2)
    : '0.00';

  return (
    <Card className="border-2 border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-secondary" />
          Non-Listed Stock Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Company + Share Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Company Name</Label>
            <Input
              placeholder="Corporation Name"
              value={data?.companyName || ''}
              onChange={(e) => onChange({ ...data, companyName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Share Type</Label>
            <Select
              value={shareType}
              onValueChange={(v) => onChange({ ...data, shareType: v })}
            >
              <SelectTrigger><SelectValue placeholder="Select share type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="common">Common Shares</SelectItem>
                <SelectItem value="preferred">Preferred Shares</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Number of Shares — shown once share type is picked */}
        {shareType && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Number of Shares to Sell</Label>
            <Input
              type="number"
              placeholder="0"
              value={data?.numberOfShares ?? ''}
              onChange={(e) => handleNumberOfSharesChange(e.target.value)}
            />
          </div>
        )}

        {/* Common & Preferred Shares details using isolated motion.div */}
        {shareType === 'common' && (
          <motion.div
            key="common"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Shareholder's Equity (₱)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={data?.shareholdersEquity ?? ''}
                  onChange={(e) => onChange({ ...data, shareholdersEquity: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Outstanding Capital Shares</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={data?.outstandingCapitalShares ?? ''}
                  onChange={(e) => onChange({ ...data, outstandingCapitalShares: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Book Value per Share (₱)</Label>
                <Input type="number" value={bvps} disabled className="bg-muted font-medium" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Par Value / Share (₱) — for DST</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={data?.parValue ?? ''}
                  onChange={(e) => onChange({ ...data, parValue: e.target.value })}
                />
              </div>
            </div>
          </motion.div>
        )}
        {shareType === 'preferred' && (
          <motion.div
            key="preferred"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Par Value per Share (₱)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={data?.parValue ?? ''}
                  onChange={(e) => onChange({ ...data, parValue: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Outstanding Capital Shares</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={data?.outstandingCapitalShares ?? ''}
                  onChange={(e) => onChange({ ...data, outstandingCapitalShares: e.target.value })}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Acquisition Cost fields — shown once share type is selected */}
        {shareType && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Acquisition Cost per Share (₱/share)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={data?.acquisitionCostPerShare ?? ''}
                onChange={(e) => handleAcquisitionCostPerShareChange(e.target.value)}
                className="border-input focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-semibold">Total Acquisition Cost (₱)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={data?.acquisitionCost ?? ''}
                onChange={(e) => handleTotalAcquisitionCostChange(e.target.value)}
                className="font-medium border-input focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Selling price fields — shown once share type is selected */}
        {shareType && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Selling Price per Share (₱/share)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={data?.sellingPricePerShare ?? ''}
                onChange={(e) => handlePricePerShareChange(e.target.value)}
                className="border-secondary/40 focus:border-secondary"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-semibold text-primary">Total Selling Price (₱)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={data?.sellingPrice ?? ''}
                onChange={(e) => handleTotalPriceChange(e.target.value)}
                className="font-bold border-secondary/40 focus:border-secondary"
              />
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}