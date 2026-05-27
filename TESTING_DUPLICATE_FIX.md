# Testing: Fix para Botones Duplicados

## Problema Reportado

1. ✅ Los botones ahora SÍ aparecen cuando abres el modal
2. ❌ Los botones están **duplicados** (múltiples copias)
3. ❌ Los botones **NO aparecen** antes de abrir el modal (solo en el "Start a post" button)

## Root Cause - Botones Duplicados

**Causa identificada:**
Cuando el modal se abre, múltiples selectores diferentes encuentran elementos diferentes pero relacionados:
- Selector 1 encuentra: `.ql-editor` (el editor)
- Selector 2 encuentra: `.share-creation-state__text-editor` (el contenedor)
- Selector 3 encuentra: `[role="dialog"]` (el modal)

Cada uno se considera un "composer" diferente → botones inyectados 3 veces.

**Solución implementada:**
Filtrado de elementos padre/hijo:
- Si detectamos múltiples elementos
- Y uno contiene al otro (padre → hijo)
- Solo notificamos el **elemento raíz** (padre)
- Ignoramos los elementos hijos

## Cambios Realizados

### dom-observer.ts

**Antes:**
```typescript
for (const selector of selectors) {
  elements.forEach((el) => {
    if (visible && isComposer) {
      // Notifica INMEDIATAMENTE cada elemento
      this.notifyCallbacks('post-composer', element);
    }
  });
}
```

**Después:**
```typescript
// First pass: collect all candidates
const candidateElements = new Set<HTMLElement>();
for (const selector of selectors) {
  elements.forEach((el) => {
    if (visible && isComposer) {
      candidateElements.add(element); // Solo añade a candidatos
    }
  });
}

// Second pass: filter out children if parent is also a candidate
const rootElements = candidateElements.filter(element => {
  for (const otherElement of candidateElements) {
    if (otherElement !== element && otherElement.contains(element)) {
      return false; // Es hijo, lo filtramos
    }
  }
  return true; // Es raíz, lo mantenemos
});

// Third pass: notify only root elements
rootElements.forEach(element => {
  this.notifyCallbacks('post-composer', element);
});
```

Mismo cambio aplicado a `detectPostComposerInShadowDOM()`.

## Testing

### PASO 1: Recargar Extensión

```bash
# 1. Build ya hecho
npm run build:chrome  # Ya ejecutado

# 2. Chrome
chrome://extensions/
→ "LinkedIn Assistant"
→ Click 🔄 RELOAD

# 3. Verificar sin errores
```

### PASO 2: Abrir LinkedIn con DevTools

```bash
# Nueva tab
F12 (DevTools)
→ Tab "Console"
→ Navegar a: https://www.linkedin.com/feed/
```

### PASO 3: Click en "Start a post"

```bash
# En el feed de LinkedIn:
1. Click en el botón/box "Start a post" o "Crear publicación"
2. Se abre el modal con el editor
3. Observar la consola
```

### PASO 4: Verificar Logs

**Logs esperados (NUEVOS):**

```
[DOMObserver] DOM changed, rescanning...
[DOMObserver] Scanning for post composer...
[DOMObserver]   Trying "<selector-1>" → found 1
[DOMObserver]     Visible: true, IsComposer: true
[DOMObserver]   Trying "<selector-2>" → found 1
[DOMObserver]     Visible: true, IsComposer: true
[DOMObserver]   Trying "<selector-3>" → found 1
[DOMObserver]     Visible: true, IsComposer: true

<<< NUEVO: Filtrado >>>
[DOMObserver]     Skipping child element, parent already detected
[DOMObserver]     Skipping child element, parent already detected
[DOMObserver]     ✓ Detected and notified! <root-class-name>

<<< Solo UNA notificación >>>
[Content Script] Post composer detected: <element>
[UIInjector] Injecting buttons into post composer
...
[UIInjector] Buttons injected successfully
```

**Nota la diferencia:**
- **Antes:** 3x "✓ Detected and notified"
- **Ahora:** 1x "✓ Detected and notified"

### PASO 5: Verificar Visualmente

**Debes ver:**
- ✅ Contenedor azul claro (UNO solo)
- ✅ Dos botones dentro:
  - ✨ Generate Post (morado)
  - 🚀 Improve Post (rosa)
- ✅ **NO duplicados**

### PASO 6: Verificar en Console

```javascript
// Contar contenedores
document.querySelectorAll('.lia-button-container').length
// Esperado: 1

// Contar botones
document.querySelectorAll('.lia-button').length
// Esperado: 2

// Ver qué botones
document.querySelectorAll('.lia-button').forEach(btn => {
  console.log('Button:', btn.textContent, 'Visible:', btn.offsetWidth > 0);
});
// Esperado:
//   Button: ✨ Generate Post Visible: true
//   Button: 🚀 Improve Post Visible: true
```

### PASO 7: Probar Abrir/Cerrar Múltiples Veces

```bash
1. Cerrar el modal (X o ESC)
2. Esperar 2 segundos
3. Abrir de nuevo "Start a post"
4. Verificar: ¿Siguen siendo solo 2 botones?
5. Repetir 3-4 veces
```

