/* ==========================================
   W SHARK - JAVASCRIPT VANILLA PURO
   Animaciones, interacciones y efectos
   ========================================== */

// ==========================================
// CONFIGURATION
// ==========================================
// Se define una constante global para almacenar la configuración general del sitio
const CONFIG = {
    scrollThreshold: 100, // Cantidad de píxeles (100px) que el usuario debe bajar para activar cambios en la interfaz
    animationDuration: 800, // Duración en milisegundos (800ms) para las animaciones de revelado
    particleCount: 50, // Número total de partículas (50) que se renderizarán en el fondo interactivo
}; // Cierre del objeto de configuración

// ==========================================
// CONTACT FORM HANDLER
// ==========================================
// Clase encargada de gestionar el comportamiento y envío del formulario de contacto
class ContactFormHandler {
    // Método constructor que se ejecuta automáticamente al instanciar la clase
    constructor() {
        this.form = document.getElementById('contactForm'); // Busca en el HTML el elemento con el ID 'contactForm'
        this.messageElement = document.getElementById('formMessage'); // Busca en el HTML el contenedor para mostrar los mensajes de estado
        this.recipientEmail = 'gerard.molina.7e8@itb.cat'; // Define la dirección de correo electrónico del destinatario
        
        // Verifica si el formulario realmente existe en la página actual
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e)); // Escucha el evento de envío ('submit') y ejecuta handleSubmit
        } // Cierre de la condición de verificación
    } // Cierre del constructor
    
    // Método asíncrono para procesar los datos cuando el usuario intenta enviar el formulario
    async handleSubmit(e) {
        e.preventDefault(); // Detiene el comportamiento por defecto del navegador (evita que la página se recargue)
        
        // Crea un objeto con todos los valores recolectados de los campos del formulario
        const formData = {
            nombre: document.getElementById('nombre').value, // Captura el valor escrito en el campo de texto con ID 'nombre'
            email: document.getElementById('email').value, // Captura el valor escrito en el campo con ID 'email'
            empresa: document.getElementById('empresa').value, // Captura el valor escrito en el campo con ID 'empresa'
            telefono: document.getElementById('telefono').value || 'No proporcionado', // Captura el teléfono o asigna un texto por defecto si está vacío
            servicio: document.getElementById('servicio').value, // Captura la opción seleccionada en el menú desplegable con ID 'servicio'
            contexto: document.getElementById('contexto').value, // Captura el texto largo ingresado en el campo con ID 'contexto'
            fecha: new Date().toLocaleString('es-ES') // Genera una marca de tiempo formateada con la fecha y hora actuales de España
        }; // Cierre del objeto formData
        
        // Cambia el texto del contenedor de mensajes para avisar al usuario que el proceso inició
        this.messageElement.textContent = 'Enviando solicitud...';
        this.messageElement.className = ''; // Limpia cualquier clase CSS previa (como errores o éxitos) del contenedor de mensajes
        
        // Bloque de control de errores para intentar el envío de forma segura
        try {
            // Intenta realizar el envío utilizando el servicio externo de EmailJS
            await this.sendWithEmailJS(formData);
            
        } catch (error) { // Si el bloque 'try' falla o EmailJS da error, se ejecuta este bloque alternativo
            console.warn('EmailJS no disponible, usando alternativa local:', error); // Muestra un aviso de advertencia en la consola del navegador
            // Llama al método secundario (fallback) para procesar el envío de manera local
            this.handleLocalFallback(formData);
        } // Cierre del bloque try-catch
    } // Cierre del método handleSubmit
    
    // Método asíncrono encargado de conectar y enviar los datos a través de la API de EmailJS
    async sendWithEmailJS(formData) {
        // Comprueba si la librería externa de EmailJS aún no ha sido cargada en la página
        if (typeof emailjs === 'undefined') {
            const script = document.createElement('script'); // Crea de forma dinámica una etiqueta HTML <script>
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/index.min.js'; // Asigna la URL del CDN de la librería EmailJS al script
            document.head.appendChild(script); // Inserta el script creado dentro de la sección <head> del documento para empezar a descargarlo
            
            // Pausa la ejecución del método hasta que el script se haya descargado y cargado por completo
            await new Promise(resolve => {
                script.onload = resolve; // Resuelve la promesa en cuanto se dispara el evento 'onload' del script
            }); // Cierre de la promesa
        } // Cierre de la condición de carga
        
        // Inicializa el servicio de EmailJS utilizando su clave pública de cliente
        emailjs.init('YxIGp1WeMg5sGLLkR');
        
        // Define una plantilla de texto plano estructurada que servirá como cuerpo alternativo o registro del mensaje
        const messageContent = `
NUEVA SOLICITUD DE CONSULTA - W SHARK

════════════════════════════════════════
DATOS DEL CLIENTE:
════════════════════════════════════════

Nombre: ${formData.nombre}
Email: ${formData.email}
Empresa: ${formData.empresa}
Teléfono: ${formData.telefono}
Fecha: ${formData.fecha}

════════════════════════════════════════
SERVICIO DE INTERÉS:
════════════════════════════════════════
${this.translateServicio(formData.servicio)}

════════════════════════════════════════
CONTEXTO Y OBJETIVOS:
════════════════════════════════════════
${formData.contexto}

════════════════════════════════════════

Este cliente está interesado en una consulta gratuita.
Por favor, contactar lo antes posible.
        `; // Cierre de la plantilla de texto
        
        // Realiza la petición de envío HTTP a los servidores de EmailJS enviando el ID del servicio, de la plantilla y las variables
        const response = await emailjs.send(
            'service_w_shark', // ID del servicio de correo configurado en el panel de EmailJS
            'template_consulta', // ID de la plantilla de correo configurada en el panel de EmailJS
            {
                to_email: this.recipientEmail, // Pasa el email del destinatario final
                from_name: formData.nombre, // Pasa el nombre del cliente que rellena el formulario
                from_email: formData.email, // Pasa el email de contacto del cliente
                empresa: formData.empresa, // Pasa el nombre de la empresa del cliente
                telefono: formData.telefono, // Pasa el número telefónico del cliente
                servicio: this.translateServicio(formData.servicio), // Pasa el nombre legible del servicio ya traducido
                contexto: formData.contexto, // Pasa el mensaje o requerimientos del cliente
                fecha: formData.fecha, // Pasa la fecha y hora del envío
                message_html: messageContent // Pasa la estructura de texto completa construida anteriormente
            } // Cierre del objeto con los datos de la plantilla
        ); // Cierre de la petición asíncrona emailjs.send
        
        // Verifica si la respuesta del servidor de EmailJS fue exitosa (código de estado 200)
        if (response.status === 200) {
            this.form.reset(); // Restablece y vacía todos los campos de texto del formulario HTML
            this.messageElement.textContent = '✓ ¡Solicitud enviada con éxito! Te contactaremos pronto.'; // Muestra un mensaje de éxito en la interfaz
            this.messageElement.className = 'success'; // Aplica la clase CSS 'success' para darle estilos visuales verdes al mensaje
            
            // Configura un temporizador para borrar el mensaje de éxito automáticamente después de un tiempo
            setTimeout(() => {
                this.messageElement.textContent = ''; // Borra el texto del mensaje transcurridos 5 segundos (5000ms)
            }, 5000); // Cierre del temporizador
        } // Cierre de la verificación de estado exitoso
    } // Cierre del método sendWithEmailJS
    
    // Método alternativo en caso de que falle la conexión externa; prepara un enlace directo de tipo mailto
    handleLocalFallback(formData) {
        // Define la línea de asunto que tendrá el correo electrónico resultante
        const subject = `Nueva Solicitud de Consulta - W SHARK: ${formData.nombre}`;
        
        // Construye el cuerpo del correo con un formato estructurado utilizando plantillas de cadena
        const body = `
NUEVA SOLICITUD DE CONSULTA - W SHARK

════════════════════════════════════════
DATOS DEL CLIENTE:
════════════════════════════════════════

Nombre: ${formData.nombre}
Email: ${formData.email}
Empresa: ${formData.empresa}
Teléfono: ${formData.telefono}
Fecha: ${formData.fecha}

════════════════════════════════════════
SERVICIO DE INTERÉS:
════════════════════════════════════════
${this.translateServicio(formData.servicio)}

════════════════════════════════════════
CONTEXTO Y OBJETIVOS:
════════════════════════════════════════
${formData.contexto}

════════════════════════════════════════

Este cliente está interesado en una consulta gratuita.
Por favor, contactar lo antes posible.

---
Enviado desde: W SHARK - Sistema de Contacto
`; // Cierre de la estructura del cuerpo del email alternativo
        
        // Construye la URL del enlace 'mailto', codificando de forma segura el asunto y el cuerpo para evitar caracteres rotos
        const mailtoLink = `mailto:${this.recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Redirecciona la ventana del navegador a la URL 'mailto', lo que fuerza la apertura de la app de correos del usuario
        window.location.href = mailtoLink;
        
        this.form.reset(); // Vacía los campos del formulario HTML
        // Inserta una estructura HTML detallada dentro del contenedor de mensajes guiando al usuario si el mailto falló
        this.messageElement.innerHTML = `
            <div style="line-height: 1.6;">
                <p style="color: #10b981; font-weight: 600;">✓ ¡Formulario preparado!</p>
                <p>Se abrirá tu cliente de email con la información lista para enviar a:</p>
                <p style="font-weight: 600; color: var(--accent-blue);">${this.recipientEmail}</p>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">Si no se abre automáticamente, copia los datos del formulario y envía un email manualmente.</p>
            </div>
        `; // Cierre de la asignación HTML
        this.messageElement.className = 'success'; // Aplica estilos visuales de éxito al contenedor
        
        // Configura un temporizador para limpiar las instrucciones en pantalla
        setTimeout(() => {
            this.messageElement.textContent = ''; // Elimina el contenido del mensaje tras 8 segundos (8000ms)
        }, 8000); // Cierre del temporizador
    } // Cierre del método handleLocalFallback
    
    // Método auxiliar encargado de traducir los valores internos del formulario a nombres comerciales atractivos
    translateServicio(value) {
        // Define un diccionario de traducción donde las propiedades coinciden con los 'value' de las opciones HTML
        const translations = {
            'diseño': 'Diseño Web Premium', // Mapea 'diseño' a su versión con formato estético
            'seo': 'SEO Avanzado', // Mapea 'seo' a su versión con formato estético
            'ia': 'Automatización con IA', // Mapea 'ia' a su versión con formato estético
            'otro': 'Otro / Consultoría' // Mapea 'otro' a su versión con formato estético
        }; // Cierre del diccionario
        return translations[value] || value; // Retorna la traducción correspondiente o el valor original si no se encuentra en el mapa
    } // Cierre del método translateServicio
} // Cierre de la clase ContactFormHandler

// ==========================================
// NAVBAR SCROLL EFFECT
// ==========================================
// Clase encargada de manejar la barra de navegación superior, su cambio estético al hacer scroll y el menú móvil
class NavbarController {
    // Constructor de la clase que inicializa las referencias del DOM para la navegación
    constructor() {
        this.navbar = document.getElementById('navbar'); // Obtiene el elemento contenedor principal de la barra de navegación
        this.menuToggle = document.getElementById('menuToggle'); // Obtiene el botón que despliega el menú en dispositivos móviles (hamburguesa)
        this.navMenu = document.getElementById('navMenu'); // Obtiene la lista de enlaces o menú de navegación en sí
        this.navLinks = document.querySelectorAll('.nav-link'); // Obtiene una colección de todos los elementos enlace dentro del menú
        this.isMenuOpen = false; // Define una variable de estado booleana para saber si el menú móvil está desplegado o no
        this.init(); // Invoca de manera inmediata al método de inicialización de eventos
    } // Cierre del constructor

    // Método encargado de asignar los escuchadores de eventos correspondientes a la navegación
    init() {
        window.addEventListener('scroll', () => this.handleScroll()); // Escucha el desplazamiento global de la página y ejecuta handleScroll
        this.menuToggle.addEventListener('click', () => this.toggleMenu()); // Escucha el clic en el botón móvil para abrir o cerrar el menú
        // Recorre uno por uno cada enlace de navegación para añadirle interacción
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu()); // Al hacer clic en cualquier enlace, el menú móvil se cerrará automáticamente
        }); // Cierre del bucle forEach
    } // Cierre del método init

    // Método que evalúa la posición de la pantalla para cambiar el diseño de la barra de navegación
    handleScroll() {
        // Si el usuario ha bajado más píxeles verticales de los configurados en el umbral (100px)
        if (window.scrollY > CONFIG.scrollThreshold) {
            this.navbar.classList.add('scrolled'); // Añade la clase CSS 'scrolled' (generalmente para volver opaco el fondo del menú)
        } else { // Si el usuario vuelve a estar arriba en la cabecera de la página
            this.navbar.classList.remove('scrolled'); // Remueve la clase CSS 'scrolled' restaurando su aspecto inicial
        } // Cierre de la validación
    } // Cierre del método handleScroll

    // Método que alterna el estado visual del menú móvil entre abierto y cerrado
    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen; // Invierte el valor actual del estado booleano (si era falso pasa a verdadero, y viceversa)
        this.menuToggle.classList.toggle('active'); // Añade o quita la clase CSS 'active' en el botón para cambiar su icono/animación
        this.navMenu.classList.toggle('active'); // Añade o quita la clase CSS 'active' en el menú para mostrarlo u ocultarlo en pantalla
    } // Cierre del método toggleMenu

    // Método encargado de forzar el cierre y ocultar por completo el menú de navegación móvil
    closeMenu() {
        this.isMenuOpen = false; // Establece explícitamente el estado del menú como cerrado (falso)
        this.menuToggle.classList.remove('active'); // Remueve la clase 'active' del botón hamburguesa
        this.navMenu.classList.remove('active'); // Remueve la clase 'active' del menú contenedor ocultándolo de la vista
    } // Cierre del método closeMenu
} // Cierre de la clase NavbarController

// ==========================================
// PARTICLE BACKGROUND ANIMATION
// ==========================================
// Clase que renderiza un fondo animado interactivo compuesto por partículas conectadas mediante líneas en un Canvas 2D
class ParticleSystem {
    // Constructor que recibe el ID del canvas que se desea transformar
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId); // Selecciona el elemento <canvas> del DOM usando el ID provisto
        if (!this.canvas) return; // Si el canvas no existe en la página actual, interrumpe la ejecución de la clase por seguridad

        this.ctx = this.canvas.getContext('2d'); // Obtiene el contexto de renderizado bidimensional para poder dibujar sobre él
        this.particles = []; // Inicializa un array vacío donde se guardarán las propiedades individuales de cada partícula
        this.animationId = null; // Variable creada para almacenar la referencia del bucle de animación de requestAnimationFrame

        this.setupCanvas(); // Configura las dimensiones iniciales de ancho y alto del lienzo de dibujo
        this.createParticles(); // Rellena el array creando los objetos individuales de las partículas
        this.animate(); // Da inicio al bucle infinito de animación y redibujo por segundo

        window.addEventListener('resize', () => this.setupCanvas()); // Escucha si la ventana cambia de tamaño para reajustar el lienzo
    } // Cierre del constructor

    // Método que iguala la resolución interna de dibujo del canvas con el espacio real que ocupa en pantalla
    setupCanvas() {
        this.canvas.width = this.canvas.offsetWidth; // Asigna el ancho físico en píxeles del elemento al ancho interno del canvas
        this.canvas.height = this.canvas.offsetHeight; // Asigna el alto físico en píxeles del elemento al alto interno del canvas
    } // Cierre del método setupCanvas

    // Método que genera matemáticamente el grupo de partículas iniciales con valores aleatorios
    createParticles() {
        this.particles = []; // Resetea e inicializa de nuevo el array de partículas como vacío
        // Un bucle que se ejecuta tantas veces como se haya indicado en CONFIG.particleCount (50 veces)
        for (let i = 0; i < CONFIG.particleCount; i++) {
            // Añade un nuevo objeto con propiedades únicas al listado de partículas
            this.particles.push({
                x: Math.random() * this.canvas.width, // Define una coordenada X aleatoria dentro del ancho del lienzo
                y: Math.random() * this.canvas.height, // Define una coordenada Y aleatoria dentro del alto del lienzo
                vx: (Math.random() - 0.5) * 0.5, // Velocidad horizontal aleatoria (puede ser positiva o negativa)
                vy: (Math.random() - 0.5) * 0.5, // Velocidad vertical aleatoria (puede ser positiva o negativa)
                radius: Math.random() * 1.5, // Define un radio de tamaño aleatorio de hasta 1.5 píxeles para el punto
                opacity: Math.random() * 0.5 + 0.2, // Asigna una opacidad inicial de transparencia aleatoria entre 0.2 y 0.7
            }); // Cierre del push de objeto
        } // Cierre del bucle for
    } // Cierre del método createParticles

    // Método que ejecuta el bucle de renderizado continuo para animar los movimientos cuadro por cuadro
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Limpia por completo todo el lienzo antes de dibujar el nuevo cuadro

        // Itera sobre cada una de las partículas guardadas en el sistema para actualizar su posición y dibujarla
        this.particles.forEach((particle) => {
            // Actualiza la posición sumándole la velocidad asignada en cada fotograma
            particle.x += particle.vx; // Desplazamiento en el eje X
            particle.y += particle.vy; // Desplazamiento en el eje Y

            // Verifica si la partícula ha tocado o superado los bordes horizontales del lienzo para rebotar
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -1; // Invierte el sentido de su velocidad horizontal multiplicándola por -1
            } // Cierre de la condición de rebote X
            // Verifica si la partícula ha tocado o superado los bordes verticales del lienzo para rebotar
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -1; // Invierte el sentido de su velocidad vertical multiplicándola por -1
            } // Cierre de la condición de rebote Y

            // Fuerza los valores para asegurar que la partícula nunca quede atrapada fuera de los límites visibles del canvas
            particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));

            // Configura el color de relleno del dibujo en formato RGBA usando el celeste característico y la opacidad de la partícula
            this.ctx.fillStyle = `rgba(0, 217, 255, ${particle.opacity})`;
            this.ctx.beginPath(); // Inicia un nuevo trazo o figura geométrica en el lienzo
            // Dibuja una circunferencia perfecta (arco de 0 a 2*PI radianes) en las coordenadas actuales y con el radio de la partícula
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fill(); // Rellena el círculo dibujado con el color establecido previamente

            // Segundo bucle anidado para comparar la partícula actual con todas las demás del array y trazar conexiones
            this.particles.forEach((otherParticle) => {
                const dx = particle.x - otherParticle.x; // Calcula la distancia de separación en el eje X
                const dy = particle.y - otherParticle.y; // Calcula la distancia de separación en el eje Y
                const distance = Math.sqrt(dx * dx + dy * dy); // Aplica el Teorema de Pitágoras para hallar la distancia real en línea recta

                // Si la distancia calculada entre ambos puntos es menor a 150 píxeles
                if (distance < 150) {
                    // Define el estilo de línea haciendo que sea más transparente a medida que los puntos se separan más
                    this.ctx.strokeStyle = `rgba(0, 217, 255, ${0.1 * (1 - distance / 150)})`;
                    this.ctx.lineWidth = 0.5; // Grosor muy fino de la línea de conexión (0.5px)
                    this.ctx.beginPath(); // Inicializa un nuevo trazo para la línea
                    this.ctx.moveTo(particle.x, particle.y); // Posiciona el "lápiz" virtual en el centro de la partícula inicial
                    this.ctx.lineTo(otherParticle.x, otherParticle.y); // Dibuja una línea recta imaginaria hasta la posición de la otra partícula
                    this.ctx.stroke(); // Pinta de forma efectiva la línea trazada en el canvas
                } // Cierre de la condición de cercanía
            }); // Cierre del forEach anidado
        }); // Cierre del forEach principal

        // Llama de forma recursiva al mismo método en el siguiente refresco de pantalla del navegador, creando el bucle continuo
        this.animationId = requestAnimationFrame(() => this.animate());
    } // Cierre del método animate
} // Cierre de la clase ParticleSystem

// ==========================================
// INTERSECTION OBSERVER FOR REVEAL ANIMATIONS
// ==========================================
// Clase para controlar la aparición gradual y animada de elementos de contenido a medida que se navega por la página
class RevealObserver {
    // Constructor de la clase que detecta los elementos a observar
    constructor() {
        // Selecciona todos los elementos HTML que contengan clases específicas destinadas a animarse al aparecer
        this.revealElements = document.querySelectorAll(
            '.reveal-text, .reveal-fade, .reveal-card, .reveal-timeline'
        ); // Guarda el listado de nodos encontrados
        this.initObserver(); // Inicializa el observador de intersección
    } // Cierre del constructor

    // Método que configura la API IntersectionObserver para disparar animaciones optimizadas
    initObserver() {
        // Objeto de configuración para indicar las condiciones bajo las cuales se activará la visualización
        const options = {
            threshold: 0.1, // El elemento debe ser visible al menos en un 10% de su tamaño total en pantalla
            rootMargin: '0px 0px -100px 0px', // Acorta el área de activación por abajo en 100px para que la animación empiece antes de llegar al borde
        }; // Cierre del objeto de configuración

        // Crea una nueva instancia de IntersectionObserver que recibe una función de callback y las opciones anteriores
        const observer = new IntersectionObserver((entries) => {
            // Itera sobre cada uno de los elementos que cambiaron su estado de visibilidad
            entries.forEach((entry) => {
                // Si el elemento ha entrado en la zona visible configurada de la pantalla
                if (entry.isIntersecting) {
                    // Le inyecta estilos CSS inline para ejecutar la animación 'reveal-animation' usando la duración configurable (800ms)
                    entry.target.style.animation = `reveal-animation ${CONFIG.animationDuration}ms ease-out forwards`;
                    observer.unobserve(entry.target); // Deja de observar este elemento para que la animación solo ocurra una única vez
                } // Cierre de la validación isIntersecting
            }); // Cierre del bucle de entradas
        }, options); // Cierre de la inicialización de IntersectionObserver

        this.revealElements.forEach((el) => observer.observe(el)); // Ordena al observador empezar a vigilar cada uno de los nodos detectados
    } // Cierre del método initObserver
} // Cierre de la clase RevealObserver

// ==========================================
// SMOOTH SCROLL BEHAVIOR
// ==========================================
// Clase encargada de interceptar los enlaces internos del sitio para realizar un desplazamiento suave y elegante
class SmoothScroll {
    // Constructor que busca los enlaces que apuntan a secciones internas
    constructor() {
        this.links = document.querySelectorAll('a[href^="#"]'); // Selecciona todos los enlaces cuyo atributo href empiece con el caracter '#'
        this.init(); // Invoca el asignador de eventos
    } // Cierre del constructor

    // Método que asigna los escuchadores de clics a los enlaces internos detectados
    init() {
        this.links.forEach((link) => {
            link.addEventListener('click', (e) => this.handleClick(e)); // Añade un detector para ejecutar handleClick al hacer clic
        }); // Cierre del bucle forEach
    } // Cierre del método init

    // Método que gestiona el comportamiento del clic anulando el salto brusco clásico
    handleClick(e) {
        const href = e.currentTarget.getAttribute('href'); // Obtiene el valor exacto del atributo 'href' del enlace clickeado
        if (href === '#') return; // Si el enlace apunta únicamente a '#' (enlace vacío), cancela la acción y no hace nada

        e.preventDefault(); // Detiene la acción nativa del navegador para evitar el salto instantáneo a la sección
        const target = document.querySelector(href); // Busca en el documento el elemento HTML cuyo ID coincida con el valor del href
        if (!target) return; // Si por alguna razón la sección de destino no existe en la página, detiene el proceso de inmediato

        // Ejecuta la API nativa de desplazamiento indicando comportamiento suave y alineación al inicio del elemento
        target.scrollIntoView({
            behavior: 'smooth', // Aplica una transición amortiguada y fluida en lugar de un salto rígido
            block: 'start', // Alinea la parte superior del elemento de destino con la parte superior de la ventana
        }); // Cierre de scrollIntoView
    } // Cierre del método handleClick
} // Cierre de la clase SmoothScroll

// ==========================================
// BUTTON RIPPLE EFFECT
// ==========================================
// Clase encargada de generar un efecto visual de onda expansiva (ripple) al presionar los botones, al estilo Material Design
class RippleEffect {
    // Constructor que obtiene todos los botones interactivos de la página
    constructor() {
        this.buttons = document.querySelectorAll('button'); // Busca y recolecta todas las etiquetas <button> presentes en el DOM
        this.init(); // Arranca la inicialización del efecto
    } // Cierre del constructor

    // Método que asigna los eventos de escucha del clic a los botones
    init() {
        this.buttons.forEach((button) => {
            button.addEventListener('click', (e) => this.createRipple(e)); // Al hacer clic, se ejecuta la función de creación de la onda
        }); // Cierre del bucle forEach
    } // Cierre del método init

    // Método que calcula la posición exacta del cursor para renderizar la onda expansiva dentro del botón
    createRipple(e) {
        const button = e.currentTarget; // Almacena el botón específico sobre el cual se hizo clic
        const rect = button.getBoundingClientRect(); // Obtiene las dimensiones físicas y la posición exacta del botón respecto a la pantalla
        const size = Math.max(rect.width, rect.height); // Determina cuál es la dimensión mayor (ancho o alto) para fijar el diámetro de la onda
        const x = e.clientX - rect.left - size / 2; // Calcula la coordenada X relativa dentro del botón donde se hizo el clic
        const y = e.clientY - rect.top - size / 2; // Calcula la coordenada Y relativa dentro del botón donde se hizo el clic

        const ripple = document.createElement('span'); // Crea un elemento HTML tipo <span> de manera dinámica
        ripple.style.width = ripple.style.height = size + 'px'; // Aplica el tamaño calculado al ancho y alto del span para que sea cuadrado
        ripple.style.left = x + 'px'; // Posiciona horizontalmente el centro de la onda en el punto exacto del clic
        ripple.style.top = y + 'px'; // Posiciona verticalmente el centro de la onda en el punto exacto del clic
        ripple.classList.add('ripple'); // Le añade la clase CSS 'ripple' la cual contiene los estilos de animación expansiva y opacidad

        // Busca si el botón ya tiene alguna onda expansiva previa que aún esté agregada en su interior
        const existingRipple = button.querySelector('.ripple');
        if (existingRipple) existingRipple.remove(); // Si encuentra una onda previa, la elimina del DOM para evitar sobrecargas de elementos

        button.appendChild(ripple); // Inserta el nuevo span de animación como un hijo interno dentro del contenedor del botón
    } // Cierre del método createRipple
} // Cierre de la clase RippleEffect

// ==========================================
// COUNTER ANIMATION
// ==========================================
// Clase diseñada para realizar una animación de cuenta numérica progresiva ascendente al visualizar las estadísticas del sitio
class CounterAnimation {
    // Constructor que localiza las cifras numéricas animables
    constructor() {
        this.counters = document.querySelectorAll('.stat-number'); // Obtiene todos los elementos que muestran números de estadísticas
        this.init(); // Llama a la inicialización respaldada en IntersectionObserver
    } // Cierre del constructor

    // Método que prepara el observador para iniciar la animación numérica solo cuando las estadísticas estén a la vista
    init() {
        const options = {
            threshold: 0.5, // El elemento debe ser visible al menos al 50% en la pantalla antes de empezar a incrementar las cifras
        }; // Cierre del objeto de configuración

        // Inicializa el observador para controlar la ejecución visual de la cuenta regresiva/progresiva
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                // Si las estadísticas entraron en la zona de visualización requerida
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target); // Ejecuta la lógica de incremento en el elemento de texto actual
                    observer.unobserve(entry.target); // Remueve la observación para evitar que vuelva a animar repetidamente al scrollear
                } // Cierre de la validación
            }); // Cierre del bucle forEach
        }, options); // Cierre del observador de intersección

        this.counters.forEach((counter) => observer.observe(counter)); // Ordena vigilar individualmente a cada contador de estadísticas
    } // Cierre del método init

    // Método que incrementa progresivamente el número utilizando funciones de tiempo de alta precisión
    animateCounter(element) {
        const text = element.textContent; // Lee el texto original guardado dentro del elemento (ej: "99+")
        const finalValue = parseInt(text.replace(/\D/g, '')); // Extrae únicamente los dígitos numéricos eliminando letras o símbolos (ej: 99)
        const suffix = text.replace(/\d/g, ''); // Extrae todos los símbolos que no sean números para usarlos de sufijo (ej: "+")
        let currentValue = 0; // Inicializa el contador que aumentará progresivamente partiendo desde cero
        const duration = 2000; // Define el tiempo total que durará el incremento completo en milisegundos (2 segundos)
        const startTime = Date.now(); // Captura la marca de tiempo exacta del inicio exacto de la animación

        // Función interna repetitiva encargada de actualizar el valor según el tiempo transcurrido
        const animate = () => {
            const elapsed = Date.now() - startTime; // Calcula cuántos milisegundos han pasado desde que inició la animación
            const progress = Math.min(elapsed / duration, 1); // Obtiene una tasa decimal de progreso entre 0 y 1 asegurando no superar el 1
            currentValue = Math.floor(finalValue * progress); // Multiplica el valor final por el progreso y lo redondea hacia abajo

            element.textContent = currentValue + suffix; // Reemplaza el texto en pantalla concatenando el número actual y su sufijo

            // Si el progreso de la animación aún no ha llegado al 100% (es decir, menor a 1)
            if (progress < 1) {
                requestAnimationFrame(animate); // Solicita al navegador agendar la ejecución del método en el siguiente fotograma
            } // Cierre de la validación de progreso
        }; // Cierre de la subfunción animate

        animate(); // Llama por primera vez a la subfunción para arrancar la secuencia del contador
    } // Cierre del método animateCounter
} // Cierre de la clase CounterAnimation

// ==========================================
// TIMELINE ANIMATION
// ==========================================
// Clase para animar los hitos o bloques cronológicos de forma secuencial y escalonada al aparecer en pantalla
class TimelineAnimation {
    // Constructor que recopila la lista de elementos de la línea de tiempo
    constructor() {
        this.items = document.querySelectorAll('.timeline-item'); // Obtiene todos los contenedores con la clase '.timeline-item'
        this.init(); // Inicializa el sistema de observación
    } // Cierre del constructor

    // Método encargado de vigilar la línea de tiempo mediante IntersectionObserver
    init() {
        const options = {
            threshold: 0.3, // El bloque cronológico debe asomar al menos un 30% en pantalla para disparar el efecto
            rootMargin: '0px 0px -50px 0px', // Desplaza el área efectiva de detección 50 píxeles por encima del fondo inferior
        }; // Cierre de configuraciones

        // Crea el observador de intersección encargado de aplicar retardos en cascada para la animación
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                // Si el elemento pasa a estar en la zona de visualización válida de la página
                if (entry.isIntersecting) {
                    // Configura un retardo de tiempo basado en su posición física (índice) para que aparezcan uno tras otro de forma fluida
                    setTimeout(
                        () => {
                            entry.target.style.animation = `reveal-animation 600ms ease-out forwards`; // Inyecta la animación CSS
                        },
                        index * 150 // Multiplica el índice por 150ms para desfasar la entrada de cada elemento subsiguiente
                    ); // Cierre de setTimeout
                    observer.unobserve(entry.target); // Desactiva el seguimiento para que la animación se quede fija
                } // Cierre de la validación de intersección
            }); // Cierre de iteración de entradas
        }, options); // Cierre de la instancia de IntersectionObserver

        this.items.forEach((item) => observer.observe(item)); // Vincula el observador a cada uno de los bloques de la línea de tiempo
    } // Cierre del método init
} // Cierre de la clase TimelineAnimation

// ==========================================
// CARD HOVER EFFECT
// ==========================================
// Clase que provee un efecto interactivo avanzado tridimensional en 3D y brillo de sombras dinámicas al pasar el ratón sobre las tarjetas
class CardHoverEffect {
    // Constructor que busca los diferentes tipos de tarjetas de contenidos del portal
    constructor() {
        // Selecciona de golpe las tarjetas de servicios, portafolio y precios aplicando múltiples Selectores CSS
        this.cards = document.querySelectorAll(
            '.service-card, .portfolio-card, .pricing-card'
        ); // Guarda la colección en el objeto
        this.init(); // Lanza el asignador de interacciones de ratón
    } // Cierre del constructor

    // Método que registra los eventos de interacción del puntero sobre cada tarjeta
    init() {
        this.cards.forEach((card) => {
            card.addEventListener('mouseenter', (e) => this.handleHover(e)); // Evento ejecutado al entrar el cursor al área física de la tarjeta
            card.addEventListener('mousemove', (e) => this.handleMouseMove(e)); // Evento continuo ejecutado mientras el cursor se mueva por dentro de la tarjeta
            card.addEventListener('mouseleave', (e) => this.handleLeave(e)); // Evento ejecutado justo al salir el cursor de la tarjeta
        }); // Cierre de iteraciones
    } // Cierre del método init

    // Método activado en el instante en que el ratón ingresa a la tarjeta
    handleHover(e) {
        const card = e.currentTarget; // Captura el elemento de la tarjeta sobre el cual se interactúa
        card.style.transform = 'translateY(-10px)'; // Eleva suavemente la tarjeta 10px en vertical mediante transformaciones CSS
    } // Cierre del método handleHover

    // Método encargado de simular el efecto de inclinación 3D inclinando y distorsionando las sombras según la posición interna del cursor
    handleMouseMove(e) {
        const card = e.currentTarget; // Captura el elemento físico de la tarjeta actual
        const rect = card.getBoundingClientRect(); // Obtiene las coordenadas espaciales absolutas de la tarjeta en pantalla
        const x = e.clientX - rect.left; // Calcula la distancia horizontal del cursor con respecto al borde izquierdo interno de la tarjeta
        const y = e.clientY - rect.top; // Calcula la distancia vertical del cursor con respecto al borde superior interno de la tarjeta

        const centerX = rect.width / 2; // Determina el punto central exacto de la tarjeta a lo ancho
        const centerY = rect.height / 2; // Determina el punto central exacto de la tarjeta a lo alto

        const rotateX = (y - centerY) / 10; // Calcula una tasa de inclinación para el eje X en base a la distancia al centro
        const rotateY = (centerX - x) / 10; // Calcula una tasa de inclinación para el eje Y en base a la distancia al centro

        // Modifica la propiedad de sombra CSS de forma dinámica emulando una proyección de iluminación basada en la posición calculada
        card.style.boxShadow = `
            ${rotateY * 2}px ${rotateX * 2}px 20px rgba(0, 217, 255, 0.3)
        `; // Aplica el sombreado difuminado teñido con el color cian característico
    } // Cierre del método handleMouseMove

    // Método encargado de restaurar el estado original del diseño cuando el usuario retira el ratón del elemento
    handleLeave(e) {
        const card = e.currentTarget; // Captura la tarjeta de la cual salió el ratón
        card.style.transform = ''; // Elimina la propiedad inline de traslación vertical restableciendo la posición inicial por CSS
        card.style.boxShadow = ''; // Remueve la sombra CSS calculada inline devolviéndole su estilo predeterminado de hoja de estilos
    } // Cierre del método handleLeave
} // Cierre de la clase CardHoverEffect

// ==========================================
// PRICING TOGGLE
// ==========================================
// Clase para controlar el cambio de tarifas de precios (por ejemplo, cambio entre facturación mensual y anual)
class PricingToggle {
    // Constructor básico que arranca la inicialización del sistema
    constructor() {
        this.init(); // Invoca el método de inicio automático
    } // Cierre del constructor

    // Método preparado para la escalabilidad futura del sistema de precios
    init() {
        // Puede extenderse para agregar toggle de billing anual/mensual
        console.log('Pricing system initialized'); // Deja un registro en consola confirmando que la lógica base está lista
    } // Cierre del método init
} // Cierre de la clase PricingToggle

// ==========================================
// CURSOR GLOW EFFECT
// ==========================================
// Clase que implementa esferas de degradado flotantes en la cabecera que persiguen la posición actual del cursor del usuario
class CursorGlow {
    // Constructor que inicializa los valores posicionales en cero
    constructor() {
        this.x = 0; // Coordenada X inicial del mouse en cero
        this.y = 0; // Coordenada Y inicial del mouse en cero
        this.init(); // Activa el escuchador de posición global
    } // Cierre del constructor

    // Método que registra el movimiento del ratón a nivel general del documento
    init() {
        document.addEventListener('mousemove', (e) => {
            this.x = e.clientX; // Actualiza la propiedad interna X con la ubicación del puntero del usuario en tiempo real
            this.y = e.clientY; // Actualiza la propiedad interna Y con la ubicación del puntero del usuario en tiempo real
            this.updateGlow(); // Llama al actualizador de posición de las esferas estéticas
        }); // Cierre del evento de escucha
    } // Cierre del método init

    // Método encargado de reubicar los círculos difuminados de fondo en base al ratón, optimizando rendimiento en la sección Hero
    updateGlow() {
        const hero = document.getElementById('hero'); // Busca el elemento contenedor de la sección principal con ID 'hero'
        // Valida si la sección hero existe y si la altura actual del ratón se encuentra por dentro de los límites verticales de esa sección
        if (hero && this.y < hero.offsetHeight) {
            const gradients = document.querySelectorAll('.gradient-sphere'); // Selecciona todas las esferas decorativas de degradado
            // Itera aplicando desfasajes de movimiento calculados por cada esfera para dar efecto de profundidad
            gradients.forEach((grad, index) => {
                const offset = (index + 1) * 10; // Genera una desviación matemática multiplicando la posición de la esfera por 10px
                grad.style.left = `${this.x + offset}px`; // Ajusta el posicionamiento horizontal CSS inline de la esfera
                grad.style.top = `${this.y + offset}px`; // Ajusta el posicionamiento vertical CSS inline de la esfera
            }); // Cierre del forEach
        } // Cierre de la condición de límites
    } // Cierre del método updateGlow
} // Cierre de la clase CursorGlow

// ==========================================
// SCROLL PROGRESS BAR
// ==========================================
// Clase encargada de pintar y rellenar dinámicamente una barra de progreso delgada en el extremo superior según la lectura del usuario
class ScrollProgress {
    // Constructor de la clase
    constructor() {
        this.init(); // Arranca directamente la inyección y el cálculo de scroll
    } // Cierre del constructor

    // Método encargado de armar los estilos por código e inyectar el nodo medidor dentro del cuerpo de la web
    init() {
        const progress = document.createElement('div'); // Crea un contenedor genérico HTML <div>
        progress.id = 'scroll-progress'; // Asigna un identificador único al elemento creado
        // Define un string CSS inline estructurado para posicionar de forma fija la barra sin depender de un archivo externo
        progress.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #00d9ff, #7c3aed, #ec4899);
            width: 0;
            z-index: 9999;
            transition: width 0.1s ease;
        `; // Fin de los estilos inline; asigna un fondo en degradado cian-púrpura-rosa y prioridad z-index absoluta
        document.body.appendChild(progress); // Agrega la barra recién construida al final de la etiqueta <body> del documento

        // Escucha el evento de desplazamiento global de la ventana
        window.addEventListener('scroll', () => {
            const windowHeight = document.documentElement.scrollHeight - window.innerHeight; // Calcula la altura máxima scroleable útil de la página
            const scrolled = window.scrollY; // Lee la posición vertical exacta de píxeles donde está parado el usuario actualmente
            const percentage = (scrolled / windowHeight) * 100; // Regla de tres simple para obtener el porcentaje de avance (0 a 100%)
            progress.style.width = percentage + '%'; // Modifica el ancho de la barra CSS inline para representar el porcentaje de avance real
        }); // Cierre del evento scroll
    } // Cierre del método init
} // Cierre de la clase ScrollProgress

