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
    // 1. Create a native file download (HTML document)
    // This is 100% reliable and never blocked by browser pop-up blockers or iframe sandboxes!
    const filename = `BIR_Form_${computation_type === 'estate' ? '1801' : computation_type === 'donation' ? '1800' : '1706'}.html`;
    try {
      const blob = new Blob([htmlResult], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (downloadErr) {
      console.error('File download failed:', downloadErr);
    }

    // 2. Open print dialog using an in-page hidden iframe
    // This completely bypasses pop-up blockers (which only block window.open)
    // and triggers the browser's native print/PDF export dialog!
    try {
      let iframe = document.getElementById('bir-print-iframe');
      if (iframe) {
        iframe.parentNode.removeChild(iframe);
      }
      iframe = document.createElement('iframe');
      iframe.id = 'bir-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.pointerEvents = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document || iframe.contentDocument;
      doc.open();
      doc.write(htmlResult);
      doc.close();

      // Give styles a tiny moment to parse, then open print dialog
      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (printErr) {
          console.error('Iframe print function failed:', printErr);
          // Ultimate fallback to window.open if iframe printing fails
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(htmlResult);
            printWindow.document.close();
          }
        }
      }, 350);
    } catch (iframeErr) {
      console.error('Iframe injection failed, falling back to window.open:', iframeErr);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlResult);
        printWindow.document.close();
      }
    }
  }
}
