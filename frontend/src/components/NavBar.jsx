import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        Resume<span>Tailor</span>
      </Link>
      <nav>
        {user ? (
          <>
            <Link to="/tailor">New Tailoring</Link>
            <Link to="/history">History</Link>
            <span className="user-chip">{user.name || user.email}</span>
            <button
              className="link-button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register" className="cta">
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
