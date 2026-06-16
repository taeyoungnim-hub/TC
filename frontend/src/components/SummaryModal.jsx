import React from 'react';
import { X, Download, Copy, CheckCircle } from 'lucide-react';

function SummaryModal({ data, onClose }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const text = formatSummaryText(data);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = formatSummaryText(data);
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-research-summary-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatSummaryText = (data) => {
    let text = '# Multi-AI 심층 연구 결과\n\n';
    text += `생성 시간: ${new Date().toLocaleString('ko-KR')}\n\n`;

    text += '## Phase 1: 각 AI의 초기 답변\n\n';
    data.phase1?.forEach(({ ai, content }) => {
      text += `### ${ai}\n${content}\n\n`;
    });

    text += '## Phase 2: 상호 리뷰\n\n';
    data.phase2?.forEach(({ reviewer, target, review }) => {
      if (review) {
        text += `### ${reviewer}가 ${target}을 리뷰\n${review}\n\n`;
      }
    });

    text += '## 최종 종합 결론 (ChatGPT)\n\n';
    text += data.summary || '요약을 생성하지 못했습니다.';

    return text;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">심층 연구 결과</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Phase 1 */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Phase 1</span>
              각 AI의 초기 답변
            </h3>
            <div className="space-y-4">
              {data.phase1?.map(({ ai, content }) => (
                <div key={ai} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">{ai}</div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 2 */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Phase 2</span>
              상호 리뷰
            </h3>
            <div className="space-y-4">
              {data.phase2?.map(({ reviewer, target, review }, idx) => (
                review && (
                  <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="font-semibold text-purple-900 mb-2">
                      {reviewer} → {target}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{review}</p>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Summary */}
          {data.summary && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Final</span>
                최종 종합 결론 (ChatGPT)
              </h3>
              <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6">
                <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {data.summary}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {copied ? '복사됨!' : '복사'}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            다운로드
          </button>
        </div>
      </div>
    </div>
  );
}

export default SummaryModal;
