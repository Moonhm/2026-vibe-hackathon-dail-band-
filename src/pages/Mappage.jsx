import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { festivals, regions } from '../data/festivals';
import BottomNav from '../components/BottomNav';
import { formatVisitors, shortAddress } from '../utils/format';
import { IMG_FALLBACK, TREND } from '../utils/constants';
import './Mappage.css';

// ── 필터 옵션 ──────────────────────────────────────────────
const AGE_GROUPS = ['전체', '20대', '30대', '40대', '50대', '60대이상'];
const REGIONS    = ['전국', '서울', '경기', '인천', '강원', '충남', '전북', '전남', '경북', '경남', '부산'];

const REGION_IDS = {
  서울: ['seoul'],    경기: ['gyeonggi'], 인천: ['incheon'],
  강원: ['gangwon'],  충남: ['chungnam'],  전북: ['jeonbuk'],  전남: ['jeonnam'],
  경북: ['gyeongbuk'], 경남: ['gyeongnam'], 부산: ['busan'],
};

// region ID → 한글 필터명
const REGION_ID_TO_KO = Object.fromEntries(
  Object.entries(REGION_IDS).flatMap(([ko, ids]) => ids.map(id => [id, ko]))
);

// 월 범위 기반 계절
const SEASON_MONTHS = {
  '12월~2월':  ['12', '1', '2'],
  '3월~5월':   ['3', '4', '5'],
  '6월~8월':   ['6', '7', '8'],
  '9월~11월':  ['9', '10', '11'],
};

function getCurrentSeasonKey() {
  const m = new Date().getMonth() + 1;
  if ([12, 1, 2].includes(m)) return '12월~2월';
  if ([3, 4, 5].includes(m))  return '3월~5월';
  if ([6, 7, 8].includes(m))  return '6월~8월';
  return '9월~11월';
}

const CURRENT_SEASON_KEY = getCurrentSeasonKey();

const SEASONS = [
  { key: '전체',     label: '전체',     icon: '🗓' },
  { key: '12월~2월', label: '12월~2월', icon: '❄️' },
  { key: '3월~5월',  label: '3월~5월',  icon: '🌸' },
  { key: '6월~8월',  label: '6월~8월',  icon: '☀️' },
  { key: '9월~11월', label: '9월~11월', icon: '🍂' },
].map(s => s.key === CURRENT_SEASON_KEY ? { ...s, label: `${s.label} (현재)` } : s);


const KOREA_CENTER  = { lat: 36.5, lng: 127.8 };
const INITIAL_LEVEL = 13;
const INIT_FILTERS  = { region: null, ageGroup: '전체', season: CURRENT_SEASON_KEY, sortByPopularity: false, showHeatmap: false };

const HEAT_MAX = regions.length ? Math.max(...regions.map(r => r.visitors)) : 1;

// ── 필터 세션 유지 (30분) ───────────────────────────────────
const SESSION_KEY = 'nolrugaja_map_filters';
const SESSION_TTL = 30 * 60 * 1000;

function loadSessionFilters() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { filters, ts } = JSON.parse(raw);
    if (Date.now() - ts > SESSION_TTL) { sessionStorage.removeItem(SESSION_KEY); return null; }
    return filters;
  } catch { return null; }
}
function saveSessionFilters(f) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ filters: f, ts: Date.now() })); } catch {}
}

function thermalHex(ratio) {
  const stops = [
    [0,    [0,   0,   200]],
    [0.25, [0,   180, 255]],
    [0.5,  [50,  230, 50 ]],
    [0.70, [255, 230, 0  ]],
    [0.85, [255, 100, 0  ]],
    [1,    [200, 0,   0  ]],
  ];
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 1; i < stops.length; i++) {
    if (ratio <= stops[i][0]) { lo = stops[i - 1]; hi = stops[i]; break; }
  }
  const t = hi[0] === lo[0] ? 0 : (ratio - lo[0]) / (hi[0] - lo[0]);
  const lerp = (a, b) => Math.round(a + (b - a) * t);
  const [r, g, b] = [0, 1, 2].map(i => lerp(lo[1][i], hi[1][i]));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ── 헬퍼 ──────────────────────────────────────────────────
function matchesSeason(date, season) {
  if (date.includes('연중')) return true;
  const months = SEASON_MONTHS[season];
  if (!months) return true;
  return months.some(m => new RegExp(`(?<![0-9])${m}월`).test(date));
}

