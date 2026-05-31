import { useEffect, useRef, useState } from 'react';
import { fetchSummary, formatMinutes, Summary, fetchSettings, saveSettings, UserSettings, ChallengeConfig } from '../lib/api';
import { usePageMeta } from '../lib/usePageMeta';

type Metric = 'total' | 'YouTube' | 'Facebook' | 'TikTok' | 'score';

interface MetricMeta {
  icon: string;
  label: string;
  unit: string;
  lowerIsBetter: boolean;
}

const METRICS: Record<Metric, MetricMeta> = {
  total: { icon: '🧘', label: 'Tổng thời gian', unit: 'phút', lowerIsBetter: true },
  YouTube: { icon: '📺', label: 'YouTube', unit: 'phút', lowerIsBetter: true },
  Facebook: { icon: '🚫', label: 'Facebook', unit: 'phút', lowerIsBetter: true },
  TikTok: { icon: '⏳', label: 'TikTok', unit: 'phút', lowerIsBetter: true },
  score: { icon: '✨', label: 'Điểm tỉnh thức', unit: 'điểm', lowerIsBetter: false },
};

function metricMeta(metric: string): MetricMeta {
  return METRICS[metric as Metric] ?? METRICS.total;
}

const DEFAULT_CHALLENGES: ChallengeConfig[] = [
  { id: 'seed-total', metric: 'total', target: 60 },
  { id: 'seed-tiktok', metric: 'TikTok', target: 20 },
  { id: 'seed-facebook', metric: 'Facebook', target: 0 },
  { id: 'seed-score', metric: 'score', target: 80 },
];

