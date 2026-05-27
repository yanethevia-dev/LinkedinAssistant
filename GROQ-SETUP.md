# Groq Setup Guide - 100% Free AI ⚡

## ¿Qué es Groq?

Groq es un proveedor de IA **completamente gratis** que ofrece:
- ⚡ **Ultra rápido** - Inferencia más rápida que OpenAI/Claude
- 🆓 **100% gratuito** - Sin tarjeta de crédito
- 📊 **Límites generosos:**
  - 30 requests por minuto
  - 14,400 requests por día
- 🤖 **Modelos potentes:**
  - Llama 3.1 70B (comparable a GPT-4)
  - Llama 3.1 8B (ultra rápido)
  - Mixtral 8x7B

## Obtener API Key (2 minutos)

### Paso 1: Crear Cuenta
1. Ve a: **https://console.groq.com/keys**
2. Click "Sign Up" o "Log In"
3. Opciones:
   - **Con Google** (más rápido - recomendado)
   - Con GitHub
   - Con email

### Paso 2: Crear API Key
1. Ya estás en la página de Keys
2. Click **"Create API Key"**
3. Dale un nombre: "LinkedIn Assistant"
4. Click "Submit"
5. **COPIA LA KEY** (empieza con `gsk_...`)
   - ⚠️ Solo se muestra una vez!
   - Guárdala en un lugar seguro

### Paso 3: Listo!
Ya tienes tu API key. No necesitas:
- ❌ Tarjeta de crédito
- ❌ Verificar teléfono
- ❌ Crear proyectos
- ❌ Configurar billing

---

## Configurar en la Extensión

### Paso 1: Build
```bash
cd /Users/yhevia/Expedia/ReposCC/LinkedinAssistant
npm run build:chrome
```

### Paso 2: Cargar Extensión
1. Chrome: `chrome://extensions/`
2. "Developer mode" ON
3. "Load unpacked"
4. Selecciona: `dist/chrome`

### Paso 3: Configurar Groq
1. Click en icono de extensión
2. Click "Settings"
3. Scroll hasta la tarjeta **"Groq ⚡"**
4. Pega tu API key (gsk_...)
5. Model: **llama-3.1-70b-versatile** (recomendado)
6. Click **"Test Connection"**

**Esperado:**
- Button: "Testing..."
- Status: "Testing..." (amarillo)
- Después de 1-2 segundos:
  - Status: "Connected ✓" (verde)
  - Toast: "groq connection successful"
  - Border verde en la tarjeta

### Paso 4: Verificar
**Service Worker Console:**
```
[Service Worker] Testing AI connection: groq
[AIService] Generating content with groq
[AIService] Test successful for groq: success
[Service Worker] Test successful: groq
```

---

## Modelos Disponibles

### 1. Llama 3.1 70B Versatile (Recomendado) ⭐
- **Modelo:** `llama-3.1-70b-versatile`
- **Calidad:** Comparable a GPT-4
- **Velocidad:** Muy rápido
- **Uso:** Posts, mejoras, contenido largo
- **Por defecto en la extensión**

### 2. Llama 3.1 8B Instant (Ultra Rápido) ⚡
- **Modelo:** `llama-3.1-8b-instant`
- **Calidad:** Buena (menor que 70B)
- **Velocidad:** Instantáneo
- **Uso:** Respuestas rápidas, borradores

### 3. Mixtral 8x7B
- **Modelo:** `mixtral-8x7b-32768`
- **Calidad:** Muy buena
- **Contexto:** 32K tokens (más que otros)
- **Uso:** Documentos largos, CVs

---

## Testing Rápido

### Test 1: Configuración Básica
```bash
# Después de build y cargar extensión
1. Settings → Groq card
2. Pega API key
3. Test Connection
✅ Debe mostrar "Connected ✓"
```

### Test 2: En LinkedIn
```bash
1. Ve a linkedin.com/feed/
2. "Start a post"
3. Click "✨ Generate Post" (morado)
4. Modal se abre
5. Type: "Write about AI in healthcare"
6. Click "Generate Post"
✅ Debe funcionar (placeholder por ahora)
```

