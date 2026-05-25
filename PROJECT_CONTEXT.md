# 놀러가자 (Nolrugaja) — AI 인수인계 문서

> 이 파일을 읽는 AI는 이 프로젝트를 바로 이어서 개발할 수 있다.
> 완전판(GitHub PAT 포함)은 로컬 서버 `/home/jovyan/work/data/PROJECT_CONTEXT_PRIVATE.md` 에 있다.
> 최종 수정: 2026-05-25

---

## 1. 프로젝트 개요

**놀러가자**는 한국 국내 관광지를 탐색하는 모바일 우선 웹 서비스다.
한국관광데이터랩의 빅데이터(이동통신·신용카드·내비게이션)를 기반으로
전국 33개 관광지의 방문자 통계, 연령대별 인기 순위, 혼잡도 예측을 시각화한다.

- **서비스 URL**: https://2026-vibe-hackathon-dail-band.pages.dev
- **로컬 작업 디렉토리**: `/home/jovyan/work/nolrugaja`
- **데이터 디렉토리**: `/home/jovyan/work/data`
- **개발자**: GitHub: Moonhm
- **대회**: 2026 Vibe Hackathon

---

## 2. 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | React 18.2 + Vite 4.4 |
| 라우팅 | React Router v7 |
| 지도 | 카카오맵 JavaScript SDK (CustomOverlay 방식) |
| 호스팅 | Cloudflare Pages (GitHub mine 저장소 연동, push 시 자동 배포) |
| API 프록시 | Cloudflare Pages Functions (`functions/api/tour.js`) |
| 스타일 | 컴포넌트별 일반 CSS import (CSS Modules 아님) |
| 빌드 | `npm run build` → `dist/` |

---

## 3. Git 저장소 구성

```
mine    → https://github.com/Moonhm/2026-vibe-hackathon-dail-band-.git  (push 대상)
```

**`git push`는 반드시 `git push mine main` 만 사용**

### GitHub Personal Access Token (PAT)
- 실제 토큰값은 로컬 완전판 파일 참조: `/home/jovyan/work/data/PROJECT_CONTEXT_PRIVATE.md`
- 또는 로컬에서 `git remote get-url mine` 으로 확인 가능
- 권한: `repo` (Full control of private repositories), 소유자: Moonhm

### 새 환경에서 git remote 설정
```bash
cd /home/jovyan/work/nolrugaja
git remote add mine https://[YOUR_PAT]@github.com/Moonhm/2026-vibe-hackathon-dail-band-.git
```

---

## 4. API 키 및 환경변수

### 4-1. 카카오맵 JavaScript API 키
- **키**: `[로컬 완전판 참조: /home/jovyan/work/data/PROJECT_CONTEXT_PRIVATE.md]`
- **파일**: `.env.local` → `VITE_KAKAO_MAP_KEY=...`
- **사용 위치**: `src/pages/Mappage.jsx` — `import.meta.env.VITE_KAKAO_MAP_KEY`
- **Cloudflare Pages 환경변수에도 동일하게 등록** (Settings → Environment Variables)
- **카카오 개발자콘솔**: https://developers.kakao.com (JavaScript 키)

### 4-2. 공공데이터포털 관광지 혼잡도 예측 API
- **키**: `[로컬 완전판 참조: /home/jovyan/work/data/PROJECT_CONTEXT_PRIVATE.md]`
- **파일**: `functions/api/tour.js` 에 하드코딩
- **API명**: 한국관광공사 tatsCnctrRateList (관광지 혼잡도 예측)
- **Base URL**: `https://apis.data.go.kr/B551011/TatsCnctrRateService/tatsCnctrRateList`
- **프론트 호출**: `/api/tour?areaCd=XX&signguCd=XXXXX` (Cloudflare Function 프록시)

---

## 5. 프로젝트 파일 구조

