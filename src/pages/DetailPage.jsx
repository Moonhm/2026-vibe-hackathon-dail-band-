import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { festivals } from '../data/festivals';
import CrowdForecast from '../components/CrowdForecast';
import BottomNav from '../components/BottomNav';
import { formatVisitors, shortAddress } from '../utils/format';
import { REGION_KO, IMG_FALLBACK, TREND } from '../utils/constants';
import './DetailPage.css';

const AGE_GROUPS = ['20대', '30대', '40대', '50대', '60대이상'];

function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const festival = festivals.find(f => f.id === Number(id));

  if (!festival) {
    return (
      <div className="dp-notfound">
        <p>관광지 정보를 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/')}>홈으로 가기</button>
      </div>
    );
  }

  const trend = TREND[festival.trend] ?? TREND['유지'];
  const related = festivals
    .filter(f => f.region === festival.region && f.id !== festival.id)
    .slice(0, 3);

  return (
    <div className="dp-page">

      {/* ── 히어로 이미지 ── */}
      <div className="dp-hero">
        <img src={festival.image} alt={festival.name} className="dp-hero-img"
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = IMG_FALLBACK; }} />
        <div className="dp-hero-overlay" />
        <button className="dp-back" onClick={() => navigate(-1)}>← 뒤로</button>
        <div className="dp-hero-content">
          <span className={`dp-trend ${trend.cls}`}>{trend.text}</span>
          <h1 className="dp-name">{festival.name}</h1>
          <p className="dp-location">📍 {shortAddress(festival.address)} · {festival.date}</p>
        </div>
      </div>

      {/* ── 통계 행 ── */}
      <div className="dp-stats-row">
        <div className="dp-stat">
          <span className="dp-stat-label">연간 방문자</span>
          <span className="dp-stat-value">👥 {formatVisitors(festival.visitors)}</span>
        </div>
        <div className="dp-stat">
          <span className="dp-stat-label">전국 순위</span>
          <span className="dp-stat-value">🏆 #{festival.popularityRank}</span>
        </div>
        <div className="dp-stat">
          <span className="dp-stat-label">트렌드</span>
          <span className={`dp-stat-value dp-trend-chip ${trend.cls}`}>{trend.text}</span>
        </div>
      </div>

      <div className="dp-body">

        {/* ── 소개 ── */}
        <section>
          <h2 className="dp-section-title">관광지 소개</h2>
          <p className="dp-desc">{festival.description}</p>
        </section>

        {/* ── 태그 ── */}
        <section>
          <h2 className="dp-section-title">태그</h2>
          <div className="dp-tags">
            {festival.tags.map(tag => (
              <span key={tag} className="dp-tag">#{tag}</span>
            ))}
          </div>
        </section>

        {/* ── 연령대별 순위 ── */}
        <section>
          <h2 className="dp-section-title">👥 연령대별 인기 순위</h2>
          <div className="dp-age-grid">
            {AGE_GROUPS.map(age => {
              const rank = festival.ageRankings[age];
              const cls = rank == null ? 'rank-none' : rank <= 5 ? 'rank-top' : rank <= 15 ? 'rank-mid' : '';
              return (
                <div key={age} className="dp-age-cell">
                  <span className="dp-age-group">{age}</span>
                  <span className={`dp-age-rank ${cls}`}>{rank != null ? `#${rank}` : '–'}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 혼잡도 예측 ── */}
        <CrowdForecast areaCd={festival.areaCd} signguCd={festival.signguCd} />

        {/* ── 같은 지역 관광지 ── */}
        {related.length > 0 && (
          <section>
            <h2 className="dp-section-title">{REGION_KO[festival.region]}의 다른 관광지</h2>
            <div className="dp-related">
              {related.map(f => (
                <div
                  key={f.id}
                  className="dp-related-card"
                  onClick={() => navigate(`/detail/${f.id}`)}
                >
                  <img src={f.image} alt={f.name}
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = IMG_FALLBACK; }} />
                  <div className="dp-related-info">
                    <p className="dp-related-name">{f.name}</p>
                    <p className="dp-related-date">{f.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="dp-action-row">
          <button
            className="dp-map-btn"
            onClick={() => navigate('/map', { state: { region: festival.region, festivalId: festival.id } })}
          >
            지도에서 위치 보기 →
          </button>
          <button className="dp-share-btn" onClick={() => {
            if (navigator.share) {
              navigator.share({ title: festival.name, text: festival.description, url: window.location.href });
            } else {
              navigator.clipboard?.writeText(window.location.href).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              });
            }
          }}>
            {copied ? '✓ 복사됨' : '공유'}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default DetailPage;
