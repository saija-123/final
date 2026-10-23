const express = require('express');
const multer = require('multer');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');
const { extractResumeText } = require('../services/parseResume');
const { computeMatchScore } = require('../services/matchScore');
const { tailorResume } = require('../services/llm');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/tailor
// multipart/form-data: resumeFile (optional) OR resumeText (string), jobDescription, jobTitle, company
router.post('/', requireAuth, upload.single('resumeFile'), async (req, res) => {
  try {
    let resumeText = req.body.resumeText;

    if (req.file) {
      resumeText = await extractResumeText(req.file.buffer, req.file.mimetype, req.file.originalname);
    }

    const { jobDescription, jobTitle, company } = req.body;

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ error: 'A resume (file upload or pasted text) is required.' });
    }
    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ error: 'A job description is required.' });
    }

    const before = computeMatchScore(resumeText, jobDescription);

    const { tailoredResume, coverLetter, changesSummary } = await tailorResume({
      resumeText,
      jobDescription,
      jobTitle,
      company,
    });

    const after = computeMatchScore(tailoredResume, jobDescription);

    const saved = await prisma.resumeVersion.create({
      data: {
        userId: req.userId,
        jobTitle: jobTitle || null,
        company: company || null,
        originalResume: resumeText,
        jobDescription,
        tailoredResume,
        coverLetter,
        matchScoreBefore: before.score,
        matchScoreAfter: after.score,
        matchedKeywords: JSON.stringify(after.matchedKeywords),
        missingKeywords: JSON.stringify(after.missingKeywords),
      },
    });

    res.status(201).json({
      id: saved.id,
      tailoredResume,
      coverLetter,
      changesSummary,
      matchScoreBefore: before.score,
      matchScoreAfter: after.score,
      matchedKeywords: after.matchedKeywords,
      missingKeywords: after.missingKeywords,
      createdAt: saved.createdAt,
    });
  } catch (err) {
    console.error('Tailor route error:', err);
    res.status(500).json({ error: err.message || 'Failed to tailor resume.' });
  }
});

module.exports = router;
