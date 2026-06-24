import { formatCurrency } from '../taxComputations';

/**
 * BIR Form No. 1801 - Estate Tax Return
 * January 2018 (ENCS) - 2 pages matching the actual BIR form
 */
export function getEstateTemplate(computationData) {
  const {
    seller_info,
    property_details,
    computation_result,
    ordinaryDeductions: ordinaryDeductionsObj = {},
  } = computationData;

  const deceased   = seller_info || {};
  const properties = property_details?.properties || [];
  const result     = computation_result || {};

  const f = (v) => formatCurrency(v || 0);

  // ── Categorise properties for schedules ────────────────────────────────
  let realPropertyTotal = 0;
  let familyHomeTotal   = 0;
  let stocksTotal       = 0;
  let otherPersonalTotal= 0;

  const realProps   = [];
  const familyProps = [];
  const stockProps  = [];
  const otherProps  = [];

  properties.forEach(prop => {
    let propValue = 0;

    if (prop.propertyType === 'land' || prop.propertyType === 'condo' || prop.propertyType === 'building') {
      const areaZonal = (prop.area || 0) * (prop.zonalValue || 0);
      propValue = Math.max(prop.fairMarketValue || 0, areaZonal);
      if (prop.hasImprovement) propValue += (prop.improvementAmount || 0);

      const classMap = { residential:'RR', commercial:'GP', industrial:'I', agricultural:'A' };
      const cls = classMap[prop.landClassification] || 'RR';

      if (prop.isFamilyHome) {
        familyHomeTotal += propValue;
        familyProps.push({ ...prop, computedValue: propValue, classCode: cls });
      } else {
        realPropertyTotal += propValue;
        realProps.push({ ...prop, computedValue: propValue, classCode: cls });
      }

    } else if (prop.propertyType === 'stocks') {
      if (prop.stockListing === 'listed') {
        propValue = (prop.marketPriceAtDeath || 0) * (prop.numberOfShares || 0);
      } else if (prop.stockListing === 'non-listed') {
        if (prop.shareType === 'common') {
          const bvps = prop.outstandingShares > 0 ? (prop.shareholdersEquity || 0) / prop.outstandingShares : 0;
          propValue = bvps * (prop.numberOfShares || 0);
        } else {
          propValue = (prop.parValue || 0) * (prop.numberOfShares || 0);
        }
      } else {
        propValue = prop.stockValue || 0;
      }
      stocksTotal += propValue;
      stockProps.push({ ...prop, computedValue: propValue });

    } else {
      propValue = prop.vehicleValue || prop.value || 0;
      otherPersonalTotal += propValue;
      otherProps.push({ ...prop, computedValue: propValue });
    }
  });

  const totalOrdinaryDeductions =
    (ordinaryDeductionsObj.claimsAgainstEstate      || 0) +
    (ordinaryDeductionsObj.unpairedMortgage          || 0) +
    (ordinaryDeductionsObj.taxes                     || 0) +
    (ordinaryDeductionsObj.lossesIncurredDuringSettlement || 0);

  const grossEstate       = result.grossEstate       || 0;
  const standardDeduction = result.standardDeduction || 5000000;
  const familyHomeDeduct  = result.familyHomeDeduction|| 0;
  const netTaxableEstate  = result.netTaxableEstate  || 0;
  const estateTax         = result.estateTax         || 0;
  const conjugalShare     = result.conjugalShare     || 0;
  const numberOfHeirs     = result.numberOfHeirs     || 1;
  const heirsExemptionDeduction = result.heirsExemptionDeduction || 0;
  const extraFees         = result.extraFees         || 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BIR Form No. 1801 - Estate Tax Return</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:Arial,Helvetica,sans-serif; font-size:9.5pt; color:#000; background:#fff; }
    .page { width:215mm; min-height:279mm; margin:0 auto; padding:8mm 10mm; page-break-after:always; }
    .page:last-child { page-break-after:auto; }

    .form-header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2.5px solid #000; padding-bottom:4px; margin-bottom:4px; }
    .gov-label { font-size:8pt; line-height:1.4; }
    .gov-label strong { font-size:9pt; }
    .form-title-center { text-align:center; flex:1; }
    .form-number { font-size:22pt; font-weight:bold; line-height:1; }
    .form-subtitle { font-size:8.5pt; margin-top:2px; }
    .form-title-big { font-size:13pt; font-weight:bold; margin:2px 0; }
    .bir-use-box { border:1px solid #000; padding:3px 6px; font-size:7.5pt; text-align:center; min-width:80px; }

    .instructions { font-size:7.5pt; border:1px solid #000; padding:2px 4px; margin:3px 0; line-height:1.4; }

    .field-row { display:flex; border-left:1px solid #000; border-right:1px solid #000; border-bottom:1px solid #000; }
    .field-row.top-border { border-top:1px solid #000; }
    .field-cell { padding:2px 4px; border-right:1px solid #000; flex:1; }
    .field-cell:last-child { border-right:none; }
    .field-label { font-size:7pt; color:#333; }
    .field-value { font-weight:bold; font-size:9pt; min-height:14px; text-transform:uppercase; }
    .field-value.normal { font-weight:normal; }

    .section-header { background:#c0c0c0; font-weight:bold; font-size:9pt; padding:2px 5px; border:1px solid #000; border-bottom:none; }

    .computation-row { display:flex; border-left:1px solid #000; border-right:1px solid #000; border-bottom:1px solid #000; }
    .computation-label { flex:3; padding:2px 5px; font-size:9pt; border-right:1px solid #000; }
    .computation-value { flex:1; padding:2px 5px; font-size:9pt; text-align:right; font-weight:bold; }
    .computation-value.blank { font-weight:normal; color:#666; }

    .penalty-row { display:flex; border-left:1px solid #000; border-right:1px solid #000; border-bottom:1px solid #000; }
    .penalty-label { flex:3; padding:2px 5px 2px 20px; font-size:9pt; border-right:1px solid #000; }
    .penalty-value { flex:1; padding:2px 5px; font-size:9pt; text-align:right; }

    .declaration { border:1px solid #000; padding:5px; font-size:7.5pt; line-height:1.4; margin:4px 0; }
    .sig-block { flex:1; border-top:1px solid #000; padding-top:3px; font-size:7.5pt; }

    table.payment-table { width:100%; border-collapse:collapse; font-size:8.5pt; }
    table.payment-table th, table.payment-table td { border:1px solid #000; padding:2px 4px; }
    table.payment-table th { background:#e0e0e0; font-size:8pt; }

    .schedule-header { font-weight:bold; font-size:8.5pt; padding:2px 4px; background:#e8e8e8; border:1px solid #000; border-bottom:none; margin-top:5px; }
    table.sched-table { width:100%; border-collapse:collapse; font-size:8pt; }
    table.sched-table th, table.sched-table td { border:1px solid #000; padding:2px 4px; vertical-align:top; }
    table.sched-table th { background:#f0f0f0; font-size:7.5pt; text-align:center; }
    table.sched-table td.amount { text-align:right; }
    .blank-row td { height:15px; }
    .total-row td { font-weight:bold; background:#f5f5f5; }

    /* Part IV three-column layout */
    table.part4-table { width:100%; border-collapse:collapse; font-size:8.5pt; }
    table.part4-table th, table.part4-table td { border:1px solid #000; padding:2px 4px; }
    table.part4-table th { background:#e0e0e0; text-align:center; }
    table.part4-table td.amount { text-align:right; }
    table.part4-table tr.subtotal td { background:#f0f0f0; font-weight:bold; }
    table.part4-table tr.grandtotal td { background:#1a365d; color:#fff; font-weight:bold; }

    .footnote { font-size:7pt; margin-top:3px; }
    .print-btn { margin-top:14px; text-align:center; }
    .print-btn button { padding:8px 22px; background:#1a365d; color:#fff; border:none; cursor:pointer; border-radius:4px; font-size:10pt; }
    @media print { .print-btn { display:none; } .page { margin:0; padding:8mm 10mm; } }
  </style>
</head>
<body>

<!-- ═══════════════════════════════ PAGE 1 ═══════════════════════════════ -->
<div class="page">

  <div class="form-header">
    <div class="gov-label">
      Republic of the Philippines<br>
      Department of Finance<br>
      <strong>Bureau of Internal Revenue</strong>
    </div>
    <div class="form-title-center">
      <div class="form-number">1801</div>
      <div class="form-subtitle">January 2018 (ENCS)</div>
      <div class="form-title-big">Estate Tax Return</div>
    </div>
    <div class="bir-use-box">For BIR<br>Use Only<br>BCS/<br>Item:</div>
  </div>
  <div style="text-align:right; font-size:7pt; margin-bottom:2px;">1801 01/18ENCS P1</div>

  <div class="instructions">
    Enter all required information in CAPITAL LETTERS using BLACK ink. Mark applicable boxes with an "X".
    Two copies MUST be filed with the BIR and one held by the taxpayer.
  </div>

  <!-- Rows 1-4 -->
  <div class="field-row top-border">
    <div class="field-cell" style="flex:1.2;">
      <div class="field-label">1 Date of Death (MM/DD/YYYY)</div>
      <div class="field-value">${deceased.dateOfDeath || ''}</div>
    </div>
    <div class="field-cell" style="flex:0.8;">
      <div class="field-label">2 Amended Return?</div>
      <div class="field-value normal">☐ Yes &nbsp; ☑ No</div>
    </div>
    <div class="field-cell" style="flex:0.6;">
      <div class="field-label">3 No. of Sheet/s Attached</div>
      <div class="field-value">0</div>
    </div>
    <div class="field-cell" style="flex:0.8;">
      <div class="field-label">4 Alphanumeric Tax Code (ATC)</div>
      <div class="field-value">ES 010</div>
    </div>
  </div>

  <!-- Part I -->
  <div class="section-header">Part I – Taxpayer Information</div>
  <div class="field-row">
    <div class="field-cell" style="flex:1.5;">
      <div class="field-label">5 Taxpayer Identification Number (TIN)</div>
      <div class="field-value">${deceased.tin || '___-___-___-000'}</div>
    </div>
    <div class="field-cell" style="flex:0.5;">
      <div class="field-label">6 RDO Code</div>
      <div class="field-value">&nbsp;</div>
    </div>
  </div>
  <div class="field-row">
    <div class="field-cell">
      <div class="field-label">7 Taxpayer's Name (ESTATE of Last Name, First Name, Middle Name)</div>
      <div class="field-value">ESTATE OF ${deceased.name || ''}</div>
    </div>
  </div>
  <div class="field-row">
    <div class="field-cell">
      <div class="field-label">8 Residence of Decedent at the time of death</div>
      <div class="field-value normal">${deceased.address || ''}</div>
    </div>
  </div>
  <div class="field-row">
    <div class="field-cell" style="flex:0.8;">
      <div class="field-label">9 Non-Resident Alien?</div>
      <div class="field-value normal">☐ Yes &nbsp; ☑ No</div>
    </div>
    <div class="field-cell" style="flex:0.8;">
      <div class="field-label">Civil Status</div>
      <div class="field-value">${deceased.civilStatus || ''}</div>
    </div>
    <div class="field-cell" style="flex:0.8;">
      <div class="field-label">Nationality</div>
      <div class="field-value">${deceased.nationality || ''}</div>
    </div>
  </div>
  <div class="field-row">
    <div class="field-cell">
      <div class="field-label">10 Name of Executor / Administrator</div>
      <div class="field-value">&nbsp;</div>
    </div>
    <div class="field-cell" style="flex:0.6;">
      <div class="field-label">11 TIN of Executor/Administrator</div>
      <div class="field-value">&nbsp;</div>
    </div>
  </div>
  <div class="field-row">
    <div class="field-cell">
      <div class="field-label">12 Contact Number</div>
      <div class="field-value">&nbsp;</div>
    </div>
    <div class="field-cell">
      <div class="field-label">13 Email Address</div>
      <div class="field-value">&nbsp;</div>
    </div>
  </div>
  <div class="field-row">
    <div class="field-cell">
      <div class="field-label">14 Are you availing of tax relief under a Special Law / International Tax Treaty?</div>
      <div class="field-value normal">☐ Yes &nbsp; ☑ No</div>
    </div>
  </div>
  <div class="field-row">
    <div class="field-cell">
      <div class="field-label">15 Mark Applicable Box</div>
      <div class="field-value normal" style="font-size:8pt;">
        15A Has extension to file been granted? ☐Yes ☑No &nbsp;&nbsp;
        15B Estate settled judicially? ☐Yes ☑No &nbsp;&nbsp;
        15C Extension to pay granted? ☐Yes ☑No &nbsp;&nbsp;
        15D Installment payment granted? ☐Yes ☑No
      </div>
    </div>
  </div>

  <!-- Part II -->
  <div class="section-header">Part II – Total Tax Payable</div>
  <div class="computation-row" style="border-top:1px solid #000;">
    <div class="computation-label">16 NET TAXABLE ESTATE (From Part IV, Item 40)</div>
    <div class="computation-value">${f(netTaxableEstate)}</div>
  </div>
  <div class="computation-row">
    <div class="computation-label">17 Applicable Tax Rate</div>
    <div class="computation-value">6.0%</div>
  </div>
  <div class="computation-row">
    <div class="computation-label"><strong>18 ESTATE TAX DUE (Item 16 × Item 17)</strong></div>
    <div class="computation-value"><strong>${f(estateTax)}</strong></div>
  </div>
  <div class="computation-row">
    <div class="computation-label">19 Less: Tax Credits/Payments</div>
    <div class="computation-value blank">&nbsp;</div>
  </div>
  <div class="penalty-row"><div class="penalty-label">19A Foreign Estate Tax Paid</div><div class="penalty-value">0.00</div></div>
  <div class="penalty-row"><div class="penalty-label">19B Tax Paid in Return Previously Filed (if amended)</div><div class="penalty-value">0.00</div></div>
  <div class="penalty-row"><div class="penalty-label">19C Total (Sum of Items 19A and 19B)</div><div class="penalty-value">0.00</div></div>
  <div class="computation-row">
    <div class="computation-label">20 Tax Payable (Item 18 Less Item 19C)</div>
    <div class="computation-value">${f(estateTax)}</div>
  </div>
  <div class="computation-row">
    <div class="computation-label">21 Less: Portion of tax for installment (if applicable)</div>
    <div class="computation-value blank">0.00</div>
  </div>
  <div class="computation-row">
    <div class="computation-label">22 Tax Payable (1st installment) (Item 20 Less Item 21)</div>
    <div class="computation-value">${f(estateTax)}</div>
  </div>
  <div class="computation-row">
    <div class="computation-label">23 Add: Penalties</div>
    <div class="computation-value blank">&nbsp;</div>
  </div>
  <div class="penalty-row"><div class="penalty-label">23A Surcharge</div><div class="penalty-value">0.00</div></div>
  <div class="penalty-row"><div class="penalty-label">23B Interest</div><div class="penalty-value">0.00</div></div>
  <div class="penalty-row"><div class="penalty-label">23C Compromise</div><div class="penalty-value">0.00</div></div>
  <div class="penalty-row"><div class="penalty-label">23D Total Penalties</div><div class="penalty-value">0.00</div></div>
  ${extraFees > 0 ? `
  <div class="computation-row">
    <div class="computation-label">Add: Non-Listed Stocks Transfer Fees (DST, Notarization, Registration)</div>
    <div class="computation-value">${f(extraFees)}</div>
  </div>
  ` : ''}
  <div class="computation-row" style="background:#f0f0f0;">
    <div class="computation-label"><strong>24 TOTAL AMOUNT PAYABLE (Tax & Fees)</strong></div>
    <div class="computation-value"><strong>${f(estateTax + extraFees)}</strong></div>
  </div>

  <!-- Declaration -->
  <div class="declaration">
    I/We declare under the penalties of perjury that this return, and all its attachments, have been made in good faith, verified by me/us,
    and to the best of my/our knowledge and belief, is true and correct pursuant to the provisions of the National Internal Revenue Code,
    as amended, and the regulations issued under authority thereof.
    <div style="display:flex; gap:8px; margin-top:12px;">
      <div class="sig-block">
        <div style="height:24px;">&nbsp;</div>
        <div>Signature over Printed Name of Executor/Administrator/Heir/Authorized Representative/Tax Agent</div>
        <div>(Indicate title/designation and TIN)</div>
      </div>
      <div class="sig-block" style="flex:0.8;">
        <div>Tax Agent Accreditation No./Attorney's Roll No.</div>
        <div style="height:14px;">&nbsp;</div>
        <div>Date of Issue (MM/DD/YYYY)</div>
        <div style="height:10px;">&nbsp;</div>
        <div>Date of Expiry (MM/DD/YYYY)</div>
      </div>
    </div>
  </div>

  <!-- Part III -->
  <div class="section-header">Part III – Details of Payment</div>
  <table class="payment-table">
    <thead>
      <tr>
        <th style="width:28%;">Details of Payment</th>
        <th>Drawee Bank / Agency Number</th>
        <th style="width:18%;">Date (MM/DD/YYYY)</th>
        <th style="width:18%;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>25 Cash/Bank Debit Memo</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
      <tr><td>26 Check</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
      <tr><td>27 Tax Debit Memo</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
      <tr><td>28 Others (Specify)</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    </tbody>
  </table>
  <div style="border:1px solid #000; border-top:none; padding:20px 5px 5px; font-size:7.5pt;">
    Machine Validation Stamp of Authorized Agent Bank and Date of Receipt (Bank Teller's Initial)
  </div>
  <div style="font-size:7pt; margin-top:3px;">*NOTE: The BIR Data Privacy Policy is in the BIR website (www.bir.gov.ph)</div>

</div><!-- end page 1 -->


<!-- ═══════════════════════════════ PAGE 2 ═══════════════════════════════ -->
<div class="page">

  <div class="form-header">
    <div class="gov-label">
      Republic of the Philippines<br>
      Department of Finance<br>
      <strong>Bureau of Internal Revenue</strong>
    </div>
    <div class="form-title-center">
      <div class="form-number">1801</div>
      <div class="form-subtitle">January 2018 (ENCS)</div>
      <div class="form-title-big">Estate Tax Return</div>
    </div>
    <div class="bir-use-box">Page 2</div>
  </div>
  <div style="text-align:right; font-size:7pt; margin-bottom:4px;">1801 01/18ENCS P2</div>

  <div class="field-row top-border">
    <div class="field-cell" style="flex:0.5;">
      <div class="field-label">TIN</div>
      <div class="field-value">${deceased.tin || '___-___-___-000'}</div>
    </div>
    <div class="field-cell">
      <div class="field-label">Taxpayer's Name</div>
      <div class="field-value">ESTATE OF ${deceased.name || ''}</div>
    </div>
  </div>

  <!-- Part IV – three-column computation -->
  <div class="section-header" style="margin-top:6px;">Part IV – Computation of Tax</div>
  <table class="part4-table">
    <thead>
      <tr>
        <th style="width:46%;">Particulars</th>
        <th style="width:18%;">A. Exclusive</th>
        <th style="width:18%;">B. Conjugal / Communal</th>
        <th style="width:18%;">C. Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>29 Real Properties Excluding Family Home (From Part V Schedule 1)</td>
        <td class="amount">${f(realPropertyTotal)}</td>
        <td class="amount">0.00</td>
        <td class="amount">${f(realPropertyTotal)}</td>
      </tr>
      <tr>
        <td>30 Family Home (From Part V Schedule 1A)</td>
        <td class="amount">${f(familyHomeTotal)}</td>
        <td class="amount">0.00</td>
        <td class="amount">${f(familyHomeTotal)}</td>
      </tr>
      <tr>
        <td>31 Personal Properties (From Part V Schedules 2 &amp; 2A)</td>
        <td class="amount">${f(stocksTotal + otherPersonalTotal)}</td>
        <td class="amount">0.00</td>
        <td class="amount">${f(stocksTotal + otherPersonalTotal)}</td>
      </tr>
      <tr>
        <td>32 Taxable Transfer (From Part V Schedule 3)</td>
        <td class="amount">0.00</td>
        <td class="amount">0.00</td>
        <td class="amount">0.00</td>
      </tr>
      <tr>
        <td>33 Business Interest (From Part V Schedule 4)</td>
        <td class="amount">0.00</td>
        <td class="amount">0.00</td>
        <td class="amount">0.00</td>
      </tr>
      <tr class="subtotal">
        <td>34 Gross Estate (Sum of Items 29 to 33)</td>
        <td class="amount">${f(grossEstate)}</td>
        <td class="amount">0.00</td>
        <td class="amount">${f(grossEstate)}</td>
      </tr>
      <tr>
        <td>35 Less: Ordinary Deductions (From Part V Schedule 5)</td>
        <td class="amount">(${f(totalOrdinaryDeductions)})</td>
        <td class="amount">0.00</td>
        <td class="amount">(${f(totalOrdinaryDeductions)})</td>
      </tr>
      <tr>
        <td>36 Estate after Ordinary Deductions (Item 34 Less Item 35)</td>
        <td class="amount">${f(grossEstate - totalOrdinaryDeductions)}</td>
        <td class="amount">0.00</td>
        <td class="amount">${f(grossEstate - totalOrdinaryDeductions)}</td>
      </tr>
      <tr>
        <td>37 Less: Special Deductions</td>
        <td></td><td></td><td></td>
      </tr>
      <tr>
        <td style="padding-left:16px;">37A Standard Deduction (₱5,000,000 for Citizen/Resident; ₱500,000 for Non-Resident Alien)</td>
        <td class="amount">(${f(standardDeduction)})</td>
        <td class="amount"></td>
        <td class="amount">(${f(standardDeduction)})</td>
      </tr>
      <tr>
        <td style="padding-left:16px;">37B Family Home (FMV or ₱10,000,000 whichever is lower)</td>
        <td class="amount">(${f(familyHomeDeduct)})</td>
        <td class="amount"></td>
        <td class="amount">(${f(familyHomeDeduct)})</td>
      </tr>
      ${heirsExemptionDeduction > 0 ? `
      <tr>
        <td style="padding-left:16px;">37C Heirs Exemption Deduction (₱250,000 × ${numberOfHeirs})</td>
        <td class="amount">(${f(heirsExemptionDeduction)})</td>
        <td class="amount"></td>
        <td class="amount">(${f(heirsExemptionDeduction)})</td>
      </tr>
      ` : `
      <tr>
        <td style="padding-left:16px;">37C Others (specify)</td>
        <td class="amount">0.00</td>
        <td class="amount"></td>
        <td class="amount">0.00</td>
      </tr>
      `}
      <tr>
        <td style="padding-left:16px;">37D Total Special Deductions (Sum of 37A to 37C)</td>
        <td class="amount">(${f(standardDeduction + familyHomeDeduct + heirsExemptionDeduction)})</td>
        <td class="amount"></td>
        <td class="amount">(${f(standardDeduction + familyHomeDeduct + heirsExemptionDeduction)})</td>
      </tr>
      <tr>
        <td>38 NET ESTATE (Item 36 Less Item 37D)</td>
        <td class="amount">${f(grossEstate - totalOrdinaryDeductions - standardDeduction - familyHomeDeduct - heirsExemptionDeduction)}</td>
        <td class="amount">0.00</td>
        <td class="amount">${f(grossEstate - totalOrdinaryDeductions - standardDeduction - familyHomeDeduct - heirsExemptionDeduction)}</td>
      </tr>
      <tr>
        <td>39 Less: Share of Surviving Spouse (Net Conjugal Estate ÷ 2)</td>
        <td class="amount">(${f(conjugalShare)})</td>
        <td class="amount"></td>
        <td class="amount">(${f(conjugalShare)})</td>
      </tr>
      <tr class="grandtotal">
        <td><strong>40 NET TAXABLE ESTATE (Item 38 Less Item 39) → (To Part II Item 16)</strong></td>
        <td class="amount"><strong>${f(netTaxableEstate)}</strong></td>
        <td class="amount"></td>
        <td class="amount"><strong>${f(netTaxableEstate)}</strong></td>
      </tr>
    </tbody>
  </table>

  <!-- Part V – Schedule 1: Real Properties -->
  <div class="schedule-header">Part V – Schedule 1 – Details of Property (REAL PROPERTIES)</div>
  <table class="sched-table">
    <thead>
      <tr>
        <th>OCT/TCT/CCT No.</th>
        <th>TD No.</th>
        <th>Location</th>
        <th>Lot/Improvement</th>
        <th>Area</th>
        <th>*Class.</th>
        <th>FMV per TD</th>
        <th>FMV per BIR</th>
        <th>FMV (higher)</th>
      </tr>
    </thead>
    <tbody>
      ${realProps.length > 0 ? realProps.map(p => `
      <tr>
        <td>${p.titleNo || ''}</td>
        <td>${p.taxDecNo || ''}</td>
        <td>${p.description || ''}</td>
        <td>${p.propertyType || ''}</td>
        <td class="amount">${p.area || ''}</td>
        <td>${p.classCode || ''}</td>
        <td class="amount">${f(p.fairMarketValue || 0)}</td>
        <td class="amount">${f((p.area||0)*(p.zonalValue||0))}</td>
        <td class="amount">${f(p.computedValue)}</td>
      </tr>`).join('') : '<tr class="blank-row"><td colspan="9">&nbsp;</td></tr>'}
      <tr class="total-row">
        <td colspan="8" style="text-align:right;">TOTAL (To Part IV Item 29)</td>
        <td class="amount">${f(realPropertyTotal)}</td>
      </tr>
    </tbody>
  </table>

  <!-- Schedule 1A: Family Home -->
  <div class="schedule-header">Schedule 1A – Details of Family Home</div>
  <table class="sched-table">
    <thead>
      <tr>
        <th>OCT/TCT/CCT No.</th>
        <th>TD No.</th>
        <th>Location</th>
        <th>Area</th>
        <th>*Classification</th>
        <th>FMV per TD</th>
        <th>FMV per BIR</th>
        <th>FMV (higher)</th>
      </tr>
    </thead>
    <tbody>
      ${familyProps.length > 0 ? familyProps.map(p => `
      <tr>
        <td>${p.titleNo || ''}</td>
        <td>${p.taxDecNo || ''}</td>
        <td>${p.description || ''}</td>
        <td class="amount">${p.area || ''}</td>
        <td>${p.classCode || ''}</td>
        <td class="amount">${f(p.fairMarketValue || 0)}</td>
        <td class="amount">${f((p.area||0)*(p.zonalValue||0))}</td>
        <td class="amount">${f(p.computedValue)}</td>
      </tr>`).join('') : '<tr class="blank-row"><td colspan="8">&nbsp;</td></tr>'}
      <tr class="total-row">
        <td colspan="7" style="text-align:right;">TOTAL (To Part IV Item 30)</td>
        <td class="amount">${f(familyHomeTotal)}</td>
      </tr>
    </tbody>
  </table>

  <!-- Schedule 2: Stocks -->
  <div class="schedule-header">Schedule 2 – Personal Properties (SHARES OF STOCK)</div>
  <table class="sched-table">
    <thead>
      <tr>
        <th>Name of Corporation</th>
        <th>Classification (Listed/Not Listed)</th>
        <th>Stock Cert. No.</th>
        <th>No. of Shares</th>
        <th>FMV / Book Value per Share</th>
        <th>Total FMV / Book Value</th>
      </tr>
    </thead>
    <tbody>
      ${stockProps.length > 0 ? stockProps.map(p => `
      <tr>
        <td>${p.description || p.stockTicker || ''}</td>
        <td>${p.stockListing === 'listed' ? 'Listed' : 'Not Listed'}</td>
        <td></td>
        <td class="amount">${p.numberOfShares || ''}</td>
        <td class="amount">${p.numberOfShares > 0 ? f(p.computedValue / p.numberOfShares) : '0.00'}</td>
        <td class="amount">${f(p.computedValue)}</td>
      </tr>`).join('') : '<tr class="blank-row"><td colspan="6">&nbsp;</td></tr>'}
      <tr class="total-row">
        <td colspan="5" style="text-align:right;">TOTAL (To Part IV Item 31)</td>
        <td class="amount">${f(stocksTotal)}</td>
      </tr>
    </tbody>
  </table>

  <!-- Schedule 2A: Other Personal -->
  <div class="schedule-header">Schedule 2A – Other Personal Properties</div>
  <table class="sched-table">
    <thead>
      <tr><th>Particulars</th><th>Fair Market Value</th></tr>
    </thead>
    <tbody>
      ${otherProps.length > 0 ? otherProps.map(p => `
      <tr>
        <td>${p.brand ? `Vehicle – ${p.brand}${p.plateNumber ? ' (' + p.plateNumber + ')' : ''}` : (p.description || 'Personal Property')}</td>
        <td class="amount">${f(p.computedValue)}</td>
      </tr>`).join('') : '<tr class="blank-row"><td>&nbsp;</td><td></td></tr>'}
      <tr class="total-row">
        <td style="text-align:right;">TOTAL (To Part IV Item 31)</td>
        <td class="amount">${f(otherPersonalTotal)}</td>
      </tr>
    </tbody>
  </table>

  <!-- Schedule 5: Ordinary Deductions -->
  <div class="schedule-header">Schedule 5 – Ordinary Deductions</div>
  <table class="sched-table">
    <thead>
      <tr><th style="width:60%;">Particulars</th><th>Exclusive</th><th>Conjugal/Communal</th></tr>
    </thead>
    <tbody>
      <tr><td>Claims against the Estate</td><td class="amount">${f(ordinaryDeductionsObj.claimsAgainstEstate || 0)}</td><td class="amount">0.00</td></tr>
      <tr><td>Claims of the deceased against Insolvent Persons</td><td class="amount">0.00</td><td class="amount">0.00</td></tr>
      <tr><td>Unpaid Mortgages, Taxes and Casualty Losses</td><td class="amount">${f((ordinaryDeductionsObj.unpairedMortgage || 0) + (ordinaryDeductionsObj.taxes || 0))}</td><td class="amount">0.00</td></tr>
      <tr><td>Losses incurred during the settlement of the Estate</td><td class="amount">${f(ordinaryDeductionsObj.lossesIncurredDuringSettlement || 0)}</td><td class="amount">0.00</td></tr>
      <tr><td>Property Previously Taxed (Vanishing Deduction)</td><td class="amount">0.00</td><td class="amount">0.00</td></tr>
      <tr><td>Transfers for Public Use</td><td class="amount">0.00</td><td class="amount">0.00</td></tr>
      <tr class="total-row">
        <td style="text-align:right;">TOTAL (To Part IV Item 35)</td>
        <td class="amount">${f(totalOrdinaryDeductions)}</td>
        <td class="amount">0.00</td>
      </tr>
    </tbody>
  </table>

  <div class="footnote" style="margin-top:5px;">
    * RR-Residential Regular &nbsp; CR-Condominium Regular &nbsp; CL-Cemetery Lot &nbsp; GL-Government Lot &nbsp;
    A-Agricultural &nbsp; X-Institutional &nbsp; RC-Residential Condominium &nbsp; CC-Commercial Condominium &nbsp;
    PS-Parking Slot &nbsp; GP-General Purpose &nbsp; I-Industrial &nbsp; APD-Area for Priority Development
  </div>

  <div class="print-btn">
    <button onclick="window.print()">🖨️ Print Estate Tax Return (BIR Form 1801)</button>
  </div>

</div><!-- end page 2 -->

</body>
</html>`;
}