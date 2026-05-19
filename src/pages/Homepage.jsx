import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { festivals } from '../data/festivals';
import { topRegions, nationalSummary, NATIONAL_DATE } from '../data/nationalStats';
import BottomNav from '../components/BottomNav';
import { formatVisitors } from '../utils/format';
import { IMG_FALLBACK, TREND } from '../utils/constants';
import './Homepage.css';

const TOP3 = [...festivals]
  .sort((a, b) => b.visitors - a.visitors)
  .slice(0, 3);

const RANK_META = [
  { medal: '🥇', bg: '#FEF3C7', color: '#B45309' },
  { medal: '🥈', bg: '#f2f7fb', color: '#3d7a9a' },
  { medal: '🥉', bg: '#FFF7ED', color: '#C2410C' },
];


function Homepage() {
  const navigate = useNavigate();
  const [toastVisible, setToastVisible] = useState(false);

  const handleLogoCopy = () => {
    const url = window.location.origin;
    navigator.clipboard?.writeText(url).then(() => {
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    });
  };

  return (
    <div className="homepage">

      {/* ── 히어로 ──────────────────────────── */}
      <section className="hero">
        <div className="hero-circle hero-circle--lg" />
        <div className="hero-circle hero-circle--sm" />
        <div className="hero-ring" />

        <div className="hero-content">
          <img src="/favicon.png" alt="놀러가자" className="hero-logo hero-logo--clickable" onClick={handleLogoCopy} />
          <span className="hero-eyebrow">전국 관광지 탐색</span>
          <h1 className="hero-title">놀러가자</h1>
          <p className="hero-desc">
            전국 관광지를 한눈에 탐색하고<br />
            내 취향에 맞는 여행지를 찾아보세요
          </p>
          <button className="hero-btn" onClick={() => navigate('/map')}>
            지도로 탐색하기
            <span className="hero-btn-arrow">→</span>
          </button>
        </div>
      </section>

      {/* ── TOP 3 ───────────────────────────── */}
      <section className="top3-section">
        <div className="section-header">
          <h2 className="section-title">🔥 인기 관광지 TOP 3</h2>
          <span className="section-sub">방문자 수 기준</span>
        </div>

        <div className="card-list">
          {TOP3.map((festival, idx) => {
            const rank = RANK_META[idx];
            const trend = TREND[festival.trend] ?? TREND['유지'];
            return (
              <div key={festival.id} className="festival-card" onClick={() => navigate(`/detail/${festival.id}`)} style={{ cursor: 'pointer' }}>
                <div className="card-img-wrap">
                  <img src={festival.image} alt={festival.name} className="card-img"
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = IMG_FALLBACK; }} />
                  <span className="card-medal" style={{ background: rank.bg, color: rank.color }}>
                    {rank.medal} {idx + 1}위
                  </span>
                </div>
                <div className="card-body">
                  <div className="card-top-row">
                    <h3 className="card-name">{festival.name}</h3>
                    <span className={`card-trend ${trend.cls}`}>{trend.text}</span>
                  </div>
                  <p className="card-date">{festival.date}</p>
                  <div className="card-meta">
                    <span className="card-visitors">👥 {formatVisitors(festival.visitors)}</span>
                    <span className="card-rank-chip">전국 #{festival.popularityRank}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 전국 관광 현황 ──────────────────── */}
      <section className="national-section">
        <div className="section-header">
          <h2 className="section-title">📊 전국 관광 현황</h2>
          <span className="section-sub">({NATIONAL_DATE})</span>
        </div>

        {/* 요약 지표 칩 */}
        <div className="nat-summary-row">
          {nationalSummary.map((item) => (
            <div key={item.label} className="nat-chip">
              <span className="nat-chip-val">{item.value}</span>
              <span className="nat-chip-label">{item.label}</span>
            </div>
          ))}
        </div>

        {/* 방문자 Top 5 지역 바 차트 */}
        <p className="nat-sub">방문자 수 상위 5개 지역</p>
        <div className="nat-bars">
          {topRegions.map((d, idx) => (
            <div key={d.region} className="nat-bar-row">
              <span className="nat-bar-rank">#{idx + 1}</span>
              <span className="nat-bar-label">{d.region}</span>
              <div className="nat-bar-track">
                <div
                  className="nat-bar-fill"
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <span className="nat-bar-val">
                {(d.visitors / 100000000).toFixed(1)}억
              </span>
            </div>
          ))}
        </div>

        <p className="nat-source">
          출처: 한국관광데이터랩 지역별 방문자수 · 이동통신 신호 기반 추정치
        </p>
      </section>

      {/* ── 서비스 소개 ─────────────────────── */}
      <section className="about-section">
        <div className="about-badge">About</div>
        <h2 className="about-title">놀러가자란?</h2>
        <p className="about-desc-ko">
          놀러가자는 한국관광데이터랩의 빅데이터를 기반으로 전국 관광지의 방문자 현황,
          연령대별 선호 관광지, 지역별 인기 순위를 시각화한 국내 여행 정보 서비스입니다.
          이동통신·신용카드·내비게이션 데이터를 복합 분석하여 실제 국내 여행자의 이동
          패턴과 소비 행태를 반영하였습니다.
        </p>
        <p className="about-desc-en">
          Nolrugaja is a domestic travel guide that visualizes visitor statistics,
          age-group preferences, and regional popularity rankings across South Korea's
          tourist destinations — powered by big data from the Korea Tourism Data Lab.
          It integrates mobile, credit card, and navigation data to reflect real
          domestic travelers' movement patterns and spending behavior.
        </p>

        <div className="about-chips">
          <span className="about-chip">📱 이동통신 데이터</span>
          <span className="about-chip">💳 신용카드 데이터</span>
          <span className="about-chip">🗺️ 내비게이션 데이터</span>
          <span className="about-chip">📅 2025.05 ~ 2026.04</span>
        </div>
      </section>

      {/* ── 데이터 출처 고지 ─────────────────── */}
      <section className="data-notice">
        <p className="dn-heading">데이터 출처 및 유의사항</p>

        <p className="dn-body">
          본 서비스는 <strong>한국관광데이터랩</strong> (2025.05~2026.04 기준),{' '}
          <strong>한국관광공사</strong>, <strong>한국관광콘텐츠랩</strong>,{' '}
          <strong>공공데이터포털</strong>에서 제공하는 데이터를 활용합니다.
        </p>

        <p className="dn-body">
          <strong>이동통신 데이터 (㈜케이티)</strong> — 지역별 방문자 수 추이, 방문자
          거주지·성·연령 분포, 평균 체류시간, 숙박방문자 비율 산출에 활용.
          방문자 수는 이동통신 신호 기반 추정치로 실제 입장객 수와 차이가 있을 수 있습니다.
        </p>

        <p className="dn-body">
          <strong>신용카드 데이터 (신한카드)</strong> — 업종별 관광소비 금액 및
          성·연령별 소비 분포 산출에 활용. 관광 관련 소비(숙박·여행·운송·쇼핑·
          여가서비스·식음료 등)만 집계됩니다.
        </p>

        <p className="dn-body">
          <strong>내비게이션 데이터 (티맵모빌리티)</strong> — 목적지 유형별 검색량,
          인기 관광지·맛집 도출에 활용. 차량 이동 기준이므로 도보·대중교통 이용자는
          반영되지 않을 수 있습니다.
        </p>

        <p className="dn-body">
          관광지 입장객 수 확정치는 익년도 5월 공표 전까지 잠정치로 표출되며 수시로
          변경될 수 있습니다. 비율(%)의 총합은 반올림으로 인해 100%가 되지 않을 수
          있습니다. 방문비율은 전년도 전체 지역 평균과 표준편차를 활용한 누적분포확률로
          지수화하여 제공됩니다.
        </p>

        <p className="dn-body">
          세대별 인기관광지 분석은 이동통신·신용카드·내비게이션 데이터를 복합 분석한
          결과이며, 지역관광진단 주요 지표(방문자유입, 숙박방문자 비율, 체류시간,
          목적지 검색량, 관광소비)를 기반으로 산출됩니다.
        </p>

        <p className="dn-copy">
          © 데이터 출처: 한국관광데이터랩 · 한국관광공사 · 한국관광콘텐츠랩 · 공공데이터포털
          | 이미지 출처: 한국관광공사 2025 지역별 한국관광사진
        </p>
        <p className="dn-copy dn-dev">
          개발자: 문형민, 서교연 &nbsp;|&nbsp; 문의:{' '}
          <a href="mailto:hm8824@naver.com" className="dn-mail">hm8824@naver.com</a>
        </p>
      </section>

      <BottomNav />

      {toastVisible && (
        <div className="copy-toast">
          🔗 사이트 주소가 복사되었어요! 친구들에게 알려봐요!
        </div>
      )}
    </div>
  );
}

export default Homepage;
