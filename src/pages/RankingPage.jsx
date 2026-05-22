import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { festivals } from '../data/festivals';
import BottomNav from '../components/BottomNav';
import { formatVisitors, shortAddress } from '../utils/format';
import { IMG_FALLBACK, TREND } from '../utils/constants';
import './RankingPage.css';

// ── 상수 ──────────────────────────────────────────────────
const TABS = ['전국', '서울', '수도권', '지방'];

const METRO = new Set(['seoul', 'gyeonggi', 'incheon']);


const MEDAL = {
  1: {
    gradient:  'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    accentClr: '#F59E0B',
    cardBg:    '#FFFBEB',
    barClr:    '#F59E0B',
    label:     '금',
  },
  2: {
    gradient:  'linear-gradient(135deg, #c8dae5 0%, #6a9ab0 50%, #3d7a9a 100%)',
    accentClr: '#6a9ab0',
    cardBg:    '#f2f7fb',
    barClr:    '#6a9ab0',
    label:     '은',
  },
  3: {
    gradient:  'linear-gradient(135deg, #CD7F32 0%, #92400E 100%)',
    accentClr: '#CD7F32',
    cardBg:    '#FFF7ED',
    barClr:    '#CD7F32',
    label:     '동',
  },
};


// ── 헬퍼 ──────────────────────────────────────────────────
function getList(tab) {
  const filtered =
    tab === '서울'   ? festivals.filter(f => f.region === 'seoul')
    : tab === '수도권' ? festivals.filter(f => METRO.has(f.region))
    : tab === '지방'   ? festivals.filter(f => !METRO.has(f.region))
    : festivals;
  return [...filtered].sort((a, b) => b.visitors - a.visitors).slice(0, 10);
}

// ── 컴포넌트 ───────────────────────────────────────────────
function RankingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('전국');

  const list     = useMemo(() => getList(activeTab), [activeTab]);
  const maxVisit = list[0]?.visitors ?? 1;

  const topTags = useMemo(() => {
    const counts = {};
    list.forEach(f => (f.tags ?? []).forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1;
    }));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [list]);

  return (
    <div className="rp-page">

      {/* ── 헤더 + 탭 ── */}
      <header className="rp-header">
        <div className="rp-header-text">
          <span className="rp-eyebrow">한국관광 빅데이터 기반</span>
          <h1 className="rp-title">인기 순위</h1>
          <p className="rp-desc">지역별 방문자 수를 기준으로 관광지 순위를 알려드려요!</p>
        </div>

        <div className="rp-tabs" role="tablist">
          {TABS.map(tab => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`rp-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* ── 인기 키워드 ── */}
      {topTags.length > 0 && (
        <section className="rp-keyword-section">
          <h3 className="rp-keyword-title"># 이 지역 관광 키워드</h3>
          <div className="rp-keyword-chips">
            {topTags.map(([tag, count], i) => (
              <span key={tag} className={`rp-kw-chip${i < 3 ? ' kw-hot' : ''}`}>
                #{tag}
                {count > 1 && <em className="rp-kw-cnt">{count}</em>}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── 순위 리스트 ── */}
      <ul className="rp-list">
        {list.map((festival, idx) => {
          const rank   = idx + 1;
          const top3   = rank <= 3;
          const medal  = MEDAL[rank];
          const trend  = TREND[festival.trend] ?? TREND['유지'];
          const barPct = Math.round((festival.visitors / maxVisit) * 100);

          return (
            <li
              key={festival.id}
              className={`rp-card${top3 ? ' top3' : ''}`}
              onClick={() => navigate(`/detail/${festival.id}`)}
              style={top3 ? {
                cursor: 'pointer',
                background: medal.cardBg,
                '--accent': medal.accentClr,
              } : { cursor: 'pointer' }}
            >
              {/* ─ 메인 행 ─ */}
              <div className="rp-row">

                {/* 순위 뱃지 */}
                {top3 ? (
                  <div
                    className="rp-badge medal"
                    style={{ background: medal.gradient }}
                  >
                    <span className="medal-rank">{rank}</span>
                    <span className="medal-label">{medal.label}</span>
                  </div>
                ) : (
                  <div className="rp-badge normal">{rank}</div>
                )}

                {/* 썸네일 */}
                <img
                  src={festival.image}
                  alt={festival.name}
                  className={`rp-thumb${top3 ? ' lg' : ''}`}
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = IMG_FALLBACK; }}
                />

                {/* 정보 */}
                <div className="rp-info">
                  <p className="rp-name">{festival.name}</p>
                  <p className="rp-meta">
                    <span className="rp-region">📍 {shortAddress(festival.address)}</span>
                  </p>
                  {top3 && (
                    <p className="rp-visit-lg">👥 {formatVisitors(festival.visitors)}</p>
                  )}
                </div>

                {/* 오른쪽: 방문자(일반) + 트렌드 */}
                <div className="rp-right">
                  {!top3 && (
                    <span className="rp-visit-sm">{formatVisitors(festival.visitors)}</span>
                  )}
                  <span className={`rp-trend ${trend.cls}`}>{trend.text}</span>
                </div>
              </div>

              {/* ─ 방문자 비율 바 (top3 전용) ─ */}
              {top3 && (
                <div className="rp-bar-track">
                  <div
                    className="rp-bar-fill"
                    style={{ width: `${barPct}%`, background: medal.barClr }}
                  />
                  <span className="rp-bar-pct">{barPct}%</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {list.length === 0 && (
        <div className="rp-empty">
          <p>해당 지역의 관광지 데이터가 없어요</p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default RankingPage;
