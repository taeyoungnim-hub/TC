import axios from 'axios';

export class PerplexityService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.perplexity.ai';
  }

  async chat(messages, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: options.model || 'llama-3.1-sonar-large-128k-online',
          messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1000,
          top_p: options.topP || 0.95
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        content: response.data.choices[0].message.content,
        model: response.data.model,
        usage: response.data.usage
      };
    } catch (error) {
      console.error('Perplexity API Error:', error);
      throw new Error(`Perplexity: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async streamChat(messages, options = {}, onChunk) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: options.model || 'llama-3.1-sonar-large-128k-online',
          messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1000,
          top_p: options.topP || 0.95,
          stream: true
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'stream'
        }
      );

      let fullContent = '';
      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
            if (line.includes('[DONE]')) continue;
            if (line.startsWith('data: ')) {
              try {
                const json = JSON.parse(line.slice(6));
                const content = json.choices[0]?.delta?.content || '';
                if (content) {
                  fullContent += content;
                  onChunk(content);
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        });

        response.data.on('end', () => {
          resolve({ content: fullContent });
        });

        response.data.on('error', (err) => {
          reject(new Error(`Perplexity Stream: ${err.message}`));
        });
      });
    } catch (error) {
      console.error('Perplexity Streaming Error:', error);
      throw new Error(`Perplexity Stream: ${error.message}`);
    }
  }
}
