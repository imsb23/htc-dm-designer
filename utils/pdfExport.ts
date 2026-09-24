import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportPdfOptions {
  filename: string;
  element?: HTMLElement | null;
  htmlContent?: string;
  title?: string;
}

/**
 * Exports policy document to high-quality multi-page A4 PDF file
 */
export const downloadAsPdf = async ({
  filename,
  element,
  htmlContent,
  title = 'Enterprise Policy Document'
}: ExportPdfOptions): Promise<void> => {
  const cleanFilename = filename.toLowerCase().endsWith('.pdf') 
    ? filename 
    : `${filename.replace(/\.docx$/, '')}.pdf`;

  try {
    let targetElement = element;
    let tempContainer: HTMLDivElement | null = null;

    if (!targetElement && htmlContent) {
      tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '820px';
      tempContainer.style.padding = '36px 44px';
      tempContainer.style.background = '#ffffff';
      tempContainer.style.color = '#1e293b';
      tempContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      tempContainer.className = 'custom-editor';
      tempContainer.innerHTML = htmlContent;
      document.body.appendChild(tempContainer);
      targetElement = tempContainer;

      // Allow fonts and DOM to settle
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!targetElement) {
      throw new Error('No element or HTML content provided for PDF export');
    }

    // Capture DOM to high-res canvas
    const canvas = await html2canvas(targetElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0
    });

    if (tempContainer && tempContainer.parentNode) {
      tempContainer.parentNode.removeChild(tempContainer);
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const marginX = 10;
    const marginY = 12;
    const contentWidth = pdfWidth - 2 * marginX;
    const contentHeight = pdfHeight - 2 * marginY;

    const pxPerMm = canvas.width / contentWidth;
    const pageCanvasHeight = Math.floor(contentHeight * pxPerMm);
    const totalPages = Math.max(1, Math.ceil(canvas.height / pageCanvasHeight));

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        doc.addPage();
      }

      const currentY = page * pageCanvasHeight;
      const sliceHeight = Math.min(pageCanvasHeight, canvas.height - currentY);

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeight;

      const sliceCtx = sliceCanvas.getContext('2d');
      if (sliceCtx) {
        sliceCtx.fillStyle = '#ffffff';
        sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceHeight);
        sliceCtx.drawImage(
          canvas,
          0, currentY, canvas.width, sliceHeight,
          0, 0, sliceCanvas.width, sliceHeight
        );

        const imgData = sliceCanvas.toDataURL('image/jpeg', 0.95);
        const renderedHeightMm = (sliceHeight / canvas.width) * contentWidth;
        doc.addImage(imgData, 'JPEG', marginX, marginY, contentWidth, renderedHeightMm, undefined, 'FAST');
      }

      // Add page header / footer
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(
        `Page ${page + 1} of ${totalPages}  •  ${title}  •  HTC Global Services`,
        pdfWidth / 2,
        pdfHeight - 5,
        { align: 'center' }
      );
    }

    doc.save(cleanFilename);
  } catch (err) {
    console.error('HTML-to-Canvas PDF generation failed, executing text fallback:', err);
    
    // Fallback: direct text-based PDF
    try {
      const fallbackDoc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      fallbackDoc.setFontSize(16);
      fallbackDoc.setFont('helvetica', 'bold');
      fallbackDoc.text(title, 14, 20);

      const div = document.createElement('div');
      div.innerHTML = htmlContent || (element ? element.innerHTML : '');
      const plainText = div.innerText || div.textContent || '';

      fallbackDoc.setFontSize(9);
      fallbackDoc.setFont('helvetica', 'normal');
      fallbackDoc.setTextColor(50, 50, 50);

      const lines = fallbackDoc.splitTextToSize(plainText, 180);
      let y = 30;
      for (let j = 0; j < lines.length; j++) {
        if (y > 280) {
          fallbackDoc.addPage();
          y = 20;
        }
        fallbackDoc.text(lines[j], 14, y);
        y += 5;
      }
      fallbackDoc.save(cleanFilename);
    } catch (fallbackErr) {
      console.error('Fallback PDF generation also failed:', fallbackErr);
      throw fallbackErr;
    }
  }
};
