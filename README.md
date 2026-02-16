# Multi-AI Chat App 🤖✨

6개의 AI (ChatGPT, Gemini, Claude, DeepSeek, Grok, Perplexity)를 병렬로 사용하는 현대적인 웹 채팅 애플리케이션

## 🌟 주요 기능

### 1. 6개 AI 병렬 채팅
- 화면을 6분할하여 각 AI와 독립적으로 대화
- 한 번의 입력으로 모든 AI에게 동시 전송 가능
- 각 AI별 개별 채팅 히스토리 관리

### 2. 3가지 작동 모드
- **간단 (Simple)**: 빠른 답변, 짧은 응답
- **보통 (Normal)**: 균형잡힌 분석과 응답
- **심층 연구 (Deep Research)**:
  - 모든 AI가 초기 답변 생성
  - AI 간 상호 검토 및 비판
  - ChatGPT의 최종 종합 결론

### 3. 5개 SOP 템플릿
1. **경제 글쓰기** 💰 - 한국 경제·부동산·투자 칼럼 작성
2. **독서 요약·비평** 📚 - 책 요약 및 비평 분석
3. **투자 분석** 📈 - 투자 타당성 및 리스크 분석
4. **바이브 코딩** 💻 - 개발 조력 및 코드 제안
5. **프롬프트 작성** 💡 - AI 프롬프트 엔지니어링

### 4. API 키 관리
- 브라우저 로컬 스토리지에 안전하게 저장
- 간편한 설정 인터페이스
- 각 AI별 개별 키 관리

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 18+
- npm 또는 yarn

### 설치

1. **의존성 설치**
```bash
# 루트에서 모든 의존성 한 번에 설치
npm run install-all

# 또는 개별 설치
cd frontend && npm install
cd ../backend && npm install
```

2. **환경 변수 설정**
```bash
# backend/.env 파일 생성
cp backend/.env.example backend/.env

# API 키 입력 (선택사항 - UI에서도 설정 가능)
# backend/.env 파일을 편집하여 API 키 추가
```

3. **개발 서버 실행**
```bash
# 루트에서 프론트엔드와 백엔드 동시 실행
npm run dev

# 또는 개별 실행
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:5000
```

4. **브라우저 접속**
```
http://localhost:3000
```

## 📁 프로젝트 구조

```
TC/
├── frontend/                # React 프론트엔드
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   │   ├── ChatPanel.jsx
│   │   │   ├── ControlPanel.jsx
│   │   │   ├── ApiKeySettings.jsx
│   │   │   └── SummaryModal.jsx
│   │   ├── services/       # API 서비스
│   │   ├── constants/      # 상수 및 SOP 템플릿
│   │   ├── App.jsx
│   │   └── index.jsx
│   └── package.json
├── backend/                 # Express 백엔드
│   ├── src/
│   │   ├── controllers/    # API 컨트롤러
│   │   ├── services/       # AI 서비스 연동
│   │   │   ├── openai.service.js
│   │   │   ├── claude.service.js
│   │   │   ├── gemini.service.js
│   │   │   ├── deepseek.service.js
│   │   │   ├── grok.service.js
│   │   │   └── perplexity.service.js
│   │   ├── config/         # 설정 파일
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🔑 API 키 발급

각 AI 서비스에서 API 키를 발급받으세요:

1. **OpenAI (ChatGPT)**: https://platform.openai.com/api-keys
2. **Google (Gemini)**: https://makersuite.google.com/app/apikey
3. **Anthropic (Claude)**: https://console.anthropic.com/
4. **DeepSeek**: https://platform.deepseek.com/
5. **xAI (Grok)**: https://x.ai/api
6. **Perplexity**: https://www.perplexity.ai/settings/api

## 💡 사용 방법

### 1. API 키 설정
- 우측 상단 설정(⚙️) 버튼 클릭
- 각 AI의 API 키 입력
- 저장 버튼 클릭

### 2. 모드 선택
- **간단**: 빠른 답변이 필요할 때
- **보통**: 일반적인 대화
- **심층 연구**: 복잡한 주제 분석 시

### 3. 템플릿 선택 (선택사항)
- 경제 글쓰기, 독서 요약, 투자 분석 등
- 템플릿을 선택하면 AI에게 특정 역할이 부여됨

### 4. AI 활성화/비활성화
- 사용하고 싶은 AI만 선택적으로 활성화
- 비활성화된 AI는 메시지를 받지 않음

### 5. 메시지 전송
- **전체 전송**: 상단 입력창에서 모든 활성 AI에게 동시 전송
- **개별 전송**: 각 패널의 입력창에서 해당 AI에만 전송

### 6. 심층 연구 모드
- "심층 연구" 모드 선택
- 메시지 전송
- Phase 1: 각 AI의 초기 답변
- Phase 2: AI 간 상호 리뷰
- Final: ChatGPT의 종합 결론
- 결과를 복사하거나 마크다운으로 다운로드

## 🛠️ 기술 스택

### Frontend
- React 18
- Tailwind CSS
- Vite
- Axios
- Zustand (상태 관리)
- Lucide React (아이콘)

### Backend
- Node.js
- Express
- OpenAI SDK
- Anthropic SDK
- Google Generative AI SDK
- Axios (DeepSeek, Grok, Perplexity)

## 🎨 UI/UX 특징

- **모던한 디자인**: Tailwind CSS를 활용한 깔끔한 UI
- **반응형**: 데스크탑에 최적화된 6분할 레이아웃
- **실시간 피드백**: 메시지 로딩 상태 표시
- **색상 구분**: 각 AI별 고유 색상으로 구분
- **직관적 인터페이스**: 최소한의 클릭으로 모든 기능 접근

## 📊 심층 연구 모드 작동 방식

1. **Phase 1 - 초기 답변**
   - 모든 활성 AI에게 동일한 질문 전송
   - 각 AI가 독립적으로 답변 생성

2. **Phase 2 - 상호 리뷰**
   - 각 AI가 다른 AI의 답변을 검토
   - 비판적 피드백 제공
   - 개선점 제시

3. **Final - 종합 결론**
   - ChatGPT가 모든 답변과 리뷰를 분석
   - 핵심 주장 정리
   - 의견 일치/불일치 지점 파악
   - 리스크와 한계점 제시
   - 최종 결론 도출

## 🔒 보안

- API 키는 브라우저의 localStorage에만 저장
- 백엔드 서버는 API 키를 저장하지 않음
- 모든 요청은 클라이언트에서 API 키 포함

## 📝 라이선스

MIT License

## 🤝 기여

이슈와 PR은 언제나 환영합니다!

## 📧 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.

---

Made with ❤️ using React, Express, and 6 AI models
