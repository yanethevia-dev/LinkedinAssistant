// AI Service - Unified provider abstraction

import type { AIRequest, AIResponse, AIError, AIProvider } from '../shared/types';

class AIService {
  /**
   * Generate content using specified AI provider
   */
  async generateContent(request: AIRequest, apiKey: string): Promise<AIResponse> {
    console.log(`[AIService] Generating content with ${request.provider}`);

    const model = request.model;
    const temperature = request.temperature ?? 0.7;
    const maxTokens = request.maxTokens ?? 2048;

    try {
      switch (request.provider) {
        case 'claude':
          return await this.callClaude(
            apiKey,
            model || 'claude-3-5-sonnet-20241022',
            request.systemPrompt,
            request.userPrompt,
            temperature,
            maxTokens
          );

        case 'openai':
          return await this.callOpenAI(
            apiKey,
            model || 'gpt-4-turbo',
            request.systemPrompt,
            request.userPrompt,
            temperature,
            maxTokens
          );

        case 'gemini':
          return await this.callGemini(
            apiKey,
            model || 'gemini-pro',
            request.systemPrompt,
            request.userPrompt,
            temperature,
            maxTokens
          );

        case 'groq':
          return await this.callGroq(
            apiKey,
            model || 'llama-3.1-70b-versatile',
            request.systemPrompt,
            request.userPrompt,
            temperature,
            maxTokens
          );

        default:
          throw {
            code: 'INVALID_PROVIDER',
            message: `Unknown provider: ${request.provider}`
          } as AIError;
      }
    } catch (error: any) {
      console.error(`[AIService] Error with ${request.provider}:`, error);
      throw this.normalizeError(error, request.provider);
    }
  }

  /**
   * Test API connection
   */
  async testConnection(provider: AIProvider, apiKey: string, model: string): Promise<boolean> {
    console.log(`[AIService] Testing connection to ${provider}`);

    try {
      const response = await this.generateContent(
        {
          provider,
          model,
          systemPrompt: 'You are a test assistant.',
          userPrompt: 'Reply with just the word "success"',
          temperature: 0,
          maxTokens: 10
        },
        apiKey
      );

      console.log(`[AIService] Test successful for ${provider}:`, response.content);
      return true;
    } catch (error: any) {
      console.error(`[AIService] Test failed for ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Call Claude (Anthropic) API
   */
  private async callClaude(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<AIResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw {
        code: error.error?.type || 'API_ERROR',
        message: error.error?.message || 'Claude API request failed',
        details: error
      } as AIError;
    }

    const data = await response.json();

    return {
      content: data.content[0].text,
      provider: 'claude',
      model,
      usage: {
        promptTokens: data.usage?.input_tokens,
        completionTokens: data.usage?.output_tokens,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      }
    };
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<AIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw {
        code: error.error?.code || 'API_ERROR',
        message: error.error?.message || 'OpenAI API request failed',
        details: error
      } as AIError;
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      provider: 'openai',
      model,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens
      }
    };
  }

  /**
   * Call Gemini (Google) API
   */
  private async callGemini(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<AIResponse> {
    // Gemini combines system and user prompt
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: combinedPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw {
        code: error.error?.code || 'API_ERROR',
        message: error.error?.message || 'Gemini API request failed',
        details: error
      } as AIError;
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]) {
      throw {
        code: 'NO_RESPONSE',
        message: 'Gemini returned no candidates',
        details: data
      } as AIError;
    }

    return {
      content: data.candidates[0].content.parts[0].text,
      provider: 'gemini',
      model,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount,
        completionTokens: data.usageMetadata?.candidatesTokenCount,
        totalTokens: data.usageMetadata?.totalTokenCount
      }
    };
  }

  /**
   * Call Groq API
   */
  private async callGroq(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<AIResponse> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw {
        code: error.error?.code || 'API_ERROR',
        message: error.error?.message || 'Groq API request failed',
        details: error
      } as AIError;
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      provider: 'groq',
      model,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens
      }
    };
  }

  /**
   * Normalize errors from different providers
   */
  private normalizeError(error: any, provider: AIProvider): AIError {
    // If already normalized
    if (error.code && error.message) {
      return error as AIError;
    }

    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error. Check your internet connection.',
        details: error
      };
    }

    // Generic error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || `Unknown error with ${provider}`,
      details: error
    };
  }
}

// Export singleton
export const aiService = new AIService();
