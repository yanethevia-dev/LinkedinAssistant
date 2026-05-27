# Testing Rápido - 3 Features

## ⚡ Setup (1 vez)

```bash
# 1. Build
npm run build:chrome

# 2. Recarga extensión
chrome://extensions/
→ "LinkedIn Assistant"
→ 🔄 RELOAD
```

---

## ✅ Test 1: Botones Flotantes (10 segundos)

```bash
1. Abre: https://www.linkedin.com/feed/
2. Mira bottom-right corner
```

**Debes ver:**
```
┌────────────────────────┐
│ ✨ Generar Post con IA │  ← Morado
└────────────────────────┘
┌────────────────────────┐
│ 📄 Generar mi CV       │  ← Verde
└────────────────────────┘
┌────────────────────────┐
│ 🔧 Mejorar mi Perfil   │  ← Rosa
└────────────────────────┘
```

✅ **Pass:** 3 botones visibles  
❌ **Fail:** Falta algún botón

---

## ✅ Test 2: Generar Post (30 segundos)

```bash
1. Click "✨ Generar Post con IA"
2. Escribe: "Anunciar nuevo producto"
3. Click "Generar Post"
4. Espera 2 segundos
```

**Debes ver:**
1. Modal de LinkedIn se abre
2. Texto aparece en el editor:
   ```
   🚀 Post generado sobre: "Anunciar nuevo producto"
   
   [Aquí iría el post generado por la IA]
   
   (Funcionalidad de IA próximamente)
   ```

✅ **Pass:** Modal abierto + texto insertado  
❌ **Fail:** Modal no abre o texto no aparece

**Debug si falla:**
```javascript
// En console
const shadow = document.querySelector('#interop-outlet').shadowRoot;
console.log('Editor:', shadow.querySelector('.ql-editor'));
```

---

## ✅ Test 3: Generar CV (30 segundos)

```bash
1. Ve a TU perfil: https://www.linkedin.com/in/TU-USERNAME
2. Click "📄 Generar mi CV"
```

**Debes ver:**
1. Modal con tus datos:
   ```
   📄 Generar mi CV
   
   He extraído tu perfil:
   
   • Nombre: [Tu nombre]
   • Título: [Tu título]
   • Experiencias: [Número]
   ```

✅ **Pass:** Modal muestra tus datos reales  
❌ **Fail:** Alert de error o datos vacíos

**Debug si falla:**
```javascript
// En console (en tu perfil)
const name = document.querySelector('h1.text-heading-xlarge');
console.log('Name element:', name);
console.log('Name text:', name?.textContent);
```

---

## ✅ Test 4: Mejorar Perfil (30 segundos)

```bash
1. Ve a TU perfil: https://www.linkedin.com/in/TU-USERNAME
2. Click "🔧 Mejorar mi Perfil"
3. Click "Aceptar" en el confirm
4. Espera 2 segundos
```

**Debes ver:**
1. Confirm con lista de secciones:
   ```
   🔧 Mejorar Perfil
   
   Voy a mejorar estas secciones:
   • Acerca de
   • 3 Experiencias
   
   ¿Continuar?
   ```

2. Después de 2s, modal con sugerencias

✅ **Pass:** Confirm + modal de sugerencias  
❌ **Fail:** Error o no muestra nada

---

## ✅ Test 5: Mejorar Post (30 segundos)

```bash
1. Abre compositor de LinkedIn (manual o con botón)
2. Escribe: "Este es mi post de prueba"
3. Busca botón "🚀 Mejorar Post" dentro del modal
4. Click "Mejorar Post"
```

**Debes ver:**
1. Botón "🚀 Mejorar Post" en el modal
2. Modal con tu texto:
   ```
   🚀 Mejorar Post
   
   I'll enhance your post...
   
   [Este es mi post de prueba]
   ```

✅ **Pass:** Botón aparece + modal muestra texto  
❌ **Fail:** Botón no aparece o modal vacío

**Debug si falla:**
```javascript
// Con modal abierto
document.querySelectorAll('.lia-button').length  // Debe ser 1
document.querySelector('.lia-button')?.textContent  // "🚀 Mejorar Post"
```

---

## 🚨 Problemas Comunes

### Botones NO aparecen
```javascript
// Console
document.getElementById('lia-floating-buttons')
// Si null → extensión no cargó
```

**Solución:** Recarga extensión + refresh LinkedIn

### Generar CV falla
**Causa:** No estás en tu perfil  
**Solución:** Ve a `/in/tu-username`

### Texto no se inserta
**Causa:** Shadow DOM cambió  
**Debug:**
```javascript
const shadow = document.querySelector('#interop-outlet').shadowRoot;
console.log('Shadow:', !!shadow);
console.log('Editor:', !!shadow.querySelector('.ql-editor'));
```

---

## ⚡ Test Completo (2 minutos)

```bash
✓ Test 1: Botones flotantes (3 visibles)
✓ Test 2: Generar Post (modal + texto)
✓ Test 3: Generar CV (extrae datos)
✓ Test 4: Mejorar Perfil (confirm + sugerencias)
✓ Test 5: Mejorar Post (botón en modal)

Total: 5/5 ✅
```

---

## 📊 Verificación Final

```javascript
// Ejecuta en Console (en feed de LinkedIn)
console.log('=== STATUS CHECK ===');
console.log('Floating buttons:', !!document.getElementById('lia-floating-buttons'));
console.log('Button count:', document.querySelectorAll('#lia-floating-buttons button').length);
console.log('Expected: 3');
```

**Resultado esperado:**
```
=== STATUS CHECK ===
Floating buttons: true
Button count: 3
Expected: 3
```

---

**Build:** ✅ 122 KB  
**Commit:** `a982c28`  
**Status:** 🎉 Todo implementado, AI integration pendiente

**Siguiente paso:** Conectar con AI Service (Issues #3)
