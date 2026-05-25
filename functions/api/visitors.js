const API_KEY = 'zH1Ajghx0euybdD9BbPBYpBTNTpGscQcGPFtoHSWV9ZmP3KnpVhJxfVO01seBplRXgMefHYZvm/VxSeNfoRtNQ==';
const BASE    = 'https://apis.data.go.kr/B551011/DataLabService/metcoRegnVisitrDDList';

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

// TourAPI 광역 지자체 코드 → festivals.js region id
const AREA_TO_REGION = {
  '11': 'seoul',    '26': 'busan',    '27': 'daegu',   '28': 'incheon',
  '29': 'gwangju',  '30': 'daejeon',  '31': 'ulsan',   '36': 'sejong',
  '41': 'gyeonggi', '43': 'chungbuk', '44': 'chungnam','46': 'jeonnam',
  '47': 'gyeongbuk','48': 'gyeongnam','50': 'jeju',    '51': 'gangwon',
  '52': 'jeonbuk',
};

function getLastMonthRange() {
  const now   = new Date();
  const year  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = now.getMonth() === 0 ? 12 : now.getMonth(); // 0-indexed → 전월
  const pad   = n => String(n).padStart(2, '0');
  const lastDay = new Date(year, month, 0).getDate();
  return {
    startYmd: `${year}${pad(month)}01`,
    endYmd:   `${year}${pad(month)}${lastDay}`,
    period:   `${year}.${pad(month)}`,
  };
}

async function fetchPage(range, pageNo) {
  const params = new URLSearchParams({
    serviceKey: API_KEY,
    MobileOS:   'WEB',
    MobileApp:  '놀러가자',
    _type:      'json',
    numOfRows:  '1000',
    pageNo:     String(pageNo),
    startYmd:   range.startYmd,
    endYmd:     range.endYmd,
  });
  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  const data = await res.json();
  const item = data?.response?.body?.items?.item;
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

export async function onRequestGet() {
  try {
    const range = getLastMonthRange();

    // 총 1275건 → 1000 + 275, 2페이지 동시 호출
    const [page1, page2] = await Promise.all([
      fetchPage(range, 1),
      fetchPage(range, 2),
    ]);

    const totals = {};
    for (const item of [...page1, ...page2]) {
      const id = AREA_TO_REGION[item.areaCode];
      if (!id) continue;
      totals[id] = (totals[id] || 0) + parseFloat(item.touNum);
    }

    // 소수점 제거
    Object.keys(totals).forEach(k => { totals[k] = Math.round(totals[k]); });

    return new Response(JSON.stringify({ period: range.period, regions: totals }), { headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      ...CORS,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
