import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Bảng điều khiển', icon: '📊' },
  { to: '/insights', label: 'Phân tích', icon: '💡' },
  { to: '/settings', label: 'Cài đặt', icon: '⚙️' },
];

export default function App() {
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
            <span className="nav-icon" aria-hidden>🏠</span> Trang chủ
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
