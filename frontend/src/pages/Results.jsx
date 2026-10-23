import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { api } from '../api';
import MatchScoreBar from '../components/MatchScoreBar';

export default function Results() {
  const { id } = useParams();
  const location = useLocation();
  const [data, setData] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('resume');

  useEffect(() => {
    if (data) return;
    setLoading(true);
    api
      .getVersion(id)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page">Loading…</div>;
  if (error) return <div className="page form-error">{error}</div>;
  if (!data) return <div className="page">Not found.</div>;

  const {
    tailoredResume,
    coverLetter,
    changesSummary,
    matchScoreBefore,
    matchScoreAfter,
    matchedKeywords = [],
    missingKeywords = [],
  } = data;

  return (
    <div className="page results-page">
      <h1>Your tailored materials</h1>

      <MatchScoreBar before={matchScoreBefore} after={matchScoreAfter} />

      {changesSummary && <p className="changes-summary">{changesSummary}</p>}

      <div className="keyword-lists">
        <div>
          <h3>Matched keywords ({matchedKeywords.length})</h3>
          <div className="pill-list">
            {matchedKeywords.map((k) => (
              <span key={k} className="pill matched">
                {k}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3>Still missing ({missingKeywords.length})</h3>
          <div className="pill-list">
            {missingKeywords.map((k) => (
              <span key={k} className="pill missing">
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={tab === 'resume' ? 'active' : ''} onClick={() => setTab('resume')}>
          Tailored Resume
        </button>
        <button className={tab === 'cover' ? 'active' : ''} onClick={() => setTab('cover')}>
          Cover Letter
        </button>
      </div>

      <div className="document-panel">
        <div className="export-buttons">
          <a href={api.exportUrl(id, tab === 'resume' ? 'resume' : 'cover-letter', 'pdf')}>Download PDF</a>
          <a href={api.exportUrl(id, tab === 'resume' ? 'resume' : 'cover-letter', 'docx')}>Download DOCX</a>
        </div>
        <pre className="document-text">{tab === 'resume' ? tailoredResume : coverLetter}</pre>
      </div>
    </div>
  );
}
