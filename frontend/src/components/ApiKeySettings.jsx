import React, { useState } from 'react';
import { X, Key, Save } from 'lucide-react';

function ApiKeySettings({ apiKeys, onSave, onClose }) {
  const [keys, setKeys] = useState({
    openai: apiKeys.openai || '',
    anthropic: apiKeys.anthropic || '',
    google: apiKeys.google || '',
    deepseek: apiKeys.deepseek || '',
    xai: apiKeys.xai || '',
    perplexity: apiKeys.perplexity || ''
  });

  const handleChange = (key, value) => {
    setKeys(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(keys);
  };

  const API_KEY_FIELDS = [
    { key: 'openai', label: 'OpenAI (ChatGPT)', icon: '🤖' },
    { key: 'google', label: 'Google (Gemini)', icon: '✨' },
    { key: 'anthropic', label: 'Anthropic (Claude)', icon: '🧠' },
    { key: 'deepseek', label: 'DeepSeek', icon: '🔍' },
    { key: 'xai', label: 'xAI (Grok)', icon: '⚡' },
    { key: 'perplexity', label: 'Perplexity', icon: '🎯' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">API 키 설정</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            {API_KEY_FIELDS.map(({ key, label, icon }) => (
              <div key={key} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span className="text-xl">{icon}</span>
                  {label}
                </label>
                <input
                  type="password"
                  value={keys[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={`${label} API Key`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>💡 안내:</strong> API 키는 브라우저의 로컬 스토리지에 저장됩니다.
              각 AI 서비스의 공식 웹사이트에서 API 키를 발급받으세요.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApiKeySettings;
