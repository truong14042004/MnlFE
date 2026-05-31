import { useState } from 'react';
import { usePageMeta } from '../lib/usePageMeta';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  usePageMeta('Cài đặt · Digital Detox', 'Đặt giới hạn thời gian mỗi ngày cho YouTube, Facebook và TikTok. Giới hạn được đồng bộ sang extension.');
  const [limits, setLimits] = useState(() => {
    const savedLimits = localStorage.getItem('detox_limits');
    try {
      return savedLimits ? JSON.parse(savedLimits) : { YouTube: '', Facebook: '', TikTok: '' };
    } catch (_) {
      return { YouTube: '', Facebook: '', TikTok: '' };
    }
  });

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('detox_limits', JSON.stringify(limits));
    // Push limits to the extension (if installed) so they actually take effect.
    try {
      window.dispatchEvent(new CustomEvent('detox-limits-changed', { detail: limits }));
    } catch (_) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <header className="page-header">
        <div className="page-eyebrow">Cài đặt</div>
        <h1 className="page-title">Đặt giới hạn mỗi ngày</h1>
        <p className="page-sub">
          Đặt giới hạn tại đây, chúng sẽ tự đồng bộ sang Chrome extension để thực thi.
          Bạn cũng có thể chỉnh trực tiếp trong popup của extension.
        </p>
      </header>

      <form className="card" onSubmit={onSave} style={{ maxWidth: 560 }}>
        <h2 className="card-title">Giới hạn mỗi ngày (phút)</h2>
        <p className="card-sub">Khi vượt quá sẽ kích hoạt thông báo và lớp phủ toàn màn hình.</p>

        {(['YouTube', 'Facebook', 'TikTok'] as const).map((s) => (
          <div className="field" key={s}>
            <label className="field-label" htmlFor={`lim-${s}`}>{s}</label>
            <input
              id={`lim-${s}`}
              className="field-input"
              type="number"
              min={0}
              placeholder="ví dụ: 30"
              value={limits[s]}
              onChange={(e) => setLimits({ ...limits, [s]: e.target.value })}
            />
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button type="submit" className="btn btn-primary">Lưu cài đặt</button>
          {saved && <span style={{ color: 'var(--good)', fontSize: 13, alignSelf: 'center' }}>Đã lưu &amp; đồng bộ ✓</span>}
        </div>
      </form>

      <div className="card" style={{ marginTop: 18, maxWidth: 560 }}>
        <h2 className="card-title">Cách theo dõi hoạt động</h2>
        <p style={{ color: 'var(--text-soft)', lineHeight: 1.6, fontSize: 14 }}>
          Extension chỉ theo dõi tab đang hoạt động. Khi tab đó là YouTube, Facebook hoặc
          TikTok, thời gian được đếm ngầm và đồng bộ theo lô mỗi 30 giây lên tài khoản của bạn,
          để bạn xem được số liệu trên web ở bất kỳ thiết bị nào. Chúng tôi chỉ ghi nhận thời
          lượng của 3 app này, không thu thập nội dung bạn xem.
        </p>
      </div>
    </>
  );
}
