// 지역별 관광 자원 수요 API 프록시
// - /api/resource?type=svc&areaCd=11&baseYm=202603  → 관광 서비스 수요
// - /api/resource?type=cul&areaCd=11&baseYm=202603  → 문화 자원 수요

const API_KEY = 'zH1Ajghx0euybdD9BbPBYpBTNTpGscQcGPFtoHSWV9ZmP3KnpVhJxfVO01seBplRXgMefHYZvm/VxSeNfoRtNQ==';
const BASE    = 'https://apis.data.go.kr/B551011/AreaTarResDemService';

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const type     = searchParams.get('type') || 'cul'; // svc | cul
  const areaCd   = searchParams.get('areaCd');
  const baseYm   = searchParams.get('baseYm');
  const signguCd = searchParams.get('signguCd') || '';

  if (!areaCd || !baseYm) {
    return new Response(JSON.stringify({ error: 'areaCd and baseYm required' }), { status: 400, headers: CORS });
  }

  const op = type === 'svc' ? 'areaTarSvcDemList' : 'areaCulResDemList';

  const params = new URLSearchParams({
    serviceKey: API_KEY,
    MobileOS: 'WEB',
    MobileApp: '놀러가자',
    areaCd,
    baseYm,
    numOfRows: '20',
    pageNo: '1',
    _type: 'json',
  });
  if (signguCd) params.set('signguCd', signguCd);

  try {
    const res = await fetch(`${BASE}/${op}?${params.toString()}`);
    if (!res.ok) return new Response(JSON.stringify({ error: `upstream ${res.status}` }), { status: 502, headers: CORS });
    const data = await res.json();
    return new Response(JSON.stringify(data), { headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: { ...CORS, 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
  });
}
