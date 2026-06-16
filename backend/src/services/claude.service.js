import Anthropic from '@anthropic-ai/sdk';

export class ClaudeService {
  constructor(apiKey) {
    this.client = new Anthropic({ apiKey });
  }

  async chat(messages, options = {}) {
    try {
      // Extract system message if present
      const systemMessage = messages.find(m => m.role === 'system');
      const conversationMessages = messages.filter(m => m.role !== 'system');

      const response = await this.client.messages.create({
        model: options.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        system: systemMessage?.content || undefined,
        messages: conversationMessages
      });

      return {
        content: response.content[0].text,
        model: response.model,
        usage: response.usage
      };
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error(`Claude: ${error.message}`);
    }
  }

  async streamChat(messages, options = {}, onChunk) {
    try {
      const systemMessage = messages.find(m => m.role === 'system');
      const conversationMessages = messages.filter(m => m.role !== 'system');

      const stream = await this.client.messages.create({
        model: options.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        system: systemMessage?.content || undefined,
        messages: conversationMessages,
        stream: true
      });

      let fullContent = '';
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const content = event.delta.text;
          fullContent += content;
          onChunk(content);
        }
      }

      return { content: fullContent };
    } catch (error) {
      console.error('Claude Streaming Error:', error);
      throw new Error(`Claude Stream: ${error.message}`);
    }
  }
}
