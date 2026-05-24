# Debug Guide - LinkedIn Extension Not Appearing

## Problema Reportado
- ✅ Groq Test Connection funciona con modelo "fastest"
- ❌ Groq Test Connection falla con otros modelos
- ❌ Extensión no aparece en LinkedIn

## Cambios Realizados

### 1. Modelos de Groq Corregidos
Los nombres de modelo estaban incorrectos. Ahora son:
- ✅ `llama-3.1-8b-instant` (fastest - FUNCIONA)
- ✅ `llama3-70b-8192` (nuevo nombre correcto)
- ✅ `llama3-8b-8192`
- ✅ `mixtral-8x7b-32768`
- ✅ `gemma2-9b-it`

**Acción:** Recarga la extensión y prueba los otros modelos ahora.

### 2. Manifest Cambiado
- **Antes:** `"run_at": "document_idle"`
- **Ahora:** `"run_at": "document_end"`

Esto hace que el content script cargue MÁS TEMPRANO.

### 3. Logs Añadidos
Ahora hay muchos más logs para debugging.

---

## Pasos de Debugging

### PASO 1: Recargar Extensión

**MUY IMPORTANTE:** Después del build, DEBES recargar:

1. Ve a: `chrome://extensions/`
2. Busca "LinkedIn Assistant"
3. Click en el botón **🔄 RELOAD** (actualizar)
4. NO solo refresques LinkedIn - PRIMERO recarga la extensión

### PASO 2: Abrir Consola ANTES de LinkedIn

1. Abre una nueva tab
2. Presiona **F12** (abre DevTools)
3. Ve a tab **Console**
4. **AHORA** navega a: `https://www.linkedin.com/feed/`
5. Mira los logs desde el inicio

### PASO 3: Verificar Logs Esperados

Debes ver ESTA SECUENCIA en orden:

```
[LinkedIn Assistant] Content script loaded
[LinkedIn Assistant] URL: https://www.linkedin.com/feed/
[LinkedIn Assistant] Document state: loading (o complete o interactive)
[LinkedIn Assistant] Initializing... readyState: loading (o complete)
```

**SI ves "Document already ready":**
```
[LinkedIn Assistant] Document already ready, initializing now
[LinkedIn Assistant] addLoadIndicator() called
[LinkedIn Assistant] Indicator added to page
[Content Script] Connection to background worker: OK
[Content Script] Initializing DOM Observer...
[DOMObserver] Initialized
[UIInjector] Initialized
[DOMObserver] Starting observer...
[DOMObserver] Observer started
[Content Script] DOM Observer started
```

**SI ves "Waiting for DOMContentLoaded":**
```
[LinkedIn Assistant] Waiting for DOMContentLoaded
(espera un momento...)
[LinkedIn Assistant] DOMContentLoaded fired
[LinkedIn Assistant] addLoadIndicator() called
(resto igual...)
```

### PASO 4: Verificar Visual

**Deberías ver:**
- Toast azul bottom-right: "✓ LinkedIn Assistant Loaded"
- Aparece por 3 segundos y desaparece

**Si NO ves el toast:**
- Pero SÍ ves los logs → Hay problema con DOM/CSS
- NO ves ni logs → Content script no carga

---

## Casos de Error

### CASO 1: No hay logs de "[LinkedIn Assistant]"

**Problema:** Content script no se inyecta

**Verificar:**
```bash
# 1. Archivo existe?
ls dist/chrome/content/linkedin-content.js

# 2. Manifest correcto?
cat dist/chrome/manifest.json | grep linkedin-content.js
# Debe mostrar: "js": ["content/linkedin-content.js"]

# 3. Permisos correctos?
cat dist/chrome/manifest.json | grep linkedin.com
# Debe mostrar: "matches": ["https://*.linkedin.com/*"]
```

**Solución:**
```bash
# Rebuild
npm run build:chrome

# Verifica que generó el archivo
ls -lh dist/chrome/content/linkedin-content.js
# Debe ser ~100KB

# Recarga extensión en chrome://extensions/
```

### CASO 2: Logs aparecen pero no el toast

**Problema:** DOM o CSS issue

**Debug:**
1. En Console, ejecuta:
   ```javascript
   document.getElementById('lia-loaded-indicator')
   ```

2. **Si retorna `null`:**
   - El elemento no se creó
   - Mira si hay errores en los logs
   - Verifica que `document.body` existe

3. **Si retorna el elemento:**
   ```javascript
   const el = document.getElementById('lia-loaded-indicator');
   console.log('Exists:', el);
   console.log('Styles:', el.style.cssText);
   console.log('Visible:', el.offsetWidth, el.offsetHeight);
   ```

4. **Si existe pero no es visible:**
   - Problema de CSS/z-index
   - LinkedIn puede estar ocultándolo
   - Intenta cambiar z-index a 999999999

### CASO 3: Error "Failed to connect to background worker"

**Problema:** Service Worker no responde

