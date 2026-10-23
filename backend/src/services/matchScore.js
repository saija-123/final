// A lightweight, dependency-free ATS-style keyword match scorer.
// It extracts salient keywords/phrases from a job description (nouns/skills-like
// tokens, filtered of stopwords and boilerplate), then measures how many of
// those keywords appear in a resume. This mirrors how many real ATS platforms
// perform a first-pass keyword/skill overlap ranking before human review.

const STOPWORDS = new Set(
  `a about above after again against all am an and any are aren't as at be
  because been before being below between both but by can't cannot could
  couldn't did didn't do does doesn't doing don't down during each few for
  from further had hadn't has hasn't have haven't having he he'd he'll he's
  her here here's hers herself him himself his how how's i i'd i'll i'm i've
  if in into is isn't it it's its itself let's me more most mustn't my
  myself no nor not of off on once only or other ought our ours ourselves
  out over own same shan't she she'd she'll she's should shouldn't so some
  such than that that's the their theirs them themselves then there there's
  these they they'd they'll they're they've this those through to too under
  until up very was wasn't we we'd we'll we're we've were weren't what
  what's when when's where where's which while who who's whom why why's
  with won't would wouldn't you you'd you'll you're you've your yours
  yourself yourselves will using use used etc within across per via role
  team work strong ability years experience including preferred required
  responsibilities qualifications job description company looking candidate
  candidates opportunity job title please note plus`
    .split(/\s+/)
    .filter(Boolean)
);

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9][a-z0-9+/#.\-]*[a-z0-9]|[a-z0-9]/g) || []);
}

/**
 * Extracts up to `limit` candidate keywords from a job description,
 * ranked by frequency (with a small bonus for longer, more specific tokens).
 */
function extractKeywords(jobDescription, limit = 25) {
  const tokens = tokenize(jobDescription).filter(
    (t) => t.length > 2 && !STOPWORDS.has(t) && !/^\d+$/.test(t)
  );

  const freq = new Map();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) || 0) + 1);
  }

  const scored = [...freq.entries()].map(([term, count]) => ({
    term,
    score: count * (1 + Math.min(term.length, 12) / 12),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.term);
}

/**
 * Computes a 0-100 match score between a resume and a job description,
 * plus the lists of matched and missing keywords.
 */
function computeMatchScore(resumeText, jobDescription) {
  const keywords = extractKeywords(jobDescription);
  const resumeTokens = new Set(tokenize(resumeText));

  const matched = [];
  const missing = [];

  for (const kw of keywords) {
    if (resumeTokens.has(kw)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const score = keywords.length === 0 ? 0 : Math.round((matched.length / keywords.length) * 100);

  return { score, matchedKeywords: matched, missingKeywords: missing, totalKeywords: keywords.length };
}

module.exports = { computeMatchScore, extractKeywords };
