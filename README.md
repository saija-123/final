# AI-Powered Resume Tailoring Tool

Full-stack implementation matching the project described in the Week 1 report
(COSC 880 / AIT 880). A user uploads a resume and a job description; the app
uses an LLM to rewrite the resume and generate a matching cover letter, scores
ATS-style keyword match before and after, and lets the user export both
documents to PDF or DOCX. Every run is saved to the user's account history.

## Stack

- **Frontend:** React 18 + Vite, React Router
- **Backend:** Node.js + Express
- **Database:** SQLite via Prisma ORM
- **Auth:** Email/password with bcrypt + JWT
- **LLM:** Groq API (OpenAI-compatible `chat/completions` endpoint, called via `fetch`)
- **Parsing:** `pdf-parse` / `mammoth` for resume upload (.pdf/.docx/.txt)
- **Export:** `pdfkit` (PDF) and `docx` (Word) for tailored resume + cover letter

## Project structure

```
resume-tailor/
  backend/
    prisma/schema.prisma       # User + ResumeVersion models
    src/
      index.js                 # Express app entry point
      db.js                    # Prisma client
      middleware/auth.js       # JWT auth middleware
      routes/
        auth.js                # register / login
        tailor.js              # upload + LLM tailoring + scoring + save
        history.js             # list / get / delete saved versions
        export.js               # PDF / DOCX download endpoints
      services/
        parseResume.js         # extract text from uploaded files
        matchScore.js          # ATS-style keyword match scoring
        llm.js                 # engineered prompts -> Anthropic API
        exportDocx.js
        exportPdf.js
  frontend/
    src/
      pages/                   # Login, Register, Tailor, Results, History
      components/              # NavBar, MatchScoreBar
      context/AuthContext.jsx
      api.js                   # fetch wrapper
```

## Why Groq

The report lists "LLM API selection" as an open Week 1 question (balancing
quality, latency, and cost). This implementation calls the **Groq API**
(`llama-3.3-70b-versatile` by default) because Groq's inference is very fast
and its free/low-cost tier is friendly for a student project budget. The
integration goes through Groq's OpenAI-compatible `chat/completions`
endpoint via plain `fetch` — no extra SDK dependency required. Swap
`GROQ_MODEL` in `.env` for a different model on Groq's console, or rewrite
`backend/src/services/llm.js` to call a different provider entirely (e.g.
Anthropic or OpenAI) if you prefer — that's the only file that talks to the
LLM.

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set ANTHROPIC_API_KEY and a real JWT_SECRET
npx prisma migrate dev --name init
npm run dev
```

The API runs at `http://localhost:4000`. Prisma creates a local `dev.db`
SQLite file — no external database server needed.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api` requests to the
backend (see `vite.config.js`).

### 3. Use it

1. Sign up for an account.
2. Go to "New Tailoring", upload or paste a resume, paste a job description.
3. Review the tailored resume, cover letter, and before/after ATS keyword
   match score.
4. Download either document as PDF or DOCX; every run is saved under
   "History".

## How match scoring works (Section 3/7 of the report)

`services/matchScore.js` extracts salient keywords from the job description
(frequency-ranked, stopwords removed) and checks how many appear in the
resume, producing a 0–100% score. This is intentionally the same first-pass
signal real ATS platforms use before human review — it is **not** a semantic
similarity model. The report's Week 7 plan calls for adding a
semantic-similarity layer (per Jurafsky & Martin, cited in the lit review);
that would slot in alongside `computeMatchScore` in the same file.

## Faithfulness / ethics guardrail (Section 7 of the report)

The system prompt in `services/llm.js` explicitly forbids inventing
employers, titles, dates, or metrics not present in the source resume — it
may only rephrase, reorder, and re-emphasize real content. This is the
concrete implementation of the "faithfulness and ethics" open question from
Week 1.

## Notes / next steps if extending this

- Add rate limiting / request queuing around the LLM call for production use.
- Add automated tests (the report's Weeks 10–11 evaluation phase).
- Consider streaming the LLM response for a better UX on longer resumes.
- The `.env.example` values are placeholders — never commit a real API key.
