import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <>
      <section className="hero">
        <div className="hero-eyebrow">✦ MVP — Chrome Extension + Web</div>
        <h1 className="hero-title">Lấy lại sự tập trung khỏi vòng xoáy lướt vô tận.</h1>
        <p className="hero-sub">
          Digital Detox theo dõi thời gian bạn dùng YouTube, Facebook và TikTok, nhẹ nhàng cảnh báo
          khi bạn vượt giới hạn mỗi ngày, và cho bạn thấy thói quen ẩn sau những lần lướt vô thức.
        </p>
        <div className="hero-cta">
          <Link to="/auth" className="btn btn-primary">Đăng nhập / Đăng ký</Link>
          <Link to="/dashboard" className="btn btn-ghost">Xem dashboard trực tiếp</Link>
          <Link to="/settings" className="btn btn-ghost">Đặt giới hạn của tôi</Link>
        </div>
      </section>

      <section className="features" aria-label="Tính năng nổi bật">
        <article className="feature">
          <div className="feature-icon" aria-hidden>⏱️</div>
          <h2 className="feature-title">Theo dõi thời gian thực</h2>
          <p className="feature-text">
            Một extension Chrome nhẹ tênh sẽ đếm thời gian khi bạn đang focus vào tab mạng xã hội.
            Không cần đăng nhập, không cần đám mây, dữ liệu nằm trên máy bạn.
          </p>
        </article>
        <article className="feature">
          <div className="feature-icon" aria-hidden>🚦</div>
          <h2 className="feature-title">Giới hạn thật sự dừng được bạn</h2>
          <p className="feature-text">
            Đặt hạn mức cho từng app theo phút mỗi ngày. Khi vượt qua, một lớp phủ toàn màn hình
            đẹp mắt sẽ nhắc bạn nghỉ — không phải banner bé tẹo dễ bỏ qua.
          </p>
        </article>
        <article className="feature">
          <div className="feature-icon" aria-hidden>🧭</div>
          <h2 className="feature-title">Tỉnh thức, không phán xét</h2>
          <p className="feature-text">
            Xem xu hướng theo tuần, điểm tỉnh thức và những gợi ý cá nhân giúp bạn hiểu
            <em> vì sao</em> mình lướt — chứ không chỉ là lướt bao lâu.
          </p>
        </article>
      </section>
    </>
  );
}
