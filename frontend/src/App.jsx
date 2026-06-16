import React, { useState, useEffect } from 'react';
import { Settings, Sparkles } from 'lucide-react';
import ChatPanel from './components/ChatPanel';
import ControlPanel from './components/ControlPanel';
import ApiKeySettings from './components/ApiKeySettings';
import SummaryModal from './components/SummaryModal';
import { AI_MODELS, MODES, SOPS } from './constants/sops';
import { chatAPI } from './services/api';

function App() {
  const [selectedMode, setSelectedMode] = useState('normal');
  const [selectedSOP, setSelectedSOP] = useState(null);
  const [enabledAIs, setEnabledAIs] = useState(AI_MODELS.map(ai => ai.id));
  const [showSettings, setShowSettings] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [apiKeys, setApiKeys] = useState({});
  const [globalMessage, setGlobalMessage] = useState('');
  const [chatHistories, setChatHistories] = useState(
    AI_MODELS.reduce((acc, ai) => ({ ...acc, [ai.id]: [] }), {})
  );
  const [isDeepResearch, setIsDeepResearch] = useState(false);
  const [deepResearchData, setDeepResearchData] = useState(null);

  // Load API keys from localStorage
  useEffect(() => {
    const savedKeys = localStorage.getItem('multiAI_apiKeys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
  }, []);

  // Save API keys to localStorage
  const handleSaveApiKeys = (keys) => {
    setApiKeys(keys);
    localStorage.setItem('multiAI_apiKeys', JSON.stringify(keys));
    setShowSettings(false);
  };

  // Toggle AI enable/disable
  const toggleAI = (aiId) => {
    setEnabledAIs(prev =>
      prev.includes(aiId)
        ? prev.filter(id => id !== aiId)
        : [...prev, aiId]
    );
  };

  // Send message to single AI
  const sendToAI = async (aiId, message) => {
    const history = [...chatHistories[aiId], { role: 'user', content: message }];

    setChatHistories(prev => ({
      ...prev,
      [aiId]: history
    }));

    try {
      const result = await chatAPI.chat(aiId, history, selectedMode, selectedSOP, apiKeys);

      if (result.success) {
        setChatHistories(prev => ({
          ...prev,
          [aiId]: [...prev[aiId], { role: 'assistant', content: result.content }]
        }));
      } else {
        setChatHistories(prev => ({
          ...prev,
          [aiId]: [...prev[aiId], {
            role: 'assistant',
            content: `❌ Error: ${result.error}`,
            isError: true
          }]
        }));
      }
    } catch (error) {
      setChatHistories(prev => ({
        ...prev,
        [aiId]: [...prev[aiId], {
          role: 'assistant',
          content: `❌ Error: ${error.message}`,
          isError: true
        }]
      }));
    }
  };

  // Send message to all enabled AIs in parallel
  const sendToAllAIs = async () => {
    if (!globalMessage.trim()) return;

    const messageToSend = globalMessage; // save before clearing
    const activeAIs = enabledAIs.slice();

    if (activeAIs.length === 0) {
      alert('최소 1개 이상의 AI를 활성화해주세요.');
      return;
    }

    // Add user message to all active AI histories
    const updatedHistories = { ...chatHistories };
    activeAIs.forEach(aiId => {
      updatedHistories[aiId] = [
        ...updatedHistories[aiId],
        { role: 'user', content: messageToSend }
      ];
    });
    setChatHistories(updatedHistories);

    // Clear global message
    setGlobalMessage('');

    // Check if deep research mode
    if (selectedMode === 'deep_research') {
      setIsDeepResearch(true);
      try {
        const result = await chatAPI.deepResearch(activeAIs, messageToSend, selectedSOP, apiKeys);

        if (result.success) {
          // Update histories with phase 1 results
          const newHistories = { ...chatHistories };
          result.phase1.forEach(({ ai, content }) => {
            newHistories[ai] = [
              ...newHistories[ai].filter(m => m.role === 'user'),
              { role: 'assistant', content }
            ];
          });
          setChatHistories(newHistories);

          // Save deep research data for summary
          setDeepResearchData(result);
          setShowSummary(true);
        }
      } catch (error) {
        console.error('Deep research error:', error);
      } finally {
        setIsDeepResearch(false);
      }
    } else {
      // Regular parallel chat
      try {
        const result = await chatAPI.parallelChat(activeAIs, messageToSend, selectedMode, selectedSOP, apiKeys);

        if (result.success) {
          const newHistories = { ...chatHistories };
          result.results.forEach(({ ai, success, content, error }) => {
            newHistories[ai] = [
              ...newHistories[ai],
              {
                role: 'assistant',
                content: success ? content : `❌ Error: ${error}`,
                isError: !success
              }
            ];
          });
          setChatHistories(newHistories);
        }
      } catch (error) {
        console.error('Parallel chat error:', error);
      }
    }
  };

  // Clear all chat histories
  const clearAllChats = () => {
    if (window.confirm('모든 채팅 내역을 삭제하시겠습니까?')) {
      setChatHistories(AI_MODELS.reduce((acc, ai) => ({ ...acc, [ai.id]: [] }), {}));
    }
  };

  // Clear single AI chat
  const clearChat = (aiId) => {
    setChatHistories(prev => ({
      ...prev,
      [aiId]: []
    }));
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Multi-AI Chat</h1>
              <p className="text-sm text-gray-600">6개 AI 병렬 채팅 시스템</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="API 키 설정"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Control Panel */}
      <ControlPanel
        selectedMode={selectedMode}
        onModeChange={setSelectedMode}
        selectedSOP={selectedSOP}
        onSOPChange={setSelectedSOP}
        enabledAIs={enabledAIs}
        onToggleAI={toggleAI}
        onClearAll={clearAllChats}
      />

      {/* Global Message Input */}
      <div className="px-6 py-3 bg-white border-b border-gray-200">
        <div className="flex gap-3">
          <input
            type="text"
            value={globalMessage}
            onChange={(e) => setGlobalMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendToAllAIs()}
            placeholder="모든 AI에게 동시에 메시지 보내기..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendToAllAIs}
            disabled={!globalMessage.trim() || isDeepResearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isDeepResearch ? '처리중...' : '전송'}
          </button>
        </div>
      </div>

      {/* Chat Panels Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-6 gap-2 p-4">
          {AI_MODELS.map((ai) => (
            <ChatPanel
              key={ai.id}
              ai={ai}
              enabled={enabledAIs.includes(ai.id)}
              messages={chatHistories[ai.id]}
              onSendMessage={(message) => sendToAI(ai.id, message)}
              onClear={() => clearChat(ai.id)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      {showSettings && (
        <ApiKeySettings
          apiKeys={apiKeys}
          onSave={handleSaveApiKeys}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showSummary && deepResearchData && (
        <SummaryModal
          data={deepResearchData}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  );
}

export default App;
