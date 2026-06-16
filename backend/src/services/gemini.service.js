import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async chat(messages, options = {}) {
    try {
      const model = this.genAI.getGenerativeModel({
        model: options.model || 'gemini-1.5-pro',
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 1000,
          topP: options.topP || 0.95
        }
      });

      // Convert messages to Gemini format
      const history = [];
      const systemMessage = messages.find(m => m.role === 'system');
      const conversationMessages = messages.filter(m => m.role !== 'system');

      for (let i = 0; i < conversationMessages.length - 1; i++) {
        const msg = conversationMessages[i];
        history.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }

      const chat = model.startChat({
        history,
        systemInstruction: systemMessage?.content
      });

      const lastMessage = conversationMessages[conversationMessages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      const response = await result.response;

      return {
        content: response.text(),
        model: options.model || 'gemini-1.5-pro'
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Gemini: ${error.message}`);
    }
  }

  async streamChat(messages, options = {}, onChunk) {
    try {
      const model = this.genAI.getGenerativeModel({
        model: options.model || 'gemini-1.5-pro',
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 1000,
          topP: options.topP || 0.95
        }
      });

      const history = [];
      const systemMessage = messages.find(m => m.role === 'system');
      const conversationMessages = messages.filter(m => m.role !== 'system');

      for (let i = 0; i < conversationMessages.length - 1; i++) {
        const msg = conversationMessages[i];
        history.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }

      const chat = model.startChat({
        history,
        systemInstruction: systemMessage?.content
      });

      const lastMessage = conversationMessages[conversationMessages.length - 1];
      const result = await chat.sendMessageStream(lastMessage.content);

      let fullContent = '';
      for await (const chunk of result.stream) {
        const content = chunk.text();
        fullContent += content;
        onChunk(content);
      }

      return { content: fullContent };
    } catch (error) {
      console.error('Gemini Streaming Error:', error);
      throw new Error(`Gemini Stream: ${error.message}`);
    }
  }
}
