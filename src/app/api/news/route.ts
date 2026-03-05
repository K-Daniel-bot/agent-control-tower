import { NextResponse } from 'next/server'
import type { NewsArticle, EventCategory, NewsSeverity, NewsLocation } from '@/types/news'

export const dynamic = 'force-dynamic'

interface SourceDef {
  readonly name: string
  readonly location: NewsLocation
}

const SOURCE_URLS: Record<string, string> = {
  'TechCrunch': 'https://techcrunch.com',
  'The Verge': 'https://www.theverge.com',
  'Bloomberg': 'https://www.bloomberg.com',
  'Anthropic': 'https://www.anthropic.com',
  'Wired': 'https://www.wired.com',
  'ArXiv': 'https://arxiv.org',
  'Washington Post': 'https://www.washingtonpost.com',
  'Politico': 'https://www.politico.com',
  'Austin American': 'https://www.statesman.com',
  'GeekWire': 'https://www.geekwire.com',
  'Boston Globe': 'https://www.bostonglobe.com',
  'Chicago Tribune': 'https://www.chicagotribune.com',
  'LA Times': 'https://www.latimes.com',
  'Reuters': 'https://www.reuters.com',
  'DeepMind': 'https://deepmind.google',
  'Hugging Face': 'https://huggingface.co/blog',
  'Le Monde': 'https://www.lemonde.fr',
  'Handelsblatt': 'https://www.handelsblatt.com',
  'Corriere': 'https://www.corriere.it',
  'El Pais': 'https://elpais.com',
  'De Telegraaf': 'https://www.telegraaf.nl',
  'Dagens Nyheter': 'https://www.dn.se',
  'Neue Zürcher': 'https://www.nzz.ch',
  'Gazeta Wyborcza': 'https://wyborcza.pl',
  'Hospodářské': 'https://www.hospodarske.cz',
  'Irish Times': 'https://www.irishtimes.com',
  'Kyiv Independent': 'https://kyivindependent.com',
  'TASS': 'https://tass.com',
  'Nikkei Asia': 'https://asia.nikkei.com',
  'NHK': 'https://www3.nhk.or.jp',
  'SCMP': 'https://www.scmp.com',
  'Xinhua': 'https://www.xinhuanet.com',
  'Shenzhen Daily': 'https://www.sznews.com',
  'ETNews': 'https://www.etnews.com',
  'ZDNet Korea': 'https://www.zdnet.co.kr',
  'Yonhap': 'https://www.yna.co.kr',
  'Busan Ilbo': 'https://www.busan.com',
  'Times of India': 'https://timesofindia.indiatimes.com',
  'Deccan Herald': 'https://www.deccanherald.com',
  'Jakarta Post': 'https://www.thejakartapost.com',
  'Bangkok Post': 'https://www.bangkokpost.com',
  'VnExpress': 'https://vnexpress.net',
  'Straits Times': 'https://www.straitstimes.com',
  'Taipei Times': 'https://www.taipeitimes.com',
  'Al Jazeera': 'https://www.aljazeera.com',
  'Haaretz': 'https://www.haaretz.com',
  'Arab News': 'https://www.arabnews.com',
  'Tehran Times': 'https://www.tehrantimes.com',
  'Daily Sabah': 'https://www.dailysabah.com',
  'Punch Nigeria': 'https://www.punchng.com',
  'Nation Media': 'https://www.nation.co.ke',
  'Al-Ahram': 'https://www.ahram.org.eg',
  'Daily Maverick': 'https://www.dailymaverick.co.za',
  'Folha de São Paulo': 'https://www.folha.uol.com.br',
  'Globo': 'https://globoplay.globo.com',
  'Clarín': 'https://www.clarin.com',
  'El Universal': 'https://www.eluniversal.com.mx',
  'La Tercera': 'https://www.latercera.com',
  'El Tiempo': 'https://www.eltiempo.com',
  'ABC Australia': 'https://www.abc.net.au',
  'Maple News': 'https://www.globalnews.ca',
}

const SOURCES: readonly SourceDef[] = [
  { name: 'TechCrunch', location: { country: '미국', countryCode: 'US', lat: 37.77, lng: -122.42, city: 'San Francisco' } },
  { name: 'The Verge', location: { country: '미국', countryCode: 'US', lat: 40.75, lng: -73.99, city: 'New York' } },
  { name: 'Bloomberg', location: { country: '미국', countryCode: 'US', lat: 40.76, lng: -73.98, city: 'New York' } },
  { name: 'Anthropic', location: { country: '미국', countryCode: 'US', lat: 37.77, lng: -122.39, city: 'San Francisco' } },
  { name: 'Wired', location: { country: '미국', countryCode: 'US', lat: 37.78, lng: -122.39, city: 'San Francisco' } },
  { name: 'ArXiv', location: { country: '미국', countryCode: 'US', lat: 42.45, lng: -76.47, city: 'Ithaca' } },
  { name: 'Washington Post', location: { country: '미국', countryCode: 'US', lat: 38.91, lng: -77.04, city: 'Washington DC' } },
  { name: 'Politico', location: { country: '미국', countryCode: 'US', lat: 38.90, lng: -77.03, city: 'Washington DC' } },
  { name: 'Austin American', location: { country: '미국', countryCode: 'US', lat: 30.27, lng: -97.74, city: 'Austin' } },
  { name: 'GeekWire', location: { country: '미국', countryCode: 'US', lat: 47.61, lng: -122.33, city: 'Seattle' } },
  { name: 'Boston Globe', location: { country: '미국', countryCode: 'US', lat: 42.36, lng: -71.06, city: 'Boston' } },
  { name: 'Chicago Tribune', location: { country: '미국', countryCode: 'US', lat: 41.88, lng: -87.63, city: 'Chicago' } },
  { name: 'LA Times', location: { country: '미국', countryCode: 'US', lat: 34.05, lng: -118.24, city: 'Los Angeles' } },
  { name: 'Reuters', location: { country: '영국', countryCode: 'GB', lat: 51.51, lng: -0.12, city: 'London' } },
  { name: 'DeepMind', location: { country: '영국', countryCode: 'GB', lat: 51.53, lng: -0.13, city: 'London' } },
  { name: 'Hugging Face', location: { country: '프랑스', countryCode: 'FR', lat: 48.86, lng: 2.35, city: 'Paris' } },
  { name: 'Le Monde', location: { country: '프랑스', countryCode: 'FR', lat: 48.85, lng: 2.34, city: 'Paris' } },
  { name: 'Handelsblatt', location: { country: '독일', countryCode: 'DE', lat: 52.52, lng: 13.41, city: 'Berlin' } },
  { name: 'Corriere', location: { country: '이탈리아', countryCode: 'IT', lat: 45.46, lng: 9.19, city: 'Milan' } },
  { name: 'El Pais', location: { country: '스페인', countryCode: 'ES', lat: 40.42, lng: -3.70, city: 'Madrid' } },
  { name: 'De Telegraaf', location: { country: '네덜란드', countryCode: 'NL', lat: 52.37, lng: 4.90, city: 'Amsterdam' } },
  { name: 'Dagens Nyheter', location: { country: '스웨덴', countryCode: 'SE', lat: 59.33, lng: 18.07, city: 'Stockholm' } },
  { name: 'Neue Zürcher', location: { country: '스위스', countryCode: 'CH', lat: 47.37, lng: 8.54, city: 'Zurich' } },
  { name: 'Gazeta Wyborcza', location: { country: '폴란드', countryCode: 'PL', lat: 52.23, lng: 21.01, city: 'Warsaw' } },
  { name: 'Hospodářské', location: { country: '체코', countryCode: 'CZ', lat: 50.08, lng: 14.44, city: 'Prague' } },
  { name: 'Irish Times', location: { country: '아일랜드', countryCode: 'IE', lat: 53.35, lng: -6.26, city: 'Dublin' } },
  { name: 'Kyiv Independent', location: { country: '우크라이나', countryCode: 'UA', lat: 50.45, lng: 30.52, city: 'Kyiv' } },
  { name: 'TASS', location: { country: '러시아', countryCode: 'RU', lat: 55.76, lng: 37.62, city: 'Moscow' } },
  { name: 'Nikkei Asia', location: { country: '일본', countryCode: 'JP', lat: 35.68, lng: 139.69, city: 'Tokyo' } },
  { name: 'NHK', location: { country: '일본', countryCode: 'JP', lat: 35.69, lng: 139.70, city: 'Tokyo' } },
  { name: 'SCMP', location: { country: '중국', countryCode: 'CN', lat: 22.28, lng: 114.16, city: 'Hong Kong' } },
  { name: 'Xinhua', location: { country: '중국', countryCode: 'CN', lat: 39.91, lng: 116.39, city: 'Beijing' } },
  { name: 'Shenzhen Daily', location: { country: '중국', countryCode: 'CN', lat: 22.54, lng: 114.06, city: 'Shenzhen' } },
  { name: 'ETNews', location: { country: '한국', countryCode: 'KR', lat: 37.57, lng: 126.98, city: 'Seoul' } },
  { name: 'ZDNet Korea', location: { country: '한국', countryCode: 'KR', lat: 37.50, lng: 127.04, city: 'Seoul' } },
  { name: 'Yonhap', location: { country: '한국', countryCode: 'KR', lat: 37.56, lng: 126.97, city: 'Seoul' } },
  { name: 'Busan Ilbo', location: { country: '한국', countryCode: 'KR', lat: 35.18, lng: 129.08, city: 'Busan' } },
  { name: 'Times of India', location: { country: '인도', countryCode: 'IN', lat: 19.08, lng: 72.88, city: 'Mumbai' } },
  { name: 'Deccan Herald', location: { country: '인도', countryCode: 'IN', lat: 12.97, lng: 77.59, city: 'Bangalore' } },
  { name: 'Jakarta Post', location: { country: '인도네시아', countryCode: 'ID', lat: -6.21, lng: 106.85, city: 'Jakarta' } },
  { name: 'Bangkok Post', location: { country: '태국', countryCode: 'TH', lat: 13.76, lng: 100.50, city: 'Bangkok' } },
  { name: 'VnExpress', location: { country: '베트남', countryCode: 'VN', lat: 21.03, lng: 105.85, city: 'Hanoi' } },
  { name: 'Straits Times', location: { country: '싱가포르', countryCode: 'SG', lat: 1.35, lng: 103.82, city: 'Singapore' } },
  { name: 'Taipei Times', location: { country: '대만', countryCode: 'TW', lat: 25.03, lng: 121.57, city: 'Taipei' } },
  { name: 'Al Jazeera', location: { country: 'UAE', countryCode: 'AE', lat: 25.20, lng: 55.27, city: 'Dubai' } },
  { name: 'Haaretz', location: { country: '이스라엘', countryCode: 'IL', lat: 32.07, lng: 34.77, city: 'Tel Aviv' } },
  { name: 'Arab News', location: { country: '사우디', countryCode: 'SA', lat: 24.71, lng: 46.68, city: 'Riyadh' } },
  { name: 'Tehran Times', location: { country: '이란', countryCode: 'IR', lat: 35.69, lng: 51.39, city: 'Tehran' } },
  { name: 'Daily Sabah', location: { country: '터키', countryCode: 'TR', lat: 41.01, lng: 28.98, city: 'Istanbul' } },
  { name: 'Punch Nigeria', location: { country: '나이지리아', countryCode: 'NG', lat: 6.52, lng: 3.38, city: 'Lagos' } },
  { name: 'Nation Media', location: { country: '케냐', countryCode: 'KE', lat: -1.29, lng: 36.82, city: 'Nairobi' } },
  { name: 'Al-Ahram', location: { country: '이집트', countryCode: 'EG', lat: 30.04, lng: 31.24, city: 'Cairo' } },
  { name: 'Daily Maverick', location: { country: '남아공', countryCode: 'ZA', lat: -33.93, lng: 18.42, city: 'Cape Town' } },
  { name: 'Folha de São Paulo', location: { country: '브라질', countryCode: 'BR', lat: -23.55, lng: -46.63, city: 'São Paulo' } },
  { name: 'Globo', location: { country: '브라질', countryCode: 'BR', lat: -22.91, lng: -43.17, city: 'Rio de Janeiro' } },
  { name: 'Clarín', location: { country: '아르헨티나', countryCode: 'AR', lat: -34.60, lng: -58.38, city: 'Buenos Aires' } },
  { name: 'El Universal', location: { country: '멕시코', countryCode: 'MX', lat: 19.43, lng: -99.13, city: 'Mexico City' } },
  { name: 'La Tercera', location: { country: '칠레', countryCode: 'CL', lat: -33.45, lng: -70.67, city: 'Santiago' } },
  { name: 'El Tiempo', location: { country: '콜롬비아', countryCode: 'CO', lat: 4.71, lng: -74.07, city: 'Bogota' } },
  { name: 'ABC Australia', location: { country: '호주', countryCode: 'AU', lat: -33.87, lng: 151.21, city: 'Sydney' } },
  { name: 'Maple News', location: { country: '캐나다', countryCode: 'CA', lat: 43.65, lng: -79.38, city: 'Toronto' } },
]

