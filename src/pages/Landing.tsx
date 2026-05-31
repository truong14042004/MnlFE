import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <>
      <section className="hero">
        <div className="hero-eyebrow">✦ Tập trung hơn, mỗi ngày</div>
        <h1 className="hero-title">Giành lại thời gian từ những cú lướt vô thức.</h1>
        <p className="hero-sub">
          Digital Detox lặng lẽ đo thời gian bạn dành cho YouTube, Facebook và TikTok,
          nhắc bạn dừng đúng lúc, và biến mỗi ngày tỉnh thức thành một thử thách nho nhỏ
          để bạn muốn quay lại.
        </p>
        <div className="hero-cta">
          <Link to="/auth" className="btn btn-primary">Bắt đầu miễn phí</Link>
          <Link to="/dashboard" className="btn btn-ghost">Xem dashboard trực tiếp</Link>
          <Link to="/challenges" className="btn btn-ghost">Khám phá thử thách</Link>
        </div>
      </section>

      <section className="features" aria-label="Tính năng nổi bật">
        <article className="feature">
          <div className="feature-icon" aria-hidden>⏱️</div>
          <h2 className="feature-title">Tự động, không bận tâm</h2>
          <p className="feature-text">
            Extension Chrome nhẹ tênh tự đếm thời gian ngay khi bạn mở tab mạng xã hội.
            Đăng nhập một lần, số liệu đồng bộ an toàn và theo bạn trên mọi thiết bị.
          </p>
        </article>
        <article className="feature">
          <div className="feature-icon" aria-hidden>🚦</div>
          <h2 className="feature-title">Giới hạn thật sự dừng được bạn</h2>
          <p className="feature-text">
            Đặt hạn mức theo phút cho từng app. Khi chạm ngưỡng, một lớp phủ toàn màn hình
            xuất hiện để kéo bạn ra &mdash; không phải dòng thông báo bé xíu dễ vuốt qua.
          </p>
        </article>
        <article className="feature">
          <div className="feature-icon" aria-hidden>🔥</div>
          <h2 className="feature-title">Tiến bộ mà không phán xét</h2>
          <p className="feature-text">
            Hoàn thành thử thách detox mỗi ngày, giữ chuỗi streak, và theo dõi điểm tỉnh thức
            cùng gợi ý cá nhân giúp bạn hiểu <em>vì sao</em> mình lướt &mdash; chứ không chỉ bao lâu.
          </p>
        </article>
      </section>
    </>
  );
}
