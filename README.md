# 부동산 경매 인사이트 (Real Estate Auction Insight MVP)

데이터 기반 부동산 경매 물건 추천, 시장 트렌드 분석, 투자 의사결정 지원 웹 애플리케이션

## 주요 기능

### 1. 추천 물건 (Recommended Listings)
- **설명 가능한 추천 시스템**: 0-100점 추천 점수 + 점수 구성요소 상세 표시
- **추천 로직**: 할인율(30%), 경쟁도(25%), 유찰상태(20%), 리스크(15%), 입찰임박성(10%)
- **추천 사유 및 리스크 경고**: 사용자에게 명확한 근거 제공
- **필터링**: 지역, 물건종류, 가격대, 입찰일, 상태, 리스크 레벨

### 2. 시장 트렌드 분석 (Trends Dashboard)
- **주요 지표**: 물건 수, 유찰률, 낙찰률, 평균 낙찰가율, 평균 할인율, 평균 경쟁률, 평균 유찰 횟수
- **필터**: 지역, 물건종류, 기간 (1/3/6/12개월)
- **투명성**: 데이터 집계 방법 설명 제공

### 3. 이색 물건 (Unusual Listings)
- **이색 태그**: 지분경매, 섬/오지, 법정지상권, 분묘리스크, 개발예정지역 등
- **에디터 노트**: 관리자가 작성한 특별 코멘트
- **주의 포인트**: 리스크 강조 표시

### 4. 심리 지수 (Psychological Index)
- **4가지 구성요소**:
  - 열기 (Competition, 30%): 평균 입찰자 수 변화
  - 공격성 (Aggression, 30%): 평균 낙찰가율 변화
  - 유동성 (Liquidity, 25%): 낙찰률/소화 속도
  - 리스크회피 (Risk Aversion, 15%): 평균 할인율 변화
- **해석**: 과열(70+), 적정(50-70), 관망(30-50), 침체(30-)
- **지역/물건종류별 지수**: 시계열 데이터 제공

### 5. 기타 기능
- **물건 검색**: 필터링 및 정렬
- **학습 센터**: 경매 용어, 체크리스트, SOP (권리분석, 명도, 세금 등)
- **계산기**: 취득비용, 대출 이자 계산
- **관심 목록**: 로그인 사용자 기능 (MVP에서는 UI만 구현)
- **관리자**: 데이터 업로드, 가중치 조정, 에디터 노트 관리

## 기술 스택

- **Frontend/Fullstack**: Next.js 15 (App Router) + TypeScript
- **UI**: TailwindCSS + shadcn/ui + Lucide Icons
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth v5 (구조만 준비, MVP에서는 미구현)
- **Charts**: Recharts
- **Validation**: Zod
- **Testing**: Jest + ts-jest

## 로컬 실행 방법

### 1. 사전 요구사항
- Node.js 18+
- PostgreSQL 14+
- npm

### 2. 프로젝트 클론 및 의존성 설치
```bash
# 패키지 설치
npm install
```

### 3. 환경 변수 설정
```bash
# .env 파일 생성 (이미 생성되어 있음)
# DATABASE_URL을 실제 PostgreSQL 연결 정보로 수정하세요
```

`.env` 파일 예시:
```
DATABASE_URL="postgresql://username:password@localhost:5432/auction_insight"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
ENABLE_LLM_SUMMARIES="false"
```

### 4. 데이터베이스 준비

#### PostgreSQL 데이터베이스 생성
```bash
# PostgreSQL에 로그인
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE auction_insight;

# 종료
\q
```

#### Prisma 마이그레이션 및 시드
```bash
# Prisma 클라이언트 생성 및 DB 스키마 생성
npx prisma db push

# 시드 데이터 생성 (300개의 샘플 경매 물건)
npm run db:seed
```

시드 데이터에는 다음이 포함됩니다:
- 300개의 경매 물건 (다양한 지역, 물건종류, 상태)
- 낙찰 결과 데이터
- 추천 설정 (기본 가중치)
- 심리 지수 설정 (기본 가중치)
- 관리자 계정 (admin@auction.com)

### 5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 6. 프로덕션 빌드
```bash
npm run build
npm run start
```

## 테스트 실행
```bash
# 모든 테스트 실행
npm test

# Watch 모드로 테스트
npm run test:watch
```

현재 테스트 범위:
- 추천 점수 계산 로직 (7개 테스트)
- 할인율, 리스크, 유찰상태, 입찰 임박성 점수 검증