interface EventTemplate {
  readonly title: string
  readonly category: EventCategory
  readonly severity: NewsSeverity
  readonly tags: readonly string[]
  readonly videoUrl?: string
  readonly content: string
  readonly originalUrl?: string
}

const EVENT_TEMPLATES: readonly EventTemplate[] = [
  // ─── AI (35+ templates) ───
  { title: 'GPT-5 벤치마크 결과 공개: 추론 능력 대폭 향상', category: 'AI', severity: 'critical', tags: ['GPT-5', 'OpenAI', 'LLM'], videoUrl: 'https://www.youtube.com/watch?v=Lp7E973zozc', originalUrl: 'https://openai.com/blog', content: 'OpenAI가 차세대 대규모 언어 모델 GPT-5의 벤치마크 결과를 공개했다. 새 모델은 MMLU에서 92.3%, HumanEval에서 94.1%를 기록하며 이전 모델 대비 추론 능력이 크게 향상되었다.\n\n특히 수학적 추론과 코드 생성 분야에서 괄목할 만한 성장을 보여 MATH 벤치마크에서 89.7%를 달성했다. 이는 기존 GPT-4 대비 약 15%포인트 상승한 수치다.\n\n업계 전문가들은 GPT-5가 멀티모달 이해력에서도 큰 진전을 이뤘다고 평가했다. 이미지, 비디오, 오디오를 통합적으로 처리하는 능력이 대폭 강화되어 실용적 AI 비서로서의 가능성이 한층 높아졌다는 분석이다.\n\nSam Altman CEO는 "GPT-5는 단순한 성능 향상이 아니라 AI가 진정한 추론을 수행하는 첫 단계"라며, 올해 하반기 일반 공개를 예고했다.' },
  { title: 'Claude 4.6 출시, 200K 컨텍스트 윈도우 지원', category: 'AI', severity: 'critical', tags: ['Claude', 'Anthropic', 'LLM'], videoUrl: 'https://www.youtube.com/watch?v=jV8B24rSN5o', originalUrl: 'https://anthropic.com/news', content: 'Anthropic이 Claude 4.6을 공식 출시했다. 이번 버전은 200K 토큰의 컨텍스트 윈도우를 지원하며, 복잡한 코딩 작업과 장문 분석에서 뛰어난 성능을 보인다.\n\n핵심 개선 사항으로는 Constitutional AI 2.0 기반의 향상된 안전성, 멀티스텝 추론 능력의 비약적 발전, 그리고 도구 사용(Tool Use) 성능의 대폭 향상이 꼽힌다.\n\nClaude 4.6은 특히 소프트웨어 엔지니어링 분야에서 SWE-bench Verified에서 72.7%를 기록하며 AI 코딩 어시스턴트로서의 입지를 더욱 강화했다.\n\nDario Amodei CEO는 "이번 모델은 안전성과 유용성을 동시에 극대화한 결과"라며 향후 에이전트 기능 확장 계획을 밝혔다.' },
  { title: 'Google Gemini Ultra 2.0 발표, 멀티모달 1위', category: 'AI', severity: 'high', tags: ['Gemini', 'Google', 'Multimodal'], videoUrl: 'https://www.youtube.com/watch?v=UIZAiXYceBI', originalUrl: 'https://blog.google/technology/ai', content: 'Google DeepMind가 Gemini Ultra 2.0을 발표하며 멀티모달 AI 벤치마크 전 부문에서 1위를 차지했다. 텍스트, 이미지, 비디오, 오디오를 네이티브로 처리하는 통합 아키텍처가 핵심이다.\n\n새 모델은 MMMU에서 75.2%, MathVista에서 68.9%를 달성하며 시각적 추론 능력에서도 선두를 기록했다. 특히 32K 토큰 길이의 비디오를 실시간으로 분석하는 능력이 주목받고 있다.\n\nGoogle Cloud를 통해 기업용 API로 우선 제공되며, Workspace 통합을 통해 기업 생산성 도구와의 시너지를 극대화할 계획이다.' },
  { title: 'Llama 4 오픈소스 공개, 커뮤니티 반응 폭발적', category: 'AI', severity: 'high', tags: ['Llama', 'Meta', 'Open Source'], originalUrl: 'https://ai.meta.com/blog', content: 'Meta가 Llama 4를 오픈소스로 공개하며 AI 민주화의 새 장을 열었다. 8B, 70B, 405B 파라미터 버전이 동시에 공개되었으며, 상용 라이선스로 누구나 자유롭게 사용할 수 있다.\n\nLlama 4-405B는 GPT-4 수준의 성능을 보이면서도 완전한 오픈소스로 제공되어 학계와 산업계 모두에서 큰 관심을 받고 있다. Hugging Face에서 공개 48시간 만에 10만 다운로드를 돌파했다.\n\n특히 한국어를 포함한 다국어 지원이 크게 강화되어 비영어권 국가에서의 AI 접근성이 한층 높아질 전망이다.' },
  { title: 'DeepMind CEO: "AGI 5년 내 달성 가능"', category: 'AI', severity: 'high', tags: ['AGI', 'DeepMind'], originalUrl: 'https://deepmind.google/blog', content: 'Google DeepMind의 Demis Hassabis CEO가 TED 강연에서 "범용 인공지능(AGI)이 5년 내에 달성 가능하다"고 발언해 업계의 이목을 집중시켰다.\n\n그는 현재 AI 시스템이 이미 인간 수준의 추론, 계획, 학습 능력의 상당 부분을 갖추고 있으며, 남은 과제는 이를 통합하고 일반화하는 것이라고 설명했다.\n\nHassabis는 AlphaFold의 성공 사례를 들며 "AI가 과학 전 분야에서 인간을 보조하는 수준을 넘어, 독자적으로 과학적 발견을 이끄는 단계에 진입할 것"이라고 전망했다.\n\n다만 AI 안전성 연구의 병행을 강조하며 "능력의 발전 속도만큼 안전 장치의 발전도 중요하다"고 덧붙였다.' },
  { title: 'Mistral Large 새 버전, 유럽 AI 경쟁력 강화', category: 'AI', severity: 'medium', tags: ['Mistral', 'EU'], originalUrl: 'https://mistral.ai/news', content: 'Mistral AI가 최신 Mistral Large 모델을 공개하며 유럽 AI 경쟁력을 한 단계 끌어올렸다. 128K 컨텍스트 윈도우와 네이티브 함수 호출을 지원하며, 다국어 벤치마크에서 GPT-4를 근소하게 앞서는 성능을 보였다.\n\n프랑스 정부의 전략적 지원과 함께 유럽 데이터 주권을 보장하는 모델로 포지셔닝되어 EU 기업들의 도입이 빠르게 확산되고 있다.' },
  { title: 'Anthropic Constitutional AI 2.0 발표', category: 'AI', severity: 'high', tags: ['Anthropic', 'Safety'], videoUrl: 'https://www.youtube.com/watch?v=bIrEM2FbOLU', originalUrl: 'https://anthropic.com/research', content: 'Anthropic이 AI 정렬 기술의 핵심인 Constitutional AI의 2세대 버전을 발표했다. 새로운 접근법은 모델이 스스로 행동 원칙을 평가하고 개선하는 자기 감독 메커니즘을 대폭 강화했다.\n\nCAI 2.0은 레드팀 테스트에서 해로운 출력 발생률을 기존 대비 87% 감소시켰으며, 동시에 유용성 점수는 12% 향상되었다. 이는 안전성과 유용성이 반드시 상충하지 않음을 실증한 결과다.\n\n이 기술은 Claude 모델 시리즈에 즉시 적용되며, 관련 논문은 arXiv에 공개되었다.' },
  { title: '바이두 Ernie 5.0, 중국어 벤치마크 압도적', category: 'AI', severity: 'medium', tags: ['Baidu', 'China', 'LLM'], content: '바이두가 Ernie 5.0을 공개하며 중국어 NLP 벤치마크 전 부문에서 최고 성능을 기록했다. C-Eval 91.2%, CMMLU 89.7%로 기존 모델들을 크게 앞섰으며, 중국 문화와 법률에 대한 이해도가 특히 높아졌다.\n\n바이두 클라우드를 통해 기업용 API가 즉시 제공되며, 중국 내 10만 개 이상의 기업이 이미 도입 의향을 밝혔다.' },
  { title: 'KAIST 연구팀, 새로운 어텐션 메커니즘 제안', category: 'AI', severity: 'medium', tags: ['KAIST', 'Research', 'Korea'], content: 'KAIST AI대학원 연구팀이 기존 Transformer의 어텐션 메커니즘을 대체할 새로운 아키텍처 "FlashAttention-3"를 제안했다. O(n log n) 복잡도로 긴 시퀀스를 효율적으로 처리하면서도 성능 저하가 거의 없다.\n\n이 연구는 NeurIPS 2026 구두 발표로 채택되었으며, 100K 토큰 이상의 시퀀스에서 기존 방식 대비 4.2배 빠른 추론 속도를 달성했다.' },
  { title: 'Tesla Optimus Gen 3, 공장 투입 시작', category: 'AI', severity: 'high', tags: ['Tesla', 'Robotics'], videoUrl: 'https://www.youtube.com/watch?v=cpraXaw7dyc', originalUrl: 'https://tesla.com/optimus', content: 'Tesla가 휴머노이드 로봇 Optimus Gen 3를 자사 기가팩토리에 실전 투입하기 시작했다. 배터리 셀 조립, 품질 검사, 물류 이동 등 세 가지 작업을 자율적으로 수행할 수 있다.\n\nOptimus Gen 3는 이전 세대 대비 보행 속도 2배, 물체 조작 정밀도 5배 향상을 달성했으며, 자체 개발한 AI 비전 시스템으로 비정형 환경에서도 안정적으로 작동한다.\n\nElon Musk는 "2027년까지 100만 대 생산 목표"를 밝히며, Optimus가 Tesla의 가장 큰 수익원이 될 것이라고 전망했다.' },
  { title: 'Figure AI, 휴머노이드 로봇 대량 생산 계획', category: 'AI', severity: 'medium', tags: ['Figure', 'Robotics'], videoUrl: 'https://www.youtube.com/watch?v=Q5MKo3wnB8E', content: 'Figure AI가 OpenAI와의 파트너십을 확대하며 범용 휴머노이드 로봇 Figure 02의 대량 생산 계획을 발표했다. 연간 10만 대 생산 체제를 갖추기 위해 20억 달러 규모의 신규 공장을 착공한다.\n\nFigure 02는 자연어 명령을 이해하고 복잡한 물리적 작업을 수행할 수 있어, BMW, Amazon 등 대기업들의 파일럿 프로그램에 투입되고 있다.' },
  { title: 'AI 에이전트 프레임워크 전쟁: LangChain vs CrewAI vs AutoGen', category: 'AI', severity: 'high', tags: ['Agents', 'Framework', 'LangChain'], content: 'AI 에이전트 프레임워크 시장이 급격히 재편되고 있다. LangChain의 LangGraph, Microsoft의 AutoGen, CrewAI의 멀티에이전트 시스템이 주도권을 두고 치열한 경쟁을 벌이고 있다.\n\nGartner에 따르면 2026년 기업의 30%가 AI 에이전트 프레임워크를 도입할 것으로 예측되며, 시장 규모는 연간 80억 달러에 달할 전망이다.\n\n각 프레임워크별 특성이 뚜렷해 LangGraph는 복잡한 워크플로우, AutoGen은 다중 에이전트 대화, CrewAI는 역할 기반 협업에 강점을 보인다.' },
  { title: 'MCP(Model Context Protocol) 표준화, 에이전트 상호운용성 확보', category: 'AI', severity: 'critical', tags: ['MCP', 'Anthropic', 'Protocol'], videoUrl: 'https://www.youtube.com/watch?v=kQmXtrmQ5Zg', originalUrl: 'https://modelcontextprotocol.io', content: 'Anthropic이 개발한 MCP(Model Context Protocol)가 업계 표준으로 빠르게 채택되고 있다. OpenAI, Google, Microsoft 등 주요 AI 기업들이 MCP 지원을 선언하면서 AI 에이전트 간 상호운용성의 새 시대가 열렸다.\n\nMCP는 AI 모델이 외부 도구, 데이터, 서비스와 표준화된 방식으로 통신할 수 있게 하는 오픈 프로토콜이다. USB가 하드웨어 연결을 통일한 것처럼, MCP는 AI 도구 연결을 통일한다.\n\n현재 1,000개 이상의 MCP 서버가 등록되어 있으며, GitHub, Slack, Notion 등 주요 서비스와의 연동이 이미 가능하다.' },
  { title: 'Claude Code 출시, AI 코딩 어시스턴트 패러다임 전환', category: 'AI', severity: 'critical', tags: ['Claude Code', 'Coding', 'Anthropic'], videoUrl: 'https://www.youtube.com/watch?v=eUwX0j6gUGM', originalUrl: 'https://docs.anthropic.com/en/docs/claude-code', content: 'Anthropic이 AI 코딩 어시스턴트 Claude Code를 출시하며 소프트웨어 개발 방식에 패러다임 전환을 일으키고 있다. CLI 기반으로 작동하며, 터미널에서 직접 코드 분석, 수정, 테스트를 자율적으로 수행한다.\n\nClaude Code는 기존 IDE 기반 AI 도우미와 달리 파일 시스템, git, 빌드 도구를 직접 제어하는 에이전틱 방식을 채택했다. SWE-bench Verified에서 72.7%의 해결률을 기록하며 업계 최고 수준을 달성했다.\n\n개발자 커뮤니티에서는 "진정한 AI 페어 프로그래머"라는 평가가 나오고 있으며, 출시 한 달 만에 50만 명의 활성 사용자를 확보했다.' },
  { title: 'GitHub Copilot X 업데이트, 멀티파일 에이전트 모드', category: 'AI', severity: 'high', tags: ['Copilot', 'GitHub', 'Coding'], content: 'GitHub Copilot이 대규모 업데이트를 통해 멀티파일 에이전트 모드를 도입했다. 기존의 단일 파일 자동완성을 넘어, 프로젝트 전체를 이해하고 여러 파일에 걸친 리팩토링과 기능 구현을 자율적으로 수행한다.\n\n새로운 에이전트 모드는 이슈 해결, PR 생성, 코드 리뷰를 자동화하며, 내부 테스트에서 개발자 생산성이 평균 55% 향상된 것으로 나타났다.' },
  { title: 'Cursor AI IDE 기업가치 100억 달러 돌파', category: 'AI', severity: 'high', tags: ['Cursor', 'IDE', 'Coding'], content: 'AI 네이티브 IDE Cursor의 기업가치가 100억 달러를 돌파했다. Series C 라운드에서 4억 달러를 유치하며 AI 코딩 도구 시장의 선두 주자로 자리매김했다.\n\nCursor는 월간 활성 사용자 300만 명을 확보했으며, Fortune 500 기업 중 200개 이상이 기업용 라이선스를 도입했다. 코드 생성뿐 아니라 디버깅, 리팩토링, 테스트 작성 등 개발 전 과정을 AI가 보조한다.' },
  { title: 'NVIDIA H200 AI 칩 대량 출하, 공급 부족 해소', category: 'AI', severity: 'high', tags: ['NVIDIA', 'H200', 'AI Chip'], videoUrl: 'https://www.youtube.com/watch?v=GhRJkfNIqFM', content: 'NVIDIA가 차세대 AI 가속기 H200의 대량 출하를 시작하며 지속되던 AI 칩 공급 부족이 해소 국면에 접어들었다. H200은 H100 대비 1.8배의 AI 추론 성능을 제공하며, HBM3e 메모리를 탑재해 대규모 모델 서빙에 최적화되었다.\n\nMicrosoft, Google, Amazon 등 주요 클라우드 사업자들이 수만 대 규모의 H200 클러스터를 구축 중이며, AI 훈련 비용의 추가적인 하락이 예상된다.' },
  { title: 'Groq LPU 추론 속도 기록 경신, 초당 1000 토큰', category: 'AI', severity: 'medium', tags: ['Groq', 'LPU', 'Inference'], content: 'Groq이 자사 LPU(Language Processing Unit)의 추론 속도 신기록을 세웠다. Llama 4-70B 모델 기준 초당 1,000 토큰 이상의 생성 속도를 달성하며 GPU 대비 10배 이상 빠른 추론을 실현했다.\n\n이는 실시간 대화형 AI 서비스의 사용자 경험을 혁신적으로 개선할 수 있는 수준으로, 음성 비서, 실시간 번역 등의 분야에서 큰 파급력이 예상된다.' },
  { title: 'EU AI Act 벌금 첫 부과, 빅테크 대상', category: 'AI', severity: 'critical', tags: ['EU', 'AI Act', 'Regulation'], content: 'EU가 AI Act에 따른 첫 번째 벌금을 부과했다. 대상은 미국 빅테크 기업으로, 고위험 AI 시스템의 투명성 요구사항을 위반한 혐의로 글로벌 매출의 2%에 해당하는 과징금이 부과되었다.\n\n이번 처분은 AI 규제의 실효성을 보여주는 첫 사례로, 글로벌 AI 기업들의 규제 준수 노력을 가속화할 것으로 전망된다. EU는 향후 6개월 내 추가 조사 결과를 발표할 예정이다.' },
  { title: '중국 AI 규제 강화, 생성형 AI 허가제 도입', category: 'AI', severity: 'high', tags: ['China', 'Regulation', 'GenAI'], content: '중국 정부가 생성형 AI 서비스에 대한 허가제를 도입하며 규제를 대폭 강화했다. 모든 생성형 AI 서비스는 출시 전 정부 심사를 통과해야 하며, 콘텐츠 필터링과 사용자 실명 인증이 의무화되었다.\n\n이는 미국과의 AI 기술 경쟁 속에서도 사회적 안정을 우선시하는 중국의 AI 정책 기조를 반영한다.' },
  { title: 'AI 안전성 연구소 설립 붐, 주요국 10개소 돌파', category: 'AI', severity: 'medium', tags: ['AI Safety', 'Research'], content: '전 세계적으로 AI 안전성 연구소 설립이 가속화되어 주요국에서 10개 이상의 전문 기관이 운영 중이다. 미국 AISI, 영국 DSIT, 일본 AIST, 한국 KAIST AI안전센터 등이 대표적이다.\n\n각 연구소는 AI 모델 평가, 레드팀 테스트, 정렬 연구 등을 수행하며, 국제 협력 네트워크를 통해 연구 결과를 공유하고 있다.' },
  { title: 'Anthropic RLHF 2.0 논문, 정렬 기술 획기적 개선', category: 'AI', severity: 'high', tags: ['RLHF', 'Alignment', 'Safety'], content: 'Anthropic 연구팀이 RLHF(인간 피드백 강화학습) 2.0 논문을 발표하며 AI 정렬 기술의 새로운 이정표를 세웠다. 기존 RLHF의 보상 해킹 문제를 근본적으로 해결하는 새로운 학습 알고리즘을 제안했다.\n\n핵심 혁신은 다중 보상 모델의 앙상블과 과정 기반 감독을 결합한 "Process-RLHF" 방식으로, 모델의 추론 과정 각 단계를 개별적으로 평가하고 보상한다.' },
  { title: 'Waymo 자율주행 서비스 50개 도시 확장', category: 'AI', severity: 'high', tags: ['Waymo', 'Autonomous', 'Driving'], videoUrl: 'https://www.youtube.com/watch?v=aaOB-ErYq6Y', content: 'Waymo가 자율주행 택시 서비스를 미국 50개 도시로 확장한다고 발표했다. 현재 운영 중인 피닉스, 샌프란시스코, 로스앤젤레스에 이어 시카고, 마이애미, 뉴욕 등 대도시로 서비스 지역을 넓힌다.\n\n누적 주행 거리 5억 마일을 돌파한 Waymo는 인간 운전자 대비 85% 낮은 사고율을 기록하며 안전성을 입증했다.' },
  { title: 'Tesla FSD v13 사망사고 0건, 안전성 인정', category: 'AI', severity: 'medium', tags: ['Tesla', 'FSD', 'Autonomous'], content: 'Tesla의 완전자율주행(FSD) v13이 출시 1년간 사망사고 0건을 기록하며 자율주행 기술의 안전성을 입증했다. NHTSA는 공식 조사 결과를 바탕으로 FSD v13의 조건부 레벨 4 승인을 검토 중이다.\n\n누적 10억 마일 이상의 실주행 데이터를 학습한 FSD v13은 비보호 좌회전, 공사 구간, 긴급 차량 대응 등 복잡한 상황에서도 안정적으로 작동한다.' },
  { title: 'AI 생성 음악 빌보드 진입, 저작권 논란 확대', category: 'AI', severity: 'medium', tags: ['AI Music', 'Copyright', 'Creative'], content: 'AI가 생성한 음악이 처음으로 빌보드 Hot 100에 진입하며 음악 산업에 파장을 일으키고 있다. Suno AI로 제작된 팝 트랙이 스트리밍 4,000만 회를 기록하며 78위에 올랐다.\n\n이에 대해 음악 산업 단체들은 AI 생성 음악의 빌보드 차트 진입 자격에 의문을 제기하고 있으며, 미국 저작권청은 AI 생성 콘텐츠의 저작권 보호 범위에 대한 새로운 가이드라인 제정을 서두르고 있다.' },
  { title: 'Sora 2.0 공개, AI 영상 생성 영화 수준 도달', category: 'AI', severity: 'high', tags: ['Sora', 'OpenAI', 'Video'], videoUrl: 'https://www.youtube.com/watch?v=HK6y8DAPN_0', content: 'OpenAI가 텍스트-비디오 AI 모델 Sora 2.0을 공개했다. 최대 5분 길이의 1080p 영상을 생성할 수 있으며, 물리 법칙 준수, 일관된 캐릭터, 카메라 워크 제어 등에서 획기적인 발전을 이뤘다.\n\n할리우드 스튜디오들은 콘셉트 비디오와 스토리보드 제작에 Sora를 도입하기 시작했으며, 독립 영화 제작자들에게는 혁명적 도구로 평가받고 있다.' },
  { title: 'Midjourney V7, 사진과 구별 불가능한 이미지 생성', category: 'AI', severity: 'medium', tags: ['Midjourney', 'Image', 'Creative'], content: 'Midjourney V7이 출시되며 AI 생성 이미지가 실제 사진과 완전히 구별 불가능한 수준에 도달했다. 블라인드 테스트에서 전문 사진가들도 AI 생성 이미지를 판별하지 못했다.\n\n이에 따라 디지털 콘텐츠의 진위 확인 필요성이 급격히 높아지고 있으며, C2PA 표준 기반의 콘텐츠 인증 기술 도입이 가속화되고 있다.' },
  { title: 'AI 개인교사 시스템, 한국 수능 성적 20% 향상 효과', category: 'AI', severity: 'high', tags: ['AI Education', 'Korea', 'Tutor'], content: '한국 교육부가 AI 개인교사 시스템의 파일럿 프로그램 결과를 발표했다. 참여 학생들의 수능 모의고사 성적이 평균 20% 향상되었으며, 특히 수학과 과학 영역에서 두드러진 효과를 보였다.\n\n시스템은 개별 학생의 학습 패턴과 취약점을 AI가 분석하여 맞춤형 학습 경로를 설계하며, 실시간으로 난이도를 조절한다. 교육부는 2027년까지 전국 고등학교에 확대 적용할 계획이다.' },
  { title: 'Khan Academy Khanmigo, 1억 학생 이용', category: 'AI', severity: 'medium', tags: ['Khan Academy', 'Education', 'AI'], content: 'Khan Academy의 AI 튜터 Khanmigo가 전 세계 1억 명의 학생에게 서비스를 제공하고 있다. 소크라테스식 대화 기반의 AI 교육 방식이 효과적이라는 연구 결과가 속속 발표되며, 개발도상국에서의 교육 격차 해소에도 기여하고 있다.' },
  { title: 'Google Med-PaLM 3, 의료 AI 진단 정확도 97%', category: 'AI', severity: 'critical', tags: ['Medical AI', 'Google', 'Diagnosis'], videoUrl: 'https://www.youtube.com/watch?v=saWa26CmGcI', content: 'Google DeepMind의 의료 AI 모델 Med-PaLM 3가 의료 진단 정확도 97%를 달성하며 전문의 수준을 넘어섰다. 방사선 영상 판독, 병리 슬라이드 분석, 임상 노트 해석 등 다양한 의료 업무에서 일관되게 높은 성능을 보였다.\n\nFDA 승인 절차가 진행 중이며, 의사를 대체하는 것이 아니라 보조하는 도구로서 의료 현장에 도입될 예정이다.' },
  { title: 'AI 약물 발견 플랫폼, 신약 후보 1000개 동시 스크리닝', category: 'AI', severity: 'high', tags: ['Drug Discovery', 'Medical AI'], content: 'Insilico Medicine과 Recursion Pharmaceuticals가 AI 기반 약물 발견 플랫폼의 성과를 발표했다. AI가 1,000개의 신약 후보 물질을 동시에 스크리닝하여 임상 진입까지의 기간을 기존 5년에서 1년으로 단축했다.\n\n이 플랫폼은 분자 구조 예측, 독성 평가, 임상 효과 시뮬레이션을 통합적으로 수행한다.' },
  { title: 'PathAI, AI 병리 진단 FDA 승인 확대', category: 'AI', severity: 'medium', tags: ['PathAI', 'FDA', 'Medical'], content: 'AI 병리 진단 기업 PathAI가 FDA로부터 추가 승인을 획득했다. 유방암, 전립선암, 대장암의 AI 보조 진단이 공식 인정되면서, 미국 내 500개 이상의 병원에서 도입이 결정되었다.' },
  { title: 'AI 에이전트 자율 코딩으로 오픈소스 PR 머지율 40% 달성', category: 'AI', severity: 'high', tags: ['Agents', 'Coding', 'Autonomous'], content: 'AI 코딩 에이전트가 오픈소스 프로젝트에서 자율적으로 생성한 PR의 머지 비율이 40%에 도달했다. 이는 1년 전 12%에서 3배 이상 성장한 수치로, AI 에이전트의 코드 품질이 실용적 수준에 도달했음을 보여준다.\n\n특히 버그 수정, 문서 업데이트, 의존성 업그레이드 등 반복적 작업에서는 머지율이 65%에 달한다.' },
  { title: 'OpenAI Swarm 프레임워크, 멀티에이전트 협업 표준', category: 'AI', severity: 'medium', tags: ['Swarm', 'Multi-Agent', 'OpenAI'], content: 'OpenAI가 멀티에이전트 협업 프레임워크 Swarm의 프로덕션 버전을 출시했다. 여러 AI 에이전트가 역할을 분담하고 협력하여 복잡한 작업을 수행하는 시스템을 쉽게 구축할 수 있다.\n\nSwarm은 에이전트 간 핸드오프, 컨텍스트 공유, 충돌 해결 메커니즘을 제공하며, 고객 서비스부터 소프트웨어 개발까지 다양한 도메인에 적용 가능하다.' },
  { title: 'Devin AI 소프트웨어 엔지니어, 실제 프로덕션 배포 성공', category: 'AI', severity: 'high', tags: ['Devin', 'AI Engineer', 'Coding'], videoUrl: 'https://www.youtube.com/watch?v=fjHtjT7GO1c', content: 'Cognition Labs의 AI 소프트웨어 엔지니어 Devin이 실제 기업 환경에서 프로덕션 코드를 성공적으로 배포했다. 요구사항 분석부터 코드 작성, 테스트, 배포까지 전 과정을 자율적으로 수행했다.\n\n현재 Devin은 월간 1,000건 이상의 프로덕션 배포를 수행하고 있으며, 도입 기업들의 개발 속도가 평균 3배 향상된 것으로 보고되었다.' },
  { title: 'Apple Intelligence 2.0, 온디바이스 AI 대폭 강화', category: 'AI', severity: 'high', tags: ['Apple', 'On-Device', 'AI'], videoUrl: 'https://www.youtube.com/watch?v=RXeOiIDNNek', content: 'Apple이 WWDC 2026에서 Apple Intelligence 2.0을 발표했다. M5 칩 기반의 강력한 온디바이스 AI가 사진 편집, 문서 요약, 이메일 작성, Siri 대화 등 모든 영역에서 대폭 강화되었다.\n\n가장 주목받는 기능은 "App Intelligence"로, AI가 사용자의 앱 사용 패턴을 학습하여 자동으로 워크플로우를 제안하고 실행한다.' },
  { title: 'xAI Grok 3, 실시간 뉴스 분석 AI 1위', category: 'AI', severity: 'medium', tags: ['xAI', 'Grok', 'Musk'], content: 'xAI의 Grok 3가 실시간 뉴스 분석과 팩트체크 분야에서 1위를 차지했다. X(구 트위터) 플랫폼의 실시간 데이터를 활용해 뉴스의 진위를 검증하고, 다각적 시각에서 분석을 제공한다.' },
  { title: 'AI 칩 스타트업 Cerebras IPO, 시총 50억 달러', category: 'AI', severity: 'medium', tags: ['Cerebras', 'AI Chip', 'IPO'], content: 'AI 반도체 스타트업 Cerebras Systems가 나스닥에 상장하며 시가총액 50억 달러를 기록했다. 웨이퍼 스케일 엔진(WSE-3)은 세계 최대의 칩으로, 대규모 AI 훈련에서 GPU 클러스터를 대체할 수 있는 대안으로 주목받고 있다.' },
  { title: 'Stability AI, 오픈소스 비디오 모델 공개', category: 'AI', severity: 'medium', tags: ['Stability', 'Open Source', 'Video'], content: 'Stability AI가 오픈소스 비디오 생성 모델 Stable Video Diffusion 3.0을 공개했다. 상용 라이선스로 누구나 사용 가능하며, 30초 길이의 720p 비디오를 소비자급 GPU에서 생성할 수 있다.\n\n이는 Sora와 달리 로컬에서 실행 가능하다는 점에서 독립 크리에이터들에게 큰 호응을 얻고 있다.' },

  // ─── IT (12 templates) ───
  { title: 'Apple M5 Ultra 칩 공개, 온디바이스 LLM 실행', category: 'IT', severity: 'high', tags: ['Apple', 'Chip', 'M5'], videoUrl: 'https://www.youtube.com/watch?v=8F2K8Xqm4hk', content: 'Apple이 M5 Ultra 칩을 공개하며 소비자급 디바이스에서의 LLM 실행이 현실화되었다. 192GB 통합 메모리와 40 TOPS의 Neural Engine을 탑재해 70B 파라미터 모델을 로컬에서 실행할 수 있다.\n\nM5 Ultra를 탑재한 Mac Studio는 클라우드 없이도 엔터프라이즈급 AI 워크로드를 처리할 수 있어, 데이터 프라이버시가 중요한 기업들의 관심이 집중되고 있다.' },
  { title: 'Samsung HBM4 양산 시작, AI 반도체 경쟁 격화', category: 'IT', severity: 'high', tags: ['Samsung', 'HBM4', 'Semiconductor'], content: '삼성전자가 세계 최초로 HBM4 메모리의 양산을 시작했다. 기존 HBM3e 대비 대역폭 2배, 전력 효율 40% 향상을 달성하며 차세대 AI 가속기의 핵심 부품으로 자리매김할 전망이다.\n\nNVIDIA, AMD 등 주요 AI 칩 기업들과의 공급 계약이 확정되었으며, AI 데이터센터 시장에서의 메모리 수요 급증에 대응한다.' },
  { title: 'NVIDIA Blackwell Ultra GPU 공개', category: 'IT', severity: 'critical', tags: ['NVIDIA', 'GPU', 'Blackwell'], videoUrl: 'https://www.youtube.com/watch?v=Bx7neNpMgOI', content: 'NVIDIA가 차세대 AI 가속기 Blackwell Ultra를 GTC 2026에서 공개했다. 4nm 공정 기반으로 이전 Hopper 세대 대비 AI 훈련 성능 4배, 추론 성능 8배 향상을 달성했다.\n\nJensen Huang CEO는 "AI 컴퓨팅의 새로운 시대"를 선언하며, 연간 100만 대 이상의 GPU 출하 목표를 밝혔다.' },
  { title: 'AWS AI 서비스 매출 분기 100억 달러 돌파', category: 'IT', severity: 'medium', tags: ['AWS', 'Cloud'], content: 'Amazon Web Services의 AI 관련 서비스 매출이 분기 100억 달러를 돌파했다. Bedrock, SageMaker, AI 추론 인스턴스 등 AI 전용 서비스의 성장이 주도하고 있다.\n\n이는 전체 AWS 매출의 35%에 해당하며, AI가 클라우드 산업의 핵심 성장 동력임을 보여준다.' },
  { title: 'TSMC 2nm 공정 양산 착수', category: 'IT', severity: 'high', tags: ['TSMC', 'Semiconductor', 'Taiwan'], content: 'TSMC가 2nm 공정의 양산을 시작했다. GAA(Gate-All-Around) 트랜지스터 기술을 적용한 N2 공정은 3nm 대비 성능 15% 향상, 전력 소모 30% 감소를 달성했다.\n\nApple, NVIDIA, AMD 등 주요 고객사가 2nm 제품을 준비 중이며, AI 칩의 에너지 효율 혁신에 기여할 전망이다.' },
  { title: '양자컴퓨터 1000큐비트 달성, IBM 발표', category: 'IT', severity: 'high', tags: ['Quantum', 'IBM'], videoUrl: 'https://www.youtube.com/watch?v=e3Nh9NLRR5M', content: 'IBM이 1,000큐비트 양자 프로세서 Condor를 공개하며 양자 컴퓨팅의 새로운 이정표를 세웠다. 오류율을 0.1% 이하로 억제하는 데 성공하며 실용적 양자 우위 달성에 한 걸음 더 다가섰다.' },
  { title: 'Azure 클라우드 점유율 AWS 추월, AI 수요 덕분', category: 'IT', severity: 'high', tags: ['Azure', 'Cloud', 'Microsoft'], content: 'Microsoft Azure가 클라우드 시장 점유율에서 AWS를 처음으로 추월했다. OpenAI 독점 호스팅과 Azure AI 서비스의 폭발적 성장이 주요 원인이며, 기업의 AI 전환 수요가 Azure 선택의 결정적 요인으로 작용했다.' },
  { title: '5G Advanced 상용화, 다운링크 10Gbps 달성', category: 'IT', severity: 'medium', tags: ['5G', 'Telecom'], content: '5G Advanced(5.5G) 네트워크가 주요 국가에서 상용화되며 다운링크 10Gbps를 달성했다. AI 기반 네트워크 최적화와 밀리미터파 기술의 조합으로 이전 5G 대비 10배 빠른 속도를 제공한다.' },
  { title: '6G 표준화 착수, 2030년 상용화 목표', category: 'IT', severity: 'medium', tags: ['6G', 'Telecom', 'Standard'], content: 'ITU가 6G 기술 표준화 작업을 공식 착수했다. 1Tbps 데이터 전송, 0.1ms 초저지연, AI 네이티브 아키텍처를 목표로 하며, 2030년 상용화를 예정하고 있다.' },
  { title: 'Edge Computing 시장 500억 달러 돌파', category: 'IT', severity: 'medium', tags: ['Edge', 'Computing', 'IoT'], content: '글로벌 Edge Computing 시장 규모가 연간 500억 달러를 돌파했다. AI 추론 워크로드의 엣지 이전, IoT 디바이스 폭증, 데이터 주권 규제가 시장 성장을 주도하고 있다.' },
  { title: 'Meta Quest 4 발표, AR/VR 통합 디바이스', category: 'IT', severity: 'high', tags: ['Meta', 'AR', 'VR'], videoUrl: 'https://www.youtube.com/watch?v=Hf2-pAMSIHE', content: 'Meta가 Quest 4를 발표하며 AR과 VR의 완전한 통합을 실현했다. 고해상도 풀컬러 패스스루와 AI 기반 공간 인식으로 현실과 가상의 경계가 사실상 사라졌다.\n\nAI 비서가 가상 공간에서 사용자와 함께 작업하는 "AI 공간 컴퓨팅" 기능이 주목받고 있다.' },
  { title: 'Hyperledger 3.0 출시, 기업 블록체인 인프라 혁신', category: 'IT', severity: 'medium', tags: ['Blockchain', 'Hyperledger', 'Enterprise'], content: 'Linux Foundation이 Hyperledger 3.0을 출시하며 기업용 블록체인 인프라를 혁신했다. AI 기반 스마트 컨트랙트 감사, 크로스체인 상호운용성, 초당 10만 트랜잭션 처리가 핵심 기능이다.' },

  // ─── WAR / Conflict (8 templates) ───
  { title: '우크라이나 전선 교착 상태, 드론전 격화', category: 'WAR', severity: 'critical', tags: ['Ukraine', 'Russia', 'Drone'], videoUrl: 'https://www.youtube.com/watch?v=2ZBYLIUqmIs', content: '우크라이나-러시아 전쟁이 3년째에 접어들며 전선 교착 상태가 지속되고 있다. 양측 모두 AI 기반 자율 드론을 대량 투입하며 전쟁의 양상이 근본적으로 변화하고 있다.\n\n우크라이나군은 월간 1만 대 이상의 FPV 드론을 운용 중이며, AI 표적 인식 시스템을 적용한 차세대 드론의 실전 배치도 시작했다. 러시아군도 대응하여 AI 재밍 및 요격 시스템을 구축하며 기술 경쟁이 격화되고 있다.' },
  { title: '중동 긴장 고조, 이란-이스라엘 사이버전 확대', category: 'WAR', severity: 'critical', tags: ['Iran', 'Israel', 'Cyber'], content: '이란과 이스라엘 간 사이버 전쟁이 급격히 확대되고 있다. 이란 해커 그룹이 이스라엘 인프라에 대한 대규모 사이버 공격을 감행했으며, 이스라엘 Unit 8200도 반격에 나서며 사이버 공간에서의 충돌이 격화되고 있다.\n\n전문가들은 사이버전이 물리적 군사 충돌의 전조일 수 있다고 경고하며, 중동 전역의 긴장감이 최고조에 달하고 있다.' },
  { title: '대만해협 군사 긴장, 중국 군용기 진입 증가', category: 'WAR', severity: 'high', tags: ['Taiwan', 'China', 'Military'], content: '대만해협의 군사 긴장이 다시 고조되고 있다. 중국 인민해방군 공군의 대만 방공식별구역(ADIZ) 진입 횟수가 전년 대비 60% 증가했으며, 해군 함정의 해협 통과도 빈번해지고 있다.\n\n미국은 대만에 최신 무기 패키지를 승인하며 억지력 강화에 나섰고, 일본과 필리핀도 합동 군사 훈련을 확대하고 있다.' },
  { title: 'NATO AI 군사 전략 회의, 자율무기 규제 논의', category: 'WAR', severity: 'high', tags: ['NATO', 'AI', 'Military'], content: 'NATO 동맹국들이 AI 군사 전략 특별 회의를 개최하여 자율 무기 시스템의 규제 프레임워크를 논의했다. "인간 통제 원칙(Human-in-the-loop)" 유지를 기본으로 하되, AI 보조 의사결정은 허용하는 방향으로 합의가 이루어졌다.' },
  { title: '북한 미사일 발사, 일본 경계 경보 발령', category: 'WAR', severity: 'critical', tags: ['North Korea', 'Missile', 'Japan'], videoUrl: 'https://www.youtube.com/watch?v=1y1e_ASbSIE', content: '북한이 동해상으로 신형 ICBM을 발사하며 역내 긴장이 고조되었다. 일본 정부는 J-Alert를 통해 전국에 경계 경보를 발령했으며, 한미일 3국은 긴급 안보 회의를 소집했다.\n\n발사된 미사일은 사거리 15,000km 이상으로 추정되며, 미 본토를 사정거리에 두는 것으로 분석된다.' },
  { title: '수단 내전 격화, 민간인 피해 급증', category: 'WAR', severity: 'high', tags: ['Sudan', 'Civil War', 'Humanitarian'], content: '수단 내전이 격화되며 민간인 피해가 급증하고 있다. UN에 따르면 실향민이 1,000만 명을 넘어섰으며, 기근 위기에 처한 인구는 2,500만 명에 달한다.\n\n국제사회의 중재 노력에도 불구하고 수단 군부(SAF)와 신속지원군(RSF) 간의 교전은 수도 하르툼을 포함한 전국으로 확산되고 있다.' },
  { title: '남중국해 영유권 분쟁, 필리핀-중국 해상 충돌', category: 'WAR', severity: 'high', tags: ['South China Sea', 'Philippines', 'China'], content: '남중국해에서 필리핀과 중국 해경 간 충돌이 발생하며 영유권 분쟁이 재점화되었다. 중국 해경이 필리핀 보급선에 물대포를 발사하고 차단 기동을 실시하며 긴장이 최고조에 달했다.\n\n미국은 미-필리핀 상호방위조약의 적용을 재확인하며 필리핀을 지지했고, ASEAN 국가들도 항행의 자유를 강조하는 공동 성명을 발표했다.' },
  { title: '러시아 해킹 그룹, NATO 인프라 공격 시도', category: 'WAR', severity: 'critical', tags: ['Russia', 'NATO', 'Cyber War'], content: '러시아 연계 해킹 그룹 APT29가 NATO 회원국의 주요 인프라에 대한 대규모 사이버 공격을 시도했다. 공격 대상에는 전력망, 통신 시스템, 군사 통신 네트워크가 포함되었다.\n\nNATO 사이버방위센터(CCDCOE)가 신속히 대응하여 피해를 최소화했으나, 국가 기반 시설에 대한 사이버 위협의 심각성이 다시 한번 부각되었다.' },

  // ─── STOCK (10 templates) ───
  { title: 'NVIDIA 시가총액 5조 달러 돌파', category: 'STOCK', severity: 'critical', tags: ['NVIDIA', 'Stock', 'Market Cap'], content: 'NVIDIA의 시가총액이 5조 달러를 돌파하며 세계 최대 기업의 자리를 유지하고 있다. AI 데이터센터 GPU 수요의 지속적 성장이 주가 상승을 이끌고 있으며, Blackwell Ultra GPU의 대량 출하가 실적 전망을 더욱 밝게 하고 있다.\n\n월스트리트 애널리스트들은 AI 인프라 투자가 최소 5년간 지속될 것으로 전망하며, NVIDIA의 목표 주가를 연이어 상향 조정하고 있다.' },
  { title: 'Microsoft AI 투자 800억 달러 확대 발표', category: 'STOCK', severity: 'high', tags: ['Microsoft', 'Investment'], content: 'Microsoft가 향후 3년간 AI 인프라에 800억 달러를 투자한다고 발표했다. OpenAI 파트너십 강화, Azure AI 데이터센터 확장, Copilot 생태계 확대가 핵심 투자 영역이다.\n\n이는 AI 시대의 클라우드 인프라 주도권을 확보하기 위한 전략적 투자로, 시장은 긍정적으로 반응하며 주가가 4% 상승했다.' },
  { title: 'S&P 500 사상 최고치 경신', category: 'STOCK', severity: 'medium', tags: ['S&P500', 'Wall Street'], content: 'S&P 500 지수가 사상 최고치를 경신하며 6,200선을 돌파했다. AI 관련 대형 기술주의 실적 호조와 연준의 금리 인하 기대가 상승을 견인했다.\n\nAI 수혜주인 NVIDIA, Microsoft, Alphabet, Meta가 지수 상승을 주도했으며, AI 섹터의 시가총액 비중이 S&P 500 전체의 35%를 차지하고 있다.' },
  { title: '소프트뱅크 AI 인프라에 500억 달러 투자', category: 'STOCK', severity: 'high', tags: ['SoftBank', 'Japan', 'Investment'], content: '소프트뱅크 그룹이 AI 인프라에 500억 달러를 투자한다고 발표했다. 손정의 회장은 "AI가 인류 역사상 가장 큰 혁명"이라며, 데이터센터, AI 칩, 로봇 분야에 집중 투자할 계획을 밝혔다.\n\nARM Holdings 주식 보유분을 담보로 한 대규모 자금 조달도 병행하며, 비전펀드의 AI 포트폴리오를 대폭 확대한다.' },
  { title: '삼성전자 주가 급등, AI 반도체 수혜', category: 'STOCK', severity: 'medium', tags: ['Samsung', 'Korea', 'Stock'], content: '삼성전자 주가가 10% 급등하며 시가총액 500조 원을 회복했다. HBM4 양산 성공과 NVIDIA 공급 계약 확대가 호재로 작용했으며, AI 반도체 시장에서의 경쟁력 회복에 대한 기대가 반영되었다.' },
  { title: 'Apple 분기 실적 서프라이즈, AI 서비스 매출 폭증', category: 'STOCK', severity: 'high', tags: ['Apple', 'Earnings', 'AI'], content: 'Apple의 분기 실적이 시장 예상을 크게 상회했다. Apple Intelligence 기반 서비스 매출이 전년 대비 45% 증가하며 전체 매출의 28%를 차지했다.\n\niPhone AI 기능의 활성 사용자가 10억 명을 돌파했으며, App Store의 AI 앱 매출도 급증하며 새로운 성장 엔진으로 자리매김했다.' },
  { title: 'Anthropic IPO 검토, 기업가치 1500억 달러 추정', category: 'STOCK', severity: 'critical', tags: ['Anthropic', 'IPO', 'AI'], content: 'Anthropic이 IPO를 검토 중이며, 기업가치가 1,500억 달러로 추정된다는 보도가 나왔다. Claude 모델 시리즈의 상업적 성공과 기업 고객 급증이 높은 밸류에이션을 지지하고 있다.\n\n상장이 실현될 경우 AI 분야에서 OpenAI에 이은 두 번째 초대형 IPO가 되며, AI 산업의 투자 심리를 더욱 고취시킬 전망이다.' },
  { title: 'ARM 주가 사상최고, AI 칩 설계 수요 폭증', category: 'STOCK', severity: 'high', tags: ['ARM', 'Chip', 'Stock'], content: 'ARM Holdings의 주가가 사상 최고치를 기록했다. AI 디바이스 확산에 따른 ARM 아키텍처 라이선스 수요 폭증이 원인이며, 로열티 매출이 전년 대비 60% 증가했다.' },
  { title: 'Meta-Alphabet 합병 루머, 시장 충격', category: 'STOCK', severity: 'critical', tags: ['Meta', 'Alphabet', 'Merger'], content: '월스트리트에 Meta와 Alphabet의 합병 가능성에 대한 루머가 퍼지며 시장에 충격을 주고 있다. 두 회사의 합산 시가총액은 5조 달러를 넘으며, AI 및 광고 시장에서의 시너지가 막대할 것으로 분석된다.\n\n다만 반독점 규제의 벽이 매우 높아 현실화 가능성에 대해서는 회의적인 시각이 우세하다.' },
  { title: 'Tesla 실적 부진 우려, 자율주행 기대감으로 반등', category: 'STOCK', severity: 'medium', tags: ['Tesla', 'Earnings', 'Stock'], content: 'Tesla의 분기 자동차 인도량이 시장 예상을 하회하며 주가가 일시적으로 8% 하락했다. 그러나 FSD v13의 안전성 데이터 공개와 로보택시 출시 일정 발표로 주가가 반등하며 낙폭을 대부분 회복했다.' },

  // ─── CRYPTO (9 templates) ───
  { title: 'Bitcoin $150K 돌파, 기관 투자 급증', category: 'CRYPTO', severity: 'critical', tags: ['Bitcoin', 'BTC'], content: '비트코인이 사상 최초로 $150,000을 돌파했다. 비트코인 현물 ETF로의 기관 자금 유입이 지속되고 있으며, BlackRock, Fidelity 등 대형 자산운용사의 비트코인 보유량이 총 공급량의 5%를 넘어섰다.\n\n반감기 효과와 기관 수요의 결합이 강력한 상승 동력으로 작용하고 있으며, 골드만삭스는 연말 목표가를 $200,000으로 상향 조정했다.' },
  { title: 'Ethereum ETF 승인, 기관 자금 유입', category: 'CRYPTO', severity: 'high', tags: ['Ethereum', 'ETF'], content: '이더리움 현물 ETF가 승인되며 기관 투자자들의 자금이 대규모로 유입되고 있다. 승인 첫 주에만 30억 달러의 순유입이 발생했으며, 이더리움 가격은 20% 상승했다.' },
  { title: 'DeFi TVL 사상 최고 $500B 돌파', category: 'CRYPTO', severity: 'medium', tags: ['DeFi', 'TVL'], content: 'DeFi(탈중앙화 금융) 프로토콜의 총 예치금(TVL)이 $500B을 돌파하며 사상 최고치를 기록했다. Aave, Lido, MakerDAO 등 주요 프로토콜이 기관 투자자용 컴플라이언스 기능을 도입한 것이 성장을 견인했다.' },
  { title: 'Solana 네트워크 TPS 신기록 달성', category: 'CRYPTO', severity: 'medium', tags: ['Solana', 'TPS'], content: 'Solana 네트워크가 초당 거래 처리량(TPS) 100,000건의 신기록을 달성했다. Firedancer 클라이언트의 도입으로 네트워크 안정성과 처리량이 크게 향상되었으며, 기관용 DeFi 애플리케이션의 채택이 가속화되고 있다.' },
  { title: 'Uniswap V5 출시, DeFi 프로토콜 혁신', category: 'CRYPTO', severity: 'medium', tags: ['Uniswap', 'DeFi', 'DEX'], content: 'Uniswap V5가 출시되며 분산형 거래소(DEX)의 새로운 표준을 제시했다. 의도 기반 주문(Intent-based orders)과 크로스체인 거래를 네이티브로 지원하며, 중앙화 거래소에 버금가는 사용자 경험을 제공한다.' },
  { title: 'NFT 시장 부활, AI 생성 NFT 거래량 300% 증가', category: 'CRYPTO', severity: 'medium', tags: ['NFT', 'AI', 'Market'], content: 'NFT 시장이 AI 생성 아트를 중심으로 부활하고 있다. AI 생성 NFT의 거래량이 전분기 대비 300% 증가했으며, Midjourney, DALL-E 등의 도구로 제작된 디지털 아트가 주요 거래 대상이 되고 있다.' },
  { title: 'Arbitrum L2 TVL $50B 돌파, 이더리움 확장성 해결', category: 'CRYPTO', severity: 'high', tags: ['Arbitrum', 'Layer2', 'Ethereum'], content: 'Arbitrum의 TVL이 $50B을 돌파하며 이더리움 Layer 2 솔루션의 선두 자리를 굳혔다. 가스비 절감과 빠른 트랜잭션으로 기업용 DeFi 애플리케이션의 기반이 되고 있다.' },
  { title: 'USDC 발행량 사상최고, 스테이블코인 시대 개막', category: 'CRYPTO', severity: 'medium', tags: ['USDC', 'Stablecoin', 'Circle'], content: 'Circle의 USDC 발행량이 사상 최고치를 기록하며 $80B을 돌파했다. 미국 규제 프레임워크 확립과 함께 기관 투자자들의 스테이블코인 채택이 가속화되고 있다.' },
  { title: '미국 암호화폐 규제 프레임워크 최종안 발표', category: 'CRYPTO', severity: 'critical', tags: ['Regulation', 'US', 'Crypto'], content: '미국 의회가 암호화폐 규제 프레임워크 최종안을 발표했다. 디지털 자산의 법적 분류, 거래소 등록 요건, 투자자 보호 규정이 명확히 규정되며, 암호화폐 산업에 대한 법적 불확실성이 크게 해소되었다.\n\n이 법안은 초당적 지지를 받고 있으며, 대통령 서명을 거쳐 6개월 내 시행될 예정이다.' },

  // ─── POLITICS (8 templates) ───
  { title: 'EU AI Act 시행 1년, 기업 규제 준수 현황', category: 'POLITICS', severity: 'high', tags: ['EU', 'AI Act', 'Regulation'], content: 'EU AI Act 시행 1주년을 맞아 기업들의 규제 준수 현황이 발표되었다. Fortune 500 기업의 78%가 AI 시스템 분류 및 위험 평가를 완료했으나, 중소기업의 준수율은 45%에 그쳤다.\n\nEU 집행위는 중소기업 지원을 위한 AI 규제 준수 도구를 무료로 제공하고, 과도기 유예를 6개월 연장하기로 했다.' },
  { title: '한국 AI 기본법 국회 통과', category: 'POLITICS', severity: 'high', tags: ['Korea', 'AI Law'], content: '한국 국회가 AI 기본법을 통과시키며 AI 산업 육성과 규제의 법적 기반을 마련했다. 법안은 AI 기술 분류 체계, 고위험 AI 관리 기준, AI 윤리 원칙, 데이터 활용 규정을 포함한다.\n\nAI 산업 진흥기금 5조 원 조성과 AI 안전성 평가 인프라 구축이 병행되며, 한국의 글로벌 AI 경쟁력 강화에 기여할 전망이다.' },
  { title: '미국 AI 행정명령 업데이트', category: 'POLITICS', severity: 'medium', tags: ['US', 'Executive Order'], content: '미국 대통령이 AI 행정명령의 대규모 업데이트를 발표했다. 핵심 내용은 AI 모델의 의무적 안전성 테스트 강화, AI 생성 콘텐츠의 워터마킹 의무화, 연방 정부의 AI 도입 가속화 등이다.' },
  { title: 'G7 AI 안전성 가이드라인 합의', category: 'POLITICS', severity: 'medium', tags: ['G7', 'Safety'], content: 'G7 정상들이 AI 안전성 국제 가이드라인에 합의했다. 고위험 AI 시스템의 사전 안전성 평가, 국경 간 AI 규제 협력, 오픈소스 AI의 안전한 발전을 위한 공동 프레임워크가 핵심이다.' },
  { title: 'UAE 국가 AI 전략 2030 발표', category: 'POLITICS', severity: 'medium', tags: ['UAE', 'Strategy'], content: 'UAE가 국가 AI 전략 2030을 발표하며 중동의 AI 허브로의 도약을 선언했다. 1,000억 AED(약 270억 달러) 규모의 AI 투자 계획과 함께 AI 특화 경제자유구역 설치, 글로벌 AI 인재 유치 프로그램을 발표했다.' },
  { title: '일본 디지털청, AI 활용 행정 혁신 계획 발표', category: 'POLITICS', severity: 'medium', tags: ['Japan', 'Digital', 'Government'], content: '일본 디지털청이 AI를 활용한 행정 서비스 혁신 3개년 계획을 발표했다. 전 정부 부처에 AI 어시스턴트를 도입하고, 행정 문서의 AI 자동 처리를 의무화한다.\n\n시민 상담, 허가 심사, 정책 분석 등에 AI를 적용하여 행정 효율을 50% 이상 향상시키는 것이 목표다.' },
  { title: '인도 AI 수출규제 완화, 글로벌 아웃소싱 재편', category: 'POLITICS', severity: 'high', tags: ['India', 'AI', 'Trade'], content: '인도 정부가 AI 기술 수출규제를 대폭 완화하며 글로벌 AI 아웃소싱 시장의 재편이 예상된다. 인도의 풍부한 AI 인력과 낮은 인건비가 결합되어 미국, 유럽 기업들의 AI 개발 거점으로 부상하고 있다.' },
  { title: '사우디 NEOM 프로젝트 AI 도시 2단계 착공', category: 'POLITICS', severity: 'medium', tags: ['Saudi', 'NEOM', 'AI City'], content: '사우디아라비아의 NEOM 프로젝트가 AI 도시 건설 2단계에 착수했다. 완전 자율주행 교통 시스템, AI 기반 에너지 관리, 로봇 배송 인프라를 갖춘 미래 도시가 2028년 완공을 목표로 건설 중이다.' },

  // ─── SCIENCE (7 templates) ───
  { title: 'AI 단백질 구조 예측, 신약 개발 기간 단축', category: 'SCIENCE', severity: 'high', tags: ['Protein', 'Drug', 'AlphaFold'], content: 'DeepMind의 AlphaFold 3가 단백질-리간드 복합체의 구조를 원자 수준으로 정확하게 예측하는 데 성공했다. 이로 인해 신약 후보 물질의 스크리닝 기간이 기존 2년에서 2주로 단축되었다.\n\n제약업계에서는 이미 AlphaFold를 활용한 10개 이상의 신약 후보가 임상 시험에 진입했으며, AI 기반 약물 발견의 상업화가 본격적으로 시작되었다.' },
  { title: 'Transformer 대안 아키텍처 Mamba-3 논문', category: 'SCIENCE', severity: 'medium', tags: ['Mamba', 'Architecture'], content: 'CMU와 Princeton 연구팀이 Transformer의 대안인 Mamba-3 아키텍처를 발표했다. Selective State Space Model 기반으로 O(n) 복잡도의 시퀀스 모델링을 실현하며, 1M 토큰 이상의 초장문 처리에서 Transformer를 크게 능가한다.\n\n다만 짧은 시퀀스에서는 여전히 Transformer가 우위를 보여, 하이브리드 아키텍처가 차세대 표준이 될 것이라는 전망도 나오고 있다.' },
  { title: '핵융합 발전 상용화 10년 내 가능 전망', category: 'SCIENCE', severity: 'high', tags: ['Fusion', 'Energy'], videoUrl: 'https://www.youtube.com/watch?v=mE72gFMPbas', content: 'Commonwealth Fusion Systems가 초전도 자석 기반 토카막 SPARC의 플라즈마 점화에 성공하며, 핵융합 발전의 상용화가 10년 내 가능하다는 전망이 현실화되고 있다.\n\n핵융합은 무한한 청정 에너지원으로, 성공적인 상용화는 글로벌 에너지 위기와 기후 변화를 동시에 해결할 수 있는 열쇠가 될 것이다.' },
  { title: 'NASA 화성 샘플 회수 미션 착수', category: 'SCIENCE', severity: 'medium', tags: ['NASA', 'Mars'], videoUrl: 'https://www.youtube.com/watch?v=gm0b_ijaYMQ', content: 'NASA가 화성 표면 샘플 회수 미션(MSR)을 공식 착수했다. Perseverance 로버가 수집한 토양 및 암석 샘플을 지구로 운반하는 이 미션은 2031년 완료를 목표로 한다.\n\n화성 샘플의 지구 귀환이 성공하면 화성 생명체의 존재 여부에 대한 결정적 증거를 확보할 수 있을 것으로 기대된다.' },
  { title: 'CRISPR 3.0 유전자 편집, 유전병 치료 임상 3상 성공', category: 'SCIENCE', severity: 'high', tags: ['CRISPR', 'Gene', 'Medicine'], content: '차세대 유전자 편집 기술 CRISPR 3.0(Prime Editing)의 임상 3상이 성공적으로 완료되었다. 겸상적혈구 빈혈과 베타 지중해 빈혈 환자의 97%에서 질병 완치가 확인되었다.\n\nFDA의 신속 승인 절차가 진행 중이며, 수천 종의 유전질환 치료의 길이 열리고 있다.' },
  { title: '제임스 웹 망원경, 외계 대기 산소 검출', category: 'SCIENCE', severity: 'critical', tags: ['JWST', 'Exoplanet', 'NASA'], videoUrl: 'https://www.youtube.com/watch?v=4P8fKd0IVOs', content: 'NASA의 제임스 웹 우주 망원경(JWST)이 40광년 떨어진 외계 행성 TRAPPIST-1e의 대기에서 산소 분자를 검출했다. 이는 외계 생명체의 존재를 시사하는 가장 강력한 증거로, 천문학계에 큰 파장을 일으키고 있다.\n\n연구팀은 추가 분광 관측을 통해 메탄과 이산화탄소의 존재도 확인했으며, 이는 생물학적 과정의 지표가 될 수 있다.' },
  { title: '초전도체 상온 연구 재현 성공 논란', category: 'SCIENCE', severity: 'high', tags: ['Superconductor', 'Physics'], content: '미국 로체스터대 연구팀이 상온(21°C) 초전도체 실험의 재현에 성공했다고 발표하며 물리학계가 다시 술렁이고 있다. 수소화 루테튬 화합물에서 170 GPa 압력 하에 초전도 현상을 관측했다고 주장했다.\n\n그러나 독립적 검증이 아직 완료되지 않아 학계의 반응은 신중한 편이다.' },

  // ─── STARTUP (8 templates) ───
  { title: 'Perplexity AI 기업 가치 90억 달러 달성', category: 'STARTUP', severity: 'high', tags: ['Perplexity', 'Unicorn'], content: 'AI 검색 스타트업 Perplexity AI의 기업가치가 90억 달러에 달했다. "AI 네이티브 검색"을 표방하며 구글의 검색 독점에 도전하고 있으며, 월간 활성 사용자 1억 명을 돌파했다.\n\n실시간 웹 탐색과 AI 요약을 결합한 서비스로, 정보 검색의 패러다임을 바꾸고 있다는 평가를 받고 있다.' },
  { title: 'Cursor, 월간 활성 사용자 500만 돌파', category: 'STARTUP', severity: 'medium', tags: ['Cursor', 'Coding'], content: 'AI 코딩 IDE Cursor의 월간 활성 사용자가 500만 명을 돌파했다. VS Code 기반의 익숙한 인터페이스에 강력한 AI 코딩 기능을 결합한 전략이 주효했다.\n\nPro 구독자는 100만 명을 넘었으며, 연간 반복 수익(ARR)이 3억 달러를 기록하고 있다.' },
  { title: 'AI 비디오 생성 스타트업 Runway IPO 검토', category: 'STARTUP', severity: 'medium', tags: ['Runway', 'Video', 'IPO'], content: 'AI 비디오 생성 스타트업 Runway가 IPO를 검토 중이다. 기업가치 40억 달러로 추정되며, Gen-3 모델의 상용화 성공이 높은 밸류에이션을 지지하고 있다.' },
  { title: '브라질 AI 헬스케어 스타트업 시리즈 B 유치', category: 'STARTUP', severity: 'low', tags: ['Brazil', 'Healthcare'], content: '브라질 상파울루 기반 AI 헬스케어 스타트업 MedIA가 시리즈 B에서 5,000만 달러를 유치했다. AI 기반 원격 진료와 진단 보조 시스템으로 라틴아메리카 의료 접근성 향상에 기여하고 있다.' },
  { title: 'Mistral AI 시리즈 C 유치, 유럽 최대 AI 펀딩', category: 'STARTUP', severity: 'high', tags: ['Mistral', 'Funding', 'Europe'], content: 'Mistral AI가 시리즈 C에서 12억 달러를 유치하며 유럽 AI 스타트업 사상 최대 규모의 펀딩을 기록했다. 기업가치는 65억 달러로 평가되었다.\n\n프랑스 정부의 전략적 지원과 유럽 데이터 주권에 대한 수요가 투자를 이끌었다.' },
  { title: '인도 AI SaaS 스타트업 유니콘 등극', category: 'STARTUP', severity: 'medium', tags: ['India', 'SaaS', 'Unicorn'], content: '인도 방갈로르 기반 AI SaaS 스타트업 Turing이 유니콘 기업으로 등극했다. AI 기반 소프트웨어 개발 아웃소싱 플랫폼으로, 전 세계 3만 명 이상의 개발자 네트워크를 운영하고 있다.' },
  { title: '나이지리아 핀테크 AI 스타트업, 아프리카 확장', category: 'STARTUP', severity: 'low', tags: ['Nigeria', 'Fintech', 'Africa'], content: '나이지리아 라고스 기반 AI 핀테크 스타트업 Moniepoint가 아프리카 10개국으로 서비스를 확장한다. AI 기반 신용 평가와 모바일 결제 시스템으로 금융 소외 계층의 금융 접근성을 혁신하고 있다.' },
  { title: '한국 AI 로보틱스 스타트업 글로벌 시장 진출', category: 'STARTUP', severity: 'medium', tags: ['Korea', 'Robotics', 'Startup'], content: '한국 AI 로보틱스 스타트업 두산로보틱스와 레인보우로보틱스가 미국과 유럽 시장에 본격 진출한다. 협동 로봇에 AI 비전과 자연어 인터페이스를 결합한 제품으로, 글로벌 제조업 자동화 시장을 공략한다.' },

  // ─── CYBER (7 templates) ───
  { title: '국가 기반 APT 그룹, AI 시스템 공격 급증', category: 'CYBER', severity: 'critical', tags: ['APT', 'AI Security'], content: '국가 후원 해킹 그룹의 AI 시스템 공격이 급증하고 있다. AI 모델 탈취, 학습 데이터 오염, 프롬프트 인젝션 공격이 주요 공격 벡터로 부상하며, AI 보안이 새로운 사이버 보안 과제로 떠오르고 있다.\n\nMITRE는 AI 보안 위협을 체계화한 ATLAS 프레임워크를 업데이트하고, AI 시스템의 보안 평가 기준을 발표했다.' },
  { title: '대규모 데이터 유출 사고, 2억 건 개인정보', category: 'CYBER', severity: 'critical', tags: ['Data Breach', 'Privacy'], content: '글로벌 소셜 미디어 플랫폼에서 2억 건 이상의 개인정보가 유출되는 대규모 사고가 발생했다. 이름, 이메일, 전화번호, 위치 데이터가 포함되어 있으며, 다크웹에서 이미 거래되고 있는 것으로 확인되었다.\n\n이번 사고는 API 인증 취약점을 악용한 것으로, 모든 IT 기업의 API 보안 점검 필요성이 다시 한번 부각되었다.' },
  { title: 'AI 기반 피싱 공격 300% 증가', category: 'CYBER', severity: 'high', tags: ['Phishing', 'AI'], content: 'AI를 활용한 피싱 공격이 전년 대비 300% 증가했다. 딥페이크 음성으로 CEO를 사칭하는 비싱(Vishing), AI가 작성한 맞춤형 피싱 이메일 등 고도화된 수법이 기업 보안을 위협하고 있다.\n\n기존 스팸 필터로는 탐지가 어려워, AI 기반 방어 시스템의 도입이 시급한 상황이다.' },
  { title: 'Zero-day 취약점 발견, 주요 클라우드 서비스 영향', category: 'CYBER', severity: 'critical', tags: ['Zero-day', 'Cloud'], content: '주요 클라우드 서비스에 영향을 미치는 심각한 제로데이 취약점이 발견되었다. 커널 수준의 권한 상승 취약점으로, 악용 시 테넌트 간 격리를 우회하여 다른 고객의 데이터에 접근할 수 있다.\n\n클라우드 제공업체들은 긴급 패치를 배포했으며, 현재까지 실제 공격 사례는 확인되지 않았다.' },
  { title: '랜섬웨어 공격 병원 마비, AI 방어 시스템 도입 확대', category: 'CYBER', severity: 'critical', tags: ['Ransomware', 'Hospital', 'AI Defense'], content: '유럽 대형 병원 체인이 랜섬웨어 공격을 받아 시스템이 마비되었다. 환자 기록 접근이 불가능해지며 수술이 취소되는 등 심각한 피해가 발생했다.\n\n이 사건을 계기로 의료 기관의 AI 기반 사이버 보안 시스템 도입이 급증하고 있으며, 각국 정부도 의료 인프라 보안 규제를 강화하고 있다.' },
  { title: 'AI 딥페이크 범죄 급증, 글로벌 공조 강화', category: 'CYBER', severity: 'high', tags: ['Deepfake', 'Crime', 'AI'], content: 'AI 딥페이크 기술을 이용한 범죄가 급증하며 글로벌 공조가 강화되고 있다. 금융 사기, 명예훼손, 선거 개입 등 다양한 범죄에 딥페이크가 악용되고 있으며, 탐지 기술과의 공방이 치열해지고 있다.' },
  { title: '양자암호 통신 상용화 첫 단계, 해킹 불가 네트워크', category: 'CYBER', severity: 'medium', tags: ['Quantum Crypto', 'Security'], content: '양자암호 통신(QKD)의 상용화 첫 단계가 시작되었다. 한국, 중국, 유럽 등에서 양자 보안 네트워크 구축이 진행 중이며, 양자 컴퓨터 시대에도 안전한 통신을 보장하는 기술로 주목받고 있다.' },

  // ─── CLIMATE (6 templates) ───
  { title: 'AI 기반 기후 예측 모델, 정확도 95% 달성', category: 'CLIMATE', severity: 'medium', tags: ['Climate', 'AI', 'Prediction'], content: 'Google DeepMind의 기후 예측 AI 모델 GraphCast의 정확도가 95%에 달했다. 기존 수치 기상 모델 대비 100배 빠른 속도로 10일 간의 날씨를 예측하며, 극단적 기상 현상 예보의 정확도도 크게 향상되었다.' },
  { title: '글로벌 탄소 배출 감소 목표 미달 경고', category: 'CLIMATE', severity: 'high', tags: ['Carbon', 'Emission'], content: 'UN 환경 프로그램(UNEP)이 글로벌 탄소 배출 감소가 파리 협약 목표에 크게 미달하고 있다고 경고했다. 현재 추세가 지속될 경우 2100년까지 2.9°C 상승이 예상되며, 1.5°C 목표 달성은 사실상 불가능하다는 분석이다.' },
  { title: 'AI 에너지 소비 급증, 데이터센터 탄소 문제', category: 'CLIMATE', severity: 'high', tags: ['AI', 'Energy', 'Datacenter'], content: 'AI 데이터센터의 에너지 소비가 급증하며 탄소 배출 문제가 심화되고 있다. IEA에 따르면 글로벌 데이터센터 전력 소비가 2026년까지 1,000TWh를 넘어설 전망이며, 이는 일본 전체 전력 소비에 맞먹는 규모다.\n\n빅테크 기업들은 원자력, 지열 등 탄소 제로 에너지원 확보에 나서고 있다.' },
  { title: '아마존 열대우림 AI 모니터링 시스템 가동', category: 'CLIMATE', severity: 'medium', tags: ['Amazon', 'AI', 'Forest'], content: '브라질 정부가 AI 기반 아마존 열대우림 모니터링 시스템을 가동했다. 위성 이미지와 드론 데이터를 AI가 실시간으로 분석하여 불법 벌채를 탐지하고, 자동으로 당국에 경보를 발송한다.' },
  { title: '북극 빙하 AI 관측, 2030년 소멸 예측 상향', category: 'CLIMATE', severity: 'critical', tags: ['Arctic', 'Ice', 'AI'], videoUrl: 'https://www.youtube.com/watch?v=qo3yczWeA7Q', content: 'AI 기반 북극 빙하 모니터링 시스템이 여름철 북극해 빙하가 2030년 이전에 완전 소멸할 수 있다는 예측을 내놓았다. 이는 기존 IPCC 예측보다 10년 이상 앞당겨진 것이다.\n\n빙하 소멸은 해수면 상승, 해류 변화, 극단적 기상 현상 증가 등 연쇄적 기후 재앙을 야기할 수 있다.' },
  { title: 'AI 최적화 전력망, 재생에너지 효율 30% 향상', category: 'CLIMATE', severity: 'medium', tags: ['AI', 'Renewable', 'Grid'], content: 'AI 최적화 전력망 관리 시스템이 재생에너지의 효율을 30% 향상시키는 데 성공했다. 태양광과 풍력의 변동성을 AI가 예측하고 에너지 저장 장치를 최적화하여 안정적인 전력 공급을 실현하고 있다.' },
]

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function pickWeighted(): EventTemplate {
  const useAI = Math.random() < 0.4
  if (useAI) {
    const aiTemplates = EVENT_TEMPLATES.filter((t) => t.category === 'AI')
    return pick(aiTemplates)
  }
  const nonAI = EVENT_TEMPLATES.filter((t) => t.category !== 'AI')
  return pick(nonAI)
}

