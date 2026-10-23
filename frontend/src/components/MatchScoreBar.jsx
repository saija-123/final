export default function MatchScoreBar({ before, after }) {
  return (
    <div className="match-score">
      <div className="match-score-row">
        <span className="match-score-label">Before</span>
        <div className="match-score-track">
          <div className="match-score-fill before" style={{ width: `${before}%` }} />
        </div>
        <span className="match-score-value">{before}%</span>
      </div>
      <div className="match-score-row">
        <span className="match-score-label">After</span>
        <div className="match-score-track">
          <div className="match-score-fill after" style={{ width: `${after}%` }} />
        </div>
        <span className="match-score-value">{after}%</span>
      </div>
      <p className="match-score-delta">
        {after > before
          ? `+${after - before} points of keyword match improvement`
          : 'No keyword overlap improvement detected'}
      </p>
    </div>
  );
}
