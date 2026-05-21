import { useEffect, useState } from 'react';
import './CrowdForecast.css';

function crowdLevel(rate) {
  if (rate < 30) return { label: '여유', cls: 'crowd-low' };
  if (rate < 60) return { label: '보통', cls: 'crowd-mid' };
  if (rate < 80) return { label: '붐빔', cls: 'crowd-high' };
  return { label: '매우 붐빔', cls: 'crowd-very-high' };
}

const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

export default function CrowdForecast({ areaCd, signguCd }) {
  const [items, setItems]   = useState(null);
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/api/tour?areaCd=${areaCd}&signguCd=${signguCd}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(data => {
        const raw = data?.response?.body?.items?.item;
        if (!raw) { setError('데이터 없음'); return; }
        const list = Array.isArray(raw) ? raw : [raw];
        setItems(list.slice(0, 14));
      })
      .catch(e => { if (e.name !== 'AbortError') setError('불러오기 실패'); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [areaCd, signguCd]);

  if (loading) return <div className="cf-loading">혼잡도 예측 불러오는 중...</div>;
  if (error)   return <div className="cf-error">혼잡도 예측을 일시적으로 이용할 수 없어요.</div>;

  const max = items.length > 0 ? Math.max(...items.map(d => parseFloat(d.cnctrRate)), 1) : 100;

  return (
    <section className="cf-wrap">
      <h2 className="dp-section-title">📅 혼잡도 예측 (향후 14일)</h2>
      <div className="cf-legend">
        <span className="cf-dot crowd-low" />여유
        <span className="cf-dot crowd-mid" />보통
        <span className="cf-dot crowd-high" />붐빔
        <span className="cf-dot crowd-very-high" />매우 붐빔
      </div>
      <div className="cf-bars">
        {items.map(d => {
          const rate = parseFloat(d.cnctrRate);
          const { label, cls } = crowdLevel(rate);
          const ymd = String(d.baseYmd);
          const date = new Date(`${ymd.slice(0,4)}-${ymd.slice(4,6)}-${ymd.slice(6,8)}`);
          const dayIdx = date.getDay();
          const mmdd = `${ymd.slice(4, 6)}/${ymd.slice(6, 8)}`;
          return (
            <div key={d.baseYmd} className="cf-bar-col">
              <span className="cf-rate">{rate.toFixed(0)}%</span>
              <div className="cf-bar-track">
                <div
                  className={`cf-bar-fill ${cls}`}
                  style={{ height: `${(rate / Math.max(max, 100)) * 100}%` }}
                  title={`${label} ${rate.toFixed(1)}%`}
                />
              </div>
              <span className={`cf-day ${dayIdx === 0 ? 'sun' : dayIdx === 6 ? 'sat' : ''}`}>
                {DAY_KO[dayIdx]}
              </span>
              <span className="cf-date">{mmdd}</span>
            </div>
          );
        })}
      </div>
      <p className="cf-source">출처: 한국관광공사 TourAPI · 매일 갱신</p>
    </section>
  );
}
