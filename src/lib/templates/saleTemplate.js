import { formatCurrency } from '../taxComputations';

/**
 * BIR Form No. 1706 - Capital Gains Tax Return (Real Property)
 * January 2018 (ENCS) - 2 pages matching the actual BIR form
 */
export function getSaleRealPropertyTemplate(computationData) {
  const {
    seller_info = {},
    buyer_info = {},
    property_details = {},
    computation_result = {},
  } = computationData;

  const f = (v) => formatCurrency(v || 0);
  const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

  const taxBase      = computation_result?.taxBase      || 0;
  const cgt          = computation_result?.cgt          || computation_result?.cwt || 0;
  const sellingPrice = property_details?.sellingPrice   || 0;
  const fmv          = property_details?.fairMarketValue|| 0;
  const area         = property_details?.area           || 0;
  const zonalValue   = property_details?.zonalValue     || 0;
  const areaZonal    = area * zonalValue;
  const dst          = computation_result?.dst          || 0;
  const transferTax  = computation_result?.transferTax  || 0;
  const isTradeOrBiz = property_details?.isTradeOrBusiness || false;

  // Classification code mapping
  const classMap = {
    residential: 'RR', commercial: 'GP', industrial: 'I', agricultural: 'A',
  };
  const classCode = classMap[property_details?.landClassification] || 'RR';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BIR Form No. 1706 - Capital Gains Tax Return</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9.5pt;
      color: #000;
      background: #fff;
    }
    .page {
      width: 215mm;
      min-height: 279mm;
      margin: 0 auto;
      padding: 8mm 10mm;
      page-break-after: always;
    }
    .page:last-child { page-break-after: auto; }

    /* ── header ── */
    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2.5px solid #000;
      padding-bottom: 4px;
      margin-bottom: 4px;
    }
    .gov-label { font-size: 8pt; line-height: 1.4; }
    .gov-label strong { font-size: 9pt; }
    .form-title-center { text-align: center; flex: 1; }
    .form-number { font-size: 22pt; font-weight: bold; line-height: 1; }
    .form-subtitle { font-size: 8.5pt; margin-top: 2px; }
    .form-title-big { font-size: 13pt; font-weight: bold; margin: 2px 0; }
    .bir-use-box {
      border: 1px solid #000;
      padding: 3px 6px;
      font-size: 7.5pt;
      text-align: center;
      min-width: 80px;
    }

    /* ── instructions bar ── */
    .instructions {
      font-size: 7.5pt;
      border: 1px solid #000;
      padding: 2px 4px;
      margin: 3px 0;
      line-height: 1.4;
    }

    /* ── field rows ── */
    .field-row {
      display: flex;
      border-left: 1px solid #000;
      border-right: 1px solid #000;
      border-bottom: 1px solid #000;
    }
    .field-row.top-border { border-top: 1px solid #000; }
    .field-cell {
      padding: 2px 4px;
      border-right: 1px solid #000;
      flex: 1;
    }
    .field-cell:last-child { border-right: none; }
    .field-label { font-size: 7pt; color: #333; }
    .field-value {
      font-weight: bold;
      font-size: 9pt;
      min-height: 14px;
      text-transform: uppercase;
    }
    .field-value.normal { font-weight: normal; }

    /* ── section headers ── */
    .section-header {
      background: #c0c0c0;
      font-weight: bold;
      font-size: 9pt;
      padding: 2px 5px;
      border: 1px solid #000;
      border-bottom: none;
    }

    /* ── part II computation ── */
    .computation-row {
      display: flex;
      border-left: 1px solid #000;
      border-right: 1px solid #000;
      border-bottom: 1px solid #000;
    }
    .computation-label {
      flex: 3;
      padding: 2px 5px;
      font-size: 9pt;
      border-right: 1px solid #000;
    }
    .computation-value {
      flex: 1;
      padding: 2px 5px;
      font-size: 9pt;
      text-align: right;
      font-weight: bold;
    }
    .computation-value.blank { font-weight: normal; color: #666; }

    /* ── penalty sub-rows ── */
    .penalty-row {
      display: flex;
      border-left: 1px solid #000;
      border-right: 1px solid #000;
      border-bottom: 1px solid #000;
    }
    .penalty-label {
      flex: 3;
      padding: 2px 5px 2px 20px;
      font-size: 9pt;
      border-right: 1px solid #000;
    }
    .penalty-value {
      flex: 1;
      padding: 2px 5px;
      font-size: 9pt;
      text-align: right;
    }

    /* ── declaration ── */
    .declaration {
      border: 1px solid #000;
      padding: 5px;
      font-size: 7.5pt;
      line-height: 1.4;
      margin: 4px 0;
    }
    .sig-row {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }
    .sig-block {
      flex: 1;
      border-top: 1px solid #000;
      padding-top: 3px;
      font-size: 7.5pt;
    }

    /* ── payment part III ── */
    table.payment-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      margin-top: 0;
    }
    table.payment-table th, table.payment-table td {
      border: 1px solid #000;
      padding: 2px 4px;
    }
    table.payment-table th { background: #e0e0e0; font-size: 8pt; }

    /* ── page 2 schedules ── */
    .schedule-header {
      font-weight: bold;
      font-size: 8.5pt;
      padding: 2px 4px;
      background: #e8e8e8;
      border: 1px solid #000;
      border-bottom: none;
    }
    table.sched-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
    }
    table.sched-table th, table.sched-table td {
      border: 1px solid #000;
      padding: 2px 4px;
      vertical-align: top;
    }
    table.sched-table th { background: #f0f0f0; font-size: 7.5pt; text-align: center; }
    table.sched-table td.amount { text-align: right; }
    .blank-row td { height: 16px; }
    .total-row td { font-weight: bold; background: #f5f5f5; }
    .footnote { font-size: 7pt; margin-top: 3px; }

    /* ── print button ── */
    .print-btn {
      margin-top: 14px;
      text-align: center;
    }
    .print-btn button {
      padding: 8px 22px;
      background: #1a365d;
      color: #fff;
      border: none;
      cursor: pointer;
      border-radius: 4px;
      font-size: 10pt;
    }
    @media print {
      .print-btn { display: none; }
      .page { margin: 0; padding: 8mm 10mm; }
    }
  </style>
</head>
<body>

<!-- ═══════════════════════════════ PAGE 1 ═══════════════════════════════ -->
<div class="page">

  <!-- Header -->
  <div class="form-header">
    <div class="gov-label">
      Republic of the Philippines<br>
      Department of Finance<br>
      <strong>Bureau of Internal Revenue</strong>
    </div>
    <div class="form-title-center">
      <div class="form-number">1706</div>
      <div class="form-subtitle">January 2018 (ENCS)</div>
      <div class="form-title-big">Capital Gains Tax Return</div>
      <div style="font-size:7.5pt;">(For Onerous Transfer of Real Property Classified as Capital Asset)</div>
    </div>
    <div class="bir-use-box">
      For BIR<br>Use Only<br>BCS/<br>Item:
    </div>
  </div>

  <div style="text-align:right; font-size:7pt; margin-bottom:2px;">1706 01/18 ENCS P1</div>

  <div class="instructions">
    Enter all required information in CAPITAL LETTERS using BLACK ink. Mark applicable boxes with an "X".
    Two copies MUST be filed with the BIR and one held by the Taxpayer.
  </div>

  <!-- Row 1-3 -->
  <div class="field-row top-border">
    <div class="field-cell" style="flex:1.2;">
      <div class="field-label">1 Date of Transaction (MM/DD/YYYY)</div>
      <div class="field-value">${today}</div>
    </div>
    <div class="field-cell" style="flex:0.8;">
      <div class="field-label">2 Amended Return?</div>
      <div class="field-value normal">☐ Yes &nbsp; ☑ No</div>
    </div>
    <div class="field-cell" style="flex:0.8;">
      <div class="field-label">3 ATC</div>
      <div class="field-value">WI 450</div>
    </div>
    <div class="field-cell" style="flex:0.8;">
      <div class="field-label">4 No. of Sheet/s Attached</div>
      <div class="field-value">0</div>
    </div>
  </div>

  <!-- Part I -->
  <div class="section-header">Part I – Background Information</div>
  <div class="field-row">
    <div class="field-cell">
      <div class="field-label">5 RDO Code of Location of Property</div>
      <div class="field-value">&nbsp;</div>
    </div>
  </div>
  <div class="field-row">
    <div class="field-cell">
      <div class="field-label">6 Seller's Name (Last Name, First Name, Middle Name for Individuals OR Registered Name for Non-Individuals)</div>
      <div class="field-value">${seller_info?.name || ''}</div>
    </div>
  </div>
  <div class="field-row">
    <div class="field-cell" style="flex:2;">
      <div class="field-label">Seller's Registered Address</div>
      <div class="field-value normal">${seller_info?.address || ''}</div>
    </div>
    <div class="field-cell" style="flex:1;">
      <div class="field-label">Seller's TIN</div>
      <div class="field-value">${seller_info?.tin || '___-___-___-___'}</div>
    </div>
  </div>
  <div class="field-row">
    <div class="field-cell">
      <div class="field-label">7 Buyer's Name (Last Name, First Name, Middle Name for Individuals OR Registered Name for Non-Individuals)</div>
      <div class="field-value">${buyer_info?.name || ''}</div>
    </div>
  </div>
  <div class="field-row">
    <div class="field-cell" style="flex:2;">
      <div class="field-label">Buyer's Registered Address</div>
      <div class="field-value normal">${buyer_info?.address || ''}</div>
    </div>
    <div class="field-cell" style="flex:1;">
      <div class="field-label">Buyer's TIN</div>
      <div class="field-value">${buyer_info?.tin || '___-___-___-___'}</div>
    </div>
  </div>
  <div class="field-row">
    <div class="field-cell">
      <div class="field-label">8 Is the property being sold your principal residence? (For Individual sellers only)</div>
      <div class="field-value normal">☐ Yes &nbsp; ☑ No</div>
    </div>
    <div class="field-cell">
      <div class="field-label">9 Do you intend to construct or acquire a new principal residence within 18 months?</div>
      <div class="field-value normal">☐ Yes &nbsp; ☑ No</div>
    </div>
  </div>
  <div class="field-row">
    <div class="field-cell">
      <div class="field-label">10 Does the selling price cover more than one property?</div>
      <div class="field-value normal">☐ Yes &nbsp; ☑ No</div>
    </div>
    <div class="field-cell">
      <div class="field-label">11 Are you availing of tax relief under an International Tax Treaty or Special Law?</div>
      <div class="field-value normal">☐ Yes &nbsp; ☑ No</div>
    </div>
  </div>

  <!-- Part II -->
  <div class="section-header">Part II – Computation of Tax</div>
  <div class="computation-row" style="border-top:1px solid #000;">
    <div class="computation-label">12 Taxable Base (From Part IV, Schedule 4 Item 2)</div>
    <div class="computation-value">${f(taxBase)}</div>
  </div>
  <div class="computation-row">
    <div class="computation-label">13 Applicable Tax Rate</div>
    <div class="computation-value">6.0%</div>
  </div>
  <div class="computation-row">
    <div class="computation-label"><strong>14 Tax Due (Item 12 × Item 13)</strong></div>
    <div class="computation-value"><strong>${f(cgt)}</strong></div>
  </div>
  <div class="computation-row">
    <div class="computation-label">15 Less: Tax paid in previously filed return, if this is an amended return</div>
    <div class="computation-value blank">0.00</div>
  </div>
  <div class="computation-row">
    <div class="computation-label">16 Tax Payable/(Overpayment) (Item 14 Less Item 15)</div>
    <div class="computation-value">${f(cgt)}</div>
  </div>
  <div class="computation-row">
    <div class="computation-label">17 Add: Penalties</div>
    <div class="computation-value blank">&nbsp;</div>
  </div>
  <div class="penalty-row">
    <div class="penalty-label">17A Surcharge</div>
    <div class="penalty-value">0.00</div>
  </div>
  <div class="penalty-row">
    <div class="penalty-label">17B Interest</div>
    <div class="penalty-value">0.00</div>
  </div>
  <div class="penalty-row">
    <div class="penalty-label">17C Compromise</div>
    <div class="penalty-value">0.00</div>
  </div>
  <div class="penalty-row">
    <div class="penalty-label">17D Total Penalties (Sum of Items 17A to 17C)</div>
    <div class="penalty-value">0.00</div>
  </div>
  <div class="computation-row" style="background:#f0f0f0;">
    <div class="computation-label"><strong>18 TOTAL AMOUNT PAYABLE (Sum of Item 16 and 17D)</strong></div>
    <div class="computation-value"><strong>${f(cgt)}</strong></div>
  </div>

  <!-- Declaration -->
  <div class="declaration">
    I/We declare under the penalties of perjury that this return, and all its attachments, have been made in good faith, verified by me/us, and
    to the best of my/our knowledge and belief, is true and correct pursuant to the provisions of the National Internal Revenue Code, as amended,
    and the regulations issued under authority thereof. Further, I/we give my/our consent to the processing of my/our information as contemplated
    under the <em>Data Privacy Act of 2012 (R.A. No. 10173)</em> for legitimate and lawful purposes.
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
        <div>Expiry Date (MM/DD/YYYY)</div>
      </div>
    </div>
  </div>

  <!-- Part III -->
  <div class="section-header">Part III – Details of Payment</div>
  <table class="payment-table">
    <thead>
      <tr>
        <th style="width:28%;">Particulars</th>
        <th>Drawee Bank / Bank Code / Agency Number</th>
        <th style="width:18%;">Date (MM/DD/YYYY)</th>
        <th style="width:18%;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>19 Cash/Bank Debit Memo</td><td>&nbsp;</td><td>&nbsp;</td><td style="text-align:right;">&nbsp;</td></tr>
      <tr><td>20 Check</td><td>&nbsp;</td><td>&nbsp;</td><td style="text-align:right;">&nbsp;</td></tr>
      <tr><td>21 Tax Debit Memo</td><td>&nbsp;</td><td>&nbsp;</td><td style="text-align:right;">&nbsp;</td></tr>
      <tr><td>22 Others (Specify)</td><td>&nbsp;</td><td>&nbsp;</td><td style="text-align:right;">&nbsp;</td></tr>
    </tbody>
  </table>
  <div style="border:1px solid #000; border-top:none; padding:20px 5px 5px; font-size:7.5pt;">
    Machine Validation Stamp of Authorized Agent Bank and Date of Receipt (Bank Teller's Initial)
  </div>
  <div style="font-size:7pt; margin-top:3px;">*NOTE: The BIR Data Privacy Policy is in the BIR website (www.bir.gov.ph)</div>

</div><!-- end page 1 -->


<!-- ═══════════════════════════════ PAGE 2 ═══════════════════════════════ -->
<div class="page">

  <!-- Header page 2 -->
  <div class="form-header">
    <div class="gov-label">
      Republic of the Philippines<br>
      Department of Finance<br>
      <strong>Bureau of Internal Revenue</strong>
    </div>
    <div class="form-title-center">
      <div class="form-number">1706</div>
      <div class="form-subtitle">January 2018 (ENCS)</div>
      <div class="form-title-big">Capital Gains Tax Return</div>
      <div style="font-size:7.5pt;">(For Onerous Transfer of Real Property Classified as Capital Asset)</div>
    </div>
    <div class="bir-use-box">Page 2</div>
  </div>
  <div style="text-align:right; font-size:7pt; margin-bottom:4px;">1706 01/18ENCS P2</div>

  <!-- TIN + Name repeat bar -->
  <div class="field-row top-border">
    <div class="field-cell" style="flex:0.6;">
      <div class="field-label">TIN of Buyer</div>
      <div class="field-value">${buyer_info?.tin || ''}</div>
    </div>
    <div class="field-cell">
      <div class="field-label">Taxpayer's / Buyer's Name</div>
      <div class="field-value">${buyer_info?.name || ''}</div>
    </div>
  </div>

  <!-- Part IV Schedules -->
  <div class="section-header" style="margin-top:6px;">Part IV – Schedules</div>

  <!-- Schedule 1 -->
  <div class="schedule-header">Schedule 1 – Description of Transaction (OCT/TCT/CCT No. | Tax Declaration No. | Location)</div>
  <table class="sched-table">
    <thead>
      <tr>
        <th style="width:5%;">#</th>
        <th>OCT/TCT/CCT No.</th>
        <th>Tax Declaration No. (TD)</th>
        <th>Location</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>${property_details?.titleNo || ''}</td>
        <td>${property_details?.taxDecNo || ''}</td>
        <td>${seller_info?.address || ''}</td>
      </tr>
      <tr class="blank-row"><td>2</td><td></td><td></td><td></td></tr>
      <tr class="blank-row"><td>3</td><td></td><td></td><td></td></tr>
      <tr class="blank-row"><td>4</td><td></td><td></td><td></td></tr>
      <tr class="blank-row"><td>5</td><td></td><td></td><td></td></tr>
    </tbody>
  </table>

  <!-- Schedule 1 continuation -->
  <div class="schedule-header" style="margin-top:6px;">Schedule 1 – Description of Transaction (continuation)</div>
  <table class="sched-table">
    <thead>
      <tr>
        <th style="width:4%;">#</th>
        <th>Lot/Improvement</th>
        <th>Classification*</th>
        <th>Area (sq.m.)</th>
        <th>FMV per TD (Col.1)</th>
        <th>FMV per BIR / Zonal Value (Col.2)</th>
        <th>Fair Market Value (higher of Col.1 &amp; 2)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>${property_details?.landClassification || 'Land'}</td>
        <td>${classCode}</td>
        <td class="amount">${area}</td>
        <td class="amount">${f(fmv)}</td>
        <td class="amount">${f(areaZonal)}</td>
        <td class="amount">${f(Math.max(fmv, areaZonal))}</td>
      </tr>
      ${property_details?.hasImprovement ? `<tr>
        <td></td>
        <td>Improvement</td>
        <td></td>
        <td></td>
        <td class="amount">${f(property_details?.improvementAmount || 0)}</td>
        <td></td>
        <td class="amount">${f(property_details?.improvementAmount || 0)}</td>
      </tr>` : ''}
      <tr class="blank-row"><td>2</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
      <tr class="blank-row"><td>3</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
      <tr class="total-row">
        <td colspan="6" style="text-align:right;">TOTAL (To Schedule 4 Item 1B)</td>
        <td class="amount">${f(Math.max(fmv, areaZonal) + (property_details?.hasImprovement ? (property_details?.improvementAmount || 0) : 0))}</td>
      </tr>
    </tbody>
  </table>

  <!-- Schedule 2 -->
  <div class="schedule-header" style="margin-top:6px;">Schedule 2 – Description of Transaction</div>
  <table class="sched-table">
    <tbody>
      <tr>
        <td style="width:30%;">
          ☑ Cash Sale &nbsp; ☐ Installment Sale<br>
          ☐ Exempt &nbsp; ☐ Foreclosure Sale &nbsp; ☐ Others
        </td>
        <td>
          <table style="width:100%; font-size:8pt; border-collapse:collapse;">
            <tr><td>1 Selling Price</td><td class="amount">${f(sellingPrice)}</td></tr>
            <tr><td>2 Cost and Expenses</td><td class="amount">0.00</td></tr>
            <tr><td>3 Mortgage Assumed</td><td class="amount">0.00</td></tr>
            <tr><td>4 Total Payments during Initial Year</td><td class="amount">${f(sellingPrice)}</td></tr>
          </table>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Schedule 4 – Taxable Base Determination -->
  <div class="schedule-header" style="margin-top:6px;">Schedule 4 – Determination of Taxable Base</div>
  <table class="sched-table">
    <tbody>
      <tr>
        <td style="width:60%;">1A Gross Selling Price / Bid Price</td>
        <td class="amount">${f(sellingPrice)}</td>
      </tr>
      <tr>
        <td>1B Total FMV of Land and Improvement (From Schedule 1)</td>
        <td class="amount">${f(Math.max(fmv, areaZonal) + (property_details?.hasImprovement ? (property_details?.improvementAmount || 0) : 0))}</td>
      </tr>
      <tr>
        <td>1C On the Unutilized Portion of Sales Proceeds (From Schedule 3)</td>
        <td class="amount">0.00</td>
      </tr>
      <tr>
        <td>1D Installment Collected (From Schedule 2 Item 5)</td>
        <td class="amount">N/A</td>
      </tr>
      <tr class="total-row">
        <td><strong>2 Taxable Base</strong> (For cash sale: 1A or 1B whichever is higher) <strong>(To Part II, Item 12)</strong></td>
        <td class="amount"><strong>${f(taxBase)}</strong></td>
      </tr>
    </tbody>
  </table>

  <!-- Summary box -->
  <div style="margin-top:8px; border:1.5px solid #1a365d; padding:6px 8px; background:#f8f9ff;">
    <div style="font-weight:bold; font-size:9pt; margin-bottom:4px;">Tax Summary</div>
    <table style="width:100%; font-size:9pt; border-collapse:collapse;">
      <tr>
        <td style="padding:2px 4px;">Capital Gains Tax (CGT) – 6%</td>
        <td style="text-align:right; padding:2px 4px;">${f(cgt)}</td>
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
        <td style="text-align:right; padding:3px 4px; color:#1a365d;">${f(cgt + dst + transferTax)}</td>
      </tr>
    </table>
  </div>

  <div class="footnote">
    * RR-Residential Regular &nbsp; CR-Condominium Regular &nbsp; CL-Cemetery Lot &nbsp; GL-Government Lot &nbsp;
    A-Agricultural &nbsp; X-Institutional &nbsp; RC-Residential Condominium &nbsp; CC-Commercial Condominium &nbsp;
    PS-Parking Slot &nbsp; GP-General Purpose &nbsp; I-Industrial &nbsp; APD-Area for Priority Development
  </div>

  <div class="print-btn">
    <button onclick="window.print()">🖨️ Print BIR Form 1706</button>
  </div>

</div><!-- end page 2 -->

</body>
</html>`;
}

/**
 * BIR Form No. 1707 - Capital Gains Tax (Stocks)
 */
export function getSaleStocksTemplate(computationData) {
  const { seller_info = {}, buyer_info = {}, property_details = {}, computation_result = {} } = computationData;
  const f = (v) => formatCurrency(v || 0);

  const grossSales = property_details?.grossSales || property_details?.grossSalesValue || property_details?.sellingPrice || 0;
  const cost = property_details?.cost || property_details?.acquisitionCost || 0;
  const netGain = computation_result?.netGain !== undefined ? computation_result.netGain : (grossSales - cost);
  const taxDue = computation_result?.cgt || computation_result?.totalTax || 0;

  const isNonListed = property_details?.stockType === 'non-listed';
  const dst = computation_result?.dst || 0;
  const notarizationFee = computation_result?.notarizationFee || 0;
  const registrationFee = computation_result?.registrationFee || 0;
  const cgt = computation_result?.cgt || 0;
  const donorsTax = computation_result?.donorsTax || 0;
  const totalTaxAndFees = computation_result?.totalTax || taxDue;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BIR Form No. 1707 - Stocks</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid black; padding-bottom: 5px; }
    .section-header { background-color: #e0e0e0; font-weight: bold; padding: 3px; border: 1px solid black; margin-top: 5px; }
    .row { display: flex; border: 1px solid black; border-top: none; }
    .col { padding: 4px; border-right: 1px solid black; }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div>Republic of the Philippines<br><strong>Bureau of Internal Revenue</strong></div>
    <div style="text-align:center"><strong>BIR Form No. 1707</strong><br>CGT (Shares of Stock)</div>
    <div style="text-align:right">Page 1</div>
  </div>
  <div class="section-header">Computation of Tax and Fees</div>
  <div class="row" style="border-top:1px solid black;">
    <div class="col" style="flex:3;">Gross Selling Price</div>
    <div class="col" style="flex:1; text-align:right;">${f(grossSales)}</div>
  </div>
  <div class="row">
    <div class="col" style="flex:3;">Less: Cost of Shares</div>
    <div class="col" style="flex:1; text-align:right;">${f(cost)}</div>
  </div>
  <div class="row">
    <div class="col" style="flex:3;">Net Capital Gain</div>
    <div class="col" style="flex:1; text-align:right;"><strong>${f(netGain)}</strong></div>
  </div>
  ${isNonListed ? `
  <div class="row">
    <div class="col" style="flex:3;">Capital Gains Tax (15% on Capital Gain)</div>
    <div class="col" style="flex:1; text-align:right;">${f(cgt)}</div>
  </div>
  ${donorsTax > 0 ? `
  <div class="row">
    <div class="col" style="flex:3;">Donor's Tax (6% on Deemed Gift / Donation Exceeding ₱250k)</div>
    <div class="col" style="flex:1; text-align:right;">${f(donorsTax)}</div>
  </div>
  ` : ''}
  <div class="row">
    <div class="col" style="flex:3;">Documentary Stamp Tax (DST) — 0.75%</div>
    <div class="col" style="flex:1; text-align:right;">${f(dst)}</div>
  </div>
  <div class="row">
    <div class="col" style="flex:3;">Notarization Fee — 1/2 of 1% (0.5%)</div>
    <div class="col" style="flex:1; text-align:right;">${f(notarizationFee)}</div>
  </div>
  <div class="row">
    <div class="col" style="flex:3;">Registration and Transfer Fee — 0.25%</div>
    <div class="col" style="flex:1; text-align:right;">${f(registrationFee)}</div>
  </div>
  <div class="row" style="background:#f8f9ff;">
    <div class="col" style="flex:3;"><strong>Total Amount Due (Tax & Fees)</strong></div>
    <div class="col" style="flex:1; text-align:right;"><strong>${f(totalTaxAndFees)}</strong></div>
  </div>
  ` : `
  <div class="row">
    <div class="col" style="flex:3;">Tax Due (15%)</div>
    <div class="col" style="flex:1; text-align:right;"><strong>${f(taxDue)}</strong></div>
  </div>
  `}
  <div class="print-btn" style="margin-top:20px; text-align:center;">
    <button onclick="window.print()" style="padding:10px 20px; background:#1a365d; color:white; border:none; cursor:pointer;">🖨️ Print BIR Form 1707</button>
  </div>
</body>
</html>`;
}
