import { NextResponse } from 'next/server'
import type { NewsArticle, EventCategory, NewsSeverity, NewsLocation } from '@/types/news'

export const dynamic = 'force-dynamic'

interface SourceDef {
  readonly name: string
  readonly location: NewsLocation
}

const SOURCES: readonly SourceDef[] = [
  // USA
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

  // Europe
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

  // Asia
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

  // Middle East
  { name: 'Al Jazeera', location: { country: 'UAE', countryCode: 'AE', lat: 25.20, lng: 55.27, city: 'Dubai' } },
  { name: 'Haaretz', location: { country: '이스라엘', countryCode: 'IL', lat: 32.07, lng: 34.77, city: 'Tel Aviv' } },
  { name: 'Arab News', location: { country: '사우디', countryCode: 'SA', lat: 24.71, lng: 46.68, city: 'Riyadh' } },
  { name: 'Tehran Times', location: { country: '이란', countryCode: 'IR', lat: 35.69, lng: 51.39, city: 'Tehran' } },
  { name: 'Daily Sabah', location: { country: '터키', countryCode: 'TR', lat: 41.01, lng: 28.98, city: 'Istanbul' } },

  // Africa
  { name: 'Punch Nigeria', location: { country: '나이지리아', countryCode: 'NG', lat: 6.52, lng: 3.38, city: 'Lagos' } },
  { name: 'Nation Media', location: { country: '케냐', countryCode: 'KE', lat: -1.29, lng: 36.82, city: 'Nairobi' } },
  { name: 'Al-Ahram', location: { country: '이집트', countryCode: 'EG', lat: 30.04, lng: 31.24, city: 'Cairo' } },
  { name: 'Daily Maverick', location: { country: '남아공', countryCode: 'ZA', lat: -33.93, lng: 18.42, city: 'Cape Town' } },

  // South America
  { name: 'Folha de São Paulo', location: { country: '브라질', countryCode: 'BR', lat: -23.55, lng: -46.63, city: 'São Paulo' } },
  { name: 'Globo', location: { country: '브라질', countryCode: 'BR', lat: -22.91, lng: -43.17, city: 'Rio de Janeiro' } },
  { name: 'Clarín', location: { country: '아르헨티나', countryCode: 'AR', lat: -34.60, lng: -58.38, city: 'Buenos Aires' } },
  { name: 'El Universal', location: { country: '멕시코', countryCode: 'MX', lat: 19.43, lng: -99.13, city: 'Mexico City' } },
  { name: 'La Tercera', location: { country: '칠레', countryCode: 'CL', lat: -33.45, lng: -70.67, city: 'Santiago' } },
  { name: 'El Tiempo', location: { country: '콜롬비아', countryCode: 'CO', lat: 4.71, lng: -74.07, city: 'Bogota' } },

  // Oceania & Canada
  { name: 'ABC Australia', location: { country: '호주', countryCode: 'AU', lat: -33.87, lng: 151.21, city: 'Sydney' } },
  { name: 'Maple News', location: { country: '캐나다', countryCode: 'CA', lat: 43.65, lng: -79.38, city: 'Toronto' } },
]

interface EventTemplate {
  readonly title: string
  readonly category: EventCategory
  readonly severity: NewsSeverity
  readonly tags: readonly string[]
  readonly videoUrl?: string
}

