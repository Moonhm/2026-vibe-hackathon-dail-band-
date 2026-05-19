// 출처: 한국관광데이터랩 지역별 방문자수 (2025.05 ~ 2026.04)
// regions 배열 기반 집계 — 이동통신 신호 기반 추정치

import { regions } from './festivals';

const sorted = [...regions].sort((a, b) => b.visitors - a.visitors);
const total  = regions.reduce((sum, r) => sum + r.visitors, 0);
const maxV   = sorted[0].visitors;

export const NATIONAL_DATE = '2025.05 ~ 2026.04';

// 전국 방문자 상위 5개 지역
export const topRegions = sorted.slice(0, 5).map(r => ({
  region: r.name,
  visitors: r.visitors,
  pct: Math.round((r.visitors / maxV) * 100),
}));

// 요약 지표 칩
export const nationalSummary = [
  { label: '연간 총 방문자', value: `${(total / 100000000).toFixed(1)}억 명` },
  { label: '최다 방문 지역', value: sorted[0].name },
  { label: '분석 지역 수',   value: `${regions.length}개 광역시도` },
];
