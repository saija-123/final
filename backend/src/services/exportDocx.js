const { Document, Packer, Paragraph, HeadingLevel, TextRun } = require('docx');

/**
 * Converts plain text (with blank-line-separated paragraphs and optional
 * ALL-CAPS or Title Case section headers) into a simple, clean .docx buffer.
 */
async function textToDocxBuffer(title, bodyText) {
  const lines = bodyText.split(/\r?\n/);
  const children = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
    }),
  ];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === '') {
      children.push(new Paragraph({ text: '' }));
      continue;
    }

    const looksLikeHeading =
      line.length < 60 && (line === line.toUpperCase() || /^[A-Z][a-zA-Z ]+:?$/.test(line)) && line.split(' ').length <= 6;

    if (looksLikeHeading) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: line, bold: true })],
        })
      );
    } else if (/^[-•*]\s+/.test(line)) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun(line.replace(/^[-•*]\s+/, ''))],
        })
      );
    } else {
      children.push(new Paragraph({ children: [new TextRun(line)] }));
    }
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

module.exports = { textToDocxBuffer };
