// AI Helper - Wrapper to call AI service from content script

import { MessageTypes } from '../shared/constants';
import type { AIRequest, AIResponse } from '../shared/types';

export class AIHelper {
  /**
   * Call AI service via background worker
   */
  async callAI(request: { systemPrompt: string; userPrompt: string; temperature?: number; maxTokens?: number }): Promise<AIResponse> {
    console.log('[AIHelper] Calling AI service...');

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: MessageTypes.GENERATE_CONTENT,
          payload: request
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('[AIHelper] Runtime error:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          if (!response) {
            console.error('[AIHelper] No response from background');
            reject(new Error('No response from AI service'));
            return;
          }

          if (!response.success) {
            console.error('[AIHelper] AI request failed:', response.error);
            const errorMsg = typeof response.error === 'string'
              ? response.error
              : response.error?.message || 'AI request failed';
            reject(new Error(errorMsg));
            return;
          }

          console.log('[AIHelper] AI response received');
          resolve(response.data);
        }
      );
    });
  }

  /**
   * Generate LinkedIn post from topic
   */
  async generatePost(topic: string, tone?: string, audience?: string): Promise<string> {
    try {
      const response = await this.callAI({
        systemPrompt: `Eres un experto en crear contenido viral para LinkedIn. Tu objetivo es generar posts profesionales, atractivos y optimizados para engagement.

REGLAS:
- Usa un tono profesional pero accesible
- Incluye emojis estratégicamente (máximo 3-4)
- Estructura: Hook + Contenido + Call-to-action
- Longitud ideal: 150-300 palabras
- Incluye espaciado con saltos de línea para legibilidad
- Añade 3-5 hashtags relevantes al final
- NO uses markdown, solo texto plano`,
        userPrompt: `Genera un post de LinkedIn sobre: "${topic}"${tone ? `\n\nTono: ${tone}` : ''}${audience ? `\n\nAudiencia: ${audience}` : ''}\n\nGenera SOLO el texto del post, listo para copiar y pegar.`,
        temperature: 0.8,
        maxTokens: 500
      });

      return response.content;
    } catch (error: any) {
      console.error('[AIHelper] Error generating post:', error);
      throw error;
    }
  }

  /**
   * Improve existing LinkedIn post
   */
  async improvePost(originalPost: string, focusArea?: string): Promise<string> {
    try {
      const response = await this.callAI({
        systemPrompt: `Eres un experto en optimizar contenido de LinkedIn para máximo engagement.

TAREAS:
- Mejorar el hook para capturar más atención
- Optimizar estructura y legibilidad
- Añadir emojis estratégicos (si faltan)
- Mejorar claridad y profesionalismo
- Sugerir hashtags relevantes (si faltan)
- Mantener la esencia del mensaje original`,
        userPrompt: `Mejora este post de LinkedIn:\n\n"${originalPost}"${focusArea ? `\n\nEnfócate en: ${focusArea}` : ''}\n\nDevuelve el post mejorado.`,
        temperature: 0.7,
        maxTokens: 600
      });

      return response.content;
    } catch (error: any) {
      console.error('[AIHelper] Error improving post:', error);
      throw error;
    }
  }

  /**
   * Generate CV from profile data
   */
  async generateCV(profileData: any): Promise<string> {
    try {
      let prompt = `Genera un CV profesional para:\n\n`;
      prompt += `NOMBRE: ${profileData.name}\n`;
      prompt += `TÍTULO: ${profileData.headline}\n\n`;

      if (profileData.about) {
        prompt += `ACERCA DE:\n${profileData.about}\n\n`;
      }

      if (profileData.experiences && profileData.experiences.length > 0) {
        prompt += `EXPERIENCIA:\n`;
        profileData.experiences.forEach((exp: any, idx: number) => {
          prompt += `${idx + 1}. ${exp.title} en ${exp.company} (${exp.duration})\n`;
          if (exp.description) {
            prompt += `   ${exp.description}\n`;
          }
        });
        prompt += `\n`;
      }

      if (profileData.education && profileData.education.length > 0) {
        prompt += `EDUCACIÓN:\n`;
        profileData.education.forEach((edu: any, idx: number) => {
          prompt += `${idx + 1}. ${edu.degree} - ${edu.institution}\n`;
        });
        prompt += `\n`;
      }

      prompt += `Crea un CV profesional en formato texto, bien estructurado.`;

      const response = await this.callAI({
        systemPrompt: `Eres un experto en recursos humanos y creación de CVs profesionales. Crea CVs bien estructurados, orientados a logros, y optimizados para ATS.`,
        userPrompt: prompt,
        temperature: 0.7,
        maxTokens: 1500
      });

      return response.content;
    } catch (error: any) {
      console.error('[AIHelper] Error generating CV:', error);
      throw error;
    }
  }

  /**
   * Improve profile About section
   */
  async improveAbout(currentAbout: string, role?: string): Promise<string> {
    try {
      const response = await this.callAI({
        systemPrompt: `Eres un experto en personal branding y optimización de perfiles de LinkedIn. Mejora secciones "Acerca de" para que sean impactantes, auténticas y optimizadas.`,
        userPrompt: `Mejora esta sección "Acerca de":\n\n"${currentAbout}"${role ? `\n\nRol: ${role}` : ''}\n\nDevuelve la versión mejorada.`,
        temperature: 0.7,
        maxTokens: 400
      });

      return response.content;
    } catch (error: any) {
      console.error('[AIHelper] Error improving about:', error);
      throw error;
    }
  }

  /**
   * Analyze complete profile and give suggestions
   */
  async analyzeProfile(profileData: any): Promise<string> {
    try {
      const prompt = `Analiza este perfil de LinkedIn:

TITULAR: ${profileData.headline || 'No disponible'}
ACERCA DE: ${profileData.about ? profileData.about.substring(0, 200) + '...' : 'No disponible'}
EXPERIENCIAS: ${profileData.experienceCount || 0}
EDUCACIÓN: ${profileData.educationCount || 0}

Da sugerencias concretas de mejora para cada sección.`;

      const response = await this.callAI({
        systemPrompt: `Eres un consultor experto en LinkedIn. Analiza perfiles y da sugerencias concretas, específicas y accionables para mejorar.`,
        userPrompt: prompt,
        temperature: 0.7,
        maxTokens: 800
      });

      return response.content;
    } catch (error: any) {
      console.error('[AIHelper] Error analyzing profile:', error);
      throw error;
    }
  }
}

// Export singleton
export const aiHelper = new AIHelper();
