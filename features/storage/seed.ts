import { Item, ItemExtra, ItemType } from '../items/itemTypes';

const sampleContent = (type: ItemType) =>
  `${type} 샘플 내용입니다.\n\n- 핵심 포인트\n- 다음 액션\n- 참고 링크`;

const createExtra = (type: ItemType): ItemExtra | undefined => {
  switch (type) {
    case 'youtube-summary':
      return {
        type,
        url: 'https://youtube.com/watch?v=sample',
        timestamps: '00:10 인트로\n02:30 핵심',
        actions: '댓글 확인, 요약 공유'
      };
    case 'prompt':
      return {
        type,
        variables: [
          { name: 'tone', description: '문체', defaultValue: '친절함' },
          { name: 'length', description: '길이', defaultValue: '짧게' }
        ],
        versions: [
          {
            version: 'v1',
            prompt: '당신은 전문가입니다. {{tone}} 톤으로 설명하세요.',
            notes: '기본 버전'
          }
        ]
      };
    case 'vibe-coding':
      return {
        type,
        requirements: '사용자 로그인 후 대시보드 접근',
        features: 'AI 요약, 템플릿 생성, 태그 필터',
        dataSchema: 'Item, Tag, User',
        screens: '로그인, 리스트, 상세, 설정',
        restrictions: '외부 API 호출 금지'
      };
    case 'real-estate':
    case 'stock':
      return {
        type,
        keywords: '역세권, 배당주',
        links: 'https://example.com/report',
        memo: '관심 키워드 모니터링'
      };
    case 'self-care':
      return {
        type,
        habits: [
          { label: '물 2L 마시기', checked: false },
          { label: '10분 스트레칭', checked: true }
        ],
        routine: '아침 명상 5분',
        goals: '주 3회 운동',
        weeklyReview: '한 주 회고를 적어보세요.'
      };
    default:
      return undefined;
  }
};

export const buildSeedItems = (): Item[] => {
  const types: ItemType[] = [
    'writing',
    'reading-summary',
    'youtube-summary',
    'prompt',
    'vibe-coding',
    'real-estate',
    'stock',
    'self-care'
  ];

  return Array.from({ length: 10 }).map((_, index) => {
    const type = types[index % types.length];
    const now = Date.now() - index * 1000 * 60 * 60;
    return {
      id: `seed_${index}`,
      type,
      title: `${type} 샘플 ${index + 1}`,
      content: sampleContent(type),
      tags: ['sample', type],
      favorite: index % 3 === 0,
      createdAt: now,
      updatedAt: now,
      extra: createExtra(type)
    };
  });
};
