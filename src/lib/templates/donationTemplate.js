import { formatCurrency } from '../taxComputations';

/**
 * BIR Form No. 1800 - Donor's Tax Return
 * January 2018 (ENCS) - 2 pages matching the actual BIR form
 */
export function getDonationTemplate(computationData) {
  const {
    seller_info = {},
    buyer_info  = {},
    property_details = {},
    computation_result = {},
  } = computationData;

  const f = (v) => formatCurrency(v || 0);
  const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

  const taxBase    = computation_result?.taxBase    || 0;
  const netGift    = computation_result?.netGift    || 0;
  const donorsTax  = computation_result?.donorsTax  || 0;
  const dst        = computation_result?.dst        || 0;
  const transferTax= computation_result?.transferTax|| 0;
  const exemption  = 250000;

  const fmv        = property_details?.fairMarketValue || 0;
  const area       = property_details?.area            || 0;
  const zonalValue = property_details?.zonalValue      || 0;
  const areaZonal  = area * zonalValue;
  const improvAmt  = property_details?.hasImprovement ? (property_details?.improvementAmount || 0) : 0;

  const classMap   = { residential:'RR', commercial:'GP', industrial:'I', agricultural:'A' };
  const classCode  = classMap[property_details?.landClassification] || 'RR';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BIR Form No. 1800 - Donor's Tax Return</title>
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
    .sig-row { display:flex; gap:8px; margin-top:4px; }
    .sig-block { flex:1; border-top:1px solid #000; padding-top:3px; font-size:7.5pt; }

    table.payment-table { width:100%; border-collapse:collapse; font-size:8.5pt; margin-top:0; }
    table.payment-table th, table.payment-table td { border:1px solid #000; padding:2px 4px; }
    table.payment-table th { background:#e0e0e0; font-size:8pt; }

    .schedule-header { font-weight:bold; font-size:8.5pt; padding:2px 4px; background:#e8e8e8; border:1px solid #000; border-bottom:none; }
    table.sched-table { width:100%; border-collapse:collapse; font-size:8pt; }
    table.sched-table th, table.sched-table td { border:1px solid #000; padding:2px 4px; vertical-align:top; }
    table.sched-table th { background:#f0f0f0; font-size:7.5pt; text-align:center; }
    table.sched-table td.amount { text-align:right; }
    .blank-row td { height:16px; }
    .total-row td { font-weight:bold; background:#f5f5f5; }
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
      <div class="form-number">1800</div>
      <div class="form-subtitle">January 2018 (ENCS)</div>
      <div class="form-title-big">Donor's Tax Return</div>
    </div>
    <div class="bir-use-box">For BIR<br>Use Only<br>BCS/<br>Item:</div>
  </div>
  <div style="text-align:right; font-size:7pt; margin-bottom:2px;">1800 01/18ENCS P1</div>

  <div class="instructions">
    Enter all required information in CAPITAL LETTERS using BLACK ink. Mark applicable boxes with an "X".
    Two copies MUST be filed with the BIR and one held by the taxpayer.
  </div>

  <!-- Rows 1-4 -->
  <div class="field-row top-border">
    <div class="field-cell" style="flex:1.2;">
      <div class="field-label">1 Date of Donation (MM/DD/YYYY)</div>
      <div class="field-value">${today}</div>
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
      <div class="field-value">DN 010</div>
    </div>
  </div>

  <!-- Part I -->
  <div class="section-header">Part I – Taxpayer Information</div>
  <div class="field-row">
    <div class="field-cell" style="flex:1.5;">
      <div class="field-label">5 Donor's TIN</div>
      <div class="field-value">${seller_info?.tin || '___-___-___-000'}</div>
    </div>
    <div class="field-cell" style="flex:0.5;">
      <div class="field-label">6 RDO Code</div>
      <div class="field-value">&nbsp;</div>
    </div>
  </div>
  <div class="field-row">
    <div class="field-cell">
      <div class="field-label">7 Donor's Name (Last Name, First Name, Middle Name for Individuals OR Registered Name for Non-Individuals)</div>
      <div class="field-value">${seller_info?.name || ''}</div>
    </div>
  </div>
  <div class="field-row">
    <div class="field-cell" style="flex:2;">
      <div class="field-label">8 Registered Address</div>
      <div class="field-value normal">${seller_info?.address || ''}</div>
    </div>
    <div class="field-cell" style="flex:0.4;">
      <div class="field-label">8A ZIP Code</div>
      <div class="field-value">&nbsp;</div>
    </div>
  </div>
  <div class="field-row">
    <div class="field-cell" style="flex:2;">
      <div class="field-label">9 Residence Address (at the time of donation)</div>
      <div class="field-value normal">${seller_info?.address || ''}</div>
    </div>
    <div class="field-cell" style="flex:0.4;">
      <div class="field-label">9A ZIP Code</div>
      <div class="field-value">&nbsp;</div>
    </div>
    <div class="field-cell" style="flex:0.4;">
      <div class="field-label">9B RDO Code</div>
      <div class="field-value">&nbsp;</div>
    </div>
  </div>
  <div class="field-row">
    <div class="field-cell">
      <div class="field-label">10 Contact Number</div>
      <div class="field-value">&nbsp;</div>
    </div>
    <div class="field-cell">
      <div class="field-label">11 Email Address</div>
      <div class="field-value">&nbsp;</div>
    </div>
  </div>
  <div class="field-row">
    <div class="field-cell" style="flex:2;">
      <div class="field-label">12 Donee's Name (Last Name, First Name, Middle Name / Registered Name)</div>
      <div class="field-value">${buyer_info?.name || ''}</div>
    </div>
    <div class="field-cell" style="flex:1;">
      <div class="field-label">Donee's TIN</div>
      <div class="field-value">${buyer_info?.tin || '___-___-___-000'}</div>
    </div>
  </div>
  <div class="field-row">
    <div class="field-cell">
      <div class="field-label">13 Are you availing of tax relief under a Special Law / International Tax Treaty?</div>
      <div class="field-value normal">☐ Yes &nbsp; ☑ No</div>
    </div>
  </div>

  <!-- Part II -->
  <div class="section-header">Part II – Computation of Tax</div>
  <div class="computation-row" style="border-top:1px solid #000;">
    <div class="computation-label">14 Total Net Gifts Subject to Tax (From Part IV Item 38)</div>
    <div class="computation-value">${f(netGift)}</div>
  </div>
  <div class="computation-row">
    <div class="computation-label">15 Applicable Donor's Tax Rate</div>
    <div class="computation-value">6.0%</div>
  </div>
  <div class="computation-row">
    <div class="computation-label"><strong>16 Total Donor's Tax Due (Item 14 × Item 15)</strong></div>
    <div class="computation-value"><strong>${f(donorsTax)}</strong></div>
  </div>
  <div class="computation-row">
    <div class="computation-label">17 Less: Tax Credit Payments</div>
    <div class="computation-value blank">&nbsp;</div>
  </div>
  <div class="penalty-row">
    <div class="penalty-label">17A Payments for Prior Gifts During the Calendar Year</div>
    <div class="penalty-value">0.00</div>
  </div>
  <div class="penalty-row">
    <div class="penalty-label">17B Foreign Donor's Tax Paid</div>
    <div class="penalty-value">0.00</div>
  </div>
  <div class="penalty-row">
    <div class="penalty-label">17C Tax Paid in Previously Filed Return (if amended)</div>
    <div class="penalty-value">0.00</div>
  </div>
  <div class="penalty-row">
    <div class="penalty-label">17D Total Tax Credits/Payments (Sum of 17A to 17C)</div>
    <div class="penalty-value">0.00</div>
  </div>
  <div class="computation-row">
    <div class="computation-label">18 Tax Payable/(Overpayment) (Item 16 Less Item 17D)</div>
    <div class="computation-value">${f(donorsTax)}</div>
  </div>
  <div class="computation-row">
    <div class="computation-label">19 Add: Penalties</div>
    <div class="computation-value blank">&nbsp;</div>
  </div>
  <div class="penalty-row"><div class="penalty-label">19A Surcharge</div><div class="penalty-value">0.00</div></div>
  <div class="penalty-row"><div class="penalty-label">19B Interest</div><div class="penalty-value">0.00</div></div>
  <div class="penalty-row"><div class="penalty-label">19C Compromise</div><div class="penalty-value">0.00</div></div>
  <div class="penalty-row">
    <div class="penalty-label">19D Total Penalties (Sum of 19A to 19C)</div>
    <div class="penalty-value">0.00</div>
  </div>
  <div class="computation-row" style="background:#f0f0f0;">
    <div class="computation-label"><strong>20 TOTAL AMOUNT PAYABLE (Sum of Items 18 and 19D)</strong></div>
    <div class="computation-value"><strong>${f(donorsTax)}</strong></div>
  </div>

  <!-- Declaration -->
  <div class="declaration">
    I/We declare under the penalties of perjury that this return, and all its attachments, have been made in good faith, verified by me/us, and to the best of my/our knowledge and belief, is true and correct
    pursuant to the provisions of the National Internal Revenue Code, as amended, and the regulations issued under authority thereof.
    Further, I/we give my/our consent to the processing of my/our information as contemplated under the
    <em>Data Privacy Act of 2012 (R.A. No. 10173)</em> for legitimate and lawful purposes.
    <div class="sig-row" style="margin-top:12px;">
      <div class="sig-block">
        <div>For Individual:</div>
        <div style="height:24px;">&nbsp;</div>
        <div>Signature over Printed Name of Taxpayer/Authorized Representative/Tax Agent</div>
        <div>(Indicate title/designation and TIN)</div>
      </div>
      <div class="sig-block">
        <div>For Non-Individual:</div>
        <div style="height:24px;">&nbsp;</div>
        <div>Signature over Printed Name of President/VP/Authorized Officer</div>
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
      <tr><td>21 Cash/Bank Debit Memo</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
      <tr><td>22 Check</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
      <tr><td>23 Tax Debit Memo</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
      <tr><td>24 Others (Specify)</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
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
      <div class="form-number">1800</div>
      <div class="form-subtitle">January 2018 (ENCS)</div>
      <div class="form-title-big">Donor's Tax Return</div>
    </div>
    <div class="bir-use-box">Page 2</div>
  </div>
  <div style="text-align:right; font-size:7pt; margin-bottom:4px;">1800 01/18ENCS P2</div>

  <div class="field-row top-border">
    <div class="field-cell" style="flex:0.5;">
      <div class="field-label">TIN</div>
      <div class="field-value">${seller_info?.tin || '___-___-___-000'}</div>
    </div>
    <div class="field-cell">
      <div class="field-label">Donor's Name</div>
      <div class="field-value">${seller_info?.name || ''}</div>
    </div>
  </div>

  <!-- Part IV -->
  <div class="section-header" style="margin-top:6px;">Part IV – Computation of Tax</div>
  <div class="computation-row" style="border-top:1px solid #000;">
    <div class="computation-label">25 Personal Properties (From Part V Schedule A)</div>
    <div class="computation-value blank">0.00</div>
  </div>
  <div class="computation-row">
    <div class="computation-label">26 Real Properties (From Part V Schedule B)</div>
    <div class="computation-value">${f(taxBase)}</div>
  </div>
  <div class="computation-row">
    <div class="computation-label"><strong>27 Total Gifts in this Return (Sum of Items 25 and 26)</strong></div>
    <div class="computation-value"><strong>${f(taxBase)}</strong></div>
  </div>
  <div class="computation-row">
    <div class="computation-label" style="padding-left:16px;">28 Deductions</div>
    <div class="computation-value blank">0.00</div>
  </div>
  <div class="computation-row">
    <div class="computation-label" style="padding-left:16px;">29–32 Other Deductions</div>
    <div class="computation-value blank">0.00</div>
  </div>
  <div class="computation-row">
    <div class="computation-label">33 Total Deductions Allowed (Sum of Items 28 to 32)</div>
    <div class="computation-value blank">0.00</div>
  </div>
  <div class="computation-row">
    <div class="computation-label">34 Total Net Gifts in this Return (Item 27 Less Item 33)</div>
    <div class="computation-value">${f(taxBase)}</div>
  </div>
  <div class="computation-row">
    <div class="computation-label">35 Add: Total Prior Net Gifts During the Calendar Year</div>
    <div class="computation-value blank">0.00</div>
  </div>
  <div class="computation-row">
    <div class="computation-label">36 Total Net Gifts (Sum of Items 34 and 35)</div>
    <div class="computation-value">${f(taxBase)}</div>
  </div>
  <div class="computation-row">
    <div class="computation-label">37 Less: Exempt Gift</div>
    <div class="computation-value">${f(exemption)}</div>
  </div>
  <div class="computation-row" style="background:#f0f0f0;">
    <div class="computation-label"><strong>38 Total Net Gifts Subject to Tax (Item 36 Less Item 37) → (To Part II Item 14)</strong></div>
    <div class="computation-value"><strong>${f(netGift)}</strong></div>
  </div>

  <!-- Part V – Schedule A -->
  <div class="schedule-header" style="margin-top:8px;">Part V – Schedule A – Description of Donated Personal Property</div>
  <table class="sched-table">
    <thead>
      <tr>
        <th style="width:5%;">#</th>
        <th>Particulars</th>
        <th style="width:25%;">Fair Market Value</th>
      </tr>
    </thead>
    <tbody>
      ${[1,2,3,4,5,6,7,8,9,10].map(i => `<tr class="blank-row"><td>${i}</td><td></td><td></td></tr>`).join('')}
      <tr class="total-row">
        <td colspan="2" style="text-align:right;">TOTAL (To Part IV Item 25)</td>
        <td class="amount">0.00</td>
      </tr>
    </tbody>
  </table>

  <!-- Part V – Schedule B -->
  <div class="schedule-header" style="margin-top:6px;">Part V – Schedule B – Description of Donated Real Property</div>
  <table class="sched-table">
    <thead>
      <tr>
        <th style="width:4%;">#</th>
        <th>OCT/TCT/CCT No.</th>
        <th>Tax Declaration No. (TD)</th>
        <th>Location</th>
        <th>Lot/Improvement</th>
        <th>*Classification</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>${property_details?.titleNo || ''}</td>
        <td>${property_details?.taxDecNo || ''}</td>
        <td>${seller_info?.address || ''}</td>
        <td>${property_details?.landClassification || 'Land'}</td>
        <td>${classCode}</td>
      </tr>
      ${[2,3,4,5,6,7,8,9,10].map(i => `<tr class="blank-row"><td>${i}</td><td></td><td></td><td></td><td></td><td></td></tr>`).join('')}
    </tbody>
  </table>

  <!-- Schedule B continuation -->
  <div class="schedule-header" style="margin-top:4px;">Schedule B – Continuation of the Description of Donated Real Property</div>
  <table class="sched-table">
    <thead>
      <tr>
        <th style="width:4%;">#</th>
        <th>Area (sq.m.)</th>
        <th>FMV per TD</th>
        <th>FMV per BIR (Zonal Value)</th>
        <th>Fair Market Value (whichever is higher)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td class="amount">${area}</td>
        <td class="amount">${f(fmv)}</td>
        <td class="amount">${f(areaZonal)}</td>
        <td class="amount">${f(Math.max(fmv, areaZonal))}</td>
      </tr>
      ${improvAmt > 0 ? `<tr><td></td><td></td><td class="amount">Improvement: ${f(improvAmt)}</td><td></td><td class="amount">${f(improvAmt)}</td></tr>` : ''}
      ${[2,3,4,5,6,7,8,9,10].map(i => `<tr class="blank-row"><td>${i}</td><td></td><td></td><td></td><td></td></tr>`).join('')}
      <tr class="total-row">
        <td colspan="4" style="text-align:right;">TOTAL (To Part IV Item 26)</td>
        <td class="amount">${f(taxBase)}</td>
      </tr>
    </tbody>
  </table>

  <!-- Summary -->
  <div style="margin-top:8px; border:1.5px solid #1a365d; padding:6px 8px; background:#f8f9ff;">
    <div style="font-weight:bold; font-size:9pt; margin-bottom:4px;">Tax Summary</div>
    <table style="width:100%; font-size:9pt; border-collapse:collapse;">
      <tr>
        <td style="padding:2px 4px;">Tax Base (FMV or Area × Zonal, whichever higher)</td>
        <td style="text-align:right; padding:2px 4px;">${f(taxBase)}</td>
      </tr>
      <tr>
        <td style="padding:2px 4px;">Less: Annual Exemption (₱250,000)</td>
        <td style="text-align:right; padding:2px 4px;">(${f(exemption)})</td>
      </tr>
      <tr>
        <td style="padding:2px 4px;">Net Gift Subject to Tax</td>
        <td style="text-align:right; padding:2px 4px;">${f(netGift)}</td>
      </tr>
      <tr>
        <td style="padding:2px 4px;">Donor's Tax – 6%</td>
        <td style="text-align:right; padding:2px 4px;">${f(donorsTax)}</td>
      </tr>
      <tr>
        <td style="padding:2px 4px;">Documentary Stamp Tax (DST) – 1.5%</td>
        <td style="text-align:right; padding:2px 4px;">${f(dst)}</td>
      </tr>
      <tr>
        <td style="padding:2px 4px;">Transfer Tax – 0.75%</td>
        <td style="text-align:right; padding:2px 4px;">${f(transferTax)}</td>
      </tr>
      <tr style="font-weight:bold; border-top:1.5px solid #1a365d;">
        <td style="padding:3px 4px;">TOTAL TAX DUE</td>
        <td style="text-align:right; padding:3px 4px; color:#1a365d;">${f(donorsTax + dst + transferTax)}</td>
      </tr>
    </table>
  </div>

  <div class="footnote">
    * RR-Residential Regular &nbsp; CR-Condominium Regular &nbsp; CL-Cemetery Lot &nbsp; GL-Government Lot &nbsp;
    A-Agricultural &nbsp; X-Institutional &nbsp; RC-Residential Condominium &nbsp; CC-Commercial Condominium &nbsp;
    PS-Parking Slot &nbsp; GP-General Purpose &nbsp; I-Industrial &nbsp; APD-Area for Priority Development
  </div>

  <div class="print-btn">
    <button onclick="window.print()">🖨️ Print BIR Form 1800</button>
  </div>

</div><!-- end page 2 -->

</body>
</html>`;
}