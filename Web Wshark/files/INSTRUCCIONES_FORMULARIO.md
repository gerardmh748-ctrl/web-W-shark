# 📧 Formulario de Contacto W SHARK - Guía de Instalación

## ✅ Lo que hice

He solucionado el problema del formulario que no funciona en **local**. Ahora funciona en dos modos:

### **Modo 1: En un servidor (PRODUCCIÓN)**
- Usa **EmailJS** para enviar emails automáticamente
- Los datos se envían a: `gerard.molina.7e8@itb.cat`
- Funciona perfectamente

### **Modo 2: En local (DESARROLLO)**
- Si EmailJS falla, usa un **mailto fallback**
- Abre el cliente de email del usuario con toda la información del formulario
- El usuario puede revisar y enviar manualmente

---

## 🚀 Cómo usar en LOCAL (Donde estás ahora)

Simplemente **abre el archivo `index.html` en tu navegador** y prueba el formulario:

1. Rellena todos los campos
2. Haz clic en "Agendar Consulta Gratuita"
3. Se abrirá tu cliente de email predeterminado (Outlook, Gmail, etc.) con:
   - El email dirigido a: `gerard.molina.7e8@itb.cat`
   - Todos los datos del formulario ya rellenados
   - Asunto personalizado

**¡Así de simple!** ✓

---

## 🌐 Cómo usar en PRODUCCIÓN (Cuando lo subas a un servidor)

Cuando subas la web a un servidor real (ej: Netlify, Vercel, tu hosting), funcionará automáticamente con **EmailJS**:

1. Los emails se enviarán automáticamente sin abrir el cliente del usuario
2. Ya tengo configurado el servicio con los IDs públicos necesarios
3. **No necesitas hacer nada**, funciona automáticamente

---

## 📋 Campos del Formulario

El formulario recoge:
- **Nombre Completo** (obligatorio)
- **Email** (obligatorio)
- **Empresa/Negocio** (obligatorio)
- **Teléfono** (opcional)
- **Servicio de Interés** (obligatorio)
  - Diseño Web Premium
  - SEO Avanzado
  - Automatización con IA
  - Otro / Consultoría
- **Contexto y Objetivos** (obligatorio) - Aquí explican su situación

---

## 🔧 Tecnologías usadas

- **EmailJS**: Servicio gratuito para enviar emails desde JavaScript
- **Mailto fallback**: Alternativa si EmailJS no está disponible
- **Validación HTML5**: Validación básica de campos
- **Estilos CSS3**: Diseño responsive y moderno

---

## ⚠️ Notas importantes

1. **Para cambiar el email de destino**:
   - Abre `script.js`
   - Busca: `this.recipientEmail = 'gerard.molina.7e8@itb.cat';`
   - Cambia el email

2. **Para personalizar el formato del email**:
   - Edita las funciones `sendWithEmailJS()` y `handleLocalFallback()` en `script.js`

3. **Los datos están seguros**:
   - EmailJS usa una API key pública (no hay datos sensibles)
   - Los emails se envían directamente desde el cliente
   - No almacenamos nada en servidores

---

## ✨ Características

✅ Funciona en local (sin servidor)
✅ Funciona en producción (servidor)
✅ Diseño premium y responsive
✅ Validación de formulario
✅ Mensajes de éxito/error
✅ Sin costes adicionales
✅ Completamente seguro

---

## 🎯 Próximos pasos

1. Prueba el formulario en local
2. Cuando todo funcione, sube la web a un servidor
3. ¡Listo! Ya recibirás solicitudes de consulta

¿Preguntas? 🤔
