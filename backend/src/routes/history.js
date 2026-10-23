const express = require('express');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const versions = await prisma.resumeVersion.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      jobTitle: true,
      company: true,
      matchScoreBefore: true,
      matchScoreAfter: true,
      createdAt: true,
    },
  });
  res.json(versions);
});

router.get('/:id', requireAuth, async (req, res) => {
  const version = await prisma.resumeVersion.findUnique({ where: { id: Number(req.params.id) } });

  if (!version || version.userId !== req.userId) {
    return res.status(404).json({ error: 'Not found.' });
  }

  res.json({
    ...version,
    matchedKeywords: JSON.parse(version.matchedKeywords || '[]'),
    missingKeywords: JSON.parse(version.missingKeywords || '[]'),
  });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const version = await prisma.resumeVersion.findUnique({ where: { id: Number(req.params.id) } });

  if (!version || version.userId !== req.userId) {
    return res.status(404).json({ error: 'Not found.' });
  }

  await prisma.resumeVersion.delete({ where: { id: version.id } });
  res.status(204).send();
});

module.exports = router;
