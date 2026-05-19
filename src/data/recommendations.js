export const questions = [
  {
    id: 1,
    text: "여행에서 가장 중요한 것은?",
    options: [
      { text: "🌿 자연과 힐링", tags: ["자연", "힐링"] },
      { text: "🏛️ 문화와 역사 탐방", tags: ["전통", "역사", "문화"] },
      { text: "🍜 맛집 투어", tags: ["음식", "도시"] },
      { text: "🏄 액티비티와 모험", tags: ["액티비티", "바다"] },
    ],
  },
  {
    id: 2,
    text: "선호하는 여행 동반자는?",
    options: [
      { text: "🙋 혼자 (감성 여행)", tags: ["사진", "힐링"] },
      { text: "💑 연인과 함께", tags: ["야경", "커플"] },
      { text: "👨‍👩‍👧 가족과 함께", tags: ["가족", "체험"] },
      { text: "👫 친구들과 함께", tags: ["도시", "액티비티"] },
    ],
  },
  {
    id: 3,
    text: "여행 시기 선호도는?",
    options: [
      { text: "🌸 봄 (3~5월)", tags: ["자연", "사진"] },
      { text: "☀️ 여름 (6~8월)", tags: ["여름", "바다"] },
      { text: "🍂 가을 (9~11월)", tags: ["전통", "역사"] },
      { text: "❄️ 겨울 (12~2월)", tags: ["야경", "도시"] },
    ],
  },
  {
    id: 4,
    text: "선호하는 여행 분위기는?",
    options: [
      { text: "🌙 조용하고 감성적인", tags: ["힐링", "사진", "자연"] },
      { text: "🎉 활기차고 신나는", tags: ["액티비티", "도시", "바다"] },
      { text: "📜 전통적이고 교육적인", tags: ["전통", "역사", "문화"] },
      { text: "✨ 감각적이고 트렌디한", tags: ["야경", "도시", "예술"] },
    ],
  },
  {
    id: 5,
    text: "여행에서 꼭 하고 싶은 것은?",
    options: [
      { text: "📸 인생 사진 남기기", tags: ["사진", "야경"] },
      { text: "🍽️ 현지 음식 먹기", tags: ["음식", "전통"] },
      { text: "🎭 문화·예술 관람", tags: ["문화", "예술", "야경"] },
      { text: "🌲 자연 속 체험 활동", tags: ["자연", "액티비티", "체험"] },
    ],
  },
];

// bestFestivals: { name, id } 형태 — id가 있으면 상세 페이지로 이동 가능
export const destinations = [
  {
    id: "gangwon",
    name: "강릉·속초",
    description: "동해 바다와 설악산을 함께 즐길 수 있는 힐링 여행지예요. 속초해변, 낙산사, 경포해변 등 아름다운 자연 명소가 가득해요.",
    tags: ["자연", "바다", "힐링", "사진", "여름"],
    bestFestivals: [
      { name: "속초해변", id: 8 },
      { name: "낙산사", id: 22 },
      { name: "경포해변", id: 27 },
    ],
    image: "/images/27_gyeongpo.jpg",
    tip: "KTX 강릉선으로 서울에서 2시간이면 도착",
  },
  {
    id: "seoul",
    name: "서울",
    description: "연 6억 명이 찾는 대한민국 최대 관광 도시예요. 궁궐, 한강공원, 감각적인 도심까지 취향에 따라 즐기는 방법이 무궁무진해요.",
    tags: ["야경", "문화", "힐링", "커플", "사진", "도시", "예술"],
    bestFestivals: [
      { name: "여의도한강공원", id: 7 },
      { name: "예술의전당", id: 12 },
      { name: "반포한강공원", id: 26 },
    ],
    image: "/images/5_museum.jpg",
    tip: "대중교통이 편리해 서울 패스 활용 추천",
  },
  {
    id: "jeonbuk",
    name: "전주",
    description: "한국 전통 문화의 중심지예요. 700여 채의 한옥이 밀집한 전주한옥마을에서 한복 체험과 전통 음식을 즐겨보세요.",
    tags: ["전통", "음식", "문화", "사진", "체험", "역사"],
    bestFestivals: [
      { name: "전주한옥마을", id: 11 },
    ],
    image: "/images/11_jeonju.jpg",
    tip: "한복 대여 후 한옥마을 산책이 필수 코스",
  },
  {
    id: "gyeongbuk",
    name: "경주",
    description: "신라 천년의 역사가 살아숨쉬는 도시예요. 유네스코 세계유산인 불국사와 동궁·월지 야경까지 볼거리가 넘쳐요.",
    tags: ["전통", "역사", "문화", "사진", "야경"],
    bestFestivals: [
      { name: "불국사", id: 15 },
    ],
    image: "/images/15_bulguksa.jpg",
    tip: "봄 벚꽃 시즌과 가을 단풍 시즌 방문을 추천",
  },
  {
    id: "busan",
    name: "부산",
    description: "바다와 도시가 만나는 역동적인 항구 도시예요. 광안리해수욕장 야경, 해동용궁사, 감천문화마을까지 다채로운 매력이 넘쳐요.",
    tags: ["바다", "야경", "여름", "사진", "도시"],
    bestFestivals: [
      { name: "광안리해수욕장", id: 25 },
      { name: "해동용궁사", id: 24 },
      { name: "벡스코", id: 29 },
    ],
    image: "/images/25_gwangalli.jpg",
    tip: "여름 방문 시 숙소 예약을 2~3개월 전에 해두세요",
  },
  {
    id: "gyeonggi",
    name: "용인·수원",
    description: "국내 방문자 수 1위 광역 관광권이에요. 에버랜드, 한국민속촌, 화성행궁 등 다양한 테마파크와 역사 명소가 밀집해 있어요.",
    tags: ["액티비티", "가족", "체험", "전통", "문화", "도시"],
    bestFestivals: [
      { name: "에버랜드", id: 1 },
      { name: "한국민속촌", id: 21 },
      { name: "화성행궁", id: 28 },
    ],
    image: "/images/6_seoulpark.jpg",
    tip: "수도권에서 당일치기도 가능한 근거리 여행지",
  },
  {
    id: "incheon",
    name: "인천",
    description: "서해 노을과 갯벌이 아름다운 항구 도시예요. 월미도, 을왕리해수욕장, 인천대공원까지 수도권에서 가장 가까운 바다 여행지예요.",
    tags: ["바다", "자연", "힐링", "가족", "액티비티", "사진"],
    bestFestivals: [
      { name: "월미도", id: 10 },
      { name: "을왕리해수욕장", id: 13 },
      { name: "인천대공원", id: 17 },
    ],
    image: "/images/20_oido.jpg",
    tip: "수도권 전철로 쉽게 접근 가능한 근거리 바다",
  },
  {
    id: "gyeongnam",
    name: "양산·통도사",
    description: "유네스코 세계유산 통도사를 품은 불교 문화 여행지예요. 천년 숲과 고찰이 어우러진 힐링 명소예요.",
    tags: ["전통", "역사", "자연", "힐링", "사진"],
    bestFestivals: [
      { name: "통도사", id: 23 },
      { name: "해동용궁사", id: 24 },
    ],
    image: "/images/22_naksansa.jpg",
    tip: "봄 산벚꽃, 가을 단풍 시즌이 특히 아름다워요",
  },
];

export function getRecommendations(selectedTags) {
  const scores = destinations.map((dest) => {
    const score = dest.tags.filter((tag) => selectedTags.includes(tag)).length;
    return { ...dest, score };
  });
  return scores.sort((a, b) => b.score - a.score).slice(0, 3);
}
