import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

/**
 * Generates a valid .docx file from HTML or plain structured text and triggers browser download
 */
export const downloadAsDocx = async (filename: string, title: string, content: string | { heading?: string; text: string }[]) => {
  try {
    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: title,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 }
      })
    ];

    if (typeof content === 'string') {
      // Split into paragraphs by newline
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          paragraphs.push(new Paragraph({ text: '', spacing: { after: 120 } }));
          continue;
        }

        if (trimmed.startsWith('# ')) {
          paragraphs.push(new Paragraph({
            text: trimmed.replace(/^#\s+/, ''),
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 }
          }));
        } else if (trimmed.startsWith('## ')) {
          paragraphs.push(new Paragraph({
            text: trimmed.replace(/^##\s+/, ''),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }));
        } else if (trimmed.startsWith('### ')) {
          paragraphs.push(new Paragraph({
            text: trimmed.replace(/^###\s+/, ''),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 160, after: 80 }
          }));
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          paragraphs.push(new Paragraph({
            children: [
              new TextRun({ text: '• ' + trimmed.replace(/^[-*]\s+/, '') })
            ],
            spacing: { after: 60 }
          }));
        } else {
          paragraphs.push(new Paragraph({
            children: [
              new TextRun({ text: trimmed })
            ],
            spacing: { after: 100 }
          }));
        }
      }
    } else if (Array.isArray(content)) {
      content.forEach(sec => {
        if (sec.heading) {
          paragraphs.push(new Paragraph({
            text: sec.heading,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }));
        }
        if (sec.text) {
          paragraphs.push(new Paragraph({
            children: [new TextRun(sec.text)],
            spacing: { after: 120 }
          }));
        }
      });
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(linkElement(a, url));
  } catch (err) {
    console.error("Failed to generate docx:", err);
    // Fallback to text file download if docx packing encounters error
    const textBlob = new Blob([typeof content === 'string' ? content : JSON.stringify(content, null, 2)], { type: 'application/msword' });
    const url = URL.createObjectURL(textBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

const linkElement = (a: HTMLAnchorElement, url: string) => {
  URL.revokeObjectURL(url);
  return a;
};
