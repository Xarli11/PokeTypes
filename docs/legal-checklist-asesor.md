# Checklist para el asesor fiscal y de protección de datos

Contexto confirmado por el titular: PokeTypes (poketypes.app) es un proyecto personal de una persona física residente en España, sin sociedad ni alta como autónomo. AdSense está solicitado, no aprobado ni activo. Hoy el sitio ya muestra un enlace de donaciones (Buy Me a Coffee), GA4 y el script de AdSense (sin unidades de anuncio ni Auto Ads). Detalle técnico en `docs/privacy-consent.md`. Nada de este documento es asesoramiento jurídico: son preguntas para decidir.

## 1. Actividad económica y estatus

- [ ] ¿El enlace de donaciones existente, o la futura publicidad, constituyen ya actividad económica? ¿Desde cuándo y con qué umbral?
- [ ] ¿Con qué estatus operar: particular sin actividad, autónomo o sociedad? ¿Qué ocurre si AdSense se aprueba pero los ingresos son mínimos?
- [ ] ¿Cómo se tratan los ingresos de AdSense (pagador: Google Ireland, según la ayuda de AdSense)?

## 2. Obligaciones censales y fiscales

- [ ] Alta censal (modelos 036/037), epígrafe del IAE y régimen de IRPF aplicable; pagos fraccionados.
- [ ] IVA: tratamiento de servicios prestados a Google Ireland (operación entre empresas de la UE, inversión del sujeto pasivo), inscripción necesaria y obligaciones informativas.
- [ ] Facturación a Google y conservación de documentos; información fiscal que pide AdSense (Payments profile > Manage tax info).

## 3. Seguridad Social (RETA)

- [ ] ¿Habitualidad e ingresos a partir de los cuales es obligatoria el alta en el RETA? ¿Se aplica el umbral del salario mínimo o hay otro criterio?
- [ ] Cuota, bonificaciones aplicables y plazo para el alta una vez aprobado AdSense.

## 4. Identificación del titular (LSSI-CE art. 10)

El artículo 10 (texto del BOE verificado) pide, de forma permanente, fácil, directa y gratuita: nombre o denominación social; residencia o domicilio (o dirección de un establecimiento permanente en España); correo electrónico y otros datos de contacto directo y efectivo; datos de registro si existen; NIF.

- [ ] ¿Es aplicable a este sitio ahora, o solo cuando exista actividad económica? Decisión a registrar en `lssi.applies`.
- [ ] Datos que habría que publicar y datos que pueden quedar solo en AdSense (pagos, impuestos, banco): ver la tabla "What goes to AdSense privately vs what may have to be public" en `docs/privacy-consent.md`.
- [ ] El código **no** acepta "PokeTypes" ni "Xarli11" como identidad legal.

## 5. Privacidad del domicilio

- [ ] ¿Es obligatorio publicar el domicilio de residencia? ¿Qué otras direcciones cumplen el artículo 10 (domicilio fiscal distinto, dirección profesional, otro)?
- [ ] ¿Son válidos un apartado postal o un domicilio virtual? **No se asumen válidos**: el código exige `addressLegallyConfirmed: true` para cualquier dirección que no sea la residencia.
- [ ] Compatibilidad entre la dirección pública, la del perfil de pagos de AdSense y la censal.

## 6. Protección de datos (RGPD / LOPDGDD)

- [ ] Base jurídica por finalidad (alojamiento, calculadora, analítica, publicidad); si es interés legítimo, ponderación documentada.
- [ ] Papel de cada proveedor (Google, Cloudflare, PokeAPI, GitHub, Pokémon Showdown) y contratos o términos aplicables (art. 26/28).
- [ ] Transferencias internacionales: garantía por proveedor (decisión de adecuación, cláusulas tipo, otras). Hoy no hay evidencia recogida.
- [ ] Plazos de conservación: GA4, registros de Cloudflare, registro de consentimiento de Google.
- [ ] Autoridad de control y texto del derecho de reclamación.
- [ ] Menores: edad de consentimiento digital aplicable, si el sitio puede considerarse dirigido a menores, y ajustes de Google (tratamiento dirigido a niños, usuarios por debajo de la edad de consentimiento).
- [ ] Cookies: ¿preferencias (idioma, tema, modo, equipo) y caché del service worker pueden clasificarse como estrictamente necesarias?
- [ ] Analítica fuera del EEE, Reino Unido y Suiza: al ser el prestador residente en España, ¿hace falta consentimiento para cookies no esenciales independientemente de dónde esté el visitante? Opciones técnicas: bloqueo real (actual), medición sin cookies o concesión por región.
- [ ] ¿Es necesario el registro de actividades (art. 30)? ¿Evaluación de impacto o delegado, o no?

## 7. Cuenta de AdSense compartida

- [ ] Los ajustes de modo de consentimiento son de cuenta y afectan a todos los mensajes (incluido Pokepedia). ¿Cómo coordinar la política de privacidad y la CMP de ambos sitios antes de activar nada?

## Qué llevar a la reunión

`docs/privacy-consent.md` (flujos, proveedores, cookies), la política en borrador desde un preview de Cloudflare, el estado de AdSense, y una estimación de ingresos y tráfico.
