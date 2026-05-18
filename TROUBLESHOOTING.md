# Troubleshooting - Por favor reporta qué falló

## Información necesaria para debuggear

Por favor ejecuta estos pasos y copia los resultados:

### 1. Verificar que la extensión está cargada

```
chrome://extensions/
```

- [ ] ¿Ves "LinkedIn Assistant" en la lista?
- [ ] ¿Está habilitado (toggle azul)?
- [ ] ¿Muestra algún error en rojo?

**Si hay errores, copia el texto del error aquí:**
```
[Pegar error]
```

### 2. Verificar Service Worker

1. En `chrome://extensions/`
2. Busca "LinkedIn Assistant"
3. Click en "service worker" (link azul)

**¿Se abre la consola del service worker?**
- [ ] Sí
- [ ] No (si no, ¿qué mensaje ves?)

**Si se abre, ¿qué logs ves?**
Copia todo lo que aparece en la consola:
```
[Pegar logs del service worker]
```

**Ejecuta este comando en la consola del service worker:**
```javascript
chrome.storage.local.get(null, console.log);
```

**Resultado:**
```
[Pegar resultado]
```

### 3. Verificar Popup

1. Click en el icono de la extensión

**¿Se abre el popup?**
- [ ] Sí
- [ ] No

**Si se abre, ¿qué muestra?**
- Status: [____]
- ¿Hay botones? Sí/No
- Captura de pantalla si es posible

**Abre consola del popup:**
- Right-click en icono → "Inspect popup"
- ¿Hay errores en consola? Copia aquí:
```
[Pegar errores]
```

### 4. Verificar Options Page

1. Right-click en icono → "Options"

**¿Se abre la página de Options?**
- [ ] Sí
- [ ] No (¿qué pasa?)

**Si se abre:**
- [ ] ¿Ves las 3 tarjetas de proveedores (Claude, OpenAI, Gemini)?
- [ ] ¿Hay campos de texto para API keys?
- [ ] ¿Hay botones?
- [ ] Captura de pantalla si es posible

**Abre consola (F12) en Options page:**
```
[Pegar errores si hay]
```

### 5. Test básico en Options

Si la Options page se abrió:

1. Escribe cualquier cosa en el campo "API Key" de Claude: `test123`
2. Espera 2 segundos
3. ¿Apareció un toast (mensaje) en la parte inferior?
   - [ ] Sí - ¿Qué decía?
   - [ ] No

**En consola de Options, ejecuta:**
```javascript
chrome.storage.local.get('settings', console.log);
```

**Resultado:**
```
[Pegar resultado]
```

### 6. Verificar archivos en dist/

En terminal:
```bash
cd /Users/yhevia/Expedia/ReposCC/LinkedinAssistant
ls -la dist/chrome/
ls -la dist/chrome/background/
ls -la dist/chrome/options/
```

**Pega el output:**
```
[Pegar resultado]
```

### 7. Verificar en LinkedIn

1. Ve a https://www.linkedin.com
2. ¿Apareció la notificación azul "✓ LinkedIn Assistant Loaded"?
   - [ ] Sí
   - [ ] No

**Abre consola (F12) en LinkedIn:**
```
[Pegar logs si hay]
```

---

## Resumen: ¿Qué específicamente no funcionó?

**Issue #1 (Storage Service):**
- [ ] Service worker no inicia
- [ ] No aparecen logs de inicialización
- [ ] chrome.storage.local.get no devuelve settings
- [ ] Otro: [describe]

**Issue #2 (Options UI):**
- [ ] Options page no abre
- [ ] Options page abre pero no se ve bien
- [ ] No se pueden ingresar API keys
- [ ] Auto-save no funciona
- [ ] Toast notifications no aparecen
- [ ] Status badges no actualizan
- [ ] Otro: [describe]

---

## Por favor llena esta información y pégala completa

Esto me ayudará a identificar exactamente qué está fallando.
