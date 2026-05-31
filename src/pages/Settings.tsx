import { useEffect, useState } from 'react';
import { usePageMeta } from '../lib/usePageMeta';
import { fetchSettings, saveSettings, UserSettings } from '../lib/api';

const EMPTY: UserSettings = {
  youTubeLimit: 0,
  facebookLimit: 0,
  tikTokLimit: 0,
  streakCount: 0,
  lastCompletedDay: '',
  challenges: [],
};

const LIMIT_FIELDS = [
  { key: 'youTubeLimit', label: 'YouTube' },
  { key: 'facebookLimit', label: 'Facebook' },
  { key: 'tikTokLimit', label: 'TikTok' },
] as const;

export default function Settings() {
  usePageMeta('Cài đặt · Digital Detox', 'Đặt giới hạn thời gian mỗi ngày cho YouTube, Facebook và TikTok. Giới hạn được lưu vào tài khoản và đồng bộ sang extension.');
  const [settings, setSettings] = useState<UserSettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings()
      .then((s) => setSettings({ ...EMPTY, ...s, challenges: s.challenges || [] }))
      .catch(() => setError('Không tải được cài đặt. Hãy thử đăng nhập lại.'))
      .finally(() => setLoading(false));
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await saveSettings(settings);
      setSettings({ ...EMPTY, ...updated, challenges: updated.challenges || [] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (_) {
      setError('Lưu thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="page-header">
        <div className="page-eyebrow">Cài đặt</div>
        <h1 className="page-title">Đặt giới hạn mỗi ngày</h1>
        <p className="page-sub">
          Giới hạn được lưu vào tài khoản của bạn và tự đồng bộ sang Chrome extension để thực thi
          trên mọi thiết bị.
        </p>
      </header>

      {error && (
        <div className="card" style={{ borderColor: 'rgba(239,68,68,0.35)', marginBottom: 18, maxWidth: 560 }}>
          <strong style={{ color: 'var(--bad)' }}>Lưu ý:</strong> {error}
        </div>
      )}

      <form className="card" onSubmit={onSave} style={{ maxWidth: 560 }}>
        <h2 className="card-title">Giới hạn mỗi ngày (phút)</h2>
        <p className="card-sub">Khi vượt quá sẽ kích hoạt thông báo và lớp phủ toàn màn hình. Để 0 nghĩa là không giới hạn.</p>

        {LIMIT_FIELDS.map(({ key, label }) => (
          <div className="field" key={key}>
            <label className="field-label" htmlFor={`lim-${key}`}>{label}</label>
            <input
              id={`lim-${key}`}
              className="field-input"
              type="number"
              min={0}
              placeholder="ví dụ: 30"
              disabled={loading}
              value={settings[key] || ''}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setSettings({ ...settings, [key]: isNaN(v) || v < 0 ? 0 : v });
              }}
            />
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={loading || saving}>
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
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
