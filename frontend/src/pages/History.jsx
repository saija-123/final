import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function History() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    api
      .getHistory()
      .then(setVersions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id) {
    if (!confirm('Delete this saved tailoring?')) return;
    await api.deleteVersion(id);
    load();
  }

  if (loading) return <div className="page">Loading…</div>;
  if (error) return <div className="page form-error">{error}</div>;

  return (
    <div className="page">
      <h1>History</h1>
      {versions.length === 0 && <p className="subtitle">No tailored resumes yet. Start a new tailoring.</p>}

      <div className="history-list">
        {versions.map((v) => (
          <div key={v.id} className="history-card">
            <div>
              <strong>{v.jobTitle || 'Untitled role'}</strong>
              {v.company && <span className="history-company"> — {v.company}</span>}
              <div className="history-meta">
                {new Date(v.createdAt).toLocaleString()} · Match {v.matchScoreBefore}% → {v.matchScoreAfter}%
              </div>
            </div>
            <div className="history-actions">
              <Link to={`/results/${v.id}`}>View</Link>
              <button className="link-button" onClick={() => handleDelete(v.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
