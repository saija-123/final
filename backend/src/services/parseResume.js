const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extracts plain text from an uploaded resume file.
 * Supports .txt, .pdf, and .docx. Throws on unsupported types.
 */
async function extractResumeText(buffer, mimetype, originalname = '') {
  const lowerName = originalname.toLowerCase();

  if (mimetype === 'application/pdf' || lowerName.endsWith('.pdf')) {
    const result = await pdfParse(buffer);
    return result.text.trim();
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    lowerName.endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  if (mimetype === 'text/plain' || lowerName.endsWith('.txt')) {
    return buffer.toString('utf-8').trim();
  }

  throw new Error(
    'Unsupported file type. Please upload a .pdf, .docx, or .txt resume.'
  );
}

module.exports = { extractResumeText };
