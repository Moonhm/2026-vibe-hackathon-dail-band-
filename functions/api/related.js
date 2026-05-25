const API_KEY = 'zH1Ajghx0euybdD9BbPBYpBTNTpGscQcGPFtoHSWV9ZmP3KnpVhJxfVO01seBplRXgMefHYZvm/VxSeNfoRtNQ==';
const BASE    = 'https://apis.data.go.kr/B551011/TarRlteTarService1/areaBasedList1';

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

function getLastMonthYm() {
  const now   = new Date();
  const year  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = now.getMonth() === 0 ? 12 : now.getMonth();
  return `${year}${String(month).padStart(2, '0')}`;
}

// 공백·특수문자 제거 후 포함 여부 비교
function nameMatch(a, b) {
  const clean = s => s.replace(/[\s·\-()（）]/g, '').toLowerCase();
  const ca = clean(a), cb = clean(b);
  return ca.includes(cb) || cb.includes(ca);
}

export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const areaCd  = searchParams.get('areaCd');
  const signguCd = searchParams.get('signguCd');
  const name    = searchParams.get('name') || '';

  if (!areaCd || !signguCd) {
    return new Response(JSON.stringify({ error: 'areaCd and signguCd required' }), { status: 400, headers: CORS });
  }

  const baseYm = getLastMonthYm();

  try {
    // 해당 시군구 전체 데이터 (최대 2페이지 = 2000건)
    const fetchPage = async (pageNo) => {
      const params = new URLSearchParams({
        serviceKey: API_KEY,
        MobileOS: 'WEB',
        MobileApp: '놀러가자',
        _type: 'json',
        numOfRows: '1000',
        pageNo: String(pageNo),
        areaCd: String(areaCd),
        signguCd: String(signguCd),
        baseYm,
      });
      const res  = await fetch(`${BASE}?${params}`);
      if (!res.ok) throw new Error(`upstream ${res.status}`);
      const data = await res.json();
      const body = data.response.body;
      return { items: body.items?.item || [], total: body.totalCount };
    };

    const { items: page1, total } = await fetchPage(1);
    const items = total > 1000
      ? [...page1, ...(await fetchPage(2)).items]
      : page1;

    // 우리 관광지 이름과 매칭되는 source 항목 찾기
    const sourceItems = name
      ? items.filter(it => nameMatch(it.tAtsNm, name))
      : [];

    // 연관 관광지 추출: 중복 제거 + rank 순
    const seen = new Set();
    const related = sourceItems
      .sort((a, b) => parseInt(a.rlteRank) - parseInt(b.rlteRank))
      .reduce((acc, it) => {
        const k = it.rlteTatsNm;
        if (!seen.has(k) && k !== name) {
          seen.add(k);
          acc.push({
            name:     it.rlteTatsNm,
            region:   it.rlteRegnNm,
            district: it.rlteSignguNm,
            category: it.rlteCtgryMclsNm || it.rlteCtgryLclsNm,
            rank:     parseInt(it.rlteRank),
          });
        }
        return acc;
      }, [])
      .slice(0, 8);

    return new Response(JSON.stringify({ baseYm, related, matched: sourceItems.length > 0 }), { headers: CORS });

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
