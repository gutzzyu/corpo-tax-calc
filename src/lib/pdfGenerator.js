import { getDonationTemplate } from './templates/donationTemplate';
import { getSaleRealPropertyTemplate, getSaleStocksTemplate } from './templates/saleTemplate';
import { getEstateTemplate } from './templates/estateTemplate';

export function generateTaxPDF(computationData) {
  const { computation_type, property_details } = computationData;
  let htmlResult = '';

  if (computation_type === 'donation') {
    htmlResult = getDonationTemplate(computationData);
  } else if (computation_type === 'sale') {
    // Determine if it's stocks or real property
    const isStocks = property_details?.stockType !== undefined || property_details?.grossSalesValue !== undefined;
    if (isStocks) {
      htmlResult = getSaleStocksTemplate(computationData);
    } else {
      htmlResult = getSaleRealPropertyTemplate(computationData);
    }
  } else if (computation_type === 'estate') {
    htmlResult = getEstateTemplate(computationData);
  }

  if (htmlResult) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlResult);
      printWindow.document.close();
    }
  }
}