**En console después de 4 aperturas:**
```javascript
document.querySelectorAll('.lia-button').length
// Esperado: 2 (no 8)
```

## Problema Conocido: Botones NO aparecen en estado inicial

**Estado actual:**
- ❌ Antes de abrir modal: NO hay botones
- ✅ Después de abrir modal: Botones aparecen (sin duplicados)

**Por qué:**
El "Start a post" button no es un editor, es solo un botón trigger. Los botones de la extensión se inyectan en el **editor**, no en el trigger.

**Opciones de diseño:**

### Opción A: Estado Actual (Recomendado)
- Botones aparecen cuando abres el modal
- No hay botones en el trigger inicial
- **Pro:** Simple, claro, no modifica UI de LinkedIn feed
- **Contra:** Usuario no sabe que la extensión existe hasta que abre modal

### Opción B: Inyectar en el Trigger
- Detectar el botón "Start a post"
- Añadir botones "Generate" e "Improve" al lado
- **Pro:** Visible inmediatamente
- **Contra:** Complica el feed, puede romper layout de LinkedIn

### Opción C: Badge en el Trigger
- Detectar el botón "Start a post"
- Añadir un pequeño badge/indicador (ej: "🤖 AI")
- Click en badge o en botón → abre modal con botones completos
- **Pro:** Visible pero no invasivo
- **Contra:** Más complejo de implementar

**¿Cuál prefieres?**

## Resultados Esperados

### ✅ Éxito (Problema de duplicados resuelto)

```
✓ 1 contenedor de botones (.lia-button-container)
✓ 2 botones totales (.lia-button)
✓ Logs muestran "Skipping child element"
✓ Solo 1x "Detected and notified"
✓ Abrir/cerrar modal múltiples veces → siempre 2 botones
```

### ❌ Fallo (Aún duplicados)

```
✗ Múltiples contenedores (.lia-button-container)
✗ Más de 2 botones (.lia-button)
✗ Logs NO muestran "Skipping child element"
✗ Múltiples "Detected and notified"
```

Si falla, necesitaremos más diagnóstico.

## Diagnóstico si Siguen Duplicados

### Ejecutar en Console

```javascript
// Ver todos los contenedores
const containers = document.querySelectorAll('.lia-button-container');
console.log('Total containers:', containers.length);

containers.forEach((container, i) => {
  console.log(`\nContainer ${i}:`);
  console.log('  ID:', container.id);
  console.log('  Parent:', container.parentElement?.className);
  console.log('  Buttons inside:', container.querySelectorAll('.lia-button').length);
  
  // ¿Uno dentro de otro?
  containers.forEach((other, j) => {
    if (i !== j && container.contains(other)) {
      console.log(`  ⚠️ Container ${i} CONTAINS container ${j}`);
    }
  });
});
```

**Esto nos dirá:**
- Cuántos contenedores existen
- Si están anidados (uno dentro de otro)
- Dónde se inyectaron

### Ver elementos detectados

```javascript
// Nota: Este es código interno, no exportado
// Pero podemos inspeccionar el DOM
const composerElements = document.querySelectorAll(
  '.share-creation-state__text-editor, .ql-editor, [role="textbox"]'
);

console.log('Potential composer elements:', composerElements.length);
composerElements.forEach((el, i) => {
  console.log(`\nElement ${i}:`, el.className);
  console.log('  Has buttons nearby?', !!el.parentElement?.querySelector('.lia-button-container'));
  
  // ¿Uno contiene al otro?
  composerElements.forEach((other, j) => {
    if (i !== j && el.contains(other)) {
      console.log(`  ⚠️ Element ${i} CONTAINS element ${j}`);
    }
  });
});
```

## Archivos Modificados

```
src/content/dom-observer.ts
  - detectPostComposer(): Filtrado de elementos padre/hijo
  - detectPostComposerInShadowDOM(): Mismo filtrado para Shadow DOM

Build:
  dist/chrome/content/linkedin-content.js: 126 KB (antes 123 KB)
```

## Comandos Rápidos

```bash
# Build
npm run build:chrome

# Verificar tamaño (debe ser ~126 KB)
ls -lh dist/chrome/content/linkedin-content.js

# Buscar el filtrado en el código generado
grep -n "Skipping child element" dist/chrome/content/linkedin-content.js
# Debe encontrar líneas

# Ver commits
git log --oneline -1
```

---

## Próximos Pasos

### Si funciona (solo 2 botones):
1. ✅ Problema de duplicados **resuelto**
2. Decidir: ¿Queremos botones en estado inicial (antes de abrir modal)?
3. Si sí → Implementar Opción A, B, o C (ver arriba)

### Si NO funciona (aún duplicados):
1. Ejecutar los diagnósticos de arriba
2. Compartir:
   - Logs completos
   - Output de los comandos de diagnóstico
   - Screenshot del modal con botones duplicados
3. Analizaremos por qué el filtrado no funciona

---

**Build:** ✅ Exitoso (126 KB)  
**Fecha:** 2026-05-26  
**Branch:** integration-test  
**Commit:** Pendiente
