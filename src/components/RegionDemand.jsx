import { useEffect, useState } from 'react';
import './RegionDemand.css';

// 우리 region ID → TourAPI areaCd
const AREA_CODE = {
  seoul: 11, busan: 26, daegu: 27, incheon: 28, gwangju: 29,
  daejeon: 30, ulsan: 31, sejong: 36, gyeonggi: 41, chungbuk: 43,
  chungnam: 44, jeonnam: 46, gyeongbuk: 47, gyeongnam: 48,
  jeju: 50, gangwon: 51, jeonbuk: 52,
};

// 최근 18개월 baseYm 후보 (모듈 로드 시 1회 계산)
const RECENT_MONTHS = (() => {
  const months = [];
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  for (let i = 0; i < 18; i++) {
    months.push(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`);
    d.setMonth(d.getMonth() - 1);
  }
  return months;
})();

// 레이더 분류 색상
const CUL_COLORS = {
  '문화관광': '#22c55e',
  '레저스포츠': '#3b82f6',
  '역사관광': '#f59e0b',
  '체험관광': '#f97316',
  '자연관광': '#8b5cf6',
};

export default function RegionDemand({ regionId }) {
  const [culData, setCulData]   = useState(null);
  const [stayData, setStayData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [baseYm, setBaseYm]     = useState(null);

  const areaCd = AREA_CODE[regionId];

  useEffect(() => {
    if (!areaCd) return;
    const ctrl = new AbortController();
    const { signal } = ctrl;

    setLoading(true);
    setCulData(null);
    setStayData(null);
    setBaseYm(null);

    async function fetchFirst(endpoint, params) {
      for (const ym of RECENT_MONTHS) {
        if (signal.aborted) return null;
        try {
          const url = `/api/${endpoint}?areaCd=${areaCd}&baseYm=${ym}&${params}`;
          const res = await fetch(url, { signal });
          const json = await res.json();
          const raw = json?.response?.body?.items?.item;
          if (raw) {
            const list = Array.isArray(raw) ? raw : [raw];
            if (list.length > 0) return { ym, list };
          }
        } catch (e) {
          if (e.name === 'AbortError') return null;
        }
      }
      return null;
    }

    Promise.all([
      fetchFirst('resource', 'type=cul'),
      fetchFirst('demand', 'type=stay'),
    ]).then(([cul, stay]) => {
      if (signal.aborted) return;
      if (cul) { setCulData(cul.list); setBaseYm(cul.ym); }
      if (stay) setStayData(stay.list);
    }).catch(() => {}).finally(() => { if (!signal.aborted) setLoading(false); });

    return () => ctrl.abort();
  }, [areaCd]);

  if (!areaCd) return null;

  const ymLabel = baseYm ? `${baseYm.slice(0,4)}년 ${baseYm.slice(4)}월` : '';

  // 문화 자원 수요: 카테고리별 지수값 파싱
  const culItems = culData
    ? culData.map(d => ({
        fullName: d.culResDemIxNm,
        value: parseFloat(d.culResDemIxVal) || 0,
      })).filter(d => d.value > 0)
    : [];

  const maxCul = culItems.length > 0 ? Math.max(...culItems.map(d => d.value), 1) : 100;

  // 체류 강도: 타권역방문자비중, 숙박비중
  const stayItems = stayData
    ? stayData.filter(d => ['타권역 방문자 비중', '숙박 비중'].some(k => d.tarSjrnDsIxNm?.includes(k)))
    : [];

  if (!loading && culItems.length === 0 && stayItems.length === 0) return null;

  return (
    <div className="rd-wrap">
      <div className="rd-header">
        <h3 className="rd-title">📡 지역 관광 트렌드</h3>
        {ymLabel && <span className="rd-ym">{ymLabel} 기준</span>}
      </div>

      {loading && <p className="rd-loading">데이터 불러오는 중...</p>}

      {!loading && culItems.length > 0 && (
        <div className="rd-section">
          <p className="rd-sub">관광 자원 유형별 수요 지수</p>
          <div className="rd-bars">
            {culItems.map(item => (
              <div key={item.fullName} className="rd-bar-row">
                <span className="rd-bar-label">{item.fullName}</span>
                <div className="rd-bar-track">
                  <div
                    className="rd-bar-fill"
                    style={{
                      width: `${(item.value / maxCul) * 100}%`,
                      background: CUL_COLORS[item.fullName] || '#22c55e',
                    }}
                  />
                </div>
                <span className="rd-bar-val">{item.value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && stayItems.length > 0 && (
        <div className="rd-section">
          <p className="rd-sub">체류 강도 지표</p>
          <div className="rd-chips">
            {stayItems.map(item => (
              <div key={item.tarSjrnDsIxNm} className="rd-chip">
                <span className="rd-chip-label">{item.tarSjrnDsIxNm}</span>
                <span className="rd-chip-val">{parseFloat(item.tarSjrnDsIxVal).toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="rd-source">출처: 한국관광공사 TourAPI · 월 1회 갱신</p>
    </div>
  );
}