### Test 3: Console Logs
```javascript
// En LinkedIn, F12 → Console
✅ [LinkedIn Assistant] Content script loaded
✅ [Content Script] Connection to background worker: OK
✅ [DOMObserver] Initialized
✅ [Content Script] DOM Observer started
```

---

## Comparación con otros proveedores

| Feature | Groq ⚡ | Gemini | Claude | OpenAI |
|---------|---------|--------|--------|--------|
| **Precio** | 🆓 Gratis | 🆓 Gratis* | 💰 $5 gratis | 💰 No gratis |
| **Tarjeta** | ❌ No | ❌ No | ❌ No | ✅ Sí |
| **Límites/día** | 14,400 | ~1,500 | ~100-200 | Depende |
| **Velocidad** | ⚡⚡⚡ | ⚡⚡ | ⚡⚡ | ⚡ |
| **Proyectos** | ∞ | ❌ Límite | N/A | N/A |
| **Setup** | 2 min | 5 min | 5 min | 10 min |

*Gemini tiene límite de proyectos y demora 1 mes en eliminar.

---

## Troubleshooting

### Error: "Invalid API key"
- Verifica que copiaste la key completa
- Key debe empezar con `gsk_`
- Regenera la key en Groq console

### Error: "Rate limit exceeded"
- Has excedido 30 req/min
- Espera 1 minuto
- Considera usar modelo más pequeño (8B)

### Error: "Network error"
- Verifica conexión a internet
- Verifica que Groq.com está accesible
- Intenta en modo incógnito

### No aparece la tarjeta de Groq
- Verifica que hiciste build después del cambio
- Recarga la extensión (🔄 en chrome://extensions/)
- Verifica que estás en la rama correcta

### Test Connection falla
- Abre Service Worker console
- Busca error específico
- Copia error completo y repórtalo

---

## Ventajas de Groq

### 1. Sin Límites de Proyectos
- Gemini tiene límite de proyectos
- Groq: proyectos ilimitados

### 2. Más Rápido
- Groq usa hardware especializado (LPU)
- 10x más rápido que GPT-4
- Respuestas casi instantáneas

### 3. 100% Gratis
- No necesitas tarjeta
- No hay "créditos gratis que se acaban"
- Gratis para siempre (con límites razonables)

### 4. Mejor para Testing
- Límites diarios altos (14.4K)
- Perfecto para desarrollo
- Puedes probar sin preocuparte

---

## API Key Management

### Rotar Keys
Si necesitas regenerar tu key:
1. https://console.groq.com/keys
2. Click en tu key existente
3. "Revoke" (opcional - invalida la anterior)
4. "Create API Key" → Nueva key
5. Actualiza en la extensión

### Múltiples Keys
Puedes tener varias keys para:
- Desarrollo
- Testing
- Producción
- Diferentes proyectos

### Seguridad
- ✅ Keys son privadas (solo tú las ves)
- ✅ Almacenadas localmente en Chrome
- ✅ No se envían a ningún servidor nuestro
- ✅ Solo van directo a Groq API

---

## Next Steps

Una vez configurado Groq:
1. ✅ Test Connection exitoso
2. ✅ Ve a LinkedIn
3. ✅ Abre composer
4. ✅ Botones ✨ y 🚀 aparecen
5. ✅ Modal funciona
6. 🔜 Issue #7 conectará todo con IA real

---

## ¿Por qué Groq es default?

Hemos configurado Groq como proveedor por defecto porque:
1. **Accesible** - Cualquiera puede probarlo
2. **Gratis** - No hay barreras de entrada
3. **Rápido** - Mejor experiencia de usuario
4. **Confiable** - Límites generosos

Pero puedes cambiar a Claude, OpenAI o Gemini en cualquier momento.

---

## Support

**Groq Docs:** https://console.groq.com/docs  
**Rate Limits:** https://console.groq.com/docs/rate-limits  
**Models:** https://console.groq.com/docs/models  

**Extension Issues:** https://github.com/yanethevia-dev/LinkedinAssistant/issues

---

**¡Listo para probar!** 🚀

Get your key: https://console.groq.com/keys
