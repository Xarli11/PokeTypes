# Feature Roadmap

Features pendientes de implementar. Ordenadas por impacto estimado.

---

## 1. Export a Showdown

**Qué:** Botón en el Team Builder que genera el texto de importación de Pokémon Showdown para el equipo completo.

**Por qué:** Es el puente natural entre el análisis y el juego real. Muy solicitado en herramientas competitivas.

**Datos disponibles:** `ability`, `nature`, `item`, `teraType` ya están guardados en cada slot. Solo falta el formato de texto.

**Formato objetivo:**
```
Garchomp @ Choice Scarf
Ability: Rough Skin
Tera Type: Dragon
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Scale Shot
- Earthquake
- Iron Head
- Stealth Rock
```

**Notas:** Los movimientos no se almacenan actualmente, habría que omitirlos o añadir un selector de 4 movimientos por slot.

---

## 2. Modo Comparación (A vs B)

**Qué:** Layout side-by-side que muestra dos Pokémon o dos combinaciones de tipo en paralelo: defensas, ofensas, stats base.

**Por qué:** La pregunta "¿Metagross o Garchomp en mi equipo?" se responde en un vistazo. Flujo de uso muy común.

**Implementación:** Nueva ruta `/comparar/<slug1>/<slug2>` o modal activado desde el resultado de búsqueda. La infra ya existe (calculator + ui renderCards).

---

## 3. Coverage Checker (Movimientos)

**Qué:** Input de 1-4 tipos de movimientos → output de qué tipos cubre (SE), cuáles resiste el oponente, y qué tipo queda en punto ciego.

**Por qué:** Complementa el análisis defensivo con perspectiva ofensiva real: "¿mi equipo puede golpear SE a Steel?"

**Implementación:** `calculateOffense` ya existe. Solo falta la UI de input múltiple y un aggregador que haga union/intersección de coberturas.

---

## 4. Generador de Equipo Aleatorio Balanceado

**Qué:** Dado un tier (OU, UU, etc.) y opcionalmente un tipo ancla, genera 6 Pokémon con cobertura defensiva complementaria.

**Por qué:** Acelera la creación de equipos para jugadores casuales y es un diferenciador de feature importante.

**Implementación:** Usar `analysis.js` para validar que el equipo generado no tenga 3+ debilidades compartidas. Los flags `isUber`/`isGimmick` del pokedex permiten filtrar por tier aproximado.

---

## 5. Historial Reciente

**Qué:** Fila de chips en la UI principal con los últimos 8 Pokémon/tipos visitados. Click restaura el análisis.

**Por qué:** El flujo real de uso es "busco a Landorus, comparo con Garchomp, vuelvo a Landorus". Sin historial, hay que buscar de nuevo cada vez.

**Implementación:** `localStorage` con array rotatorio de los últimos 8 estados (tipo o Pokémon). Renderiza debajo del buscador.

---

## 6. Radar Chart del Equipo

**Qué:** Visualización hexagonal (spider chart) del balance del equipo: velocidad, ataque, defensa, ataque especial, defensa especial, PS.

**Por qué:** Permite ver de un vistazo si el equipo está descompensado (ej. todos ofensivos, nadie aguanta).

**Implementación:** SVG path nativo (sin librería) calculado a partir de los stats medios del equipo. Datos de stats ya están guardados en cada slot.

---

## 7. Filtro por Tipo en la Búsqueda

**Qué:** Chips de tipo encima de la lista de sugerencias que filtran los Pokémon por tipo primario o secundario.

**Por qué:** Cuando el usuario busca "un Pokémon Dragon que resista Fire", no quiere ver los 200+ resultados sin filtrar.

**Implementación:** Checkboxes de tipo múltiple sobre el input. Aplica `.filter(p => selectedTypes.every(t => p.types.includes(t)))` al array de matches.

---

## 8. Selector de Generación / Formato

**Qué:** Dropdown o toggle que limita el pokedex y la tabla de tipos a una generación específica (Gen 1–9) o formato competitivo (OU, UU, LC, BSS).

**Por qué:** Usuarios de Gen 1 no tienen tipos Acero/Siniestro/Hada. Usuarios de VGC quieren solo Pokémon legales.

**Implementación:** Requiere añadir campo `gen` al pokedex. La tabla de tipos varía por generación (Gen 1 no tiene Siniestro/Acero). Es el cambio de mayor cobertura de datos.

---

## 9. Infographic Generator

**Qué:** Exportar el análisis de tipo o el team builder como imagen PNG descargable.

**Por qué:** Fácil de compartir en redes sociales. Aumenta visibilidad orgánica.

**Implementación:** `html2canvas` o Canvas API nativo capturando el nodo del análisis. Añadir botón "Descargar PNG" junto al share button.
