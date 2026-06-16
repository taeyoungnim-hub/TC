import React from 'react';
import { Zap, BookOpen, TrendingUp, Code, Lightbulb, DollarSign, Trash2 } from 'lucide-react';
import { AI_MODELS, MODES, SOPS } from '../constants/sops';

const SOP_ICONS = {
  economic_writing: DollarSign,
  book_review: BookOpen,
  investment_analysis: TrendingUp,
  vibe_coding: Code,
  prompt_creation: Lightbulb
};

function ControlPanel({ selectedMode, onModeChange, selectedSOP, onSOPChange, enabledAIs, onToggleAI, onClearAll }) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-wrap items-center gap-6">
        {/* Mode Selection */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700">모드:</label>
          <div className="flex gap-2">
            {Object.values(MODES).map((mode) => (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedMode === mode.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode.name}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300" />

        {/* SOP Selection */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700">템플릿:</label>
          <div className="flex gap-2">
            <button
              onClick={() => onSOPChange(null)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedSOP === null
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              없음
            </button>
            {Object.values(SOPS).map((sop) => {
              const Icon = SOP_ICONS[sop.id];
              return (
                <button
                  key={sop.id}
                  onClick={() => onSOPChange(sop.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    selectedSOP === sop.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={sop.description}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {sop.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300" />

        {/* AI Toggle */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700">AI:</label>
          <div className="flex gap-2">
            {AI_MODELS.map((ai) => (
              <button
                key={ai.id}
                onClick={() => onToggleAI(ai.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  enabledAIs.includes(ai.id)
                    ? `${ai.color} text-white shadow-md`
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                <span>{ai.icon}</span>
                <span>{ai.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Clear All Button */}
        <button
          onClick={onClearAll}
          className="ml-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          전체 삭제
        </button>
      </div>
    </div>
  );
}

export default ControlPanel;