```
nolrugaja/
├── public/
│   ├── favicon.png               # 앱 로고 (홈 히어로, 클릭 시 URL 복사 기믹)
│   └── images/                   # 관광지 이미지: 1_everland.jpg ~ 33_metasequoia.jpg
├── functions/
│   └── api/
│       └── tour.js               # Cloudflare Pages Function: 혼잡도 API 프록시
├── src/
│   ├── main.jsx                  # 엔트리포인트
│   ├── App.jsx                   # BrowserRouter + Routes
│   ├── index.css                 # 전역 reset, 공통 클래스 (.tag, .trend-up/keep/down)
│   ├── App.css                   # 비어있음 (내용 index.css로 이전됨)
│   ├── pages/
│   │   ├── Homepage.jsx/css      # 홈: 히어로, TOP3, 전국현황, 서비스소개, 데이터출처
│   │   ├── Mappage.jsx/css       # 지도: 카카오맵, 필터 패널, 슬라이드 카드, 히트맵
│   │   ├── RankingPage.jsx/css   # 순위: 탭(전국/서울/수도권/지방), 키워드 칩, 순위 리스트
│   │   ├── DetailPage.jsx/css    # 상세: 히어로, 통계행, 연령별순위, 혼잡도, 관련관광지
│   │   └── Recommend.jsx/css     # 추천: 5문항 퀴즈 → 여행지 3개 추천
│   ├── components/
│   │   ├── BottomNav.jsx/css     # 하단 네비게이션 바 (홈/지도/순위/추천)
│   │   ├── CrowdForecast.jsx/css # 혼잡도 예측 바 차트 (DetailPage 내 사용)
│   │   └── RegionDemand.jsx/css  # 미사용 컴포넌트 (TourAPI 불안정으로 제거됨)
│   ├── data/
│   │   ├── festivals.js          # 관광지 33개 + regions 17개 (핵심 데이터)
│   │   ├── nationalStats.js      # 전국 관광 집계 통계 (festivals.js 기반)
│   │   └── recommendations.js   # 추천 퀴즈 문항 + 여행지 destinations 데이터
│   └── utils/
│       ├── constants.js          # REGION_KO, IMG_FALLBACK, TREND (전역 공통 상수)
│       └── format.js             # formatVisitors(), shortAddress()
├── .env.local                    # VITE_KAKAO_MAP_KEY (git 제외)
├── vite.config.js
└── package.json
```

---

## 6. 라우팅 구조

```jsx
// App.jsx
<BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
  /            → Homepage
  /map         → Mappage
  /ranking     → RankingPage
  /detail/:id  → DetailPage   (id = 1~33)
  /recommend   → Recommend
</BrowserRouter>
```

---

## 7. 핵심 데이터 구조

### 7-1. festivals.js — 관광지 오브젝트
```js
{
  id: 1,
  name: "에버랜드",
  region: "gyeonggi",           // regions 배열 id와 매핑
  address: "경기 용인시 처인구 에버랜드로 199",
  lat: 37.2938, lng: 127.2045,  // GPS 좌표 (2차 보정 완료)
  areaCd: 41, signguCd: 41461,  // 공공데이터 혼잡도 API 파라미터
  date: "연중",                  // "연중" | "6월~8월" | "3월~5월, 9월~11월" 등
  description: "...",
  tags: ["액티비티", "가족", "체험", "커플", "봄"],
  category: "레저/스포츠",
  image: "/images/1_everland.jpg",
  visitors: 10100000,
  popularityRank: 1,
  trend: "상승",                  // "상승" | "유지" | "하락"
  ageRankings: { "전체": 1, "20대": 2, "30대": 1, "40대": 1, "50대": 2, "60대이상": 18 },
}
```

### 7-2. nationalStats.js
```js
import { regions } from './festivals';
export const NATIONAL_DATE = '2025.05 ~ 2026.04';
export const topRegions     // 방문자 상위 5개 지역: { region, visitors, pct }[]
export const nationalSummary  // 요약 칩 3개: { label, value }[]
// → Homepage.jsx 전국 관광 현황 섹션에서 사용
```

