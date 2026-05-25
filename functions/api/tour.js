const API_KEY = 'zH1Ajghx0euybdD9BbPBYpBTNTpGscQcGPFtoHSWV9ZmP3KnpVhJxfVO01seBplRXgMefHYZvm/VxSeNfoRtNQ==';
const BASE = 'https://apis.data.go.kr/B551011/TatsCnctrRateService1/tatsCnctrRateList1';

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const areaCd  = searchParams.get('areaCd');
  const signguCd = searchParams.get('signguCd');
  const tAtsNm  = searchParams.get('tAtsNm') || '';

  if (!areaCd || !signguCd) {
    return new Response(JSON.stringify({ error: 'areaCd and signguCd required' }), { status: 400, headers: CORS });
  }

  const params = new URLSearchParams({
    serviceKey: API_KEY,
    MobileOS: 'WEB',
    MobileApp: '놀러가자',
    areaCd,
    signguCd,
    numOfRows: '30',
    pageNo: '1',
    _type: 'json',
  });
  if (tAtsNm) params.set('tAtsNm', tAtsNm);

  try {
    const res = await fetch(`${BASE}?${params.toString()}`);
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `upstream ${res.status}` }), { status: 502, headers: CORS });
    }
    const data = await res.json();
    return new Response(JSON.stringify(data), { headers: CORS });
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
