import { useEffect, useState } from 'react';
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { fetchSummary, formatMinutes, Summary, getCurrentUserId } from '../lib/api';

export default function Insights() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary(getCurrentUserId(), 14)
      .then(setSummary)
      .catch(() => setErr('Không kết nối được tới API.'));
  }, []);

  const trend = (summary?.daily ?? []).map(d => ({
    day: d.day.slice(5),
    minutes: Math.round(d.totalSeconds / 60),
  }));

  return (
    <>
      <header className="page-header">
        <div className="page-eyebrow">Phân tích</div>
        <h1 className="page-title">Xu hướng &amp; gợi ý</h1>
        <p className="page-sub">Gợi ý cá nhân hoá điều chỉnh theo thói quen của bạn.</p>
      </header>

      {err && <div className="card" style={{ borderColor: 'rgba(239,68,68,0.35)', marginBottom: 18 }}>{err}</div>}

      <section className="grid grid-2">
        <div className="card">
          <h2 className="card-title">Xu hướng 14 ngày</h2>
          <p className="card-sub">Tổng số phút mạng xã hội mỗi ngày</p>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A855F7" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#8B8FB0" fontSize={12} />
                <YAxis stroke="#8B8FB0" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="minutes" stroke="#A855F7" strokeWidth={2} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Hôm nay, một cái nhìn nhanh</h2>
          <p className="card-sub">Số liệu trực tiếp từ extension</p>
          <div className="grid grid-2" style={{ gap: 10 }}>
            <div className="stat">
              <span className="stat-label">Tổng</span>
              <span className="stat-value">{formatMinutes(summary?.totalSeconds ?? 0)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Điểm</span>
              <span className="stat-value">{summary?.awarenessScore ?? 100}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        <h2 className="card-title">Gợi ý cho bạn</h2>
        <p className="card-sub">Tạo từ dữ liệu sử dụng 14 ngày gần nhất</p>
        <div className="grid grid-2">
          {(summary?.recommendations ?? ['Đặt giới hạn cho từng app để bắt đầu hành trình detox.']).map((tip, i) => (
            <div className="tip" key={i}>
              <div className="tip-icon" aria-hidden>{['💡','🌙','📅','🎯','🌿'][i % 5]}</div>
              <div className="tip-text">{tip}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