// ==========================================
// PARALLAX EFFECT
// ==========================================
// Clase para dotar de efectos de movimiento tridimensional "Parallax" a ciertos objetos decorativos al hacer desplazamientos verticales
class ParallaxEffect {
    // Constructor encargado de buscar los nodos configurados para el efecto
    constructor() {
        this.elements = document.querySelectorAll('[data-parallax]'); // Selecciona todos los elementos HTML que posean el atributo personalizado 'data-parallax'
        this.init(); // Inicializa los cálculos de desplazamiento
    } // Cierre del constructor

    // Método que registra la escucha del scroll para transformar las posiciones de los componentes parallax
    init() {
        if (this.elements.length === 0) return; // Si no hay ningún elemento configurado con este atributo en la página actual, frena el método

        window.addEventListener('scroll', () => {
            // Recorre uno por uno los elementos parallax detectados en el documento
            this.elements.forEach((el) => {
                const speed = el.dataset.parallax || 0.5; // Lee la velocidad asignada en el atributo HTML o fija 0.5 como valor por defecto
                const yPos = window.scrollY * speed; // Calcula cuántos píxeles debe retrasarse el objeto multiplicando el desplazamiento actual por la velocidad
                el.style.transform = `translateY(${yPos}px)`; // Desplaza el elemento verticalmente modificando su propiedad transform por CSS inline
            }); // Cierre del bucle forEach
        }); // Cierre del evento de escucha scroll
    } // Cierre del método init
} // Cierre de la clase ParallaxEffect