function newId() {
  try {
    return crypto.randomUUID();
  } catch (_) {
    return `c-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function challengeTitle(c: ChallengeConfig) {
  const m = metricMeta(c.metric);
  const op = m.lowerIsBetter ? 'dưới' : 'từ';
  const val = m.unit === 'phút' ? formatMinutes(c.target * 60) : `${c.target} ${m.unit}`;
  if (c.metric === 'total') return `Tổng thời gian ${op} ${val}`;
  return `${m.label} ${op} ${val}${m.lowerIsBetter ? '' : ' trở lên'}`;
}

export default function Challenges() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add-form state
  const [newMetric, setNewMetric] = useState<Metric>('total');
  const [newTarget, setNewTarget] = useState<string>('30');

  const saveTimer = useRef<number | null>(null);
  const latest = useRef<UserSettings | null>(null);

  usePageMeta('Thử thách · Digital Detox', 'Tự tạo thử thách detox của riêng bạn, theo dõi tiến độ và giữ chuỗi streak — lưu vào tài khoản, đồng bộ đa thiết bị.');

  useEffect(() => {
    Promise.all([fetchSettings(), fetchSummary(undefined, 7)])
      .then(([s, sum]) => {
        setSettings({ ...s, challenges: s.challenges || [] });
        setSummary(sum);
      })
      .catch(() => setError('Không tải được dữ liệu. Hãy thử đăng nhập lại.'))
      .finally(() => setLoading(false));
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, []);

  // Debounced persistence so rapid target edits don't spam the API.
  const persist = (next: UserSettings) => {
    setSettings(next);
    latest.current = next;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      if (latest.current) saveSettings(latest.current).catch(() => {});
    }, 600);
  };

  const configs = settings?.challenges ?? [];
  const streak = settings?.streakCount ?? 0;

  const today = summary?.daily?.[summary.daily.length - 1];
  const currentFor = (metric: string): number => {
    switch (metric) {
      case 'total': return Math.round((today?.totalSeconds ?? 0) / 60);
      case 'score': return summary?.awarenessScore ?? 0;
      default: return Math.round((today?.byWebsite?.[metric] ?? 0) / 60);
    }
  };

  const isDone = (c: ChallengeConfig) => {
    const cur = currentFor(c.metric);
    return metricMeta(c.metric).lowerIsBetter ? cur <= c.target : cur >= c.target;
  };

  const completedCount = configs.filter(isDone).length;
  const allDone = summary != null && configs.length > 0 && completedCount === configs.length;

  // Update streak once per day when every challenge is complete.
  useEffect(() => {
    if (!settings || !summary) return;
    if (configs.length === 0 || !allDone) return;
    const day = todayKey();
    if (settings.lastCompletedDay === day) return;
    const next = settings.lastCompletedDay === yesterdayKey() ? settings.streakCount + 1 : 1;
    persist({ ...settings, streakCount: next, lastCompletedDay: day });
  }, [settings, summary, allDone]);

  const addChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const t = parseInt(newTarget, 10);
    const target = isNaN(t) || t < 0 ? 0 : t;
    persist({ ...settings, challenges: [...settings.challenges, { id: newId(), metric: newMetric, target }] });
    setNewTarget('30');
  };

  const updateTarget = (id: string, value: string) => {
    if (!settings) return;
    const t = parseInt(value, 10);
    const target = isNaN(t) || t < 0 ? 0 : t;
    persist({ ...settings, challenges: settings.challenges.map((c) => (c.id === id ? { ...c, target } : c)) });
  };

  const removeChallenge = (id: string) => {
    if (!settings) return;
    persist({ ...settings, challenges: settings.challenges.filter((c) => c.id !== id) });
  };

  const resetDefaults = () => {
    if (!settings) return;
    persist({ ...settings, challenges: DEFAULT_CHALLENGES.map((c) => ({ ...c, id: newId() })) });
  };

  return (
    <>
      <header className="page-header">
        <div className="page-eyebrow">Thử thách</div>
        <h1 className="page-title">Daily Detox Challenge</h1>
        <p className="page-sub">Tự tạo thử thách của riêng bạn, hoàn thành mỗi ngày và giữ chuỗi streak.</p>
      </header>

      {error && (
        <div className="card" style={{ borderColor: 'rgba(239,68,68,0.35)', marginBottom: 18 }}>
          <strong style={{ color: 'var(--bad)' }}>Lưu ý:</strong> {error}
        </div>
      )}

      {loading && (
        <section className="grid grid-2" style={{ marginBottom: 18 }} aria-hidden>
          {[0, 1].map((i) => (
            <div className="stat" key={i}>
              <div className="skeleton" style={{ height: 12, width: '60%' }} />
              <div className="skeleton" style={{ height: 30, width: '80%', marginTop: 10 }} />
            </div>
          ))}
        </section>
      )}

      {!loading && settings && (
        <>
          <section className="grid grid-2" style={{ marginBottom: 18 }}>
            <div className="stat">
              <span className="stat-label">Chuỗi streak hiện tại</span>
              <span className="stat-value">{streak} <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>ngày 🔥</span></span>
              <span className="stat-meta muted">Hoàn thành mọi thử thách để +1 mỗi ngày</span>
            </div>
            <div className="stat">
              <span className="stat-label">Hôm nay</span>
              <span className="stat-value">{completedCount}<span style={{ fontSize: 18, color: 'var(--text-muted)' }}>/{configs.length}</span></span>
              <span className="stat-meta">
                {allDone
                  ? <span className="badge stat-good">Hoàn thành tất cả 🎉</span>
                  : <span className="muted">thử thách đã đạt</span>}
              </span>
            </div>
          </section>

          {/* Add new challenge */}
          <form className="card" onSubmit={addChallenge} style={{ marginBottom: 18 }}>
            <h2 className="card-title">Tạo thử thách mới</h2>
            <p className="card-sub">Chọn mục tiêu và đặt ngưỡng của riêng bạn. Mọi thay đổi được lưu vào tài khoản.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="field" style={{ marginBottom: 0, flex: '1 1 200px' }}>
                <label className="field-label" htmlFor="ch-metric">Mục tiêu</label>
                <select
                  id="ch-metric"
                  className="field-input"
                  value={newMetric}
                  onChange={(e) => setNewMetric(e.target.value as Metric)}
                >
                  {(Object.keys(METRICS) as Metric[]).map((m) => (
                    <option key={m} value={m}>{METRICS[m].icon} {METRICS[m].label}</option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ marginBottom: 0, flex: '1 1 160px' }}>
                <label className="field-label" htmlFor="ch-target">
                  Ngưỡng ({METRICS[newMetric].unit}) {METRICS[newMetric].lowerIsBetter ? '— tối đa' : '— tối thiểu'}
                </label>
                <input
                  id="ch-target"
                  className="field-input"
                  type="number"
                  min={0}
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ flex: '0 0 auto' }}>+ Thêm thử thách</button>
            </div>
          </form>

          {configs.length === 0 && (
            <div className="card center" style={{ padding: '40px 24px', marginBottom: 18 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🎯</div>
              <h2 className="card-title">Chưa có thử thách nào</h2>
              <p className="card-sub" style={{ marginBottom: 16 }}>Tạo thử thách đầu tiên ở trên, hoặc khôi phục bộ mặc định.</p>
              <button type="button" className="btn btn-ghost" onClick={resetDefaults}>Khôi phục mặc định</button>
            </div>
          )}

          {configs.length > 0 && (
            <section className="grid grid-2">
              {configs.map((c) => {
                const m = metricMeta(c.metric);
                const cur = currentFor(c.metric);
                const done = isDone(c);
                const pct = Math.min(100, Math.round((cur / Math.max(c.target, 1)) * 100));
                return (
                  <div
                    className="card"
                    key={c.id}
                    style={{ borderColor: done ? 'rgba(34,197,94,0.35)' : undefined }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                      <div className="tip-icon" aria-hidden style={{ fontSize: 20 }}>{m.icon}</div>
                      <div style={{ flex: 1 }}>
                        <h2 className="card-title" style={{ marginBottom: 2 }}>{challengeTitle(c)}</h2>
                        <p className="card-sub" style={{ margin: 0 }}>
                          {m.lowerIsBetter ? 'Giữ ở mức thấp hơn ngưỡng hôm nay.' : 'Đạt mức bằng hoặc cao hơn ngưỡng.'}
                        </p>
                      </div>
                      {done && <span className="badge stat-good">Đạt ✓</span>}
                    </div>

                    <div className="siterow-bar" style={{ height: 8 }}>
                      <div
                        className={`siterow-bar-fill ${m.lowerIsBetter && !done ? 'warn' : ''}`}
                        style={{ width: `${pct}%`, background: done ? 'linear-gradient(90deg, var(--good), var(--teal))' : undefined }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13, color: 'var(--text-soft)' }}>
                      <span>{m.unit === 'phút' ? formatMinutes(cur * 60) : `${cur} ${m.unit}`}</span>
                      <span className="muted">{m.lowerIsBetter ? '≤' : '≥'} {m.unit === 'phút' ? formatMinutes(c.target * 60) : `${c.target} ${m.unit}`}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                      <label className="field-label" htmlFor={`edit-${c.id}`} style={{ margin: 0 }}>Ngưỡng</label>
                      <input
                        id={`edit-${c.id}`}
                        className="field-input"
                        type="number"
                        min={0}
                        value={c.target}
                        onChange={(e) => updateTarget(c.id, e.target.value)}
                        style={{ width: 90, padding: '6px 10px' }}
                      />
                      <span className="muted" style={{ fontSize: 12 }}>{m.unit}</span>
                      <button
                        type="button"
                        className="account-link"
                        style={{ marginLeft: 'auto', color: 'var(--bad)' }}
                        onClick={() => removeChallenge(c.id)}
                      >
                        Xoá
                      </button>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          <div className="card" style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <p style={{ color: 'var(--text-soft)', lineHeight: 1.6, fontSize: 14, margin: 0, flex: '1 1 320px' }}>
              Thử thách được chấm tự động từ dữ liệu hôm nay. Hoàn thành <strong>tất cả</strong> thử thách
              trong ngày để giữ chuỗi streak &mdash; bỏ lỡ một ngày, chuỗi sẽ bắt đầu lại.
            </p>
            <button type="button" className="btn btn-ghost" onClick={resetDefaults}>Khôi phục mặc định</button>
          </div>
        </>
      )}
    </>
  );
}