function applyFilters(list, { region, ageGroup, season }) {
  return list.filter(f => {
    if (region && region !== '전국' && !(REGION_IDS[region] ?? []).includes(f.region)) return false;
    if (ageGroup !== '전체' && !f.ageRankings?.[ageGroup]) return false;
    if (season   !== '전체' && !matchesSeason(f.date, season)) return false;
    return true;
  });
}

function getRank(festival, ageGroup) {
  if (ageGroup === '전체') return festival.popularityRank ?? '-';
  return festival.ageRankings?.[ageGroup] ?? '-';
}

// ── 컴포넌트 ───────────────────────────────────────────────
function Mappage() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const mapContainerRef = useRef(null);
  const mapRef          = useRef(null);
  const overlaysRef     = useRef({});
  const overlayElsRef   = useRef({});
  const rankElsRef      = useRef({});
  const heatCirclesRef  = useRef([]);
  const initStateRef    = useRef(location.state ?? null);
  const dragStartYRef       = useRef(0);
  const filterDragStartYRef = useRef(0);

  // DetailPage "지도에서 위치 보기" → 그 지역 필터 사용
  // 일반 진입 → 세션에 저장된 필터 복원 (없으면 초기값)
  const initRegion     = REGION_ID_TO_KO[initStateRef.current?.region] ?? null;
  const sessionFilters = initStateRef.current?.festivalId ? null : loadSessionFilters();

  const [mapReady, setMapReady]                 = useState(false);
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [cardVisible, setCardVisible]           = useState(false);
  const [filters, setFilters]                   = useState(sessionFilters ?? { ...INIT_FILTERS, region: initRegion });
  const [filterOpen, setFilterOpen]             = useState(false);
  const [hintDismissed, setHintDismissed]       = useState(false);
  const [hintOut, setHintOut]                   = useState(false);
  const showHint = mapReady && filters.region === null && !hintDismissed;

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  const filteredFestivals = useMemo(() => {
    const result = applyFilters(festivals, filters);
    if (!filters.sortByPopularity) return result;
    return [...result].sort((a, b) => {
      const ag = filters.ageGroup;
      const ra = ag !== '전체' ? (a.ageRankings?.[ag] ?? 999) : (a.popularityRank ?? 999);
      const rb = ag !== '전체' ? (b.ageRankings?.[ag] ?? 999) : (b.popularityRank ?? 999);
      return ra - rb;
    });
  }, [filters]);

  // 활성 필터 개수 (배지용)
  const activeCount = [
    filters.region !== null,
    filters.ageGroup !== '전체',
    filters.season !== CURRENT_SEASON_KEY,
    filters.sortByPopularity,
    filters.showHeatmap,
  ].filter(Boolean).length;

  // 필터 변경 시 세션 저장
  useEffect(() => { saveSessionFilters(filters); }, [filters]);

  // 슬라이드 업 애니메이션
  useEffect(() => {
    if (!selectedFestival) return;
    const raf = requestAnimationFrame(() => setCardVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [selectedFestival]);

  // DetailPage에서 넘어온 경우: 지도 준비되면 해당 위치로 이동 + 카드 오픈
  useEffect(() => {
    if (!mapReady || !initStateRef.current?.festivalId) return;
    const target = festivals.find(f => f.id === initStateRef.current.festivalId);
    if (!target) return;
    const map = mapRef.current;
    map.setLevel(7);
    map.setCenter(new window.kakao.maps.LatLng(target.lat, target.lng));
    setSelectedFestival(target);
    initStateRef.current = null;
    // 슬라이드 카드가 화면 하단을 덮으므로, 핀이 카드 위 가시 영역에 오도록 위로 패닝
    setTimeout(() => map.panBy(0, 225), 50);
  }, [mapReady]);

  // 힌트 말풍선: 지역 미선택 상태면 표시, 3.5초 후 자동 페이드
  useEffect(() => {
    if (!showHint) return;
    setHintOut(false);
    const fadeOut = setTimeout(() => {
      setHintOut(true);
      setTimeout(() => setHintDismissed(true), 300);
    }, 4500);
    return () => clearTimeout(fadeOut);
  }, [showHint]);

  // 인기도 히트맵 — 지역별 반투명 원
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;

    heatCirclesRef.current.forEach(c => c.setMap(null));
    heatCirclesRef.current = [];

    if (!filters.showHeatmap) return;

    regions.forEach(r => {
      const ratio  = r.visitors / HEAT_MAX;
      const color  = thermalHex(ratio);
      const radius = Math.round(15000 + ratio * 35000);

      const circle = new window.kakao.maps.Circle({
        center:        new window.kakao.maps.LatLng(r.lat, r.lng),
        radius,
        strokeWeight:  0,
        strokeOpacity: 0,
        fillColor:     color,
        fillOpacity:   0.30,
      });
      circle.setMap(map);
      heatCirclesRef.current.push(circle);
    });
  }, [filters.showHeatmap, mapReady]);

  // 카카오맵 SDK 동적 로드 + 지도 초기화
  useEffect(() => {
    const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY;

    const initMap = () => {
      window.kakao.maps.load(() => {
        const container = mapContainerRef.current;
        if (!container) return;

        const map = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(KOREA_CENTER.lat, KOREA_CENTER.lng),
          level: INITIAL_LEVEL,
        });
        mapRef.current = map;

        festivals.forEach(festival => {
          const position = new window.kakao.maps.LatLng(festival.lat, festival.lng);

          const el = document.createElement('div');
          el.className = 'festival-badge';

          const rankEl = document.createElement('span');
          rankEl.className = 'badge-rank';
          rankEl.textContent = `#${festival.popularityRank ?? '-'}`;

          el.appendChild(rankEl);
          el.appendChild(document.createTextNode(festival.name));
          el.addEventListener('click', () => setSelectedFestival(festival));

          const overlay = new window.kakao.maps.CustomOverlay({ position, content: el, yAnchor: 1, map: null });

          overlaysRef.current[festival.id]   = overlay;
          overlayElsRef.current[festival.id] = el;
          rankElsRef.current[festival.id]    = rankEl;
        });

        setMapReady(true);
      });
    };

    if (window.kakao?.maps) { initMap(); return; }

    const existing = document.querySelector('script[src*="dapi.kakao.com"]');
    if (existing) { existing.addEventListener('load', initMap); return; }

    const script = document.createElement('script');
    script.src   = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.async = true;
    script.onload  = initMap;
    script.onerror = () => console.error('카카오맵 SDK 로드 실패.');
    document.head.appendChild(script);
  }, []);

  // 필터 변경 → 오버레이 실시간 업데이트
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    const filteredIds = new Set(filteredFestivals.map(f => f.id));

    Object.entries(overlaysRef.current).forEach(([id, overlay]) => {
      overlay.setMap(filters.region !== null && filteredIds.has(Number(id)) ? map : null);
    });

    festivals.forEach(f => {
      const rankEl = rankElsRef.current[f.id];
      if (!rankEl) return;
      rankEl.textContent = `#${getRank(f, filters.ageGroup)}`;
      rankEl.style.display = filters.sortByPopularity ? '' : 'none';
    });

    // 배지 스타일·z-index 초기화 (히트맵 ON 시 canvas(z-50) 위로 올림)
    const baseZ = filters.showHeatmap ? 100 : 1;
    Object.entries(overlayElsRef.current).forEach(([id, el]) => {
      el.classList.remove('badge-top1', 'badge-top2', 'badge-top3', 'badge-selected');
      overlaysRef.current[id]?.setZIndex(baseZ);
    });

    if (filters.sortByPopularity) {
      const medals = ['🥇', '🥈', '🥉'];
      filteredFestivals.slice(0, 3).forEach((f, i) => {
        const el = overlayElsRef.current[f.id];
        const rankEl = rankElsRef.current[f.id];
        if (el) el.classList.add(`badge-top${i + 1}`);
        if (rankEl) rankEl.textContent = medals[i];
        overlaysRef.current[f.id]?.setZIndex(baseZ + 10 - i);
      });
    }

    // 선택된 관광지 핀 강조 — 항상 최상단
    if (selectedFestival) {
      const el = overlayElsRef.current[selectedFestival.id];
      if (el) el.classList.add('badge-selected');
      overlaysRef.current[selectedFestival.id]?.setZIndex(baseZ + 100);
    }
  }, [filteredFestivals, mapReady, filters, selectedFestival]);

  const handleClose = () => {
    setCardVisible(false);
    setTimeout(() => setSelectedFestival(null), 350);
  };

  // Escape 키 → 열린 패널/카드 닫기
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (filterOpen) { setFilterOpen(false); return; }
      if (selectedFestival) { setCardVisible(false); setTimeout(() => setSelectedFestival(null), 350); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filterOpen, selectedFestival]);

  const handleReset = () => {
    setFilters(INIT_FILTERS);
    setFilterOpen(false);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const handleCardDragStart = (e) => {
    dragStartYRef.current = (e.touches?.[0] ?? e).clientY;
  };
  const handleCardDragEnd = (e) => {
    const endY = (e.changedTouches?.[0] ?? e).clientY;
    if (endY - dragStartYRef.current > 60) handleClose();
  };

  const handleFilterPointerDown = (e) => {
    filterDragStartYRef.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handleFilterPointerUp = (e) => {
    if (e.clientY - filterDragStartYRef.current > 40) setFilterOpen(false);
  };

  return (
    <div className={`mappage${filters.showHeatmap ? ' heatmap-active' : ''}`}>

      {/* ── 지도 (전체 화면) ── */}
      <div ref={mapContainerRef} className="map-container" />

      {/* ── 필터 힌트 말풍선 ── */}
      {showHint && (
        <div
          className={`map-filter-hint${hintOut ? ' hint-out' : ''}`}
          onClick={() => { setHintOut(true); setTimeout(() => setHintDismissed(true), 300); }}
        >
          지역을 선택하면 핀이 나타나요!
        </div>
      )}

      {/* ── 필터 버튼 (원형 플로팅) ── */}
      <button
        className={`map-filter-btn${activeCount > 0 ? ' has-active' : ''}`}
        onClick={() => setFilterOpen(true)}
        aria-label="필터 열기"
      >
        <span className="fi-line" />
        <span className="fi-line fi-line--mid" />
        <span className="fi-line" />
        {activeCount > 0 && <span className="fi-badge">{activeCount}</span>}
      </button>

      {/* ── 오버레이 (필터 패널 뒤 어두운 배경) ── */}
      {filterOpen && (
        <div className="map-filter-overlay" onClick={() => setFilterOpen(false)} />
      )}

      {/* ── 필터 패널 (바텀 시트) ── */}
      <div className={`map-filter-panel${filterOpen ? ' open' : ''}`} role="dialog" aria-modal="true">
        <div
          className="mfp-drag-zone"
          onPointerDown={handleFilterPointerDown}
          onPointerUp={handleFilterPointerUp}
        >
          <div className="mfp-handle" />
          <div className="mfp-header">
            <span className="mfp-title">필터</span>
          </div>
        </div>

        <div className="mfp-body">

          {/* 지역 */}
          <div className="mfp-section">
            <p className="mfp-label">📍 지역</p>
            <div className="mfp-chips">
              {REGIONS.map(r => (
                <button
                  key={r}
                  className={`mfp-chip${filters.region === r ? ' active' : ''}`}
                  onClick={() => setFilter('region', filters.region === r ? null : r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 나이대 */}
          <div className="mfp-section">
            <p className="mfp-label">👤 나이대</p>
            <div className="mfp-chips">
              {AGE_GROUPS.map(a => (
                <button
                  key={a}
                  className={`mfp-chip${filters.ageGroup === a ? ' active' : ''}`}
                  onClick={() => setFilter('ageGroup', a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* 시기 */}
          <div className="mfp-section">
            <p className="mfp-label">🗓 시기</p>
            <div className="mfp-chips">
              {SEASONS.map(s => (
                <button
                  key={s.key}
                  className={`mfp-chip${filters.season === s.key ? ' active' : ''}${s.key === CURRENT_SEASON_KEY ? ' chip-now' : ''}`}
                  onClick={() => setFilter('season', s.key)}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 인기도 순위 */}
          <div className="mfp-section">
            <div className="mfp-row-between">
              <p className="mfp-label" style={{ margin: 0 }}>🏆 인기도 순위</p>
              <button
                className={`mfp-toggle${filters.sortByPopularity ? ' on' : ''}`}
                onClick={() => setFilter('sortByPopularity', !filters.sortByPopularity)}
              >
                {filters.sortByPopularity ? 'ON' : 'OFF'}
              </button>
            </div>
            <p className="mfp-hint">
              {filters.sortByPopularity
                ? '핀에 순위 번호가 표시되고 Top 3 관광지가 강조돼요!'
                : '지도에서 각 관광지의 인기 순위를 바로 확인할 수 있어요.'}
            </p>
          </div>

          {/* 전국 인기도 히트맵 */}
          <div className="mfp-section">
            <div className="mfp-row-between">
              <p className="mfp-label" style={{ margin: 0 }}>🌡️ 전국 인기도</p>
              <button
                className={`mfp-toggle${filters.showHeatmap ? ' on' : ''}`}
                onClick={() => setFilter('showHeatmap', !filters.showHeatmap)}
              >
                {filters.showHeatmap ? 'ON' : 'OFF'}
              </button>
            </div>
            <p className="mfp-hint">
              {filters.showHeatmap
                ? '전국 17개 지역 방문자 밀도를 색상으로 표시해요. 선택 지역과 무관하게 항상 전국 기준이에요.'
                : '지역별 방문자 밀도를 색상으로 지도에 표시해 줘요.'}
            </p>
            {filters.showHeatmap && (
              <div className="mfp-heat-legend">
                <span>낮음</span>
                <div className="mfp-heat-bar" />
                <span>높음</span>
              </div>
            )}
          </div>

        </div>

        <div className="mfp-footer">
          <button className="mfp-reset" onClick={handleReset}>초기화</button>
          <button className="mfp-apply" onClick={() => setFilterOpen(false)}>
            적용하기 {activeCount > 0 ? `(${activeCount})` : ''}
          </button>
        </div>
      </div>

      {/* ── 전국 인기도 범례 ── */}
      {filters.showHeatmap && mapReady && (
        <div className="heat-map-legend">
          <span className="hml-label">전국 인기도</span>
          <div className="hml-bar" />
          <span className="hml-label">낮음 → 높음</span>
        </div>
      )}

      {/* ── 빈 상태 ── */}
      {mapReady && filters.region !== null && filteredFestivals.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🗺️</div>
          <p className="empty-text">해당하는 관광지가 없어요</p>
          <button className="empty-reset" onClick={handleReset}>필터 초기화</button>
        </div>
      )}

      {/* ── 슬라이드 카드 backdrop (지도 클릭 → 카드 닫힘) ── */}
      {selectedFestival && (
        <div className="map-card-backdrop" onClick={handleClose} />
      )}

      {/* ── 슬라이드 카드 ── */}
      {selectedFestival && (
        <div
          className={`map-slide-card${cardVisible ? ' visible' : ''}`}
          onTouchStart={handleCardDragStart}
          onTouchEnd={handleCardDragEnd}
          onMouseDown={handleCardDragStart}
          onMouseUp={handleCardDragEnd}
        >
          <div className="map-card-img-wrap">
            <img src={selectedFestival.image} alt={selectedFestival.name} className="map-card-img"
              onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = IMG_FALLBACK; }} />
            <div className="map-card-glass-top">
              <span className="map-card-handle" />
            </div>
          </div>
          <div className="map-card-body">
            <h2 className="map-card-name">{selectedFestival.name}</h2>
            <p className="map-card-addr">📍 {shortAddress(selectedFestival.address)}</p>
            <p className="map-card-date">{selectedFestival.date}</p>
            <div className="map-card-stats">
              <div className="stat-item">
                <span className="stat-label">연간 방문자</span>
                <span className="stat-value">{formatVisitors(selectedFestival.visitors)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">
                  {filters.ageGroup !== '전체' ? `${filters.ageGroup} 순위` : '전국 순위'}
                </span>
                <span className="stat-value">#{getRank(selectedFestival, filters.ageGroup)}</span>
              </div>
              {(() => {
                const t = TREND[selectedFestival.trend] ?? TREND['유지'];
                return <span className={`trend-badge ${t.cls}`}>{t.text}</span>;
              })()}
            </div>
            <p className="map-card-desc">{selectedFestival.description}</p>
            <div className="map-card-tags">
              {selectedFestival.tags.map(tag => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
            <button
              className="map-card-detail-btn"
              onClick={() => navigate(`/detail/${selectedFestival.id}`)}
            >
              상세 페이지 보기 →
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default Mappage;
