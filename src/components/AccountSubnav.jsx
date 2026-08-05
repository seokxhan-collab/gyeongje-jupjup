import { Link } from 'react-router-dom'

export default function AccountSubnav({ active }) {
  return (
    <nav className="account-subnav" aria-label="계정 메뉴">
      <Link to="/mypage" className={`account-subnav-item ${active === 'activity' ? 'active' : ''}`}>
        내 활동
      </Link>
      <Link to="/profile" className={`account-subnav-item ${active === 'settings' ? 'active' : ''}`}>
        프로필 설정
      </Link>
    </nav>
  )
}
