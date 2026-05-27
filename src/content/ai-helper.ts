// AI Helper - Wrapper to call AI service from content script

import { MessageTypes } from '../shared/constants';
import type { AIRequest, AIResponse } from '../shared/types';
import type { WritingStyle } from './writing-style-selector';

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
   * Generate LinkedIn post from topic with writing style
   */
  async generatePost(
    topic: string,
    language: 'es' | 'en' = 'es',
    writingStyle?: WritingStyle
  ): Promise<string> {
    try {
      // Style-specific instructions
      const styleInstructions = {
        professional: {
          es: 'Tono PROFESIONAL Y CORPORATIVO: Formal, estructurado, ideal para anuncios oficiales. Lenguaje pulido y autoridad.',
          en: 'PROFESSIONAL & CORPORATE tone: Formal, structured, ideal for official announcements. Polished language and authority.'
        },
        technical: {
          es: 'Tono TÉCNICO SENIOR: Como un Senior Engineer. Profundidad técnica, menciona tecnologías, arquitecturas, best practices. Experto pero no pedante.',
          en: 'TECHNICAL SENIOR tone: Like a Senior Engineer. Technical depth, mention technologies, architectures, best practices. Expert but not pedantic.'
        },
        casual: {
          es: 'Tono CERCANO Y CASUAL: Conversacional, accesible, humano. EVITA sonar corporativo o robótico. Como hablarías con un colega en un café.',
          en: 'FRIENDLY & CASUAL tone: Conversational, accessible, human. AVOID sounding corporate or robotic. Like talking to a colleague at a coffee shop.'
        },
        'recruiter-friendly': {
          es: 'Tono ENFOCADO A RECRUITERS: Resalta skills, logros, experiencia. Incluye keywords que buscan reclutadores. Demuestra valor profesional claramente.',
          en: 'RECRUITER-FRIENDLY tone: Highlight skills, achievements, experience. Include keywords recruiters search for. Demonstrate professional value clearly.'
        },
        founder: {
          es: 'Tono ESTILO FOUNDER: Visionario, motivador, comparte insights de negocio y liderazgo. Habla de desafíos, aprendizajes, construcción de equipos.',
          en: 'FOUNDER STYLE tone: Visionary, motivating, share business and leadership insights. Talk about challenges, learnings, team building.'
        },
        concise: {
          es: 'Tono CONCISO Y DIRECTO: Breve, al punto, sin rodeos. Máximo impacto en pocas palabras. Sin fluff. Directo al grano.',
          en: 'CONCISE & DIRECT tone: Brief, to the point, no fluff. Maximum impact in few words. Straight to the point.'
        },
        storytelling: {
          es: 'Tono STORYTELLING: Narrativo y emocional. Cuenta una historia que conecta con la audiencia. Inicio, desarrollo, conclusión. Crea conexión emocional.',
          en: 'STORYTELLING tone: Narrative and emotional. Tell a story that connects with audience. Beginning, development, conclusion. Create emotional connection.'
        }
      };

      const baseSystemPrompts = {
        es: `Eres un experto en crear contenido viral para LinkedIn. Tu objetivo es generar posts atractivos y optimizados para engagement EN ESPAÑOL.

REGLAS GENERALES:
- Incluye emojis estratégicamente (máximo 3-4)
- Estructura: Hook + Contenido + Call-to-action
- Longitud ideal: 150-300 palabras (ajusta según estilo)
- Incluye espaciado con saltos de línea para legibilidad
- Añade 3-5 hashtags relevantes al final
- NO uses markdown, solo texto plano
- ESCRIBE TODO EN ESPAÑOL`,
        en: `You are an expert at creating viral content for LinkedIn. Your goal is to generate engaging posts optimized for engagement IN ENGLISH.

GENERAL RULES:
- Include emojis strategically (maximum 3-4)
- Structure: Hook + Content + Call-to-action
- Ideal length: 150-300 words (adjust based on style)
- Include spacing with line breaks for readability
- Add 3-5 relevant hashtags at the end
- DO NOT use markdown, only plain text
- WRITE EVERYTHING IN ENGLISH`
      };

      // Build system prompt with style
      let systemPrompt = baseSystemPrompts[language];
      if (writingStyle && styleInstructions[writingStyle]) {
        systemPrompt += '\n\n' + styleInstructions[writingStyle][language];
      }

      const userPrompts = {
        es: `Genera un post de LinkedIn sobre: "${topic}"\n\nGenera SOLO el texto del post, listo para copiar y pegar.`,
        en: `Generate a LinkedIn post about: "${topic}"\n\nGenerate ONLY the post text, ready to copy and paste.`
      };

      const response = await this.callAI({
        systemPrompt,
        userPrompt: userPrompts[language],
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
   * Improve existing LinkedIn post with writing style
   */
  async improvePost(
    originalPost: string,
    language: 'es' | 'en' = 'es',
    writingStyle?: WritingStyle
  ): Promise<string> {
    try {
      // Style-specific instructions (same as generatePost)
      const styleInstructions = {
        professional: {
          es: 'TONO PROFESIONAL: Formal, corporativo, estructurado. Lenguaje pulido con autoridad.',
          en: 'PROFESSIONAL TONE: Formal, corporate, structured. Polished language with authority.'
        },
        technical: {
          es: 'TONO TÉCNICO: Como Senior Engineer. Profundidad técnica, menciona tecnologías y best practices.',
          en: 'TECHNICAL TONE: Like Senior Engineer. Technical depth, mention technologies and best practices.'
        },
        casual: {
          es: 'TONO CASUAL: Conversacional, cercano, humano. EVITA sonar corporativo.',
          en: 'CASUAL TONE: Conversational, friendly, human. AVOID sounding corporate.'
        },
        'recruiter-friendly': {
          es: 'TONO RECRUITER-FRIENDLY: Resalta skills, logros, keywords que buscan reclutadores.',
          en: 'RECRUITER-FRIENDLY TONE: Highlight skills, achievements, keywords recruiters search for.'
        },
        founder: {
          es: 'TONO FOUNDER: Visionario, comparte insights de liderazgo y construcción.',
          en: 'FOUNDER TONE: Visionary, share leadership and building insights.'
        },
        concise: {
          es: 'TONO CONCISO: Breve, directo, sin rodeos. Máximo impacto mínimas palabras.',
          en: 'CONCISE TONE: Brief, direct, no fluff. Maximum impact minimum words.'
        },
        storytelling: {
          es: 'TONO STORYTELLING: Narrativo, emocional, cuenta una historia que conecta.',
          en: 'STORYTELLING TONE: Narrative, emotional, tell a story that connects.'
        }
      };

      const baseSystemPrompts = {
        es: `Eres un experto en optimizar contenido de LinkedIn para máximo engagement.

TAREAS:
- Mejorar el hook para capturar más atención
- Optimizar estructura y legibilidad
- Añadir emojis estratégicos (si faltan)
- Mejorar claridad
- Sugerir hashtags relevantes (si faltan)
- Mantener la esencia del mensaje original
- ESCRIBE TODO EN ESPAÑOL`,
        en: `You are an expert at optimizing LinkedIn content for maximum engagement.

TASKS:
- Improve the hook to capture more attention
- Optimize structure and readability
- Add strategic emojis (if missing)
- Improve clarity
- Suggest relevant hashtags (if missing)
- Maintain the essence of the original message
- WRITE EVERYTHING IN ENGLISH`
      };

      let systemPrompt = baseSystemPrompts[language];
      if (writingStyle && styleInstructions[writingStyle]) {
        systemPrompt += '\n\n' + styleInstructions[writingStyle][language];
      }

      const userPrompts = {
        es: `Mejora este post de LinkedIn:\n\n"${originalPost}"\n\nDevuelve el post mejorado EN ESPAÑOL.`,
        en: `Improve this LinkedIn post:\n\n"${originalPost}"\n\nReturn the improved post IN ENGLISH.`
      };

      const response = await this.callAI({
        systemPrompt,
        userPrompt: userPrompts[language],
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
   * Generate OPTIMIZED CV from profile data (improved version)
   */
  async generateOptimizedCV(profileData: any, language: 'es' | 'en' = 'es'): Promise<string> {
    try {
      let prompt = `Genera un CV PROFESIONAL Y OPTIMIZADO usando estos datos de LinkedIn:\n\n`;
      prompt += `NOMBRE: ${profileData.name}\n`;
      prompt += `TÍTULO PROFESIONAL: ${profileData.headline}\n\n`;

      if (profileData.about) {
        prompt += `ACERCA DE:\n${profileData.about}\n\n`;
      }

      if (profileData.experiences && profileData.experiences.length > 0) {
        prompt += `EXPERIENCIA LABORAL:\n`;
        profileData.experiences.forEach((exp: any, idx: number) => {
          prompt += `\n${idx + 1}. ${exp.title || 'Posición'}\n`;
          if (exp.company) prompt += `   Empresa: ${exp.company}\n`;
          if (exp.duration) prompt += `   Período: ${exp.duration}\n`;
          if (exp.description) prompt += `   Descripción: ${exp.description}\n`;
        });
        prompt += `\n`;
      }

      if (profileData.education && profileData.education.length > 0) {
        prompt += `EDUCACIÓN:\n`;
        profileData.education.forEach((edu: any, idx: number) => {
          prompt += `${idx + 1}. ${edu.degree || edu.institution}\n`;
          if (edu.institution && edu.degree) prompt += `   Institución: ${edu.institution}\n`;
          if (edu.year) prompt += `   Año: ${edu.year}\n`;
        });
        prompt += `\n`;
      }

      const prompts = {
        es: {
          important: `IMPORTANTE: Optimiza y mejora el CV:\n• Crea un resumen profesional impactante al inicio\n• Transforma experiencias en logros cuantificables\n• Usa verbos de acción potentes\n• Resalta habilidades técnicas y competencias clave\n• Formato profesional con secciones claras\n• Orientado a resultados y logros, no solo tareas\n`,
          system: `Eres un experto en recursos humanos y escritura de CVs profesionales.

OBJETIVO: Crear un CV OPTIMIZADO Y ATRACTIVO que destaque los logros y fortalezas del candidato.

ESTRUCTURA:
1. RESUMEN PROFESIONAL (3-4 líneas impactantes)
2. EXPERIENCIA PROFESIONAL (ordenada cronológicamente, enfocada en logros)
3. EDUCACIÓN
4. HABILIDADES CLAVE (técnicas y blandas)
5. LOGROS DESTACADOS (si aplica)

FORMATO:
• Usa MAYÚSCULAS para secciones
• Usa viñetas (•) para listas
• Cuantifica logros cuando sea posible (%, números, métricas)
• Verbos de acción: Lideré, Implementé, Optimicé, Desarrollé
• Formato claro y escaneable (ATS-friendly)
• NO uses markdown, solo texto plano con formato
• ESCRIBE TODO EN ESPAÑOL

TONO: Profesional, directo, orientado a logros`
        },
        en: {
          important: `IMPORTANT: Optimize and improve the CV:\n• Create an impactful professional summary at the start\n• Transform experiences into quantifiable achievements\n• Use powerful action verbs\n• Highlight technical skills and key competencies\n• Professional format with clear sections\n• Focused on results and achievements, not just tasks\n`,
          system: `You are an expert in human resources and professional CV writing.

OBJECTIVE: Create an OPTIMIZED AND ATTRACTIVE CV that highlights the candidate's achievements and strengths.

STRUCTURE:
1. PROFESSIONAL SUMMARY (3-4 impactful lines)
2. PROFESSIONAL EXPERIENCE (chronologically ordered, focused on achievements)
3. EDUCATION
4. KEY SKILLS (technical and soft)
5. NOTABLE ACHIEVEMENTS (if applicable)

FORMAT:
• Use UPPERCASE for sections
• Use bullet points (•) for lists
• Quantify achievements when possible (%, numbers, metrics)
• Action verbs: Led, Implemented, Optimized, Developed
• Clear and scannable format (ATS-friendly)
• DO NOT use markdown, only plain text with formatting
• WRITE EVERYTHING IN ENGLISH

TONE: Professional, direct, achievement-oriented`
        }
      };

      prompt += prompts[language].important;

      const response = await this.callAI({
        systemPrompt: prompts[language].system,
        userPrompt: prompt,
        temperature: 0.7,
        maxTokens: 2000
      });

      return response.content;
    } catch (error: any) {
      console.error('[AIHelper] Error generating optimized CV:', error);
      throw error;
    }
  }

  /**
   * Generate TARGETED CV adapted to specific job posting
   */
  async generateTargetedCV(profileData: any, jobPosting: string, language: 'es' | 'en' = 'es'): Promise<string> {
    try {
      let prompt = `Genera un CV ADAPTADO ESPECÍFICAMENTE para esta oferta de empleo:\n\n`;
      prompt += `=== OFERTA DE EMPLEO ===\n${jobPosting}\n\n`;
      prompt += `=== DATOS DEL CANDIDATO ===\n\n`;
      prompt += `NOMBRE: ${profileData.name}\n`;
      prompt += `TÍTULO: ${profileData.headline}\n\n`;

      if (profileData.about) {
        prompt += `ACERCA DE:\n${profileData.about}\n\n`;
      }

      if (profileData.experiences && profileData.experiences.length > 0) {
        prompt += `EXPERIENCIA:\n`;
        profileData.experiences.forEach((exp: any, idx: number) => {
          prompt += `\n${idx + 1}. ${exp.title || 'Posición'}\n`;
          if (exp.company) prompt += `   Empresa: ${exp.company}\n`;
          if (exp.duration) prompt += `   Período: ${exp.duration}\n`;
          if (exp.description) prompt += `   Descripción: ${exp.description}\n`;
        });
        prompt += `\n`;
      }

      if (profileData.education && profileData.education.length > 0) {
        prompt += `EDUCACIÓN:\n`;
        profileData.education.forEach((edu: any, idx: number) => {
          prompt += `${idx + 1}. ${edu.degree || edu.institution}\n`;
          if (edu.institution && edu.degree) prompt += `   Institución: ${edu.institution}\n`;
          if (edu.year) prompt += `   Año: ${edu.year}\n`;
        });
        prompt += `\n`;
      }

      const prompts = {
        es: {
          adapt: `ADAPTA EL CV:\n• Resalta las habilidades y experiencias que coincidan con los requisitos\n• Usa el mismo lenguaje y keywords de la oferta\n• Enfatiza logros relevantes para este puesto específico\n• Prioriza experiencia relacionada\n• Demuestra cómo encajas perfectamente en el rol\n`,
          system: `Eres un experto en recursos humanos especializado en OPTIMIZACIÓN DE CVs PARA OFERTAS ESPECÍFICAS.

OBJETIVO: Crear un CV PERFECTAMENTE ADAPTADO a la oferta de empleo proporcionada.

ESTRATEGIA:
1. Analiza los requisitos clave de la oferta
2. Identifica las habilidades y experiencias del candidato que coinciden
3. Resalta esas coincidencias de forma prominente
4. Usa las mismas palabras clave y terminología de la oferta
5. Estructura el CV para que el reclutador vea inmediatamente el "match"

ESTRUCTURA:
1. RESUMEN PROFESIONAL (adaptado al rol específico)
2. HABILIDADES CLAVE (que coincidan con requisitos)
3. EXPERIENCIA RELEVANTE (enfocada en lo que pide la oferta)
4. EDUCACIÓN
5. LOGROS DESTACADOS (relacionados con el puesto)

FORMATO:
• MAYÚSCULAS para secciones
• Viñetas (•) para listas
• Keywords de la oferta integradas naturalmente
• Cuantifica logros
• ATS-friendly (sistemas de tracking de candidatos)
• NO uses markdown, solo texto plano
• ESCRIBE TODO EN ESPAÑOL

TONO: Profesional, específico, orientado a demostrar que el candidato es PERFECTO para este rol`
        },
        en: {
          adapt: `ADAPT THE CV:\n• Highlight skills and experiences that match requirements\n• Use the same language and keywords from the job posting\n• Emphasize achievements relevant to this specific position\n• Prioritize related experience\n• Demonstrate how you fit perfectly for the role\n`,
          system: `You are a human resources expert specialized in OPTIMIZING CVs FOR SPECIFIC JOB OFFERS.

OBJECTIVE: Create a PERFECTLY TAILORED CV for the provided job posting.

STRATEGY:
1. Analyze key requirements from the offer
2. Identify candidate's skills and experiences that match
3. Highlight those matches prominently
4. Use the same keywords and terminology from the offer
5. Structure the CV so the recruiter immediately sees the "match"

STRUCTURE:
1. PROFESSIONAL SUMMARY (tailored to the specific role)
2. KEY SKILLS (matching requirements)
3. RELEVANT EXPERIENCE (focused on what the offer asks for)
4. EDUCATION
5. NOTABLE ACHIEVEMENTS (related to the position)

FORMAT:
• UPPERCASE for sections
• Bullet points (•) for lists
• Keywords from offer integrated naturally
• Quantify achievements
• ATS-friendly (applicant tracking systems)
• DO NOT use markdown, only plain text
• WRITE EVERYTHING IN ENGLISH

TONE: Professional, specific, oriented to demonstrate the candidate is PERFECT for this role`
        }
      };

      prompt += prompts[language].adapt;

      const response = await this.callAI({
        systemPrompt: prompts[language].system,
        userPrompt: prompt,
        temperature: 0.7,
        maxTokens: 2500
      });

      return response.content;
    } catch (error: any) {
      console.error('[AIHelper] Error generating targeted CV:', error);
      throw error;
    }
  }

  /**
   * Generate CV from profile data (legacy - basic version)
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
  async improveAbout(currentAbout: string, language: 'es' | 'en' = 'es', role?: string): Promise<string> {
    try {
      const prompts = {
        es: {
          system: `Eres un experto en personal branding y optimización de perfiles de LinkedIn. Mejora secciones "Acerca de" para que sean impactantes, auténticas y optimizadas. ESCRIBE TODO EN ESPAÑOL.`,
          user: `Mejora esta sección "Acerca de":\n\n"${currentAbout}"${role ? `\n\nRol: ${role}` : ''}\n\nDevuelve la versión mejorada EN ESPAÑOL.`
        },
        en: {
          system: `You are an expert in personal branding and LinkedIn profile optimization. Improve "About" sections to make them impactful, authentic, and optimized. WRITE EVERYTHING IN ENGLISH.`,
          user: `Improve this "About" section:\n\n"${currentAbout}"${role ? `\n\nRole: ${role}` : ''}\n\nReturn the improved version IN ENGLISH.`
        }
      };

      const response = await this.callAI({
        systemPrompt: prompts[language].system,
        userPrompt: prompts[language].user,
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
   * Improve profile Headline
   */
  async improveHeadline(currentHeadline: string, language: 'es' | 'en' = 'es'): Promise<string> {
    try {
      const prompts = {
        es: {
          system: `Eres un experto en personal branding y optimización de perfiles de LinkedIn. Mejora titulares/headlines para que sean impactantes, profesionales y optimizados para búsquedas. ESCRIBE TODO EN ESPAÑOL.`,
          user: `Mejora este titular de LinkedIn:\n\n"${currentHeadline}"\n\nDevuelve SOLO el titular mejorado (máximo 220 caracteres), sin explicaciones adicionales. EN ESPAÑOL.`
        },
        en: {
          system: `You are an expert in personal branding and LinkedIn profile optimization. Improve headlines to make them impactful, professional, and search-optimized. WRITE EVERYTHING IN ENGLISH.`,
          user: `Improve this LinkedIn headline:\n\n"${currentHeadline}"\n\nReturn ONLY the improved headline (maximum 220 characters), without additional explanations. IN ENGLISH.`
        }
      };

      const response = await this.callAI({
        systemPrompt: prompts[language].system,
        userPrompt: prompts[language].user,
        temperature: 0.7,
        maxTokens: 100
      });

      return response.content;
    } catch (error: any) {
      console.error('[AIHelper] Error improving headline:', error);
      throw error;
    }
  }

  /**
   * Analyze complete profile and give suggestions
   */
  async analyzeProfile(profileData: any, language: 'es' | 'en' = 'es'): Promise<string> {
    try {
      const prompts = {
        es: {
          user: `Analiza este perfil de LinkedIn:

TITULAR: ${profileData.headline || 'No disponible'}
ACERCA DE: ${profileData.about ? profileData.about.substring(0, 200) + '...' : 'No disponible'}
EXPERIENCIAS: ${profileData.experienceCount || 0}
EDUCACIÓN: ${profileData.educationCount || 0}

Da sugerencias concretas de mejora para cada sección EN ESPAÑOL.`,
          system: `Eres un consultor experto en LinkedIn. Analiza perfiles y da sugerencias concretas, específicas y accionables para mejorar. ESCRIBE TODO EN ESPAÑOL.`
        },
        en: {
          user: `Analyze this LinkedIn profile:

HEADLINE: ${profileData.headline || 'Not available'}
ABOUT: ${profileData.about ? profileData.about.substring(0, 200) + '...' : 'Not available'}
EXPERIENCES: ${profileData.experienceCount || 0}
EDUCATION: ${profileData.educationCount || 0}

Give concrete improvement suggestions for each section IN ENGLISH.`,
          system: `You are an expert LinkedIn consultant. Analyze profiles and give concrete, specific, and actionable suggestions for improvement. WRITE EVERYTHING IN ENGLISH.`
        }
      };

      const response = await this.callAI({
        systemPrompt: prompts[language].system,
        userPrompt: prompts[language].user,
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
