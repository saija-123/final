const express = require('express');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');
const { textToDocxBuffer } = require('../services/exportDocx');
const { streamTextToPdf } = require('../services/exportPdf');

const router = express.Router();

async function loadOwnedVersion(req, res) {
  const version = await prisma.resumeVersion.findUnique({ where: { id: Number(req.params.id) } });
  if (!version || version.userId !== req.userId) {
    res.status(404).json({ error: 'Not found.' });
    return null;
  }
  return version;
}

// GET /api/export/:id/:doc(resume|cover-letter)/pdf
router.get('/:id/:doc/pdf', requireAuth, async (req, res) => {
  const version = await loadOwnedVersion(req, res);
  if (!version) return;

  const isResume = req.params.doc === 'resume';
  const text = isResume ? version.tailoredResume : version.coverLetter;
  const title = isResume ? 'Tailored Resume' : 'Cover Letter';
  const filename = isResume ? 'tailored-resume.pdf' : 'cover-letter.pdf';

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  try {
    await streamTextToPdf(res, title, text);
  } catch (err) {
    console.error('PDF export error:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to generate PDF.' });
  }
});

// GET /api/export/:id/:doc(resume|cover-letter)/docx
router.get('/:id/:doc/docx', requireAuth, async (req, res) => {
  const version = await loadOwnedVersion(req, res);
  if (!version) return;

  const isResume = req.params.doc === 'resume';
  const text = isResume ? version.tailoredResume : version.coverLetter;
  const title = isResume ? 'Tailored Resume' : 'Cover Letter';
  const filename = isResume ? 'tailored-resume.docx' : 'cover-letter.docx';

  try {
    const buffer = await textToDocxBuffer(title, text);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error('DOCX export error:', err);
    res.status(500).json({ error: 'Failed to generate DOCX.' });
  }
});

module.exports = router;