**Verificar:**
1. `chrome://extensions/` → Click "service worker"
2. Debe abrir console del service worker
3. Busca errores

**Si no abre:**
- Service worker crashed
- Click "Reload" en la extensión
- Mira errores en esa misma página

### CASO 4: Logs de DOM Observer pero no detecta composer

**Problema:** Observer funciona pero selectores incorrectos

**Debug en Console:**
```javascript
// Busca el composer manualmente
document.querySelector('.share-box-feed-entry__trigger')
document.querySelector('.share-creation-state__text-editor')
document.querySelector('[data-test-share-box-text-editor]')
document.querySelector('.ql-editor[data-placeholder]')

// Alguno debe retornar elemento cuando abres "Start a post"
```

**Si ninguno retorna nada:**
- LinkedIn cambió su DOM
- Necesitamos actualizar selectores en dom-observer.ts

---

## Verificación Paso a Paso

### CHECK 1: Extension Loaded
```bash
chrome://extensions/
→ "LinkedIn Assistant" presente
→ Estado: "Enabled"
→ Errores: Ninguno
```

### CHECK 2: Service Worker Alive
```bash
chrome://extensions/
→ Click "service worker"
→ Console abre
→ Logs:
  [LinkedIn Assistant] Service worker initialized
  [Service Worker] Initialization complete
  [Service Worker] Storage: {used: "X KB", ...}
```

### CHECK 3: Content Script Injected
```bash
LinkedIn page → F12 → Console
→ Buscar: "[LinkedIn Assistant] Content script loaded"
→ Buscar: "[Content Script] Connection to background worker: OK"
```

### CHECK 4: Visual Indicator
```bash
LinkedIn page → Bottom right
→ Toast azul: "✓ LinkedIn Assistant Loaded"
→ Desaparece después de 3s
```

### CHECK 5: DOM Observer Running
```bash
LinkedIn console → Buscar:
[DOMObserver] Starting observer...
[DOMObserver] Observer started
```

### CHECK 6: Composer Detection
```bash
LinkedIn → "Start a post"
→ Console debe mostrar:
[DOMObserver] Detected post-composer
[Content Script] Post composer detected
```

### CHECK 7: Buttons Visible
```bash
Con composer abierto → Buscar botones:
→ ✨ Generate Post (morado)
→ 🚀 Improve Post (rosa)
→ Cerca del botón "Post" de LinkedIn
```

---

## Comandos Útiles

### Verificar build
```bash
cd /Users/yhevia/Expedia/ReposCC/LinkedinAssistant
npm run build:chrome

# Verificar archivos generados
ls -lh dist/chrome/content/linkedin-content.js
ls -lh dist/chrome/background/service-worker.js
ls -lh dist/chrome/manifest.json
```

### Ver manifest completo
```bash
cat dist/chrome/manifest.json | jq .
# O sin jq:
cat dist/chrome/manifest.json
```

### Buscar errores en build
```bash
npm run build:chrome 2>&1 | grep -i error
# Si no muestra nada = sin errores
```

---

## Prueba Manual Rápida

**En Console de LinkedIn:**

```javascript
// 1. Verificar que script cargó
console.log('Script loaded?', typeof chrome !== 'undefined');

// 2. Intentar crear el toast manualmente
const toast = document.createElement('div');
toast.textContent = 'TEST';
toast.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: red;
  color: white;
  padding: 20px;
  z-index: 999999999;
  font-size: 20px;
  font-weight: bold;
`;
document.body.appendChild(toast);
// Deberías ver un cuadro rojo con "TEST"

// 3. Si el anterior funcionó, el problema es nuestro CSS/z-index
// Si NO funcionó, problema más grave con LinkedIn DOM
```

---

## Qué Reportar

Si sigue sin funcionar, reporta:

1. **Logs completos de Console:**
   ```
   Copia TODO desde el principio
   Incluye errores en rojo
   ```

2. **Service Worker logs:**
   ```
   chrome://extensions/ → service worker → copia console
   ```

3. **Screenshots:**
   - La extensión en chrome://extensions/
   - La página de LinkedIn (sin info privada)
   - El panel de Settings si Groq funciona

4. **Responde:**
   - ¿Ves ALGÚN log de "[LinkedIn Assistant]"?
   - ¿El Service Worker console tiene logs?
   - ¿Qué modelo de Groq usaste que funciona?
   - ¿LinkedIn está en español o inglés?
   - ¿Qué URL exacta de LinkedIn? (feed, profile, etc)

---

## Next Steps

**Si los logs aparecen pero no el toast:**
→ Problema visual/CSS → Arreglo fácil

**Si no hay logs:**
→ Content script no inyecta → Problema de manifest/permisos

**Si hay logs + toast pero no botones:**
→ DOM Observer no detecta composer → Selectores incorrectos

**Si todo funciona excepto modelos Groq:**
→ Prueba los nuevos nombres de modelo
→ Si fallan, reporta error exacto del Test Connection