### 7-3. recommendations.js
```js
export const questions       // 5개 객관식 질문, 각 보기에 tags[] 연결
export const destinations    // 8개 여행지: { id, name, description, tags[], bestFestivals[], image, tip }
export function getRecommendations(selectedTags)
// tags 교집합 점수로 destinations 상위 3개 반환
```

### 7-4. constants.js — 전역 공통 상수
```js
REGION_KO   // region id → 한글명
IMG_FALLBACK  // base64 SVG 플레이스홀더 (이미지 로드 실패 시)
TREND = {
  상승: { cls: 'trend-up',   text: '▲ 상승' },
  유지: { cls: 'trend-keep', text: '▶ 유지' },
  하락: { cls: 'trend-down', text: '▼ 하락' },
}
// 사용법: const t = TREND[festival.trend]; → t.cls (className), t.text (표시 텍스트)
```

---

## 8. 페이지별 주요 기능

### Homepage
- 로고 클릭 → 사이트 URL 복사 + 토스트 알림 ("🔗 사이트 주소가 복사되었어요! 친구들에게 알려봐요!")
- TOP3 카드, 전국 관광 현황 바 차트, 서비스 소개, 데이터 출처 고지

### Mappage (지도)
- 카카오맵 CustomOverlay로 핀을 DOM으로 직접 생성 (React state 아님)
- 핀 DOM 참조: `overlayElsRef.current[id]`, `rankElsRef.current[id]`
- 필터: 지역 / 나이대 / 시기(계절) / 인기도 순위 ON·OFF / 전국 인기도 히트맵 ON·OFF
- 인기도 순위 ON: 핀에 `#순위` 표시, Top3에 🥇🥈🥉 + 특별 배지
- 히트맵: regions 방문자 수 → thermal gradient 색상 원
- 슬라이드 카드: 핀 클릭 → 하단 슬라이드업 (드래그 아래로 닫힘)
- 필터 세션: `sessionStorage` key `'nolrugaja_map_filters'`, TTL 30분
- DetailPage에서 `navigate('/map', { state: { region, festivalId } })` 전달 시 해당 핀 자동 선택

### RankingPage (순위)
- 탭: 전국 / 서울 / 수도권(서울+경기+인천) / 지방, 방문자 수 내림차순 상위 10개
- 인기 키워드 섹션: 현재 탭 태그 빈도 집계 → 상위 8개 칩 (상위 3개 `kw-hot` 스타일)
- RegionDemand: 제거됨 (외부 TourAPI 응답 불안정)

### DetailPage (상세)
- URL: `/detail/:id` (id = 1~33)
- 통계 행: 연간 방문자 / 전국 순위 / 트렌드 (`.dp-trend-chip` 배지)
- 연령대별 순위 그리드, 혼잡도 예측(CrowdForecast), 같은 지역 관련 관광지

### Recommend (추천)
- 5문항 퀴즈 → 태그 누적 → `getRecommendations()` → 여행지 상위 3개
- 결과 `localStorage`(`'nolrugaja_recommend_result'`) 저장 → 이전 결과 보기 지원

### CrowdForecast (컴포넌트)
- `/api/tour?areaCd=XX&signguCd=XXXXX` → 향후 14일 혼잡도 바 차트
- 혼잡도 레벨: <30% 여유 / <60% 보통 / <80% 붐빔 / 이상 매우붐빔
- `npm run dev` 시 동작 안 함 (Cloudflare 배포 환경에서만 작동)

---

## 9. 카카오맵 핀 배지 CSS 시스템

