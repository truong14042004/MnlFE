import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSummary, formatMinutes, Summary, getActiveUserId } from '../lib/api';
import AnonBanner from '../components/AnonBanner';
import { usePageMeta } from '../lib/usePageMeta';

const STREAK_KEY = 'detox_challenge_streak';
const STREAK_DATE_KEY = 'detox_challenge_last';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

interface Challenge {
  id: string;
  icon: string;
  title: string;
  desc: string;
  /** current measured value (e.g. minutes used) */
  current: number;
  /** target threshold */
  target: number;
  /** true when the goal is "stay under" target; false when "reach at least" target */
  lowerIsBetter: boolean;
  unit: string;
}

export default function Challenges() {
  const [activeUserId] = useState(() => getActiveUserId());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [streak, setStreak] = useState<number>(() => {
    const s = Number(localStorage.getItem(STREAK_KEY) || '0');
    return Number.isFinite(s) ? s : 0;
  });
  usePageMeta('Thử thách · Digital Detox', 'Hoàn thành các thử thách detox mỗi ngày và giữ chuỗi streak để xây dựng thói quen số lành mạnh.');

  useEffect(() => {
    if (!activeUserId) return;
    fetchSummary(activeUserId, 7).then(setSummary).catch(() => {});
  }, [activeUserId]);

  // Today's slice is the last entry of the rolling daily array.
  const today = summary?.daily?.[summary.daily.length - 1];
  const todayTotalMin = Math.round((today?.totalSeconds ?? 0) / 60);
  const todayYouTube = Math.round((today?.byWebsite?.YouTube ?? 0) / 60);
  const todayFacebook = Math.round((today?.byWebsite?.Facebook ?? 0) / 60);
  const todayTikTok = Math.round((today?.byWebsite?.TikTok ?? 0) / 60);
  const score = summary?.awarenessScore ?? 0;

  const challenges: Challenge[] = useMemo(() => [
    {
      id: 'total',
      icon: '🧘',
      title: 'Dưới 60 phút hôm nay',
      desc: 'Giữ tổng thời gian mạng xã hội dưới 1 tiếng.',
      current: todayTotalMin,
      target: 60,
      lowerIsBetter: true,
      unit: 'phút',
    },
    {
      id: 'tiktok',
      icon: '⏳',
      title: 'TikTok dưới 20 phút',
      desc: 'Hạn chế cuộn TikTok vô tận trong hôm nay.',
      current: todayTikTok,
      target: 20,
      lowerIsBetter: true,
      unit: 'phút',
    },
    {
      id: 'facebook',
      icon: '🚫',
      title: 'Một ngày không Facebook',
      desc: 'Bỏ qua Facebook trọn vẹn hôm nay.',
      current: todayFacebook,
      target: 0,
      lowerIsBetter: true,
      unit: 'phút',
    },
    {
      id: 'score',
      icon: '✨',
      title: 'Điểm tỉnh thức ≥ 80',
      desc: 'Duy trì điểm tỉnh thức ở mức xuất sắc.',
      current: score,
      target: 80,
      lowerIsBetter: false,
      unit: 'điểm',
    },
  ], [todayTotalMin, todayTikTok, todayFacebook, score]);

  const isDone = (c: Challenge) =>
    c.lowerIsBetter ? c.current <= c.target : c.current >= c.target;

  const completedCount = challenges.filter(isDone).length;
  const allDone = summary != null && completedCount === challenges.length;

  // Update the streak once per day when every challenge is complete.
  useEffect(() => {
    if (!allDone) return;
    const last = localStorage.getItem(STREAK_DATE_KEY);
    const today = todayKey();
    if (last === today) return; // already counted today
    const prev = Number(localStorage.getItem(STREAK_KEY) || '0');
    const next = last === yesterdayKey() ? prev + 1 : 1;
    localStorage.setItem(STREAK_KEY, String(next));
    localStorage.setItem(STREAK_DATE_KEY, today);
    setStreak(next);
  }, [allDone]);

  return (
    <>
      <header className="page-header">
        <div className="page-eyebrow">Thử thách</div>
        <h1 className="page-title">Daily Detox Challenge</h1>
        <p className="page-sub">Hoàn thành các mục tiêu mỗi ngày và giữ chuỗi streak của bạn.</p>
      </header>

      {activeUserId === 'anon' && <AnonBanner />}

      {!activeUserId && (
        <div className="card auth-required-card">
          <h2 className="card-title">Bạn cần đăng nhập để tham gia thử thách</h2>
          <p className="card-sub">Thử thách được chấm dựa trên dữ liệu theo dõi của tài khoản hiện tại.</p>
          <Link to="/auth" className="btn btn-primary">Đăng nhập / Đăng ký</Link>
        </div>
      )}

      {activeUserId && (
        <>
          <section className="grid grid-2" style={{ marginBottom: 18 }}>
            <div className="stat">
              <span className="stat-label">Chuỗi streak hiện tại</span>
              <span className="stat-value">{streak} <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>ngày 🔥</span></span>
              <span className="stat-meta muted">Hoàn thành mọi thử thách để +1 mỗi ngày</span>
            </div>
            <div className="stat">
              <span className="stat-label">Hôm nay</span>
              <span className="stat-value">{completedCount}<span style={{ fontSize: 18, color: 'var(--text-muted)' }}>/{challenges.length}</span></span>
              <span className="stat-meta">
                {allDone
                  ? <span className="badge stat-good">Hoàn thành tất cả 🎉</span>
                  : <span className="muted">thử thách đã đạt</span>}
              </span>
            </div>
          </section>

          <section className="grid grid-2">
            {challenges.map((c) => {
              const done = isDone(c);
              const pct = c.lowerIsBetter
                ? Math.min(100, Math.round((c.current / Math.max(c.target, 1)) * 100))
                : Math.min(100, Math.round((c.current / Math.max(c.target, 1)) * 100));
              return (
                <div
                  className="card"
                  key={c.id}
                  style={{ borderColor: done ? 'rgba(34,197,94,0.35)' : undefined }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                    <div className="tip-icon" aria-hidden style={{ fontSize: 20 }}>{c.icon}</div>
                    <div style={{ flex: 1 }}>
                      <h2 className="card-title" style={{ marginBottom: 2 }}>{c.title}</h2>
                      <p className="card-sub" style={{ margin: 0 }}>{c.desc}</p>
                    </div>
                    {done && <span className="badge stat-good">Đạt ✓</span>}
                  </div>

                  <div className="siterow-bar" style={{ height: 8 }}>
                    <div
                      className={`siterow-bar-fill ${c.lowerIsBetter && !done ? 'warn' : ''}`}
                      style={{ width: `${pct}%`, background: done ? 'linear-gradient(90deg, var(--good), var(--teal))' : undefined }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13, color: 'var(--text-soft)' }}>
                    <span>
                      {c.unit === 'phút' ? formatMinutes(c.current * 60) : `${c.current} ${c.unit}`}
                    </span>
                    <span className="muted">
                      Mục tiêu: {c.lowerIsBetter ? '≤' : '≥'} {c.unit === 'phút' ? formatMinutes(c.target * 60) : `${c.target} ${c.unit}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </section>

          <div className="card" style={{ marginTop: 18 }}>
            <h2 className="card-title">Cách hoạt động</h2>
            <p style={{ color: 'var(--text-soft)', lineHeight: 1.6, fontSize: 14, margin: 0 }}>
              Thử thách được chấm tự động từ dữ liệu theo dõi hôm nay. Hoàn thành cả {challenges.length} thử
              thách trong ngày để giữ chuỗi streak &mdash; bỏ lỡ một ngày, chuỗi sẽ bắt đầu lại từ đầu.
            </p>
          </div>
        </>
      )}
    </>
  );
}
