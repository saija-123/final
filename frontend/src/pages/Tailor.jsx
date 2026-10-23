import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Tailor() {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!resumeFile && !resumeText.trim()) {
      setError('Upload a resume file or paste your resume text.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Paste the job description you are tailoring for.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (resumeFile) formData.append('resumeFile', resumeFile);
      else formData.append('resumeText', resumeText);
      formData.append('jobDescription', jobDescription);
      formData.append('jobTitle', jobTitle);
      formData.append('company', company);

      const result = await api.tailor(formData);
      navigate(`/results/${result.id}`, { state: result });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page tailor-page">
      <h1>Tailor a resume</h1>
      <p className="subtitle">
        Upload your resume and paste a job description. The tailored resume, a matching cover
        letter, and an ATS keyword match score will be generated.
      </p>

      <form className="tailor-form" onSubmit={handleSubmit}>
        <div className="grid-2">
          <label>
            Job title
            <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Frontend Engineer" />
          </label>
          <label>
            Company
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Corp" />
          </label>
        </div>

        <label>
          Resume file (.pdf, .docx, or .txt)
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
          />
        </label>

        <div className="or-divider">or paste resume text</div>

        <label>
          Resume text
          <textarea
            rows={8}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your current resume here…"
            disabled={!!resumeFile}
          />
        </label>

        <label>
          Job description
          <textarea
            rows={10}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here…"
            required
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Tailoring your resume…' : 'Tailor my resume'}
        </button>
      </form>
    </div>
  );
}
