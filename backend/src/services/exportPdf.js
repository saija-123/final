const PDFDocument = require('pdfkit');

/**
 * Streams a simple, clean PDF built from plain text directly to the given
 * writable response stream. Resolves once the PDF has finished writing.
 */
function streamTextToPdf(res, title, bodyText) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 54 });
    doc.pipe(res);
    doc.on('error', reject);
    res.on('finish', resolve);

    doc.font('Helvetica-Bold').fontSize(18).text(title, { align: 'left' });
    doc.moveDown(0.75);
    doc.font('Helvetica').fontSize(11);

    const lines = bodyText.split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line === '') {
        doc.moveDown(0.5);
        continue;
      }
      const looksLikeHeading =
        line.length < 60 && (line === line.toUpperCase() || /^[A-Z][a-zA-Z ]+:?$/.test(line)) && line.split(' ').length <= 6;

      if (looksLikeHeading) {
        doc.moveDown(0.4);
        doc.font('Helvetica-Bold').fontSize(12).text(line);
        doc.font('Helvetica').fontSize(11);
      } else {
        doc.text(line, { align: 'left' });
      }
    }

    doc.end();
  });
}

module.exports = { streamTextToPdf };
