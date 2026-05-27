import { useState } from 'react';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [limits, setLimits] = useState({ YouTube: '', Facebook: '', TikTok: '' });

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Lưu trên localStorage chỉ để tham khảo; extension là nguồn dữ liệu chính.
    localStorage.setItem('detox_limits', JSON.stringify(limits));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <header className="page-header">
        <div className="page-eyebrow">Cài đặt</div>
        <h1 className="page-title">Đặt giới hạn mỗi ngày</h1>
        <p className="page-sub">
          Chrome extension là nơi áp dụng giới hạn thật. Giá trị ở đây được lưu cục bộ
          để bạn tham khảo &mdash; mở popup extension để thực thi.
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
          {saved && <span style={{ color: 'var(--good)', fontSize: 13, alignSelf: 'center' }}>Đã lưu cục bộ ✓</span>}
        </div>
      </form>

      <div className="card" style={{ marginTop: 18, maxWidth: 560 }}>
        <h2 className="card-title">Cách theo dõi hoạt động</h2>
        <p style={{ color: 'var(--text-soft)', lineHeight: 1.6, fontSize: 14 }}>
          Extension chỉ theo dõi tab đang hoạt động. Khi tab đó là YouTube, Facebook hoặc
          TikTok, thời gian được đếm ngầm. Dữ liệu được đồng bộ theo lô lên API cục bộ
          mỗi 30 giây &mdash; không có gì rời khỏi máy bạn.
        </p>
      </div>
    </>
  );
}
