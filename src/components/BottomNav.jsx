import { NavLink } from 'react-router-dom';
import './BottomNav.css';

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

const icons = {
  home: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...S}>
      <path d="M3 11.5L12 3l9 8.5" />
      <path d="M5 9.8V20a.5.5 0 00.5.5H10v-5h4v5h4.5a.5.5 0 00.5-.5V9.8" />
    </svg>
  ),
  map: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...S}>
      <path d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6z" />
      <circle cx="12" cy="8" r="2" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...S}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  sparkle: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...S}>
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      <path d="M5.64 5.64l2.83 2.83M15.54 15.54l2.83 2.83M5.64 18.36l2.83-2.83M15.54 8.46l2.83-2.83" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { to: '/',          end: true,  icon: icons.home,    label: '홈' },
  { to: '/map',       end: false, icon: icons.map,     label: '지도' },
  { to: '/ranking',   end: false, icon: icons.star,    label: '순위' },
  { to: '/recommend', end: false, icon: icons.sparkle, label: '추천' },
];

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ to, end, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{icon}</span>
          <span className="nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;
