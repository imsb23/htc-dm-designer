import jsPDF from 'jspdf';
import { KBArticle, KNOWLEDGE_BASE_ARTICLES } from '../data/knowledgeBaseData';

/**
 * Generates an executive-grade, publication-ready PDF for a single KB article
 * or the complete HTC Copilot Knowledge Base catalog.
 */
export const exportKnowledgeBasePdf = async (
  selectedArticle?: KBArticle | null,
  exportAll: boolean = false
): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 45;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Colors
  const primaryRed = '#EA251B';
  const brandDark = '#0F172A';
  const brandSlate = '#475569';
  const lightBg = '#F8FAFC';
  const accentIndigo = '#4F46E5';

  const checkPageBreak = (neededHeight: number) => {
    if (yPos + neededHeight > pageHeight - margin - 35) {
      addFooter();
      doc.addPage();
      yPos = margin + 20;
      addRunningHeader();
    }
  };

  const addRunningHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('HTC COPILOT • ENTERPRISE KNOWLEDGE BASE & PRODUCT GUIDE', margin, margin);
    doc.setFont('helvetica', 'normal');
    doc.text('CONFIDENTIAL & PROPRIETARY', pageWidth - margin - 150, margin);
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.75);
    doc.line(margin, margin + 8, pageWidth - margin, margin + 8);
    yPos = margin + 28;
  };

  const addFooter = () => {
    const pageNum = (doc as any).internal.getNumberOfPages();
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.75);
    doc.line(margin, pageHeight - margin + 5, pageWidth - margin, pageHeight - margin + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('HTC Global Services • HTCNXT Enterprise AI Platform', margin, pageHeight - margin + 18);
    doc.text(`Page ${pageNum}`, pageWidth - margin - 40, pageHeight - margin + 18);
  };

  const articlesToPrint = exportAll 
    ? KNOWLEDGE_BASE_ARTICLES 
    : (selectedArticle ? [selectedArticle] : KNOWLEDGE_BASE_ARTICLES);

  // -------------------------------------------------------------
  // COVER PAGE (If exporting all or single full article)
  // -------------------------------------------------------------
  // Background Header Block
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 180, 'F');

  // Brand Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(234, 37, 27); // HTC Red
  doc.text('HTC', margin, 65);
  doc.setTextColor(255, 255, 255);
  doc.text('NXT', margin + 52, 65);

  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text('GLOBAL SERVICES • ENTERPRISE AI DIVISION', margin, 85);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  const docTitle = exportAll 
    ? 'HTC Copilot Product Knowledge Base' 
    : (selectedArticle?.title || 'HTC Copilot Module Specification');
  
  const titleLines = doc.splitTextToSize(docTitle, contentWidth);
  doc.text(titleLines, margin, 125);

  doc.setFontSize(10);
  doc.setTextColor(199, 210, 254); // indigo-200
  doc.setFont('helvetica', 'normal');
  doc.text('Comprehensive Enterprise Architecture, Governance & Technical Specification Guide', margin, 155);

  yPos = 210;

  // Metadata Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPos, contentWidth, 50, 6, 6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, yPos, contentWidth, 50, 6, 6, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('DOCUMENT VERSION', margin + 15, yPos + 18);
  doc.text('RELEASE STATUS', margin + 140, yPos + 18);
  doc.text('GENERATED DATE', margin + 260, yPos + 18);
  doc.text('TOTAL ARTICLES', margin + 390, yPos + 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('v2.4 Enterprise', margin + 15, yPos + 35);
  doc.text('Commercial Production', margin + 140, yPos + 35);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), margin + 260, yPos + 35);
  doc.text(`${articlesToPrint.length} Specifications`, margin + 390, yPos + 35);

  yPos += 75;

  // -------------------------------------------------------------
  // RENDER EACH ARTICLE
  // -------------------------------------------------------------
  articlesToPrint.forEach((article, index) => {
    if (index > 0) {
      addFooter();
      doc.addPage();
      yPos = margin + 20;
      addRunningHeader();
    }

    // Category & Badge Bar
    checkPageBreak(50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(234, 37, 27); // Red
    doc.text(article.category.toUpperCase(), margin, yPos);
    
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text(`•  ${article.badge.toUpperCase()}`, margin + 120, yPos);

    doc.setTextColor(148, 163, 184);
    doc.text(`•  ${article.readTime}`, margin + 300, yPos);

    yPos += 14;

    // Article Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    const titleLines = doc.splitTextToSize(article.title, contentWidth);
    doc.text(titleLines, margin, yPos);
    yPos += titleLines.length * 18 + 10;

    // Target Personas
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('TARGET PERSONAS:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(article.targetPersonas.join('  |  '), margin + 95, yPos);
    yPos += 16;

    // Executive Summary Box
    checkPageBreak(80);
    const summaryLines = doc.splitTextToSize(article.summary, contentWidth - 24);
    const summaryBoxHeight = summaryLines.length * 13 + 24;

    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(margin, yPos, contentWidth, summaryBoxHeight, 6, 6, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, yPos, contentWidth, summaryBoxHeight, 6, 6, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('EXECUTIVE OVERVIEW', margin + 12, yPos + 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(summaryLines, margin + 12, yPos + 30);

    yPos += summaryBoxHeight + 18;

    // Business Value & ROI
    checkPageBreak(70);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Business Value & Commercial Impact', margin, yPos);
    yPos += 14;

    article.businessValue.forEach(item => {
      checkPageBreak(30);
      doc.setFillColor(234, 37, 27);
      doc.circle(margin + 5, yPos - 3, 2, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const textLines = doc.splitTextToSize(item, contentWidth - 20);
      doc.text(textLines, margin + 14, yPos);
      yPos += textLines.length * 13 + 3;
    });

    yPos += 12;

    // Core Capabilities
    checkPageBreak(80);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('2. Core Enterprise Capabilities', margin, yPos);
    yPos += 14;

    article.capabilities.forEach(cap => {
      checkPageBreak(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`• ${cap.name}:`, margin + 6, yPos);
      const capNameWidth = doc.getTextWidth(`• ${cap.name}: `);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const descLines = doc.splitTextToSize(cap.description, contentWidth - 16);
      doc.text(descLines, margin + 14, yPos + 12);
      yPos += descLines.length * 12 + 10;
    });

    yPos += 10;

    // Step-by-Step Workflow
    checkPageBreak(70);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('3. End-to-End Operational Workflow', margin, yPos);
    yPos += 14;

    article.workflow.forEach((wf, i) => {
      checkPageBreak(25);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const wfLines = doc.splitTextToSize(wf, contentWidth - 16);
      doc.text(wfLines, margin + 10, yPos);
      yPos += wfLines.length * 12 + 4;
    });

    yPos += 10;

    // Deliverables & Standards Grid
    checkPageBreak(80);
    const boxWidth = (contentWidth - 14) / 2;

    // Left: Generated Deliverables
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPos, boxWidth, 75, 5, 5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, yPos, boxWidth, 75, 5, 5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('GENERATED ARTIFACTS', margin + 10, yPos + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    article.deliverables.forEach((deliv, dIdx) => {
      doc.text(`✓ ${deliv}`, margin + 10, yPos + 32 + dIdx * 13);
    });

    // Right: Regulatory & DAMA Standards
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin + boxWidth + 14, yPos, boxWidth, 75, 5, 5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin + boxWidth + 14, yPos, boxWidth, 75, 5, 5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('GOVERNING STANDARDS', margin + boxWidth + 24, yPos + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    article.standards.forEach((std, sIdx) => {
      doc.text(`§ ${std}`, margin + boxWidth + 24, yPos + 32 + sIdx * 13);
    });

    yPos += 90;

    // Best Practices
    checkPageBreak(60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Enterprise Best Practices & Guardrails:', margin, yPos);
    yPos += 13;

    article.bestPractices.forEach(bp => {
      checkPageBreak(25);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const bpLines = doc.splitTextToSize(`• ${bp}`, contentWidth - 10);
      doc.text(bpLines, margin + 6, yPos);
      yPos += bpLines.length * 12 + 3;
    });

    yPos += 20;
  });

  // Final footer on last page
  addFooter();

  // Save the PDF
  const filename = exportAll 
    ? 'HTC_Copilot_Complete_Product_Knowledge_Base.pdf' 
    : `HTC_Copilot_${selectedArticle?.id || 'Knowledge_Base'}_Guide.pdf`;
    
  doc.save(filename);
};
