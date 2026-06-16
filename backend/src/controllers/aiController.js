import { OpenAIService } from '../services/openai.service.js';
import { ClaudeService } from '../services/claude.service.js';
import { GeminiService } from '../services/gemini.service.js';
import { DeepSeekService } from '../services/deepseek.service.js';
import { GrokService } from '../services/grok.service.js';
import { PerplexityService } from '../services/perplexity.service.js';
import { SOPS, MODES } from '../config/sops.js';

export class AIController {
  constructor() {
    this.services = {};
  }

  initializeServices(apiKeys) {
    if (apiKeys.openai) {
      this.services.chatgpt = new OpenAIService(apiKeys.openai);
    }
    if (apiKeys.anthropic) {
      this.services.claude = new ClaudeService(apiKeys.anthropic);
    }
    if (apiKeys.google) {
      this.services.gemini = new GeminiService(apiKeys.google);
    }
    if (apiKeys.deepseek) {
      this.services.deepseek = new DeepSeekService(apiKeys.deepseek);
    }
    if (apiKeys.xai) {
      this.services.grok = new GrokService(apiKeys.xai);
    }
    if (apiKeys.perplexity) {
      this.services.perplexity = new PerplexityService(apiKeys.perplexity);
    }
  }

  async chat(req, res) {
    try {
      const { ai, messages, mode, sop, apiKeys } = req.body;

      if (!ai || !messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid request parameters' });
      }

      // Initialize services with provided API keys
      this.initializeServices(apiKeys || {});

      const service = this.services[ai];
      if (!service) {
        return res.status(400).json({ error: `AI service '${ai}' not configured or API key missing` });
      }

      // Apply SOP if specified
      let finalMessages = [...messages];
      if (sop && SOPS[sop]) {
        finalMessages = [
          { role: 'system', content: SOPS[sop] },
          ...messages.filter(m => m.role !== 'system')
        ];
      }

      // Apply mode settings
      const modeSettings = MODES[mode] || MODES.normal;

      const result = await service.chat(finalMessages, modeSettings);

      res.json({
        success: true,
        ai,
        content: result.content,
        model: result.model,
        usage: result.usage
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async parallelChat(req, res) {
    try {
      const { ais, message, mode, sop, apiKeys } = req.body;

      if (!ais || !Array.isArray(ais) || !message) {
        return res.status(400).json({ error: 'Invalid request parameters' });
      }

      // Initialize services
      this.initializeServices(apiKeys || {});

      // Prepare messages
      let messages = [{ role: 'user', content: message }];
      if (sop && SOPS[sop]) {
        messages = [
          { role: 'system', content: SOPS[sop] },
          ...messages
        ];
      }

      const modeSettings = MODES[mode] || MODES.normal;

      // Send to all AIs in parallel
      const promises = ais.map(async (ai) => {
        try {
          const service = this.services[ai];
          if (!service) {
            return {
              ai,
              success: false,
              error: `AI service '${ai}' not configured or API key missing`
            };
          }

          const result = await service.chat(messages, modeSettings);
          return {
            ai,
            success: true,
            content: result.content,
            model: result.model,
            usage: result.usage
          };
        } catch (error) {
          return {
            ai,
            success: false,
            error: error.message
          };
        }
      });

      const results = await Promise.all(promises);

      res.json({
        success: true,
        results
      });
    } catch (error) {
      console.error('Parallel chat error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async deepResearch(req, res) {
    try {
      const { ais, message, sop, apiKeys } = req.body;

      if (!ais || !Array.isArray(ais) || !message) {
        return res.status(400).json({ error: 'Invalid request parameters' });
      }

      this.initializeServices(apiKeys || {});

      // Phase 1: Initial responses from all AIs
      let messages = [{ role: 'user', content: message }];
      if (sop && SOPS[sop]) {
        messages = [
          { role: 'system', content: SOPS[sop] },
          ...messages
        ];
      }

      const modeSettings = MODES.deep_research;

      const phase1Promises = ais.map(async (ai) => {
        try {
          const service = this.services[ai];
          if (!service) return null;
          const result = await service.chat(messages, modeSettings);
          return { ai, content: result.content };
        } catch (error) {
          return { ai, content: `Error: ${error.message}` };
        }
      });

      const phase1Results = await Promise.all(phase1Promises);
      const validResults = phase1Results.filter(r => r !== null);

      // Phase 2: Cross-review (each AI reviews another AI's response)
      const phase2Promises = validResults.map(async (result, index) => {
        try {
          const reviewerAI = result.ai;
          const targetAI = validResults[(index + 1) % validResults.length].ai;
          const targetResponse = validResults[(index + 1) % validResults.length].content;

          const reviewMessages = [
            { role: 'system', content: '다른 AI의 답변을 비판적으로 검토하고 피드백을 제공하세요.' },
            { role: 'user', content: `원래 질문: ${message}\n\n${targetAI}의 답변:\n${targetResponse}\n\n이 답변에 대한 비평과 개선점을 제시해주세요.` }
          ];

          const service = this.services[reviewerAI];
          if (!service) return null;

          const reviewResult = await service.chat(reviewMessages, modeSettings);
          return {
            reviewer: reviewerAI,
            target: targetAI,
            review: reviewResult.content
          };
        } catch (error) {
          return {
            reviewer: result.ai,
            error: error.message
          };
        }
      });

      const phase2Results = await Promise.all(phase2Promises);

      // Phase 3: Final summary by ChatGPT
      let finalSummary = null;
      if (this.services.chatgpt) {
        try {
          const summaryPrompt = `다음은 여러 AI들의 답변과 상호 리뷰입니다:\n\n` +
            `원래 질문: ${message}\n\n` +
            `=== 각 AI의 초기 답변 ===\n` +
            validResults.map(r => `${r.ai}:\n${r.content}\n`).join('\n') +
            `\n=== 상호 리뷰 ===\n` +
            phase2Results.map(r => r.review ? `${r.reviewer}가 ${r.target}을 리뷰:\n${r.review}\n` : '').join('\n') +
            `\n위 내용을 종합하여:\n1. 핵심 주장들\n2. 의견 일치/불일치 지점\n3. 주요 리스크와 한계\n4. 최종 결론\n을 정리해주세요.`;

          const summaryMessages = [
            { role: 'system', content: '당신은 여러 AI의 의견을 종합하고 정리하는 전문가입니다.' },
            { role: 'user', content: summaryPrompt }
          ];

          const summaryResult = await this.services.chatgpt.chat(summaryMessages, modeSettings);
          finalSummary = summaryResult.content;
        } catch (error) {
          finalSummary = `Summary generation failed: ${error.message}`;
        }
      }

      res.json({
        success: true,
        phase1: validResults,
        phase2: phase2Results,
        summary: finalSummary
      });
    } catch (error) {
      console.error('Deep research error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