// ==========================================
// NOTIFICATION SYSTEM
// ==========================================
// Clase utilitaria global con un método estático que permite desplegar avisos flotantes emergentes (Toasts) en la pantalla de forma rápida
class NotificationSystem {
    // Método estático accesible directamente sin instanciar la clase (acepta texto de mensaje, tipo de estilo y tiempo en pantalla)
    static show(message, type = 'success', duration = 3000) {
        const notification = document.createElement('div'); // Crea de la nada una caja contenedora HTML <div> para la notificación
        notification.className = `notification notification-${type}`; // Le asigna clases estructuradas combinando dinámicamente el tipo (ej: notification-success)
        notification.textContent = message; // Inserta el texto plano provisto dentro de la caja de notificación
        // Define las reglas visuales estrictas CSS inline necesarias para fijar y animar el aviso emergente en la esquina inferior derecha
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 217, 255, 0.9);
            color: white;
            padding: 16px 24px;
            border-radius: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            font-weight: 600;
        `; // Fin de estilos inline. Cuenta con una animación de entrada inicial 'slideIn' y alta prioridad z-index
        document.body.appendChild(notification); // Coloca el aviso de notificación directamente en la interfaz del documento

        // Dispara un temporizador para ocultar y destruir el elemento tras agotarse el tiempo de duración asignado
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out forwards'; // Cambia la animación inline a 'slideOut' para retirar la caja suavemente
            setTimeout(() => notification.remove(), 300); // Espera 300 milisegundos adicionales (tiempo de la animación) y destruye por completo el nodo HTML del DOM
        }, duration); // Cierre del temporizador principal basado en el parámetro de duración
    } // Cierre del método estático show
} // Cierre de la clase NotificationSystem

// ==========================================
// BUTTON INTERACTIONS
// ==========================================
// Clase diseñada para controlar eventos específicos y complementarios sobre los botones principales de Llamado a la Acción (CTA)
class ButtonInteractions {
    // Constructor de la clase
    constructor() {
        this.init(); // Corre la inicialización de eventos inmediatamente
    } // Cierre del constructor

    // Método encargado de interceptar clics en los botones con estilos premium resaltados
    init() {
        const buttons = document.querySelectorAll('.btn-cta, .btn-primary'); // Selecciona colecciones de botones bajo las clases de acción principales

        // Recorre todos los botones encontrados aplicando el detector de clics
        buttons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                this.handleButtonClick(e); // Ejecuta el gestor de clics de botones al detectar la interacción
            }); // Cierre del detector de eventos
        }); // Cierre de iteración
    } // Cierre del método init

    // Método que examina el contenido del botón clickeado para mostrar mensajes informativos contextuales
    handleButtonClick(e) {
        const btn = e.currentTarget; // Almacena el botón que disparó la acción actual
        const text = btn.textContent; // Extrae el texto plano literal que contiene el botón en su interior

        // Comprueba si el texto del botón contiene palabras clave de enganche o conversión comercial
        if (text.includes('Empezar') || text.includes('Consulta Gratuita')) {
            // Hace uso del sistema estático de notificaciones para avisar al usuario del proceso en curso
            NotificationSystem.show(
                'Te redirigiremos al formulario de contacto...', // Mensaje textual de aviso
                'success' // Clase de estilo de notificación exitosa
            ); // Cierre de la invocación al Toast informativo
            // Aquí iría la redirección real
        } // Cierre de la condición de texto
    } // Cierre del método handleButtonClick
} // Cierre de la clase ButtonInteractions

// ==========================================
// FORM VALIDATION
// ==========================================
// Clase de validación y control general para todos los formularios genéricos integrados en la landing page
class FormValidation {
    // Constructor de la clase
    constructor() {
        this.init(); // Lanza el disparador de eventos de interceptación
    } // Cierre del constructor

    // Método encargado de buscar formularios generales y vigilar sus envíos
    init() {
        const forms = document.querySelectorAll('form'); // Selecciona de manera masiva todos los elementos de formulario <form> del portal
        forms.forEach((form) => {
            form.addEventListener('submit', (e) => this.handleSubmit(e)); // Al enviarse, delega el control al método interno handleSubmit
        }); // Cierre de iteración
    } // Cierre del método init

    // Método gestor del envío de datos que interrumpe recargas de página y notifica al usuario final de forma amigable
    handleSubmit(e) {
        e.preventDefault(); // Evita por completo la recarga forzada clásica del navegador ante un envío de formulario tradicional
        // Despliega una alerta limpia en pantalla agradeciendo la interacción mediante el NotificationSystem
        NotificationSystem.show(
            'Gracias por tu interés. Nos pondremos en contacto pronto.', // Texto del aviso emergente
            'success' // Define el estilo estético del aviso como exitoso
        ); // Fin del Toast informativo
        e.target.reset(); // Restablece y limpia a sus valores vacíos originales todos los campos del formulario que fue enviado
    } // Cierre del método handleSubmit
} // Cierre de la clase FormValidation

// ==========================================
// LAZY LOADING IMAGES
// ==========================================
// Clase para postergar inteligentemente la carga de imágenes pesadas optimizando drásticamente la velocidad de carga inicial de la web
class LazyLoadImages {
    // Constructor de la clase
    constructor() {
        this.init(); // Inicia la evaluación de compatibilidad de carga diferida
    } // Cierre del constructor

    // Método que configura un IntersectionObserver específico para intercambiar atributos de origen en imágenes
    init() {
        // Valida si el navegador del visitante es moderno y soporta nativamente la API IntersectionObserver
        if ('IntersectionObserver' in window) {
            // Instancia un observador dedicado al rastreo de la llegada de imágenes a la zona de visión del cliente
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    // Si la imagen en cuestión ingresó o está muy cerca de ingresar al área visible de la pantalla
                    if (entry.isIntersecting) {
                        const img = entry.target; // Captura la etiqueta <img> actual que está siendo procesada
                        img.src = img.dataset.src || img.src; // Pasa el link real del atributo 'data-src' al 'src' real para forzar la descarga de la imagen
                        img.classList.add('loaded'); // Agrega la clase CSS 'loaded' para disparar efectos de transiciones de opacidad suaves (fade-in)
                        imageObserver.unobserve(img); // Ordena al observador retirar el rastreo sobre esta imagen ya cargada con éxito
                    } // Cierre de la condición de intersección de imagen
                }); // Cierre del bucle forEach de imágenes detectadas
            }); // Cierre del bloque de inicialización del observador

            // Localiza todas las etiquetas de imagen de la web que posean el atributo personalizado de origen diferido
            document.querySelectorAll('img[data-src]').forEach((img) => {
                imageObserver.observe(img); // Registra y activa la vigilancia posicional sobre cada una de las imágenes candidatas encontradas
            }); // Cierre del bucle de vinculación de observación
        } // Cierre del bloque condicional de compatibilidad de la API
    } // Cierre del método init
} // Cierre de la clase LazyLoadImages

// ==========================================
// KEYBOARD NAVIGATION
// ==========================================
// Clase de accesibilidad que monitorea la actividad del teclado para enriquecer la experiencia de control del usuario
class KeyboardNavigation {
    // Constructor de la clase
    constructor() {
        this.init(); // Inicializa el detector global de pulsaciones de teclas
    } // Cierre del constructor

    // Método que adjunta un escuchador de eventos de teclado en todo el documento
    init() {
        document.addEventListener('keydown', (e) => {
            // Comprueba detalladamente si la tecla física que presionó el usuario corresponde a la tecla de Escape ('Escape' o 'Esc')
            if (e.key === 'Escape') {
                const navbar = document.getElementById('navbar'); // Obtiene la barra de navegación del DOM
                const navMenu = document.getElementById('navMenu'); // Obtiene el menú móvil desplegable del DOM
                const menuToggle = document.getElementById('menuToggle'); // Obtiene el botón disparador del menú móvil del DOM

                // Fuerza de manera segura el cierre inmediato del menú móvil si estuviese abierto al presionar escape
                navMenu.classList.remove('active'); // Oculta la caja del menú retirando la clase activa
                menuToggle.classList.remove('active'); // Regresa el icono hamburguesa a su diseño original quitando la clase activa
            } // Cierre de la comprobación de tecla Escape
        }); // Cierre de la escucha del evento keydown
    } // Cierre del método init
} // Cierre de la clase KeyboardNavigation

// ==========================================
// PERFORMANCE MONITORING
// ==========================================
// Clase encargada de medir métricas de velocidad técnica internas del sitio imprimiendo reportes de diagnóstico en consola
class PerformanceMonitor {
    // Constructor de la clase
    constructor() {
        this.init(); // Arranca el monitoreo del rendimiento de recursos
    } // Cierre del constructor

    // Método de análisis que utiliza PerformanceObserver para extraer el costo en milisegundos de la carga de la web
    init() {
        // Valida exhaustivamente si el navegador cuenta con soporte técnico para la API avanzada PerformanceObserver
        if ('PerformanceObserver' in window) {
            try { // Abre bloque de control por seguridad ante restricciones de políticas de navegadores
                // Inicializa el observador técnico de rendimiento pasándole un bucle de recolección de entradas
                const observer = new PerformanceObserver((list) => {
                    // Itera sobre los reportes técnicos generados por las acciones del navegador
                    for (const entry of list.getEntries()) {
                        console.log(`${entry.name}: ${entry.duration}ms`); // Imprime en consola el nombre del recurso y su tiempo exacto de procesamiento en milisegundos
                    } // Cierre del ciclo de entradas de rendimiento
                }); // Cierre de la instancia del observador

                // Configura el observador para registrar exclusivamente eventos vinculados a la navegación general e impacto de recursos externos
                observer.observe({ entryTypes: ['navigation', 'resource'] });
            } catch (e) { // Bloque catch para capturar excepciones
                // Silent fail for older browsers -> Falla en silencio en navegadores obsoletos sin interrumpir la ejecución del resto del JavaScript
            } // Cierre del try-catch
        } // Cierre de validación de compatibilidad de la API de rendimiento
    } // Cierre del método init
} // Cierre de la clase PerformanceMonitor

// ==========================================
// INITIALIZE ALL SYSTEMS ON DOM READY
// ==========================================
// Bloque maestro encargado de orquestar y encender absolutamente todos los módulos lógicos una vez la estructura HTML esté totalmente lista
document.addEventListener('DOMContentLoaded', () => {
    console.log('🦈 W SHARK - Initializing premium experience...'); // Envía un saludo de bienvenida de la marca a la consola del desarrollador

    // Instanciación en memoria e inicialización automática de cada controlador y efecto del archivo JavaScript
    new NavbarController(); // Enciende el controlador del menú de navegación y efectos de scroll
    new ParticleSystem('particleCanvas'); // Enciende la animación del lienzo de partículas conectando el nodo canvas por ID
    new RevealObserver(); // Enciende el observador de apariciones graduales de bloques de contenidos
    new SmoothScroll(); // Enciende el interceptor de enlaces para desplazamientos fluidos de scroll
    new RippleEffect(); // Enciende los efectos de ondas expansivas en botones al hacer clics
    new CounterAnimation(); // Enciende los incrementos progresivos numéricos automáticos en estadísticas
    new TimelineAnimation(); // Enciende la aparición en cascada cronológica de la línea de tiempo
    new CardHoverEffect(); // Enciende el sistema interactivo de inclinaciones y sombras 3D en las tarjetas
    new PricingToggle(); // Enciende el módulo base del seleccionador de precios
    new CursorGlow(); // Enciende el efecto de esferas de luz que siguen la trayectoria del ratón
    new ScrollProgress(); // Enciende y dibuja la barra superior indicadora del porcentaje de lectura
    new ParallaxEffect(); // Enciende los movimientos sutiles parallax de decoración en fondos
    new ButtonInteractions(); // Enciende los avisos del sistema Toast asociados a acciones de botones
    new FormValidation(); // Enciende los validadores estándar alternativos de formularios
    new LazyLoadImages(); // Enciende la carga inteligente diferida de imágenes basada en visibilidad
    new KeyboardNavigation(); // Enciende las directivas de accesibilidad por medio de la tecla Escape
    new PerformanceMonitor(); // Enciende el monitor interno para auditar el rendimiento y carga de elementos
    new ContactFormHandler(); // Enciende el despachador premium asíncrono para el envío del formulario de contacto hacia EmailJS/mailto

    console.log('✅ W SHARK - All systems online and ready for takeoff!'); // Registra en consola que la inicialización concluyó de forma totalmente exitosa
}); // Cierre de la función de callback de DOMContentLoaded

// ==========================================
// HANDLE PAGE VISIBILITY
// ==========================================
// Evento para rastrear si el usuario se cambia de pestaña o minimiza la ventana, ayudando a optimizar procesos
document.addEventListener('visibilitychange', () => {
    // Comprueba si el estado actual de la página pasó a estar oculto a los ojos del usuario
    if (document.hidden) {
        console.log('🦈 W SHARK - Page hidden'); // Deja constancia en consola de que la web pasó a segundo plano (se pueden pausar bucles pesados aquí)
    } else { // Si el usuario regresa nuevamente a la pestaña de nuestra web
        console.log('🦈 W SHARK - Welcome back!'); // Da un saludo de bienvenida por consola al regresar el foco a la ventana
    } // Cierre del condicional de visibilidad
}); // Cierre del detector de cambio de visibilidad

// ==========================================
// ERROR HANDLING
// ==========================================
// Capturador general de errores en tiempo de ejecución para evitar que fallas imprevistas rompan la experiencia de navegación del usuario
window.addEventListener('error', (e) => {
    console.error('Error detected:', e.error); // Registra con un formato destacado de error el fallo técnico localizado y su descripción en consola
}); // Cierre del capturador de errores tradicional

// Capturador especializado en registrar promesas asíncronas rechazadas que no contaron con un bloque catch de contención
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason); // Imprime el motivo específico del fallo del rechazo asíncrono en la consola
}); // Cierre del capturador de rechazos de promesas

// ==========================================
// PRELOAD CRITICAL RESOURCES
// ==========================================
// Evento de escucha que se dispara al completarse absolutamente toda la descarga de la página (HTML, CSS, Imágenes y fuentes externas)
window.addEventListener('load', () => {
    console.log('🦈 W SHARK - Page fully loaded'); // Envía confirmación por consola de carga completa absoluta

    // Bloque destinado a optimizar la carga e inyección diferida de tipografías premium desde Google Fonts para optimizar el primer renderizado
    const link = document.createElement('link'); // Crea una etiqueta de vinculación HTML <link>
    link.rel = 'preload'; // Configura el enlace con la directiva de precarga de alta prioridad 'preload'
    link.as = 'font'; // Especifica al navegador que el recurso que se va a descargar de forma prioritaria corresponde a fuentes de tipografías
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@400;600;700;800&display=swap'; // Asigna la URL del catálogo de Google Fonts con las familias y pesos necesarios
    document.head.appendChild(link); // Inserta el elemento link al <head> forzando la optimización final de textos en pantalla
}); // Cierre del evento de escucha de carga de ventana