const EVENT_TEMPLATES: readonly EventTemplate[] = [
  // ─── AI (35+ templates) ───
  { title: 'GPT-5 벤치마크 결과 공개: 추론 능력 대폭 향상', category: 'AI', severity: 'critical', tags: ['GPT-5', 'OpenAI', 'LLM'], videoUrl: 'https://www.youtube.com/watch?v=Lp7E973zozc' },
  { title: 'Claude 4.6 출시, 200K 컨텍스트 윈도우 지원', category: 'AI', severity: 'critical', tags: ['Claude', 'Anthropic', 'LLM'], videoUrl: 'https://www.youtube.com/watch?v=jV8B24rSN5o' },
  { title: 'Google Gemini Ultra 2.0 발표, 멀티모달 1위', category: 'AI', severity: 'high', tags: ['Gemini', 'Google', 'Multimodal'], videoUrl: 'https://www.youtube.com/watch?v=UIZAiXYceBI' },
  { title: 'Llama 4 오픈소스 공개, 커뮤니티 반응 폭발적', category: 'AI', severity: 'high', tags: ['Llama', 'Meta', 'Open Source'] },
  { title: 'DeepMind CEO: "AGI 5년 내 달성 가능"', category: 'AI', severity: 'high', tags: ['AGI', 'DeepMind'] },
  { title: 'Mistral Large 새 버전, 유럽 AI 경쟁력 강화', category: 'AI', severity: 'medium', tags: ['Mistral', 'EU'] },
  { title: 'Anthropic Constitutional AI 2.0 발표', category: 'AI', severity: 'high', tags: ['Anthropic', 'Safety'], videoUrl: 'https://www.youtube.com/watch?v=bIrEM2FbOLU' },
  { title: '바이두 Ernie 5.0, 중국어 벤치마크 압도적', category: 'AI', severity: 'medium', tags: ['Baidu', 'China', 'LLM'] },
  { title: 'KAIST 연구팀, 새로운 어텐션 메커니즘 제안', category: 'AI', severity: 'medium', tags: ['KAIST', 'Research', 'Korea'] },
  { title: 'Tesla Optimus Gen 3, 공장 투입 시작', category: 'AI', severity: 'high', tags: ['Tesla', 'Robotics'], videoUrl: 'https://www.youtube.com/watch?v=cpraXaw7dyc' },
  { title: 'Figure AI, 휴머노이드 로봇 대량 생산 계획', category: 'AI', severity: 'medium', tags: ['Figure', 'Robotics'], videoUrl: 'https://www.youtube.com/watch?v=Q5MKo3wnB8E' },
  { title: 'AI 에이전트 프레임워크 전쟁: LangChain vs CrewAI vs AutoGen', category: 'AI', severity: 'high', tags: ['Agents', 'Framework', 'LangChain'] },
  { title: 'MCP(Model Context Protocol) 표준화, 에이전트 상호운용성 확보', category: 'AI', severity: 'critical', tags: ['MCP', 'Anthropic', 'Protocol'], videoUrl: 'https://www.youtube.com/watch?v=kQmXtrmQ5Zg' },
  { title: 'Claude Code 출시, AI 코딩 어시스턴트 패러다임 전환', category: 'AI', severity: 'critical', tags: ['Claude Code', 'Coding', 'Anthropic'], videoUrl: 'https://www.youtube.com/watch?v=eUwX0j6gUGM' },
  { title: 'GitHub Copilot X 업데이트, 멀티파일 에이전트 모드', category: 'AI', severity: 'high', tags: ['Copilot', 'GitHub', 'Coding'] },
  { title: 'Cursor AI IDE 기업가치 100억 달러 돌파', category: 'AI', severity: 'high', tags: ['Cursor', 'IDE', 'Coding'] },
  { title: 'NVIDIA H200 AI 칩 대량 출하, 공급 부족 해소', category: 'AI', severity: 'high', tags: ['NVIDIA', 'H200', 'AI Chip'], videoUrl: 'https://www.youtube.com/watch?v=GhRJkfNIqFM' },
  { title: 'Groq LPU 추론 속도 기록 경신, 초당 1000 토큰', category: 'AI', severity: 'medium', tags: ['Groq', 'LPU', 'Inference'] },
  { title: 'EU AI Act 벌금 첫 부과, 빅테크 대상', category: 'AI', severity: 'critical', tags: ['EU', 'AI Act', 'Regulation'] },
  { title: '중국 AI 규제 강화, 생성형 AI 허가제 도입', category: 'AI', severity: 'high', tags: ['China', 'Regulation', 'GenAI'] },
  { title: 'AI 안전성 연구소 설립 붐, 주요국 10개소 돌파', category: 'AI', severity: 'medium', tags: ['AI Safety', 'Research'] },
  { title: 'Anthropic RLHF 2.0 논문, 정렬 기술 획기적 개선', category: 'AI', severity: 'high', tags: ['RLHF', 'Alignment', 'Safety'] },
  { title: 'Waymo 자율주행 서비스 50개 도시 확장', category: 'AI', severity: 'high', tags: ['Waymo', 'Autonomous', 'Driving'], videoUrl: 'https://www.youtube.com/watch?v=aaOB-ErYq6Y' },
  { title: 'Tesla FSD v13 사망사고 0건, 안전성 인정', category: 'AI', severity: 'medium', tags: ['Tesla', 'FSD', 'Autonomous'] },
  { title: 'AI 생성 음악 빌보드 진입, 저작권 논란 확대', category: 'AI', severity: 'medium', tags: ['AI Music', 'Copyright', 'Creative'] },
  { title: 'Sora 2.0 공개, AI 영상 생성 영화 수준 도달', category: 'AI', severity: 'high', tags: ['Sora', 'OpenAI', 'Video'], videoUrl: 'https://www.youtube.com/watch?v=HK6y8DAPN_0' },
  { title: 'Midjourney V7, 사진과 구별 불가능한 이미지 생성', category: 'AI', severity: 'medium', tags: ['Midjourney', 'Image', 'Creative'] },
  { title: 'AI 개인교사 시스템, 한국 수능 성적 20% 향상 효과', category: 'AI', severity: 'high', tags: ['AI Education', 'Korea', 'Tutor'] },
  { title: 'Khan Academy Khanmigo, 1억 학생 이용', category: 'AI', severity: 'medium', tags: ['Khan Academy', 'Education', 'AI'] },
  { title: 'Google Med-PaLM 3, 의료 AI 진단 정확도 97%', category: 'AI', severity: 'critical', tags: ['Medical AI', 'Google', 'Diagnosis'], videoUrl: 'https://www.youtube.com/watch?v=saWa26CmGcI' },
  { title: 'AI 약물 발견 플랫폼, 신약 후보 1000개 동시 스크리닝', category: 'AI', severity: 'high', tags: ['Drug Discovery', 'Medical AI'] },
  { title: 'PathAI, AI 병리 진단 FDA 승인 확대', category: 'AI', severity: 'medium', tags: ['PathAI', 'FDA', 'Medical'] },
  { title: 'AI 에이전트 자율 코딩으로 오픈소스 PR 머지율 40% 달성', category: 'AI', severity: 'high', tags: ['Agents', 'Coding', 'Autonomous'] },
  { title: 'OpenAI Swarm 프레임워크, 멀티에이전트 협업 표준', category: 'AI', severity: 'medium', tags: ['Swarm', 'Multi-Agent', 'OpenAI'] },
  { title: 'Devin AI 소프트웨어 엔지니어, 실제 프로덕션 배포 성공', category: 'AI', severity: 'high', tags: ['Devin', 'AI Engineer', 'Coding'], videoUrl: 'https://www.youtube.com/watch?v=fjHtjT7GO1c' },
  { title: 'Apple Intelligence 2.0, 온디바이스 AI 대폭 강화', category: 'AI', severity: 'high', tags: ['Apple', 'On-Device', 'AI'], videoUrl: 'https://www.youtube.com/watch?v=RXeOiIDNNek' },
  { title: 'xAI Grok 3, 실시간 뉴스 분석 AI 1위', category: 'AI', severity: 'medium', tags: ['xAI', 'Grok', 'Musk'] },
  { title: 'AI 칩 스타트업 Cerebras IPO, 시총 50억 달러', category: 'AI', severity: 'medium', tags: ['Cerebras', 'AI Chip', 'IPO'] },
  { title: 'Stability AI, 오픈소스 비디오 모델 공개', category: 'AI', severity: 'medium', tags: ['Stability', 'Open Source', 'Video'] },

  // ─── IT (12 templates) ───
  { title: 'Apple M5 Ultra 칩 공개, 온디바이스 LLM 실행', category: 'IT', severity: 'high', tags: ['Apple', 'Chip', 'M5'], videoUrl: 'https://www.youtube.com/watch?v=8F2K8Xqm4hk' },
  { title: 'Samsung HBM4 양산 시작, AI 반도체 경쟁 격화', category: 'IT', severity: 'high', tags: ['Samsung', 'HBM4', 'Semiconductor'] },
  { title: 'NVIDIA Blackwell Ultra GPU 공개', category: 'IT', severity: 'critical', tags: ['NVIDIA', 'GPU', 'Blackwell'], videoUrl: 'https://www.youtube.com/watch?v=Bx7neNpMgOI' },
  { title: 'AWS AI 서비스 매출 분기 100억 달러 돌파', category: 'IT', severity: 'medium', tags: ['AWS', 'Cloud'] },
  { title: 'TSMC 2nm 공정 양산 착수', category: 'IT', severity: 'high', tags: ['TSMC', 'Semiconductor', 'Taiwan'] },
  { title: '양자컴퓨터 1000큐비트 달성, IBM 발표', category: 'IT', severity: 'high', tags: ['Quantum', 'IBM'], videoUrl: 'https://www.youtube.com/watch?v=e3Nh9NLRR5M' },
  { title: 'Azure 클라우드 점유율 AWS 추월, AI 수요 덕분', category: 'IT', severity: 'high', tags: ['Azure', 'Cloud', 'Microsoft'] },
  { title: '5G Advanced 상용화, 다운링크 10Gbps 달성', category: 'IT', severity: 'medium', tags: ['5G', 'Telecom'] },
  { title: '6G 표준화 착수, 2030년 상용화 목표', category: 'IT', severity: 'medium', tags: ['6G', 'Telecom', 'Standard'] },
  { title: 'Edge Computing 시장 500억 달러 돌파', category: 'IT', severity: 'medium', tags: ['Edge', 'Computing', 'IoT'] },
  { title: 'Meta Quest 4 발표, AR/VR 통합 디바이스', category: 'IT', severity: 'high', tags: ['Meta', 'AR', 'VR'], videoUrl: 'https://www.youtube.com/watch?v=Hf2-pAMSIHE' },
  { title: 'Hyperledger 3.0 출시, 기업 블록체인 인프라 혁신', category: 'IT', severity: 'medium', tags: ['Blockchain', 'Hyperledger', 'Enterprise'] },

  // ─── WAR / Conflict (8 templates) ───
  { title: '우크라이나 전선 교착 상태, 드론전 격화', category: 'WAR', severity: 'critical', tags: ['Ukraine', 'Russia', 'Drone'], videoUrl: 'https://www.youtube.com/watch?v=2ZBYLIUqmIs' },
  { title: '중동 긴장 고조, 이란-이스라엘 사이버전 확대', category: 'WAR', severity: 'critical', tags: ['Iran', 'Israel', 'Cyber'] },
  { title: '대만해협 군사 긴장, 중국 군용기 진입 증가', category: 'WAR', severity: 'high', tags: ['Taiwan', 'China', 'Military'] },
  { title: 'NATO AI 군사 전략 회의, 자율무기 규제 논의', category: 'WAR', severity: 'high', tags: ['NATO', 'AI', 'Military'] },
  { title: '북한 미사일 발사, 일본 경계 경보 발령', category: 'WAR', severity: 'critical', tags: ['North Korea', 'Missile', 'Japan'], videoUrl: 'https://www.youtube.com/watch?v=1y1e_ASbSIE' },
  { title: '수단 내전 격화, 민간인 피해 급증', category: 'WAR', severity: 'high', tags: ['Sudan', 'Civil War', 'Humanitarian'] },
  { title: '남중국해 영유권 분쟁, 필리핀-중국 해상 충돌', category: 'WAR', severity: 'high', tags: ['South China Sea', 'Philippines', 'China'] },
  { title: '러시아 해킹 그룹, NATO 인프라 공격 시도', category: 'WAR', severity: 'critical', tags: ['Russia', 'NATO', 'Cyber War'] },

  // ─── STOCK (10 templates) ───
  { title: 'NVIDIA 시가총액 5조 달러 돌파', category: 'STOCK', severity: 'critical', tags: ['NVIDIA', 'Stock', 'Market Cap'] },
  { title: 'Microsoft AI 투자 800억 달러 확대 발표', category: 'STOCK', severity: 'high', tags: ['Microsoft', 'Investment'] },
  { title: 'S&P 500 사상 최고치 경신', category: 'STOCK', severity: 'medium', tags: ['S&P500', 'Wall Street'] },
  { title: '소프트뱅크 AI 인프라에 500억 달러 투자', category: 'STOCK', severity: 'high', tags: ['SoftBank', 'Japan', 'Investment'] },
  { title: '삼성전자 주가 급등, AI 반도체 수혜', category: 'STOCK', severity: 'medium', tags: ['Samsung', 'Korea', 'Stock'] },
  { title: 'Apple 분기 실적 서프라이즈, AI 서비스 매출 폭증', category: 'STOCK', severity: 'high', tags: ['Apple', 'Earnings', 'AI'] },
  { title: 'Anthropic IPO 검토, 기업가치 1500억 달러 추정', category: 'STOCK', severity: 'critical', tags: ['Anthropic', 'IPO', 'AI'] },
  { title: 'ARM 주가 사상최고, AI 칩 설계 수요 폭증', category: 'STOCK', severity: 'high', tags: ['ARM', 'Chip', 'Stock'] },
  { title: 'Meta-Alphabet 합병 루머, 시장 충격', category: 'STOCK', severity: 'critical', tags: ['Meta', 'Alphabet', 'Merger'] },
  { title: 'Tesla 실적 부진 우려, 자율주행 기대감으로 반등', category: 'STOCK', severity: 'medium', tags: ['Tesla', 'Earnings', 'Stock'] },

  // ─── CRYPTO (9 templates) ───
  { title: 'Bitcoin $150K 돌파, 기관 투자 급증', category: 'CRYPTO', severity: 'critical', tags: ['Bitcoin', 'BTC'] },
  { title: 'Ethereum ETF 승인, 기관 자금 유입', category: 'CRYPTO', severity: 'high', tags: ['Ethereum', 'ETF'] },
  { title: 'DeFi TVL 사상 최고 $500B 돌파', category: 'CRYPTO', severity: 'medium', tags: ['DeFi', 'TVL'] },
  { title: 'Solana 네트워크 TPS 신기록 달성', category: 'CRYPTO', severity: 'medium', tags: ['Solana', 'TPS'] },
  { title: 'Uniswap V5 출시, DeFi 프로토콜 혁신', category: 'CRYPTO', severity: 'medium', tags: ['Uniswap', 'DeFi', 'DEX'] },
  { title: 'NFT 시장 부활, AI 생성 NFT 거래량 300% 증가', category: 'CRYPTO', severity: 'medium', tags: ['NFT', 'AI', 'Market'] },
  { title: 'Arbitrum L2 TVL $50B 돌파, 이더리움 확장성 해결', category: 'CRYPTO', severity: 'high', tags: ['Arbitrum', 'Layer2', 'Ethereum'] },
  { title: 'USDC 발행량 사상최고, 스테이블코인 시대 개막', category: 'CRYPTO', severity: 'medium', tags: ['USDC', 'Stablecoin', 'Circle'] },
  { title: '미국 암호화폐 규제 프레임워크 최종안 발표', category: 'CRYPTO', severity: 'critical', tags: ['Regulation', 'US', 'Crypto'] },

  // ─── POLITICS (8 templates) ───
  { title: 'EU AI Act 시행 1년, 기업 규제 준수 현황', category: 'POLITICS', severity: 'high', tags: ['EU', 'AI Act', 'Regulation'] },
  { title: '한국 AI 기본법 국회 통과', category: 'POLITICS', severity: 'high', tags: ['Korea', 'AI Law'] },
  { title: '미국 AI 행정명령 업데이트', category: 'POLITICS', severity: 'medium', tags: ['US', 'Executive Order'] },
  { title: 'G7 AI 안전성 가이드라인 합의', category: 'POLITICS', severity: 'medium', tags: ['G7', 'Safety'] },
  { title: 'UAE 국가 AI 전략 2030 발표', category: 'POLITICS', severity: 'medium', tags: ['UAE', 'Strategy'] },
  { title: '일본 디지털청, AI 활용 행정 혁신 계획 발표', category: 'POLITICS', severity: 'medium', tags: ['Japan', 'Digital', 'Government'] },
  { title: '인도 AI 수출규제 완화, 글로벌 아웃소싱 재편', category: 'POLITICS', severity: 'high', tags: ['India', 'AI', 'Trade'] },
  { title: '사우디 NEOM 프로젝트 AI 도시 2단계 착공', category: 'POLITICS', severity: 'medium', tags: ['Saudi', 'NEOM', 'AI City'] },

  // ─── SCIENCE (7 templates) ───
  { title: 'AI 단백질 구조 예측, 신약 개발 기간 단축', category: 'SCIENCE', severity: 'high', tags: ['Protein', 'Drug', 'AlphaFold'] },
  { title: 'Transformer 대안 아키텍처 Mamba-3 논문', category: 'SCIENCE', severity: 'medium', tags: ['Mamba', 'Architecture'] },
  { title: '핵융합 발전 상용화 10년 내 가능 전망', category: 'SCIENCE', severity: 'high', tags: ['Fusion', 'Energy'], videoUrl: 'https://www.youtube.com/watch?v=mE72gFMPbas' },
  { title: 'NASA 화성 샘플 회수 미션 착수', category: 'SCIENCE', severity: 'medium', tags: ['NASA', 'Mars'], videoUrl: 'https://www.youtube.com/watch?v=gm0b_ijaYMQ' },
  { title: 'CRISPR 3.0 유전자 편집, 유전병 치료 임상 3상 성공', category: 'SCIENCE', severity: 'high', tags: ['CRISPR', 'Gene', 'Medicine'] },
  { title: '제임스 웹 망원경, 외계 대기 산소 검출', category: 'SCIENCE', severity: 'critical', tags: ['JWST', 'Exoplanet', 'NASA'], videoUrl: 'https://www.youtube.com/watch?v=4P8fKd0IVOs' },
  { title: '초전도체 상온 연구 재현 성공 논란', category: 'SCIENCE', severity: 'high', tags: ['Superconductor', 'Physics'] },

  // ─── STARTUP (8 templates) ───
  { title: 'Perplexity AI 기업 가치 90억 달러 달성', category: 'STARTUP', severity: 'high', tags: ['Perplexity', 'Unicorn'] },
  { title: 'Cursor, 월간 활성 사용자 500만 돌파', category: 'STARTUP', severity: 'medium', tags: ['Cursor', 'Coding'] },
  { title: 'AI 비디오 생성 스타트업 Runway IPO 검토', category: 'STARTUP', severity: 'medium', tags: ['Runway', 'Video', 'IPO'] },
  { title: '브라질 AI 헬스케어 스타트업 시리즈 B 유치', category: 'STARTUP', severity: 'low', tags: ['Brazil', 'Healthcare'] },
  { title: 'Mistral AI 시리즈 C 유치, 유럽 최대 AI 펀딩', category: 'STARTUP', severity: 'high', tags: ['Mistral', 'Funding', 'Europe'] },
  { title: '인도 AI SaaS 스타트업 유니콘 등극', category: 'STARTUP', severity: 'medium', tags: ['India', 'SaaS', 'Unicorn'] },
  { title: '나이지리아 핀테크 AI 스타트업, 아프리카 확장', category: 'STARTUP', severity: 'low', tags: ['Nigeria', 'Fintech', 'Africa'] },
  { title: '한국 AI 로보틱스 스타트업 글로벌 시장 진출', category: 'STARTUP', severity: 'medium', tags: ['Korea', 'Robotics', 'Startup'] },

  // ─── CYBER (7 templates) ───
  { title: '국가 기반 APT 그룹, AI 시스템 공격 급증', category: 'CYBER', severity: 'critical', tags: ['APT', 'AI Security'] },
  { title: '대규모 데이터 유출 사고, 2억 건 개인정보', category: 'CYBER', severity: 'critical', tags: ['Data Breach', 'Privacy'] },
  { title: 'AI 기반 피싱 공격 300% 증가', category: 'CYBER', severity: 'high', tags: ['Phishing', 'AI'] },
  { title: 'Zero-day 취약점 발견, 주요 클라우드 서비스 영향', category: 'CYBER', severity: 'critical', tags: ['Zero-day', 'Cloud'] },
  { title: '랜섬웨어 공격 병원 마비, AI 방어 시스템 도입 확대', category: 'CYBER', severity: 'critical', tags: ['Ransomware', 'Hospital', 'AI Defense'] },
  { title: 'AI 딥페이크 범죄 급증, 글로벌 공조 강화', category: 'CYBER', severity: 'high', tags: ['Deepfake', 'Crime', 'AI'] },
  { title: '양자암호 통신 상용화 첫 단계, 해킹 불가 네트워크', category: 'CYBER', severity: 'medium', tags: ['Quantum Crypto', 'Security'] },

  // ─── CLIMATE (6 templates) ───
  { title: 'AI 기반 기후 예측 모델, 정확도 95% 달성', category: 'CLIMATE', severity: 'medium', tags: ['Climate', 'AI', 'Prediction'] },
  { title: '글로벌 탄소 배출 감소 목표 미달 경고', category: 'CLIMATE', severity: 'high', tags: ['Carbon', 'Emission'] },
  { title: 'AI 에너지 소비 급증, 데이터센터 탄소 문제', category: 'CLIMATE', severity: 'high', tags: ['AI', 'Energy', 'Datacenter'] },
  { title: '아마존 열대우림 AI 모니터링 시스템 가동', category: 'CLIMATE', severity: 'medium', tags: ['Amazon', 'AI', 'Forest'] },
  { title: '북극 빙하 AI 관측, 2030년 소멸 예측 상향', category: 'CLIMATE', severity: 'critical', tags: ['Arctic', 'Ice', 'AI'], videoUrl: 'https://www.youtube.com/watch?v=qo3yczWeA7Q' },
  { title: 'AI 최적화 전력망, 재생에너지 효율 30% 향상', category: 'CLIMATE', severity: 'medium', tags: ['AI', 'Renewable', 'Grid'] },
]

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function pickWeighted(): EventTemplate {
  // 40% AI, 60% everything else
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
  const count = 60 + Math.floor(Math.random() * 20)
  const articles: NewsArticle[] = []

  for (let i = 0; i < count; i++) {
    const template = pickWeighted()
    const source = pick(SOURCES)
    const hoursAgo = Math.floor(Math.random() * 72)

    articles.push({
      id: `evt-${i}-${now}`,
      title: template.title,
      summary: `${template.title}. 전문가 분석에 따르면 이 사건은 글로벌 시장과 기술 생태계에 상당한 영향을 미칠 것으로 예상됩니다. 관련 업계에서는 후속 대응을 준비하고 있습니다.`,
      source: source.name,
      url: '#',
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
