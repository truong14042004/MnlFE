import { Link } from 'react-router-dom';

/**
 * Shared "Guest Mode" banner shown when the user is browsing anonymously.
 * Previously duplicated across Dashboard and Insights.
 */
export default function AnonBanner() {
  return (
    <div
      className="card"
      style={{
        borderColor: 'rgba(168,85,247,0.35)',
        background: 'rgba(168,85,247,0.03)',
        marginBottom: 18,
      }}
    >
      <span style={{ fontSize: 13, display: 'block', lineHeight: 1.5 }}>
        🚀 <strong style={{ color: 'var(--accent)' }}>Chế độ Ẩn danh (Guest Mode):</strong> Bạn đang xem dữ liệu theo dõi cục bộ. Hãy{' '}
        <Link
          to="/auth"
          style={{ color: 'var(--accent-2)', textDecoration: 'underline', fontWeight: 600 }}
        >
          Đăng ký tài khoản
        </Link>{' '}
        để đồng bộ dữ liệu trên nhiều thiết bị và lưu trữ vĩnh viễn!
      </span>
    </div>
  );
}
