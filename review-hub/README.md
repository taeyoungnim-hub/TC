# 모두의 리뷰 (All Reviews Hub)

검색어 하나로 여러 곳에 흩어진 리뷰/후기를 한 번에 모아 비교하고, AI로 요약해주는 리뷰 메타서치 서비스.

## 아키텍처 요약

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Next.js 14 + Tailwind + TanStack Query)          │
│  - 검색창 (자동완성/최근검색/인기검색어)                      │
│  - 결과: 전체요약 카드 + 출처별 리뷰 리스트 + 필터/정렬       │
│  - 폴링으로 비동기 분석 결과 업데이트                         │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP /api/search
┌──────────────────────────▼──────────────────────────────────┐
│  Backend API (Node.js + Express + TypeScript)                │
│  - /api/search : 병렬 커넥터 검색 → 중복제거 → 스코어링      │
│  - /api/search/trending : 인기 검색어                        │
│  - /api/search/status/:id : 비동기 결과 폴링                 │
│                                                             │
│  Connector Layer (Allowlist 기반 플러그인)                   │
│  - NaverSearchConnector (공식 Naver API)                    │
│  - GoogleCSEConnector (Google Custom Search API)            │
│  - IConnector 인터페이스로 추가/제거 가능                    │
└──────────┬──────────────────────────┬───────────────────────┘
           │                          │
    ┌──────▼──────┐           ┌───────▼────────┐
    │  PostgreSQL │           │  Redis         │
    │  (Prisma)   │           │  - 검색 캐시   │
    │  - Entity   │           │  - URL 캐시    │
    │  - Review   │           │  - 인기 키워드 │
    │  - Summary  │           │  - BullMQ 큐   │
    │  - Source   │           └────────────────┘
    └─────────────┘
           │
    ┌──────▼──────────────────────────────────────┐
    │  Background Workers (BullMQ)                │
    │                                             │
    │  CrawlWorker                                │
    │  1. robots.txt 확인                          │
    │  2. Rate limit 확인 (도메인별 토큰버킷)       │
    │  3. HTML fetch → 본문 추출 (Cheerio)         │
    │  4. LLM 분류: 리뷰성 여부 판단               │
    │  5. LLM 추출: 발췌(≤300자)/장단점/감성/키워드 │
    │  6. DB 저장 (snippet만, 원문 전체 저장 금지)  │
    │                                             │
    │  SummarizeWorker                            │
    │  1. 리뷰 20개 모아서 전체 요약 생성           │
    │  2. 신뢰도 점수 계산 (출처다양성/개수/최신성)  │
    │  3. Summary DB 저장 (1시간 캐시)             │
    └─────────────────────────────────────────────┘
```

## 법적/약관 준수 원칙

- **허용**: 공식 API (Naver, Google CSE), 공개 RSS, robots.txt 허용 사이트만
- **금지**: 로그인 우회, 캡차 우회, API 역공학, 대량 원문 복제
- **원문**: 200~300자 발췌(snippet)만 저장/표시, 항상 출처 + 원문 링크 제공
- **요청 제한**: 도메인별 rate limiting (token bucket), 적절한 User-Agent 명시

## 레포 구조

```
review-hub/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # DB 스키마
│   ├── src/
│   │   ├── connectors/
│   │   │   ├── BaseConnector.ts   # 추상 기반 클래스
│   │   │   ├── NaverSearchConnector.ts
│   │   │   ├── GoogleCSEConnector.ts
│   │   │   └── index.ts           # 커넥터 레지스트리
│   │   ├── services/
│   │   │   ├── llmService.ts      # Claude API (분류/추출/요약)
│   │   │   ├── redisService.ts    # 캐시 + 인기검색어
│   │   │   └── searchService.ts   # 핵심 검색 파이프라인
│   │   ├── workers/
│   │   │   ├── crawlWorker.ts     # BullMQ 크롤링 워커
│   │   │   ├── summarizeWorker.ts # BullMQ 요약 워커
│   │   │   ├── queue.ts           # 큐 정의
│   │   │   └── index.ts           # 워커 진입점
│   │   ├── routes/
│   │   │   └── search.ts          # API 라우터
│   │   ├── middleware/
│   │   │   └── errorHandler.ts
│   │   ├── utils/
│   │   │   ├── hash.ts            # URL/IP 해싱
│   │   │   ├── logger.ts          # pino 로거
│   │   │   ├── rateLimiter.ts     # 토큰 버킷 rate limiter
│   │   │   └── robots.ts          # robots.txt 확인
│   │   ├── types/index.ts
│   │   └── index.ts               # Express 앱 진입점
│   ├── tests/
│   │   ├── heuristicClassify.test.ts
│   │   ├── hashUrl.test.ts
│   │   ├── rateLimiter.test.ts
│   │   └── searchService.test.ts
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           # 홈 (검색창)
│   │   │   ├── results/page.tsx   # 결과 페이지
│   │   │   ├── providers.tsx      # QueryClient Provider
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── search/
│   │   │   │   ├── SearchHero.tsx  # 홈 화면
│   │   │   │   └── SearchBar.tsx   # 검색 입력 (자동완성 포함)
│   │   │   └── results/
│   │   │       ├── SummaryCard.tsx  # AI 요약 카드
│   │   │       ├── ReviewCard.tsx   # 개별 리뷰 카드
│   │   │       ├── ReviewList.tsx   # 리뷰 목록
│   │   │       ├── FilterBar.tsx    # 정렬/출처 필터
│   │   │       ├── TrustScoreBadge.tsx
│   │   │       └── ResultsSkeleton.tsx
│   │   ├── hooks/
│   │   │   └── useSearch.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── utils.ts
│   │   └── types/index.ts
│   └── Dockerfile
├── docker-compose.yml
└── package.json
```

## 로컬 실행 방법

### 필수 조건
- Node.js 18+
- Docker + Docker Compose (PostgreSQL, Redis)

### 1. 저장소 클론 및 의존성 설치

```bash
git clone <repo-url>
cd review-hub

