import OpenAI from 'openai';

export class OpenAIService {
  constructor(apiKey) {
    this.client = new OpenAI({ apiKey });
  }

  async chat(messages, options = {}) {
    try {
      const response = await this.client.chat.completions.create({
        model: options.model || 'gpt-4-turbo-preview',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
        top_p: options.topP || 0.95
      });

      return {
        content: response.choices[0].message.content,
        model: response.model,
        usage: response.usage
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`ChatGPT: ${error.message}`);
    }
  }

  async streamChat(messages, options = {}, onChunk) {
    try {
      const stream = await this.client.chat.completions.create({
        model: options.model || 'gpt-4-turbo-preview',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
        top_p: options.topP || 0.95,
        stream: true
      });

      let fullContent = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          onChunk(content);
        }
      }

      return { content: fullContent };
    } catch (error) {
      console.error('OpenAI Streaming Error:', error);
      throw new Error(`ChatGPT Stream: ${error.message}`);
    }
  }
}