function generateArticles(): readonly NewsArticle[] {
  const now = Date.now()
  const count = 100 + Math.floor(Math.random() * 30)
  const used = new Set<string>()
  const articles: NewsArticle[] = []

  for (let i = 0; i < count; i++) {
    let template = pickWeighted()
    let attempts = 0
    while (used.has(template.title) && attempts < 20) {
      template = pickWeighted()
      attempts++
    }
    used.add(template.title)

    const source = pick(SOURCES)
    const hoursAgo = Math.floor(Math.random() * 72)

    const baseUrl = SOURCE_URLS[source.name] || 'https://news.example.com'
    const originalUrl = template.originalUrl || `${baseUrl}/article/${i}`

    articles.push({
      id: `evt-${i}-${now}`,
      title: template.title,
      summary: template.content.split('\n\n')[0] ?? template.title,
      content: template.content,
      source: source.name,
      url: '#',
      originalUrl,
      category: template.category,
      severity: template.severity,
      publishedAt: new Date(now - hoursAgo * 3600000).toISOString(),
      saved: false,
      location: source.location,
      videoUrl: template.videoUrl,
      tags: [...template.tags],
    })
  }

  return articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export async function GET() {
  return NextResponse.json({
    articles: generateArticles(),
    savedArticles: [],
    lastUpdated: new Date().toISOString(),
  })
}
