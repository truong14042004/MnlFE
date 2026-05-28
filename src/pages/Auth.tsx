import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, register, saveAuthUser } from '../lib/api';

type Mode = 'login' | 'register';

function getErrorMessage(error: any) {
  return error?.response?.data?.message || 'Không kết nối được tới server.';
}

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError(null);
    setSuccess(null);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanUsername = username.trim();
    const cleanFullName = fullName.trim();
    if (!cleanUsername || !password) {
      setError('Vui lòng nhập tài khoản và mật khẩu.');
      return;
    }
    if (isRegister && !cleanFullName) {
      setError('Vui lòng nhập họ và tên.');
      return;
    }
    if (isRegister && password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    try {
      setLoading(true);
      const payload = { username: cleanUsername, password, fullName: cleanFullName };
      const user = isRegister ? await register(payload) : await login(payload);
      saveAuthUser(user);
      setSuccess(user.message || 'Đăng nhập thành công.');
      window.dispatchEvent(new Event('detox-auth-changed'));
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <div className="page-eyebrow">Tài khoản web</div>
          <h1 className="page-title">Xem dashboard theo đúng dữ liệu của bạn.</h1>
          <p className="page-sub">
            Đăng nhập trên web để dashboard đọc cùng userId với extension. Sau khi vào tài khoản,
            dữ liệu YouTube, Facebook và TikTok được đồng bộ từ extension sẽ hiển thị tự động.
          </p>
          <div className="auth-proof">
            <span>API Railway</span>
            <strong>Đang dùng dữ liệu thật</strong>
          </div>
        </div>

        <form className="card auth-form" onSubmit={onSubmit}>
          <div className="auth-tabs-web" role="tablist" aria-label="Chọn chế độ tài khoản">
            <button
              type="button"
              className={`auth-tab-web ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={`auth-tab-web ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}
            >
              Đăng ký
            </button>
          </div>

          <h2 className="card-title">{isRegister ? 'Tạo tài khoản mới' : 'Đăng nhập tài khoản'}</h2>
          <p className="card-sub">
            {isRegister ? 'Tài khoản này dùng chung cho web dashboard và extension.' : 'Dùng tài khoản đã tạo trong extension hoặc trên web.'}
          </p>

          {isRegister && (
            <div className="field">
              <label className="field-label" htmlFor="fullName">Họ và tên</label>
              <input
                id="fullName"
                className="field-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                placeholder="Nguyễn Văn A"
              />
            </div>
          )}

          <div className="field">
            <label className="field-label" htmlFor="username">Tài khoản</label>
            <input
              id="username"
              className="field-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="ten_tai_khoan"
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              className="field-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder="••••••••"
            />
          </div>

          {isRegister && (
            <div className="field">
              <label className="field-label" htmlFor="confirmPassword">Nhập lại mật khẩu</label>
              <input
                id="confirmPassword"
                className="field-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
              />
            </div>
          )}

          {error && <div className="auth-message auth-error">{error}</div>}
          {success && <div className="auth-message auth-success">{success}</div>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
          </button>

          <div className="auth-footnote">
            <span>{isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}</span>
            <button type="button" onClick={() => switchMode(isRegister ? 'login' : 'register')}>
              {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
            </button>
          </div>

          <Link className="auth-secondary-link" to="/dashboard">Xem dashboard ẩn danh</Link>
        </form>
      </section>
    </div>
  );
}