## 프로젝트 구조
```
/
├── app/                    # Next.js App Router 페이지
│   ├── page.tsx           # 홈 (대시보드)
│   ├── listings/          # 물건 검색/목록/상세
│   ├── recommended/       # 추천 물건
│   ├── trends/            # 트렌드 분석
│   ├── unusual/           # 이색 물건
│   ├── sentiment/         # 심리 지수
│   ├── learn/             # 학습 센터
│   ├── calculators/       # 계산기
│   ├── watchlist/         # 관심 목록
│   └── admin/             # 관리자
├── components/
│   ├── ui/                # shadcn/ui 컴포넌트
│   └── layout/            # 레이아웃 컴포넌트
├── lib/
│   ├── prisma.ts          # Prisma 클라이언트
│   ├── utils.ts           # 유틸리티 함수
│   ├── recommendation.ts  # 추천 로직
│   ├── trends.ts          # 트렌드 분석 로직
│   └── psychology-index.ts # 심리 지수 로직
├── prisma/
│   ├── schema.prisma      # 데이터베이스 스키마
│   └── seed.ts            # 시드 데이터 생성
├── __tests__/             # 테스트 파일
└── public/                # 정적 파일
```

## 데이터 모델

### 주요 엔티티
- **AuctionItem**: 경매 물건 정보
- **AuctionResult**: 낙찰 결과
- **RecommendationSnapshot**: 추천 점수 스냅샷
- **TrendSnapshot**: 트렌드 집계 스냅샷
- **PsychologyIndexSnapshot**: 심리 지수 스냅샷
- **User, Watchlist, SavedSearch**: 사용자 및 관심 목록
- **RecommendationConfig, PsychologyIndexConfig**: 설정

## 관리자 기능

### 데이터 업로드
MVP에서는 시드 스크립트를 사용하거나 직접 DB에 데이터를 삽입합니다.
추후 CSV/JSON 업로드 기능을 구현할 수 있습니다.

CSV 템플릿 예시 (추후 구현):
```csv
caseNumber,court,propertyType,address,appraisalPrice,minimumBidPrice,bidDate,status
2024타경12345,서울중앙지방법원,아파트,서울 강남구...,500000000,350000000,2024-12-31,진행
```

### 가중치 조정
`/admin` 페이지에서 추천 및 심리 지수 가중치를 조정할 수 있습니다 (UI만 준비, 로직은 추후 구현).

### 관리자 계정
시드 후 생성되는 기본 관리자:
- Email: admin@auction.com
- 역할: admin

## 주요 특징

### 1. 외부 크롤링 없음
- MVP는 CSV/JSON 업로드 + 시드 데이터로 구성
- 데이터 어댑터 인터페이스로 추후 API/제휴 데이터 연동 가능

### 2. 설명 가능한 AI
- 블랙박스가 아닌 명확한 규칙 기반 추천
- 점수 구성요소 및 사유를 사용자에게 투명하게 제공

### 3. 투명성
- 추천 방법론, 트렌드 집계 방법, 심리 지수 산식 모두 공개
- 사용자가 신뢰할 수 있는 데이터 기반 의사결정 지원

### 4. 법적 고지
- 모든 페이지 푸터에 "투자/법률 자문 아님" 명시
- 데이터 지연/오류 가능성 고지

## 향후 개발 계획

### 단기 (v1.1)
- NextAuth 인증 완전 구현 (Google OAuth)
- 관심 목록 실제 동작
- CSV/JSON 업로드 기능
- 트렌드 차트 (Recharts)
- 심리 지수 차트

### 중기 (v1.5)
- 저장된 검색 및 알림 (이메일/푸시)
- LLM 기반 물건 요약 (OpenAI API)
- 지도 기반 물건 검색
- 유사 물건 추천

### 장기 (v2.0)
- 합법적 데이터 소스 연동 (공식 API/제휴)
- 모바일 앱 (React Native)
- 고급 분석 대시보드
- 커뮤니티 기능

## 라이선스
이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 주의사항
⚠️ **본 서비스는 투자 자문이나 법률 자문을 제공하지 않습니다.**
- 모든 데이터는 참고용입니다
- 실제 투자 결정 시 반드시 전문가 상담을 받으시기 바랍니다
- 권리분석, 현장조사, 법적 검토 등은 직접 수행하거나 전문가에게 의뢰해야 합니다

## 문의
프로젝트 관련 문의 또는 버그 리포트는 GitHub Issues를 이용해 주세요.
