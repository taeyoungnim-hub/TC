export const ITEM_TYPES = [
  'writing',
  'reading-summary',
  'youtube-summary',
  'prompt',
  'vibe-coding',
  'real-estate',
  'stock',
  'self-care'
] as const;

export type ItemType = (typeof ITEM_TYPES)[number];

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  writing: '글쓰기',
  'reading-summary': '독서요약',
  'youtube-summary': '유튜브요약',
  prompt: '프롬프트제작',
  'vibe-coding': '바이브코딩설계',
  'real-estate': '부동산정보',
  stock: '주식정보',
  'self-care': '자기관리'
};

export type PromptVariable = {
  name: string;
  description: string;
  defaultValue: string;
};

export type PromptVersion = {
  version: string;
  prompt: string;
  notes: string;
};

export type SelfCareHabit = {
  label: string;
  checked: boolean;
};

export type ItemExtra =
  | {
      type: 'youtube-summary';
      url: string;
      timestamps: string;
      actions: string;
    }
  | {
      type: 'prompt';
      variables: PromptVariable[];
      versions: PromptVersion[];
    }
  | {
      type: 'vibe-coding';
      requirements: string;
      features: string;
      dataSchema: string;
      screens: string;
      restrictions: string;
    }
  | {
      type: 'real-estate' | 'stock';
      keywords: string;
      links: string;
      memo: string;
    }
  | {
      type: 'self-care';
      habits: SelfCareHabit[];
      routine: string;
      goals: string;
      weeklyReview: string;
    };

export type Item = {
  id: string;
  type: ItemType;
  title: string;
  content: string;
  tags: string[];
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
  extra?: ItemExtra;
};