# 백엔드 의존성
cd backend && npm install

# 프론트엔드 의존성
cd ../frontend && npm install
cd ..
```

### 2. 환경변수 설정

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# backend/.env 편집:
# - ANTHROPIC_API_KEY 설정 (필수: AI 기능용)
# - NAVER_CLIENT_ID / NAVER_CLIENT_SECRET (선택: 네이버 검색용)
# - GOOGLE_CSE_API_KEY / GOOGLE_CSE_ID (선택: 구글 검색용)
```

### 3. DB + Redis 실행

```bash
docker-compose up -d postgres redis
```

### 4. DB 마이그레이션

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 5. 백엔드 API 실행

```bash
# Terminal 1: API 서버
cd backend && npm run dev

# Terminal 2: 백그라운드 워커
cd backend && npm run worker
```

### 6. 프론트엔드 실행

```bash
# Terminal 3
cd frontend && npm run dev
```

브라우저에서 http://localhost:3000 접속

### 테스트 실행

```bash
cd backend && npm test
```

### 전체 도커 빌드

```bash
docker-compose up --build
```

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/search?q=...` | 리뷰 검색 (핵심 API) |
| GET | `/api/search/trending` | 인기 검색어 |
| GET | `/api/search/entity/:id` | 엔티티 상세 + 리뷰 |
| GET | `/api/search/status/:entityId` | 비동기 처리 상태 폴링 |
| GET | `/health` | 헬스체크 |

### 검색 파라미터

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `q` | string (필수) | 검색어 |
| `region` | string | 지역 (장소 검색 시) |
| `from` | ISO date | 시작 날짜 |
| `to` | ISO date | 종료 날짜 |
| `category` | RESTAURANT\|PRODUCT\|TRAVEL | 카테고리 강제 지정 |
| `page` | number | 페이지 번호 (기본: 1) |
| `limit` | number | 페이지 크기 (기본: 20) |
| `sortBy` | latest\|rating\|positive\|negative | 정렬 |
| `sourceTypes` | 콤마 구분 | 출처 필터 (BLOG,COMMUNITY 등) |

## 신뢰도 점수 계산

| 요소 | 가중치 |
|------|--------|
| 출처 다양성 (5개 이상 = 만점) | 40점 |
| 리뷰 개수 (20개 이상 = 만점) | 30점 |
| 최신성 (90일 이내 비율) | 20점 |
| 리뷰성 확률 평균 | 10점 |

## 새 커넥터 추가 방법

```typescript
// src/connectors/MyNewConnector.ts
import { BaseConnector } from './BaseConnector';
import { ConnectorMeta, ConnectorSearchOptions, RawSearchResult } from '../types';

export class MyNewConnector extends BaseConnector {
  meta: ConnectorMeta = {
    id: 'my-connector',
    name: 'My Source',
    domain: 'example.com',
    sourceType: 'BLOG',
    rateLimit: 5,
    isEnabled: !!process.env.MY_API_KEY,
  };

  async search(options: ConnectorSearchOptions): Promise<RawSearchResult[]> {
    // 공식 API 호출 구현
    return [];
  }
}

// src/connectors/index.ts 에 추가:
connectorRegistry.push(new MyNewConnector());
```
