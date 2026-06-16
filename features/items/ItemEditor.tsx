'use client';

import { useEffect, useMemo, useState } from 'react';
import { Item, ItemExtra, ItemType, PromptVariable, PromptVersion, SelfCareHabit } from './itemTypes';

const buildEmptyExtra = (type: ItemType): ItemExtra | undefined => {
  switch (type) {
    case 'youtube-summary':
      return { type, url: '', timestamps: '', actions: '' };
    case 'prompt':
      return { type, variables: [], versions: [] };
    case 'vibe-coding':
      return { type, requirements: '', features: '', dataSchema: '', screens: '', restrictions: '' };
    case 'real-estate':
    case 'stock':
      return { type, keywords: '', links: '', memo: '' };
    case 'self-care':
      return { type, habits: [], routine: '', goals: '', weeklyReview: '' };
    default:
      return undefined;
  }
};

type ItemEditorProps = {
  item: Item | null;
  type: ItemType;
  onSave: (values: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, patch: Partial<Item>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (item: Item) => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
};

export default function ItemEditor({
  item,
  type,
  onSave,
  onUpdate,
  onDelete,
  onDuplicate,
  onToggleFavorite
}: ItemEditorProps) {
  const [isEditing, setIsEditing] = useState(!item);
  const [title, setTitle] = useState(item?.title ?? '');
  const [content, setContent] = useState(item?.content ?? '');
  const [tags, setTags] = useState(item?.tags.join(', ') ?? '');
  const [extra, setExtra] = useState<ItemExtra | undefined>(item?.extra ?? buildEmptyExtra(type));

  useEffect(() => {
    setIsEditing(!item);
    setTitle(item?.title ?? '');
    setContent(item?.content ?? '');
    setTags(item?.tags.join(', ') ?? '');
    setExtra(item?.extra ?? buildEmptyExtra(type));
  }, [item, type]);

  const tagList = useMemo(
    () =>
      tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags]
  );

  const handleSave = () => {
    const payload = {
      type,
      title,
      content,
      tags: tagList,
      favorite: item?.favorite ?? false,
      extra
    };

    if (item) {
      onUpdate(item.id, payload);
      setIsEditing(false);
    } else {
      onSave(payload);
    }
  };

  const setPromptVariables = (variables: PromptVariable[]) => {
    if (extra && extra.type === 'prompt') {
      setExtra({ ...extra, variables });
    }
  };

  const setPromptVersions = (versions: PromptVersion[]) => {
    if (extra && extra.type === 'prompt') {
      setExtra({ ...extra, versions });
    }
  };

  const setHabits = (habits: SelfCareHabit[]) => {
    if (extra && extra.type === 'self-care') {
      setExtra({ ...extra, habits });
    }
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">{item ? '상세' : '새 항목'}</h2>
          <p className="text-xs text-slate-400">필수 항목: 제목, 내용</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {item && (
            <button
              type="button"
              onClick={() => onToggleFavorite(item.id, !item.favorite)}
              className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200"
            >
              {item.favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            </button>
          )}
          {item && (
            <button
              type="button"
              onClick={() => onDuplicate(item)}
              className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200"
            >
              복제
            </button>
          )}
          {item && (
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="rounded-full border border-rose-500 px-3 py-1 text-xs text-rose-200"
            >
              삭제
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className="rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold text-slate-950"
          >
            {isEditing ? '보기' : '편집'}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <div>
          <label className="text-xs text-slate-400" htmlFor="title">
            제목
          </label>
          <input
            id="title"
            disabled={!isEditing}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400" htmlFor="content">
            내용 (마크다운)
          </label>
          <textarea
            id="content"
            disabled={!isEditing}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="mt-1 min-h-[160px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400" htmlFor="tags">
            태그 (콤마 구분)
          </label>
          <input
            id="tags"
            disabled={!isEditing}
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
        </div>

        {extra?.type === 'youtube-summary' && (
          <div className="grid gap-3 rounded-xl border border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-slate-200">유튜브 요약 필드</h3>
            <label className="text-xs text-slate-400" htmlFor="youtube-url">
              URL
            </label>
            <input
              id="youtube-url"
              disabled={!isEditing}
              value={extra.url}
              onChange={(event) => setExtra({ ...extra, url: event.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
            <label className="text-xs text-slate-400" htmlFor="youtube-timestamps">
              Timestamps
            </label>
            <textarea
              id="youtube-timestamps"
              disabled={!isEditing}
              value={extra.timestamps}
              onChange={(event) => setExtra({ ...extra, timestamps: event.target.value })}
              className="min-h-[100px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
            <label className="text-xs text-slate-400" htmlFor="youtube-actions">
              Actions
            </label>
            <textarea
              id="youtube-actions"
              disabled={!isEditing}
              value={extra.actions}
              onChange={(event) => setExtra({ ...extra, actions: event.target.value })}
              className="min-h-[80px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>
        )}

        {extra?.type === 'prompt' && (
          <div className="grid gap-4 rounded-xl border border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-slate-200">프롬프트 제작</h3>
            <div className="grid gap-2">
              <p className="text-xs text-slate-400">Variables</p>
              {extra.variables.map((variable, index) => (
                <div key={index} className="grid gap-2 rounded-lg border border-slate-700 p-3">
                  <input
                    disabled={!isEditing}
                    value={variable.name}
                    onChange={(event) => {
                      const next = [...extra.variables];
                      next[index] = { ...variable, name: event.target.value };
                      setPromptVariables(next);
                    }}
                    placeholder="이름"
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                  />
                  <input
                    disabled={!isEditing}
                    value={variable.description}
                    onChange={(event) => {
                      const next = [...extra.variables];
                      next[index] = { ...variable, description: event.target.value };
                      setPromptVariables(next);
                    }}
                    placeholder="설명"
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                  />
                  <input
                    disabled={!isEditing}
                    value={variable.defaultValue}
                    onChange={(event) => {
                      const next = [...extra.variables];
                      next[index] = { ...variable, defaultValue: event.target.value };
                      setPromptVariables(next);
                    }}
                    placeholder="기본값"
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                  />
                </div>
              ))}
              {isEditing && (
                <button
                  type="button"
                  onClick={() =>
                    setPromptVariables([...extra.variables, { name: '', description: '', defaultValue: '' }])
                  }
                  className="self-start rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                >
                  변수 추가
                </button>
              )}
            </div>
            <div className="grid gap-2">
              <p className="text-xs text-slate-400">Versions</p>
              {extra.versions.map((version, index) => (
                <div key={index} className="grid gap-2 rounded-lg border border-slate-700 p-3">
                  <input
                    disabled={!isEditing}
                    value={version.version}
                    onChange={(event) => {
                      const next = [...extra.versions];
                      next[index] = { ...version, version: event.target.value };
                      setPromptVersions(next);
                    }}
                    placeholder="버전"
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                  />
                  <textarea
                    disabled={!isEditing}
                    value={version.prompt}
                    onChange={(event) => {
                      const next = [...extra.versions];
                      next[index] = { ...version, prompt: event.target.value };
                      setPromptVersions(next);
                    }}
                    placeholder="프롬프트"
                    className="min-h-[80px] w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                  />
                  <input
                    disabled={!isEditing}
                    value={version.notes}
                    onChange={(event) => {
                      const next = [...extra.versions];
                      next[index] = { ...version, notes: event.target.value };
                      setPromptVersions(next);
                    }}
                    placeholder="노트"
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                  />
                </div>
              ))}
              {isEditing && (
                <button
                  type="button"
                  onClick={() =>
                    setPromptVersions([...extra.versions, { version: '', prompt: '', notes: '' }])
                  }
                  className="self-start rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                >
                  버전 추가
                </button>
              )}
            </div>
          </div>
        )}

        {extra?.type === 'vibe-coding' && (
          <div className="grid gap-3 rounded-xl border border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-slate-200">바이브 코딩 설계</h3>
            {([
              ['requirements', '요구사항'],
              ['features', '기능 목록'],
              ['dataSchema', '데이터 스키마'],
              ['screens', '화면 목록'],
              ['restrictions', '금지사항']
            ] as const).map(([key, label]) => (
              <div key={key}>
                <label className="text-xs text-slate-400" htmlFor={`vibe-${key}`}>
                  {label}
                </label>
                <textarea
                  id={`vibe-${key}`}
                  disabled={!isEditing}
                  value={extra[key]}
                  onChange={(event) => setExtra({ ...extra, [key]: event.target.value })}
                  className="mt-1 min-h-[80px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        )}

        {(extra?.type === 'real-estate' || extra?.type === 'stock') && (
          <div className="grid gap-3 rounded-xl border border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-slate-200">관심 정보</h3>
            <label className="text-xs text-slate-400" htmlFor="keywords">
              관심 키워드
            </label>
            <input
              id="keywords"
              disabled={!isEditing}
              value={extra.keywords}
              onChange={(event) => setExtra({ ...extra, keywords: event.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
            <label className="text-xs text-slate-400" htmlFor="links">
              링크
            </label>
            <textarea
              id="links"
              disabled={!isEditing}
              value={extra.links}
              onChange={(event) => setExtra({ ...extra, links: event.target.value })}
              className="min-h-[80px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
            <label className="text-xs text-slate-400" htmlFor="memo">
              메모
            </label>
            <textarea
              id="memo"
              disabled={!isEditing}
              value={extra.memo}
              onChange={(event) => setExtra({ ...extra, memo: event.target.value })}
              className="min-h-[80px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>
        )}

        {extra?.type === 'self-care' && (
          <div className="grid gap-3 rounded-xl border border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-slate-200">자기관리</h3>
            <div className="grid gap-2">
              <p className="text-xs text-slate-400">Habits</p>
              {extra.habits.map((habit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    disabled={!isEditing}
                    checked={habit.checked}
                    onChange={(event) => {
                      const next = [...extra.habits];
                      next[index] = { ...habit, checked: event.target.checked };
                      setHabits(next);
                    }}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950"
                  />
                  <input
                    disabled={!isEditing}
                    value={habit.label}
                    onChange={(event) => {
                      const next = [...extra.habits];
                      next[index] = { ...habit, label: event.target.value };
                      setHabits(next);
                    }}
                    placeholder="습관"
                    className="flex-1 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                  />
                </div>
              ))}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setHabits([...extra.habits, { label: '', checked: false }])}
                  className="self-start rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                >
                  습관 추가
                </button>
              )}
            </div>
            <div>
              <label className="text-xs text-slate-400" htmlFor="routine">
                루틴
              </label>
              <textarea
                id="routine"
                disabled={!isEditing}
                value={extra.routine}
                onChange={(event) => setExtra({ ...extra, routine: event.target.value })}
                className="mt-1 min-h-[70px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400" htmlFor="goals">
                목표
              </label>
              <textarea
                id="goals"
                disabled={!isEditing}
                value={extra.goals}
                onChange={(event) => setExtra({ ...extra, goals: event.target.value })}
                className="mt-1 min-h-[70px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400" htmlFor="weeklyReview">
                주간 회고
              </label>
              <textarea
                id="weeklyReview"
                disabled={!isEditing}
                value={extra.weeklyReview}
                onChange={(event) => setExtra({ ...extra, weeklyReview: event.target.value })}
                className="mt-1 min-h-[70px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950"
          >
            저장
          </button>
        </div>
      )}
    </section>
  );
}
