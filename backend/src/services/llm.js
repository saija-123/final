// Uses Groq's OpenAI-compatible chat completions endpoint.
// Docs: https://console.groq.com/docs/api-reference#chat-create
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are an expert resume writer and career coach who tailors resumes to
specific job postings for Applicant Tracking Systems (ATS) and human recruiters.

Hard constraints (do not violate these):
1. NEVER invent employers, job titles, dates, degrees, certifications, or metrics that are
   not present or reasonably implied by the source resume. You may rephrase, reorder,
   re-emphasize, and surface relevant existing experience — you may not fabricate new
   experience.
2. Prefer the exact terminology used in the job description when the candidate's resume
   already contains equivalent experience (e.g. if the candidate says "customer support"
   and the job description says "client success", and the underlying work is equivalent,
   it is acceptable to reconcile wording — but only when truthful).
3. Keep the tailored resume the same general length as the original (do not pad).
4. Output ONLY valid JSON matching the schema below. No prose, no markdown fences.

Schema:
{
  "tailoredResume": string,   // full resume text, ready to export, plain text with line breaks
  "coverLetter": string,      // a complete, specific cover letter (3-4 short paragraphs)
  "changesSummary": string    // 2-4 sentence plain-English summary of what was changed and why
}`;

function buildUserPrompt({ resumeText, jobDescription, jobTitle, company }) {
  return `JOB TITLE: ${jobTitle || '(not provided)'}
COMPANY: ${company || '(not provided)'}

JOB DESCRIPTION:
"""
${jobDescription}
"""

CANDIDATE'S CURRENT RESUME:
"""
${resumeText}
"""

Tailor the resume to this job description and write a matching cover letter, following all
constraints in the system prompt. Respond with JSON only.`;
}

/**
 * Calls the Anthropic API to produce a tailored resume + cover letter.
 * Returns { tailoredResume, coverLetter, changesSummary }.
 */
async function tailorResume({ resumeText, jobDescription, jobTitle, company }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set. Add it to backend/.env');
  }

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt({ resumeText, jobDescription, jobTitle, company }) },
      ],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Groq API error (${res.status}): ${errBody.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('LLM response contained no text content.');
  }

  const cleaned = text.trim().replace(/^```json\s*|\s*```$/g, '');

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error('Failed to parse LLM response as JSON: ' + err.message);
  }

  if (!parsed.tailoredResume || !parsed.coverLetter) {
    throw new Error('LLM response missing required fields.');
  }

  return {
    tailoredResume: parsed.tailoredResume,
    coverLetter: parsed.coverLetter,
    changesSummary: parsed.changesSummary || '',
  };
}

module.exports = { tailorResume };
