import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearAuthUser, getStoredUser } from './lib/api';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '▣' },
  { to: '/insights', label: 'Phân tích', icon: '◇' },
  { to: '/settings', label: 'Cài đặt', icon: '⚙' },
];

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    window.addEventListener('storage', syncUser);
    window.addEventListener('detox-auth-changed', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('detox-auth-changed', syncUser);
    };
  }, []);

  const logout = () => {
    clearAuthUser();
    setUser(null);
    navigate('/auth');
  };

  return (
    <div className="shell">
      <aside className="sidebar" id="sidebar">
        <div className="brand">
          <img className="brand-logo" src="/logo.png" alt="Digital Detox logo" />
          <div>
            <div className="brand-name">Digital Detox</div>
            <div className="brand-sub">Lấy lại sự tập trung</div>
          </div>
        </div>

        <nav className="nav" aria-label="Điều hướng chính">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon" aria-hidden>⌂</span> Trang chủ
          </NavLink>
          <NavLink to="/auth" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon" aria-hidden>◎</span> Tài khoản
          </NavLink>
          {navItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon" aria-hidden>{it.icon}</span> {it.label}
            </NavLink>
          ))}
        </nav>

        <div className="account-card">
          {user ? (
            <>
              <span className="account-label">Đang đăng nhập</span>
              <strong>{user.displayName}</strong>
              <button type="button" className="account-link" onClick={logout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <span className="account-label">Chưa đăng nhập</span>
              <NavLink to="/auth" className="account-link">Đăng nhập / Đăng ký</NavLink>
            </>
          )}
        </div>

        <div className="sidebar-footer">
          <strong style={{ color: 'var(--text)' }}>Mẹo:</strong> cài Chrome extension để bắt đầu theo dõi tự động.
        </div>
      </aside>

      <main className="main" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
