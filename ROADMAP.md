# Web de Orvyn Studios — hoja de ruta

Estado: **base v1**. Hay estructura, sistema de diseño y animaciones principales. Lo de abajo está pendiente.
Seguimiento general en el issue #1.

## Lo que ya está (base)

- `index.html` + `styles.css` + `main.js`, sin dependencias ni paso de compilación.
- Sistema de diseño en `:root` de `styles.css`: colores, degradado de marca, radios, curvas (`--ease`, `--spring`), tipografías (Space Grotesk + Inter).
- **Hero:** titular con revelado palabra a palabra, Nova en 3D que sigue al cursor y parpadea, fondo de aurora en canvas y grano.
- **Productos:**
  - StarOptimizer, con captura real e inclinación 3D al pasar el ratón.
  - Nivo, con una demo viva de la isla dinámica (música, temporizador, aviso).
- **Principios:** 3 tarjetas con foco que sigue al cursor.
- **CTA y footer** básicos.
- Revelado al hacer scroll, nav con fondo al bajar, responsive (900 px / 640 px) y `prefers-reduced-motion` respetado.

## Pendiente

### Contenido
- [x] **Página de privacidad de StarOptimizer** (`/privacidad/staroptimizer/`). El texto está en `docs/PRIVACY.md` del repo de StarOptimizer. Microsoft Store puede pedir una URL, así que tiene prioridad.
- [ ] Enlace a Microsoft Store en StarOptimizer cuando se publique (insignia oficial «Get it from Microsoft»).
- [ ] Sección **Estudio**: quiénes somos, historia breve y equipo, con foto o avatar si se quiere. Ahora solo hay un CTA de relleno.
- [ ] Contacto real: email de soporte o formulario. **No** usar emails personales.
- [ ] Página o sección propia de **Nivo** cuando haya capturas reales. Ahora la demo es una maqueta en CSS.
- [ ] Textos en inglés (versión `/en/`) y selector de idioma.

### Motion graphics
- [x] Escaparate de StarOptimizer con scroll fijado (*sticky*): al bajar, cambian las pantallas (Inicio → Análisis → Plan → Limpieza). Las capturas `so-plan.webp` y `so-limpieza.webp` ya están en `assets/img/`.
- [x] Transición de entrada (preloader corto con Nova abriendo los ojos), sin pasar de 1 s.
- [x] Cursor personalizado y botones «magnéticos» (solo con puntero fino).
- [x] Marquesina o cinta de principios entre secciones.
- [ ] Vídeo corto o GIF de StarOptimizer analizando (grabar desde la app).

### Calidad
- [ ] Imagen Open Graph (1200×630) para que el enlace se vea bien al compartirlo.
- [ ] `sitemap.xml`, `robots.txt` y página 404.
- [ ] Probar en Safari iOS y Firefox. Medir Lighthouse (objetivo: más de 95 en todo).
- [ ] Alojar las fuentes en el propio sitio en vez de Google Fonts (más rápido y sin terceros).
- [ ] Revisar contraste AA de los textos grises.

### Despliegue
- [ ] GitHub Pages desde `main` (Settings → Pages) o Vercel.
- [ ] Dominio propio, si se compra, con HTTPS.

## Cómo trabajar

- `main` está protegida: trabaja en una rama y abre un pull request.
- Para verlo en local, sirve la carpeta con cualquier servidor estático, por ejemplo `npx serve .` o `python -m http.server`, y abre `http://localhost:8000`.
- Reglas: nada de cifras, logos de clientes ni testimonios inventados. Todo lo que se diga de los productos tiene que ser verdad.
