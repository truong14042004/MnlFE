import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend,
} from 'recharts';
import { fetchSummary, formatMinutes, Summary, getCurrentUserId } from '../lib/api';

const SITES = ['YouTube', 'Facebook', 'TikTok'] as const;
const SITE_COLORS: Record<string, string> = {
  YouTube: '#FF2A55',
  Facebook: '#3B82F6',
  TikTok: '#25F4EE',
};

function ScoreBadge({ score }: { score: number }) {
  const label =
    score >= 80 ? 'Xuất sắc' :
    score >= 60 ? 'Lành mạnh' :
    score >= 40 ? 'Cần chú ý' : 'Cần detox';
  const cls =
    score >= 60 ? 'stat-good' :
    score >= 40 ? 'stat-warn' : 'stat-bad';
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const data = await fetchSummary(getCurrentUserId(), 7);
        if (!stop) {
          setSummary(data);
          setError(null);
        }
      } catch (e: any) {
        if (!stop) setError('Không kết nối được tới API. Hãy chắc chắn backend đang chạy ở cổng 5050.');
      }
    };
    load();
    const t = setInterval(load, 5000);
    return () => { stop = true; clearInterval(t); };
  }, []);

  const totalSec = summary?.totalSeconds ?? 0;
  const score = summary?.awarenessScore ?? 100;
  const byWebsite = summary?.byWebsite ?? [];
  const daily = summary?.daily ?? [];

  const pieData = SITES.map(s => {
    const found = byWebsite.find(b => b.website === s);
    return { name: s, value: found?.totalSeconds ?? 0 };
  }).filter(d => d.value > 0);

  const barData = daily.map(d => ({
    day: d.day.slice(5), // MM-DD
    YouTube: Math.round((d.byWebsite?.YouTube ?? 0) / 60),
    Facebook: Math.round((d.byWebsite?.Facebook ?? 0) / 60),
    TikTok: Math.round((d.byWebsite?.TikTok ?? 0) / 60),
  }));

  const topSite = byWebsite[0];

  return (
    <>
      <header className="page-header">
        <div className="page-eyebrow">7 ngày qua</div>
        <h1 className="page-title">Dashboard detox của bạn</h1>
        <p className="page-sub">Dữ liệu trực tiếp từ Chrome extension. Cập nhật mỗi 5 giây.</p>
      </header>

      {error && (
        <div className="card" style={{ borderColor: 'rgba(239,68,68,0.35)', marginBottom: 18 }}>
          <strong style={{ color: 'var(--bad)' }}>Lưu ý:</strong> {error}
        </div>
      )}

      <section className="grid grid-4" style={{ marginBottom: 18 }}>
        <div className="stat">
          <span className="stat-label">Tổng thời gian</span>
          <span className="stat-value">{formatMinutes(totalSec)}</span>
          <span className="stat-meta muted">trên tất cả app theo dõi</span>
        </div>
        <div className="stat">
          <span className="stat-label">Điểm tỉnh thức</span>
          <span className="stat-value">{score}<span style={{ fontSize: 18, color: 'var(--text-muted)' }}>/100</span></span>
          <span className="stat-meta"><ScoreBadge score={score} /></span>
        </div>
        <div className="stat">
          <span className="stat-label">App dùng nhiều nhất</span>
          <span className="stat-value" style={{ fontSize: 26 }}>
            {topSite?.website ?? '—'}
          </span>
          <span className="stat-meta muted">
            {topSite ? formatMinutes(topSite.totalSeconds) : 'chưa có dữ liệu'}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Trung bình mỗi ngày</span>
          <span className="stat-value">{formatMinutes(Math.round(totalSec / Math.max(daily.length, 1)))}</span>
          <span className="stat-meta muted">{daily.length || 7} ngày gần đây</span>
        </div>
      </section>

      <section className="grid grid-dashboard">
        <div className="card">
          <h2 className="card-title">Phân tích theo ngày</h2>
          <p className="card-sub">Số phút theo từng app, 7 ngày gần đây</p>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#8B8FB0" fontSize={12} />
                <YAxis stroke="#8B8FB0" fontSize={12} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Legend wrapperStyle={{ color: 'var(--text-soft)', fontSize: 12 }} />
                <Bar dataKey="YouTube"  stackId="a" fill={SITE_COLORS.YouTube}  radius={[0,0,0,0]} />
                <Bar dataKey="Facebook" stackId="a" fill={SITE_COLORS.Facebook} radius={[0,0,0,0]} />
                <Bar dataKey="TikTok"   stackId="a" fill={SITE_COLORS.TikTok}   radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Mức độ tỉnh thức</h2>
          <p className="card-sub">Càng cao càng tốt &mdash; tính theo tổng số phút sử dụng</p>
          <div className="ring-wrap">
            <div className="ring" style={{ ['--pct' as any]: score }}>
              <div className="ring-content">
                <div className="ring-value">{score}</div>
                <div className="ring-label">điểm</div>
              </div>
            </div>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 14, color: 'var(--text-soft)' }}>
                Công thức: 100 − (số phút / 10).
              </p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                Giữ điểm trên 80 phần lớn các ngày để hình thành thói quen lành mạnh.
              </p>
            </div>
          </div>

          <div style={{ marginTop: 22 }}>
            <h3 className="card-title" style={{ fontSize: 14 }}>Phân bổ hôm nay</h3>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData.length ? pieData : [{ name: 'Chưa có', value: 1 }]}
                    dataKey="value"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {(pieData.length ? pieData : [{ name: 'Chưa có' } as any]).map((d, i) => (
                      <Cell
                        key={i}
                        fill={SITE_COLORS[d.name] || 'rgba(255,255,255,0.10)'}
                        stroke="rgba(0,0,0,0.4)"
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        <h2 className="card-title">Tổng theo từng app</h2>
        <p className="card-sub">Bấm sang trang Phân tích để xem xu hướng</p>
        {SITES.map(s => {
          const found = byWebsite.find(b => b.website === s);
          const sec = found?.totalSeconds ?? 0;
          const max = Math.max(...byWebsite.map(b => b.totalSeconds), 1);
          const pct = (sec / max) * 100;
          const dotClass = s === 'YouTube' ? 'dot-yt' : s === 'Facebook' ? 'dot-fb' : 'dot-tt';
          return (
            <div className="siterow" key={s}>
              <span className={`dot ${dotClass}`} aria-hidden></span>
              <div>
                <div className="siterow-name">{s}</div>
                <div className="siterow-meta">{sec === 0 ? 'Chưa có hoạt động' : `${Math.round(pct)}% so với app dùng nhiều nhất`}</div>
                <div className="siterow-bar"><div className="siterow-bar-fill" style={{ width: `${pct}%` }}></div></div>
              </div>
              <div className="siterow-time">{formatMinutes(sec)}</div>
            </div>
          );
        })}
      </section>
    </>
  );
}