```
.festival-badge             기본 핀 (초록 #15803d)
.badge-rank                 순위 span — 인기도 순위 OFF 시 display:none
.badge-top1                 1등: 금색 gradient + glow 애니
.badge-top2                 2등: 스틸 실버 gradient (#f0f4f8→#c8dae5→#6a9ab0→#3d7a9a)
.badge-top3                 3등: 브론즈 gradient
.badge-selected             일반 핀 선택: 초록 강조
.badge-top1.badge-selected  1등 선택: 금색 유지 (2클래스 specificity 우위)
.badge-top2.badge-selected  2등 선택: 실버 유지
.badge-top3.badge-selected  3등 선택: 브론즈 유지
```

---

## 10. 디자인 시스템 & UI 가이드라인

### 핵심 컬러 원칙
> **초록이 핵심 컬러다.** 새 UI 요소(버튼, 뱃지, 알림, 툴팁 등)의 기본 강조색은 항상 초록.
> 네이비(#1B2A5C)는 헤더·타이틀 등 구조적 요소에만 사용.

| 역할 | 색상 | 용도 |
|------|------|------|
| Primary (핵심 강조) | `#22c55e` | 버튼, CTA, 뱃지, 활성 상태, 툴팁/알림 배경 |
| Primary Dark | `#15803d` | 핀 기본색, 버튼 그라디언트 끝색, 말풍선 화살표 |
| Primary Mid | `#16a34a` | 텍스트 강조, 태그 색 |
| Brand Navy | `#1B2A5C` | 헤더 배경, 제목, 통계 수치 |
| Page BG | `#f0f2f8` | 전체 페이지 배경 (연한 블루그레이) |
| Card BG | `#ffffff` | 카드, 패널 배경 |
| Text Primary | `#1B2A5C` | 주요 제목 |
| Text Body | `#4a5568` | 본문 텍스트 |
| Text Muted | `#94a3b8` | 보조·설명 텍스트 |

### 컴포넌트 스타일 원칙

- **카드**: `background: #fff` · `border-radius: 14~18px` · `box-shadow: 0 2px 12px rgba(27,42,92,0.08)`
- **버튼 (pill)**: `border-radius: 26px` · 초록 그라디언트 `linear-gradient(135deg, #22c55e, #15803d)`
- **칩/뱃지**: `border-radius: 20px` · `background: rgba(34,197,94,0.1)` · 텍스트 `#16a34a`
- **토스트/힌트**: bottom fixed · 초록 그라디언트 배경 (새 요소) 또는 네이비+초록 테두리 (기존 토스트)
- **애니메이션 easing**: `cubic-bezier(0.34, 1.56, 0.64, 1)` — 스프링 바운스 (슬라이드 카드, 토스트, 말풍선)

### 메달 색상 체계 (1~3위 공통)

| 순위 | 스타일 | gradient |
|------|--------|----------|
| 🥇 금 | 앰버 골드 | `linear-gradient(135deg, #F59E0B, #D97706)` |
| 🥈 은 | **스틸 블루 실버** | `linear-gradient(135deg, #c8dae5, #6a9ab0, #3d7a9a)` |
| 🥉 동 | 브론즈 | `linear-gradient(135deg, #CD7F32, #92400E)` |

> 은메달은 **회색 은색이 아닌 스틸 블루 실버** — Mappage 핀 배지와 RankingPage 메달 배지 둘 다 동일 적용.

### 트렌드 배지 CSS 클래스 (⚠️ 전역 정의 위치 주의)
- **정의 위치: `src/index.css`** (개별 페이지 CSS가 아님 — 전역 적용)
```css
.trend-up   { background: #dcfce7; color: #16a34a; }
.trend-keep { background: #f1f5f9; color: #64748b; }
.trend-down { background: #fee2e2; color: #dc2626; }
```

---

## 11. UX 결정 사항

### 지도 초기 진입 — 핀 없음 (의도적 설계)
- `INIT_FILTERS.region = null` → 핀이 없는 빈 지도로 시작
- **이유**: 33개 핀이 한꺼번에 뜨면 첫인상이 복잡해 보임. 필터 선택 → 핀 등장 흐름이 더 명쾌한 UX
- 지역 필터에서 '전국' 또는 특정 지역 선택 시 핀 표시됨

### 지도 — 필터 힌트 말풍선 (TTL 기반)
- `localStorage` key: `nolrugaja_map_hint_shown` (값: 마지막 표시 시각 밀리초)
- `mapReady` 후 마지막 표시로부터 **1시간** 경과 시 필터 버튼 왼쪽에 초록 말풍선 등장
- 텍스트: "지역을 선택하면 핀이 나타나요!"
- 3.5초 후 자동 페이드아웃 / 클릭 시 즉시 닫힘
- 표시 시 timestamp 갱신 → 그 후 1시간은 안 뜸 (브라우저 localStorage 기준)
- 스타일: 초록 그라디언트 `linear-gradient(135deg, #22c55e, #15803d)` + 오른쪽 화살표 (→ 필터 버튼 방향)
- 상수: `HINT_TTL = 60 * 60 * 1000` (변경 시 Mappage.jsx 상단에서 수정)

### 필터 세션 유지 (sessionStorage)
- key: `nolrugaja_map_filters`, TTL: 30분
- 다른 페이지 갔다가 돌아와도 이전 필터 상태 복원됨

### 추천 결과 저장 (localStorage)
- key: `nolrugaja_recommend_result`
- 퀴즈 완료 시 자동 저장 → 인트로 화면에서 "이전 결과 보기" 가능

### 홈 로고 클릭 기믹
- `/favicon.png` 클릭 → `navigator.clipboard.writeText(window.location.origin)`
- 3초 토스트 알림: "🔗 사이트 주소가 복사되었어요! 친구들에게 알려봐요!"
- clipboard API 미지원 시 조용히 무시 (optional chaining `?.`)

---

## 12. 계절 필터 구현 방식

```js
const CURRENT_SEASON_KEY = getCurrentSeasonKey(); // 런타임 계산
const SEASONS = [...].map(s =>
  s.key === CURRENT_SEASON_KEY ? { ...s, label: `${s.label} (현재)` } : s
);
const INIT_FILTERS = { ..., season: CURRENT_SEASON_KEY };
// 활성 카운트: filters.season !== CURRENT_SEASON_KEY
```

---

## 13. GPS 좌표 최종 확정값 (2차 보정 완료)

| id | 관광지 | lat | lng |
|----|--------|-----|-----|
| 1 | 에버랜드 | 37.2938 | 127.2045 |
| 2 | 코엑스 | 37.5072 | 127.0553 |
| 3 | 킨텍스 | 37.6725 | 126.7639 |
| 4 | 롯데월드 | 37.5111 | 127.0981 |
| 5 | 국립중앙박물관 | 37.5239 | 126.9808 |
| 6 | 서울대공원 | 37.4250 | 127.0170 |
| 7 | 여의도한강공원 | 37.5283 | 126.9327 |
| 8 | 속초해변 | 38.2074 | 128.5932 |
| 9 | 어린이대공원 | 37.5483 | 127.0805 |
| 10 | 월미도 | 37.4745 | 126.5975 |
| 11 | 전주한옥마을 | 35.8154 | 127.1527 |
| 12 | 예술의전당 | 37.4738 | 127.0067 |
| 13 | 을왕리해수욕장 | 37.4533 | 126.3697 |
| 14 | 서울랜드 | 37.4273 | 127.0147 |
| 15 | 불국사 | 35.7897 | 129.3317 |
| 16 | 일산호수공원 | 37.6586 | 126.7624 |
| 17 | 인천대공원 | 37.4415 | 126.7357 |
| 18 | 대천해수욕장 | 36.3056 | 126.5160 |
| 19 | 올림픽공원 | 37.5219 | 127.1228 |
| 20 | 오이도빨강등대 | 37.3424 | 126.6836 |
| 21 | 한국민속촌 | 37.2594 | 127.1206 |
| 22 | 낙산사 | 38.1246 | 128.6283 |
| 23 | 통도사 | 35.4882 | 129.0639 |
| 24 | 해동용궁사 | 35.1882 | 129.2249 |
| 25 | 광안리해수욕장 | 35.1532 | 129.1187 |
| 26 | 반포한강공원 | 37.5136 | 127.0017 |
| 27 | 경포해변 | 37.8039 | 128.9088 |
| 28 | 화성행궁 | 37.2819 | 127.0144 |
| 29 | 벡스코 | 35.1691 | 129.1316 |
| 30 | 강원랜드 | 37.2167 | 128.9167 |
| 31 | 순천만국가정원 | 34.9270 | 127.4872 |
| 32 | 여수 오동도 | 34.7453 | 127.7666 |
| 33 | 담양 메타세쿼이아길 | 35.3239 | 127.0042 |

---

## 14. 트렌드 현황

- **상승**: 에버랜드, 킨텍스, 국립중앙박물관, 여의도한강공원, 전주한옥마을, 예술의전당, 을왕리해수욕장, 인천대공원, 오이도빨강등대, 낙산사, 해동용궁사, 반포한강공원, 경포해변, 화성행궁, 순천만국가정원, 담양 메타세쿼이아길
- **하락**: 서울랜드, 강원랜드
- **유지**: 나머지 15개

---

## 15. 빌드 및 배포

### 환경 정보
- **Node.js**: v22.22.2 / **npm**: v10.9.7 / **브랜치**: `main`

### 새 환경에서 처음 시작하는 순서
```bash
export PATH="$HOME/.local/bin:$PATH"  # 0. git-lfs PATH 설정 (필수)
cd /home/jovyan/work/nolrugaja
npm install                          # 1. 패키지 설치
echo "VITE_KAKAO_MAP_KEY=..." > .env.local  # 2. 환경변수 파일 생성 (키는 로컬 완전판 참조)
git remote add mine https://[YOUR_PAT]@github.com/Moonhm/2026-vibe-hackathon-dail-band-.git  # 3. git remote 설정
npm run dev                          # 4. 개발 서버 실행
```

### 일반 개발 흐름
```bash
npm run dev                    # 개발 서버 (localhost:5173)

# 배포 흐름
npm run build                  # 빌드 확인 (오류 없는지)
git add <파일>
git commit -m "커밋 메시지"
git push mine main             # Cloudflare Pages 자동 배포 트리거
# 배포 확인: https://2026-vibe-hackathon-dail-band.pages.dev
```

### .gitignore 주요 제외 항목
```
node_modules/ / dist/ / .env.*  ← .env.local은 수동 생성 필요
```

**Cloudflare Pages 설정**:
- 연결 저장소: `Moonhm/2026-vibe-hackathon-dail-band-`
- Build command: `npm run build` / Output: `dist`
- Environment variable: `VITE_KAKAO_MAP_KEY=[로컬 완전판 참조]`
- ※ Cloudflare에 환경변수 미등록 시 배포 앱에서 지도 안 뜸

---

## 16. 이미지 파일 규칙

- 경로: `public/images/{id}_{영문명}.jpg`
- 예: `1_everland.jpg`, `2_coex.jpg`, ..., `33_metasequoia.jpg`
- 현재 33장 총 6.1MB (ImageMagick으로 최대 1200px·Q75 압축 완료)
- 로드 실패 시 `IMG_FALLBACK` (constants.js의 base64 SVG 플레이스홀더 자동 대체)
- ✅ **git LFS 설정 완료** — `.gitattributes` 포함, 이미지 33장 모두 GitHub LFS 서버에 저장됨
- 이미지 추가 시 평소 git과 동일하게 add/commit/push — LFS가 자동으로 처리함
- 상세 사용법: `/home/jovyan/work/data/GIT_LFS_GUIDE.md` 참조

---

## 17. vite.config.js 핵심 설정

```js
base: '/'
build.rollupOptions.output.manualChunks: { vendor: ['react', 'react-dom', 'react-router-dom'] }
// vendor 번들 분리 → React 코드 캐시 유지, 앱 코드만 갱신됨
server.allowedHosts: 'all'    // 이 서버 환경에서 dev 접속 허용
server.watch.usePolling: true  // 파일 변경 감지
```

---

## 18. 개발 시 주의사항

1. **`git push mine main` 만 사용** — 다른 remote push 금지
2. **이 서버에서 git 명령 실행 전 반드시 PATH 설정** — git-lfs가 `~/.local/bin`에 있음:
   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   ```
   이 설정 없이 `git status` / `git add` 등 실행하면 `git-lfs: not found` 에러 발생.
2. `IMG_FALLBACK`, `TREND`, `REGION_KO` → `utils/constants.js`에서 import
3. `TREND` 사용 시 `.text` / `.cls` 사용 — `.label` 아님
4. 카카오맵 핀 DOM 조작은 `overlayElsRef` / `rankElsRef` ref로만
5. `RegionDemand` 파일 존재하지만 어느 페이지에도 import 안 됨
6. `functions/api/tour.js` — 배포 환경에서만 동작 (로컬 dev에서는 안 됨)
7. CSS specificity: `.badge-topN.badge-selected` (2클래스) > `.badge-selected` (1클래스)

---

## 19. 현재 완료 상태 (2026-05-23)

- [x] 전체 코드 최적화 (공통 상수, dead code 제거, vendor 번들 분리)
- [x] RankingPage 인기 키워드 칩 섹션 추가
- [x] 지도 계절 필터 중복 버그 수정
- [x] 지도 핀 인기도 순위 ON/OFF 토글
- [x] Top3 핀 배지 금/은/브론즈 — hover·click 시에도 고유 색 유지
- [x] 은메달(2위) 배지 스틸 블루 실버로 고급화 (Mappage 핀 + RankingPage 메달 통일)
- [x] 지도 필터 문구 해요체 개선, 전국 인기도 OFF 상태 설명 추가
- [x] 상세 페이지 트렌드 배지 스타일 개선
- [x] GPS 좌표 1·2차 전수 보정 (33개 전체)
- [x] 트렌드 데이터 현실화 (상승 16 / 하락 2 / 유지 15)
- [x] 홈 로고 클릭 → URL 복사 + 토스트 기믹
- [x] 지도 필터 힌트 말풍선 (초록, 1시간 TTL 재표시, localStorage timestamp 기반)
- [x] 이미지 전체 압축 최적화 (150MB → 6.1MB, 96% 감소 / ImageMagick 1200px·Q75)
- [x] git 히스토리 정리 (251MB → 6.9MB / git-filter-repo로 구버전 blob 제거)
- [x] 전체 해요체 통일 (Recommend·CrowdForecast·RankingPage·DetailPage·Homepage 모든 사용자 노출 문구)
- [x] 추천 결과 카드 등장 애니메이션 + hover scale 효과 (CSS translate/transform 분리로 충돌 해결)
- [x] 코드 버그 수정: ageRankings optional chaining 4곳, HEAT_MAX 빈 배열 방어, popularityRank null guard
- [x] 미사용 CSS 제거 (hero-stats 5개 클래스, rp-dot/rp-date)
- [x] 카드 hover z-index 추가 (Homepage·RankingPage — 인접 카드에 가려짐 방지)
- [x] 지도 필터 패널 높이 축소 (70vh → 55vh) + 내부 패딩·간격 전체 조정
- [x] git LFS 마이그레이션 완료 (이미지 33장 GitHub LFS 서버 이전, .gitattributes 설정)
- [x] git 저장소 단독화 (origin 제거, mine 단일 remote 운영)

## 20. 다음 작업 아이디어 (미결)

- [ ] Recommend 탭 고도화
- [ ] 관광지 추가 확장
- [ ] 다크 모드
- [ ] 지도 핀 클러스터링
- [ ] 관광지 검색 기능
- [ ] PWA (오프라인 지원)
