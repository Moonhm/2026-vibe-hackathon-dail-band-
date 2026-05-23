# 놀러가자 (Nolrugaja) — Korean Domestic Travel Guide

A mobile-first web app that helps domestic travelers discover popular tourist spots across South Korea, powered by real visitor data from the **Korea Tourism Data Lab (한국관광데이터랩)**.

## What is this?

**놀러가자 (Nolrugaja)** means *"Let's go out and play"* in Korean. This service is built **for domestic travelers, based on domestic traveler data** — not international tourism statistics.

All ranking and recommendation data is sourced from Korea Tourism Data Lab's survey of domestic Korean travelers (May 2025 – April 2026), covering generational preferences, regional visitor counts, and search trend rankings.

## Features

| Screen | Description |
|--------|-------------|
| **Home** | Top-3 popular spots, Seoul tourism dashboard (YoY indicators, inflow/outflow regions), service overview. |
| **Map** | Kakao Maps with badge overlays for 33 top tourist spots. Filter by region, age group (20s–60s+), season, and popularity. |
| **Ranking** | Top-10 visitor ranking with medal badges, trend indicators (▲▶▼), visitor bar charts, and regional tourism demand index. Toggle between nationwide / metro / regional tabs. |
| **Recommend** | 5-question travel personality quiz that recommends 3 destinations matching your style. |
| **Detail** | Full spot detail: visitor stats, age-group ranking, tags, 14-day crowd forecast (live API), and related spots. |

## Data Sources

This service integrates open data from the following organizations:

### Korea Tourism Data Lab (한국관광데이터랩)
- **세대별 인기관광지** — Top tourist spots by age group (20s / 30s / 40s / 50s / 60s+)
- **지역별 방문자수** — Annual visitor counts by region
- **지역관광진단** — Regional tourism KPI diagnostics (visitor inflow, stay duration, search volume, spending)
- **서울특별시 AI 관광 분석** — Seoul AI tourism analysis, Oct 2024 – Mar 2026

Source period: **2025.05 – 2026.04** | [datalab.visitkorea.or.kr](https://datalab.visitkorea.or.kr)

### Korea Tourism Organization TourAPI — via Korea Public Data Portal (공공데이터포털)
- **관광지 집중률·방문자 추이 예측** — 30-day crowd concentration forecast per tourist spot (live)
- **지역별 관광 수요 강도** — Monthly regional tourism stay/spending intensity index (live)
- **지역별 관광 자원 수요** — Monthly tourism resource demand by category: culture / leisure / history / experience / nature (live)

API via: [data.go.kr](https://data.go.kr)

### Underlying Data Providers
| Provider | Data Used |
|----------|-----------|
| **KT (mobile carrier)** | Visitor counts, age/gender distribution, stay duration |
| **Shinhan Card** | Tourism spending by category |
| **T-map Mobility** | Destination search volume, popular spots |
| **Korea Tourism Organization** | Tourism photos (2025 Regional Tourism Photos) |

> Visitor counts are telecom-signal estimates and may differ from actual gate counts.
> Percentages may not sum to 100% due to rounding.

## Tech Stack

- React 18 + Vite
- React Router v7
- Kakao Maps JavaScript SDK
- Cloudflare Pages (deployment + serverless API proxy functions)

## Live Demo

[https://2026-vibe-hackathon-dail-band.pages.dev](https://2026-vibe-hackathon-dail-band.pages.dev)

## Local Development

```bash
npm install
# Create .env.local and add:
# VITE_KAKAO_MAP_KEY=your_kakao_javascript_key
npm run dev
```

## Deploy

Pushing to `main` triggers an automatic Cloudflare Pages rebuild.

---

*Developed by 문형민, 서교연 | Contact: hm8824@naver.com*
