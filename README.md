# BH360 — Brand Health 360 by The Lab

Indice compuesto de salud de marca (0-100) que integra inversion, alcance, compra declarada, sentiment y ventas en un unico numero accionable. Herramienta propietaria de Reset / The Lab para la evaluacion integral de efectividad de marca en FMCG.

---

## Tabla de contenidos

- [Contexto de negocio](#contexto-de-negocio)
- [Arquitectura del indice](#arquitectura-del-indice)
- [Stack tecnico](#stack-tecnico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Archivos clave y responsabilidades](#archivos-clave-y-responsabilidades)
- [Motor de calculo](#motor-de-calculo)
- [Vistas de la aplicacion](#vistas-de-la-aplicacion)
- [Sistema de diseno](#sistema-de-diseno)
- [Datos de ejemplo](#datos-de-ejemplo)
- [Desarrollo local](#desarrollo-local)
- [Build y bundle](#build-y-bundle)
- [Como modificar](#como-modificar)
- [Roadmap de producto](#roadmap-de-producto)
- [Sustento metodologico](#sustento-metodologico)
- [Convenciones y reglas](#convenciones-y-reglas)

---

## Contexto de negocio

Reset es una agencia de medios 360 en Lima, Peru. The Lab es su unidad de data y analytics. El BH360 fue disenado para presentarse en el RFI de San Fernando S.A. (empresa lider en proteina animal en Peru, ~S/ 6M de inversion anual en medios) como diferenciador de capacidades de medicion.

El problema que resuelve: los directores de marketing reciben reportes fragmentados de la agencia de medios (alcance, CPM), la agencia creativa (engagement, sentiment), la investigadora (brand tracking) y su propio equipo (ventas). Nadie conecta las piezas. El BH360 integra todo en un diagnostico unico.

El cliente piloto es San Fernando, pero la herramienta debe ser replicable para cualquier marca FMCG.

---

## Arquitectura del indice

### Los 3 pilares (alineados a ISO 20671)

| Pilar | Peso total | Dimensiones que contiene |
|-------|-----------|--------------------------|
| Input | 35% | Inversion (15%) + Alcance (20%) |
| Equity | 40% | Compra Declarada (25%) + Sentiment (15%) |
| Performance | 25% | Ventas (25%) |

### Las 5 dimensiones

| ID | Dimension | Peso | Piso | Techo | Unidad | Fuente |
|----|-----------|------|------|-------|--------|--------|
| `investment` | Inversion de Campana | 0.15 | 0 | 8,000,000 | S/ | Agencia de medios |
| `reach` | Alcance Deduplicado | 0.20 | 0 | 95 | % | Agencia + plataformas |
| `purchase` | Compra Declarada (Ultimo Mes) | 0.25 | 0 | 85 | % | Ipsos / Panel digital The Lab |
| `sentiment` | Net Sentiment Score | 0.15 | -100 | +100 | NSS | Agencia creativa / Social listening |
| `sales` | Ventas del Periodo | 0.25 | 0 | 12,000,000 | S/ | Cliente (ERP) |

### Formula

**Paso 1 — Normalizacion Min-Max con goalposting:**

```
N_i = min(100, max(0, (x_i - Piso_i) / (Techo_i - Piso_i) * 100))
```

Excepcion para Sentiment (rango natural -100 a +100):
```
N_sentiment = ((NSS + 100) / 200) * 100
```

**Paso 2 — Agregacion lineal ponderada:**

```
BH360 = 0.15 * N_inv + 0.20 * N_alc + 0.25 * N_com + 0.15 * N_sen + 0.25 * N_ven
```

### Escala interpretativa

| Rango | Nivel | Variable `level` | Color |
|-------|-------|-------------------|-------|
| 0-30 | Critica | `critical` | `#ef4444` |
| 31-50 | Debil | `weak` | `#f97316` |
| 51-70 | Moderada | `moderate` | `#eab308` |
| 71-85 | Fuerte | `strong` | `#22c55e` |
| 86-100 | Excepcional | `exceptional` | `#06b6d4` |

---

## Stack tecnico

| Capa | Tecnologia | Version | Rol |
|------|-----------|---------|-----|
| Framework | React | 19.2 | UI reactiva |
| Lenguaje | TypeScript | 5.9 | Tipado estricto |
| Build (dev) | Vite | 8.0 | Dev server + HMR |
| Build (bundle) | Parcel | 2.16 | Single-file HTML output |
| CSS | Tailwind CSS | 3.4.1 | Utilidades + design tokens |
| Componentes | shadcn/ui | 40+ componentes | Radix UI primitives con Tailwind |
| Graficos | Recharts | 3.8 | Radar, Bar, Line charts reales |
| Iconos | Lucide React | 0.577 | Iconos SVG (NO emojis) |
| Tipografia | Outfit (Google Fonts) | Variable | Display + body, cargada via CDN |
| Animaciones | CSS transitions + requestAnimationFrame | Nativo | Counter animation, ring gauge |
| Inlining | html-inline | 1.2 | Genera bundle.html autocontenido |

---

## Estructura del proyecto

```
bh360-app/
  index.html              # Entry point HTML (Parcel y Vite lo usan como root)
  bundle.html             # Output final: HTML autocontenido con todo inlined
  package.json            # Dependencias y scripts
  tailwind.config.js      # Tema Tailwind con tokens shadcn/ui
  tsconfig.json           # Config TypeScript
  vite.config.ts          # Config Vite (dev)
  postcss.config.js       # PostCSS con Tailwind + autoprefixer
  components.json         # Config shadcn/ui (paths, aliases)
  src/
    main.tsx              # Entry point React: monta <App /> en #root
    index.css             # CSS global: Tailwind directives + CSS variables (tema dark)
    App.css               # Vacio (reservado para overrides si se necesitan)
    App.tsx               # ARCHIVO PRINCIPAL: contiene las 4 vistas y el shell
    lib/
      bh360.ts            # MOTOR DE CALCULO: interfaces, constantes, formulas, datos de ejemplo
      utils.ts            # Utilidad cn() para merge de clases Tailwind (shadcn)
    components/
      ui/                 # 40+ componentes shadcn/ui (generados, no editar manualmente)
        button.tsx
        card.tsx
        dialog.tsx
        input.tsx
        label.tsx
        select.tsx
        separator.tsx
        slider.tsx
        tabs.tsx
        tooltip.tsx
        badge.tsx
        ... (otros)
    hooks/
      use-mobile.tsx      # Hook para deteccion responsive
      use-toast.ts        # Hook para toasts (sonner)
    assets/               # Assets estaticos (no usados activamente en v1)
  dist/                   # Output de Parcel (intermedio, no commitear)
  public/                 # Assets publicos (favicon, iconos — no usados en v1)
```

---

## Archivos clave y responsabilidades

### `src/lib/bh360.ts` — Motor de calculo

Este es el cerebro de toda la aplicacion. Contiene:

**Interfaces TypeScript:**
- `DimensionConfig` — Define cada dimension: id, label, pillar, peso, piso, techo, unidad, fuente, descripcion, justificacion
- `PeriodData` — Datos crudos de un periodo: investment, reach, purchase, sentiment, sales
- `NormalizedScores` — Las 5 metricas normalizadas a escala 0-100
- `BH360Result` — Resultado completo: score, normalized, contributions, pillarScores, interpretation, level

**Constantes exportadas:**
- `DIMENSIONS` — Array de 5 DimensionConfig con toda la configuracion
- `PILLAR_COLORS` — Colores hex por pilar (input: blue, equity: violet, performance: emerald)
- `PILLAR_LABELS` — Labels por pilar
- `LEVEL_COLORS` — Colores hex por nivel interpretativo
- `LEVEL_LABELS` — Labels en espanol por nivel
- `SAMPLE_DATA` — Array de 4 PeriodData de ejemplo (Q3 2025 a Q2 2026, San Fernando)

**Funciones exportadas:**
- `normalize(value, floor, ceiling)` — Min-Max estandar
- `normalizeNSS(nss)` — Normalizacion especial para Net Sentiment Score (-100 a +100 → 0 a 100)
- `calculateBH360(data: PeriodData): BH360Result` — Funcion principal de calculo
- `formatCurrency(value)` — Formatea S/ con sufijos M/K
- `formatPercent(value)` — Formatea %
- `formatDimensionValue(dimId, value)` — Formatea segun la unidad de la dimension
- `getDimensionValue(data, dimId)` — Extrae valor crudo de PeriodData por dimId

**Para modificar pesos:** Editar el campo `weight` en cada elemento del array `DIMENSIONS`. Los pesos DEBEN sumar 1.0.

**Para modificar goalposts:** Editar los campos `floor` y `ceiling` en cada dimension. Ajustar por categoria/cliente.

**Para agregar una 6ta dimension:** Agregar un nuevo elemento al array `DIMENSIONS`, agregar el campo correspondiente a `PeriodData` y `NormalizedScores`, y actualizar `calculateBH360()`.

### `src/App.tsx` — Interfaz completa

Contiene todas las vistas en un solo archivo. Estructura interna:

**Componentes utilitarios (no exportados):**
- `AnimatedScore` — Counter animado de 0 a N con easing cubico
- `DimIcon` — Retorna el icono Lucide correcto para cada dimension
- `PillarBadge` — Badge coloreado por pilar
- `InfoModal` — Dialog que muestra definicion, fuente, peso, formula y sustento de una dimension
- `ScoreRing` — SVG circular (gauge) con animacion de stroke-dashoffset
- `Delta` — Indicador de cambio vs periodo anterior (flecha + color + valor)
- `Spark` — Sparkline via Recharts LineChart

**Vistas principales (no exportadas):**
- `ReportView` — Vista ejecutiva con score, radar, cards dimensionales, waterfall, diagnostico
- `DataEntryView` — Formulario stepper de 6 pasos con preview en vivo
- `SimView` — Simulador what-if con 5 sliders y escenarios preconfigurados
- `MethodView` — Pagina tipo whitepaper con sustento metodologico completo

**Componente raiz (exportado como default):**
- `App` — Shell con header sticky, navegacion por tabs, selector de periodo, y renderizado condicional de la vista activa

### `src/index.css` — Tema y tokens

Define las CSS variables de shadcn/ui. El tema actual es **dark by default** (no hay toggle light/dark en v1). Variables clave:

```css
--background: 0 0% 2.7%;     /* zinc-950 */
--primary: 43 96% 56%;        /* amber-400 (accent principal) */
--border: 0 0% 14%;           /* zinc-800 */
--radius: 0.5rem;
```

---

## Motor de calculo

### Flujo de datos

```
PeriodData (valores crudos)
  |
  v
normalize() / normalizeNSS()
  |
  v
NormalizedScores (0-100 por dimension)
  |
  v
contributions = normalized[i] * weight[i]
  |
  v
BH360 score = sum(contributions)
  |
  v
BH360Result { score, normalized, contributions, pillarScores, level, interpretation }
```

### Calculo de pillarScores

Los pillar scores son el promedio ponderado de las dimensiones normalizadas dentro de cada pilar:

```
inputAvg = (N_inv * 0.15 + N_alc * 0.20) / (0.15 + 0.20)
equityAvg = (N_com * 0.25 + N_sen * 0.15) / (0.25 + 0.15)
performanceAvg = N_ven
```

Estos se usan para las barras de progreso por pilar en la vista de Reporte.

### Diagnostico automatico

La funcion de diagnostico en `ReportView` ordena las 5 dimensiones por score normalizado, identifica la mas fuerte y la mas debil, calcula el delta vs periodo anterior, y genera un parrafo narrativo. Si la dimension mas debil esta por debajo de 40/100, agrega una recomendacion de intervencion.

---

## Vistas de la aplicacion

### 1. Reporte (`tab === 'report'`)

Vista ejecutiva pensada para Andrea (directora de marketing de San Fernando).

Componentes en orden de aparicion:
1. **Hero Card** — Score ring animado + nombre marca + periodo + campana + delta + barras de pilar
2. **Radar Chart** — Pentagonal con overlay del periodo anterior (linea punteada)
3. **Dimension Cards** (x5) — Score normalizado, valor crudo, peso, contribucion en puntos, sparkline historica, boton info modal
4. **Waterfall Chart** — Barras coloreadas por pilar mostrando contribucion de cada dimension al total
5. **Diagnostico** — Card con borde lateral coloreado por nivel, texto generado automaticamente

### 2. Ingreso de Data (`tab === 'entry'`)

Vista operativa para el equipo de Reset / The Lab.

- Stepper horizontal de 6 pasos: Campana → Inversion → Alcance → Compra → Sentiment → Ventas
- Cada paso tiene inputs con labels, placeholders y texto de ayuda
- Cada paso tiene boton de info modal de la dimension correspondiente
- Panel lateral con preview en vivo del BH360 (score ring + barras por dimension)
- Boton "Guardar" agrega al array de datos y recalcula
- Tabla historica debajo con todos los periodos ingresados

### 3. Simulador (`tab === 'sim'`)

Vista what-if para planificacion estrategica.

- 5 sliders (0-100) precargados con valores normalizados del periodo actual
- Al mover cualquier slider, el score se recalcula en tiempo real
- Botones de escenarios preconfigurados: +50% Inversion, Sentiment -20, Optimista, Pesimista, Reset
- Panel central con score ring simulado + delta vs actual
- Panel derecho con radar chart actual (punteado) vs simulado (solido)

### 4. Metodologia (`tab === 'meth'`)

Pagina tipo whitepaper con navegacion lateral sticky.

Secciones: Que es el BH360 → Marco teorico → 5 dimensiones → Pesos y evidencia → Formula → Sensibilidad → Roadmap → Referencias

Contenido basado en la investigacion de Deep Research (IPA Databank, Binet & Field, Brand Finance BrandBeta, OCDE Handbook, ISO 20671, Sharp/Ehrenberg-Bass).

---

## Sistema de diseno

### Paleta de colores

| Uso | Color | Hex | Tailwind class |
|-----|-------|-----|----------------|
| Background principal | Zinc 950 | `#09090b` | `bg-zinc-950` |
| Cards | Zinc 900 al 60% | `rgba(24,24,27,0.6)` | `bg-zinc-900/60` |
| Bordes | Zinc 800 | `#27272a` | `border-zinc-800` |
| Texto primario | Zinc 100 | `#f4f4f5` | `text-zinc-100` |
| Texto secundario | Zinc 400 | `#a1a1aa` | `text-zinc-400` |
| Texto terciario | Zinc 500 | `#71717a` | `text-zinc-500` |
| Accent / BH360 score | Amber 400-500 | `#f59e0b` | `text-amber-400` |
| Pilar Input | Blue 500 | `#3b82f6` | — |
| Pilar Equity | Violet 500 | `#8b5cf6` | — |
| Pilar Performance | Emerald 500 | `#10b981` | — |
| Delta positivo | Emerald 400 | `#34d399` | `text-emerald-400` |
| Delta negativo | Red 400 | `#f87171` | `text-red-400` |

### Tipografia

- **Outfit** (Google Fonts, cargada via CDN en App.tsx): Usada para titulos, scores, headers
- **System fallback** (`'Segoe UI', system-ui, sans-serif`): Body text y labels
- **Mono** (Tailwind `font-mono`): Valores numericos, formulas, contribuciones

### Iconografia

Exclusivamente **Lucide React**. NUNCA emojis. Cada dimension tiene un icono asignado:
- investment → `DollarSign`
- reach → `Eye`
- purchase → `ShoppingCart`
- sentiment → `MessageCircle`
- sales → `Target`

### Graficos

Todos via **Recharts** (no SVG manual). Tipos usados:
- `RadarChart` — Perfil dimensional (5 ejes)
- `BarChart` — Waterfall de contribuciones
- `LineChart` — Sparklines en dimension cards

Estilos de graficos: fondos transparentes, grids en `rgba(255,255,255,0.05-0.08)`, ticks en zinc-400/zinc-500, tooltips con fondo zinc-900 y borde zinc-700.

### Accesibilidad

Objetivo: **WCAG AA**

Implementado:
- Contraste minimo 4.5:1 en texto sobre fondo (zinc-100 sobre zinc-950 = 18.4:1)
- `role="progressbar"` con `aria-valuenow/min/max` en barras de pilar
- `aria-label` en sliders del simulador
- `aria-current="page"` en tab activo, `aria-current="step"` en stepper
- `role="navigation"` con `aria-label` en navegacion principal y stepper
- `role="table"` en tabla historica
- `aria-hidden="true"` en SVGs decorativos
- Todos los inputs con `<Label htmlFor>` vinculado
- Focus visible via `focus:ring-2 focus:ring-amber-400/50` en botones de info
- `<nav>` semantico con `aria-label` en sidebar de metodologia

Pendiente para v2:
- Pruebas con screen reader (NVDA/VoiceOver)
- Skip links
- Reduccion de movimiento (`prefers-reduced-motion`)
- Roles ARIA en radar chart (Recharts no los genera nativamente)

---

## Datos de ejemplo

El array `SAMPLE_DATA` en `bh360.ts` contiene 4 periodos de San Fernando:

| Periodo | Campana | Inversion | Reach | Compra | NSS | Ventas | BH360 aprox |
|---------|---------|-----------|-------|--------|-----|--------|-------------|
| Q3 2025 | Jueves de Pavita + Always On | S/ 1.85M | 58% | 42% | +35 | S/ 7.2M | ~47 |
| Q4 2025 | Navidad + Pavo | S/ 3.2M | 74% | 61% | +52 | S/ 9.8M | ~66 |
| Q1 2026 | Verano + Embutidos | S/ 2.1M | 62% | 48% | +41 | S/ 6.9M | ~51 |
| Q2 2026 | Dia de la Madre + Always On | S/ 2.35M | 65% | 52% | +45 | S/ 7.5M | ~55 |

Estos datos son ficticios pero calibrados para ser realistas dado el contexto de San Fernando (~S/ 6M anuales de inversion, lider en proteina animal en Peru).

---

## Desarrollo local

**Requisitos:** Node 18+, pnpm

```bash
cd bh360-app
pnpm install
pnpm dev        # Abre en http://localhost:5173
```

**Type check:**
```bash
npx tsc --noEmit
```

---

## Build y bundle

El output final es un **unico archivo HTML autocontenido** (`bundle.html`) que funciona sin servidor. Esto permite abrirlo como artifact en Claude, enviarlo por email, o embeddarlo en una presentacion.

```bash
bash /mnt/skills/examples/web-artifacts-builder/scripts/bundle-artifact.sh
```

Este script:
1. Compila con Parcel (sin source maps)
2. Inlinea JS y CSS en el HTML via html-inline
3. Produce `bundle.html` (~950KB)

Para desplegar en produccion (web), usar el build de Vite:
```bash
pnpm build      # Output en dist/
```

---

## Como modificar

### Cambiar los pesos de las dimensiones

1. Abrir `src/lib/bh360.ts`
2. En el array `DIMENSIONS`, modificar el campo `weight` de cada dimension
3. Verificar que la suma de los 5 `weight` sea exactamente `1.0`
4. Actualizar el campo `justification` si la razon del peso cambio
5. Actualizar la formula textual en la vista de Metodologia (`MethodView` en `App.tsx`, seccion `id="form"`)

### Cambiar los goalposts (pisos y techos)

1. Abrir `src/lib/bh360.ts`
2. En el array `DIMENSIONS`, modificar `floor` y/o `ceiling` de la dimension deseada
3. Los goalposts se deben ajustar por categoria/cliente. Los actuales estan calibrados para San Fernando

### Agregar una nueva dimension (ej: SOV, Brand Awareness)

1. En `bh360.ts`:
   - Agregar un nuevo objeto al array `DIMENSIONS` con todos los campos
   - Agregar el campo al interface `PeriodData` (ej: `brandAwareness: number`)
   - Agregar el campo al interface `NormalizedScores`
   - Actualizar `calculateBH360()` para normalizar y ponderar la nueva dimension
   - Agregar datos al array `SAMPLE_DATA`
   - Rebalancear los `weight` para que sigan sumando 1.0

2. En `App.tsx`:
   - Agregar el caso en `DimIcon` para el nuevo `id`
   - El resto de la UI se adapta automaticamente porque itera sobre `DIMENSIONS`
   - Agregar un nuevo paso en el stepper de `DataEntryView`
   - Actualizar la formula textual en `MethodView`

### Agregar una nueva vista/tab

1. En `App.tsx`, dentro de la funcion `App()`:
   - Agregar un nuevo objeto al array `tabs` con `{ id, l, I }`
   - Agregar el condicional `{tab === 'nuevo-id' && <NuevaVista />}` en el `<main>`
   - Crear el componente `NuevaVista` en el mismo archivo o en un archivo separado

### Cambiar el tema visual

1. Abrir `src/index.css`
2. Modificar las CSS variables en `:root` (formato HSL sin `hsl()` wrapper)
3. Los colores de pilar estan en `PILLAR_COLORS` en `bh360.ts` (formato hex)
4. Los colores de nivel estan en `LEVEL_COLORS` en `bh360.ts` (formato hex)

### Conectar a una base de datos real

Actualmente los datos viven en memoria (state de React). Para persistir:

1. **Opcion ligera (Supabase):** Reemplazar `useState<PeriodData[]>(SAMPLE_DATA)` con un hook que lea/escriba a Supabase via `@supabase/supabase-js`. Las tablas necesarias: `periods` (id, period, brand, campaign, investment, reach, purchase, sentiment, sales, created_at).

2. **Opcion local (localStorage):** Envolver el state con un efecto que serialize/deserialize a `localStorage`. Util para demos sin backend.

3. **Opcion enterprise (API REST):** Crear endpoints GET/POST/PUT en cualquier backend. El componente `App` consumiria via fetch en un useEffect.

---

## Roadmap de producto

### v1.0 (actual) — Mockup funcional para pitch

- 4 vistas completas: Reporte, Ingreso, Simulador, Metodologia
- Data en memoria con 4 periodos de ejemplo
- Calculo BH360 funcional con normalizacion y pesos
- Output como HTML autocontenido
- Iconos Lucide, graficos Recharts, dark mode, tipografia Outfit

### v1.1 (post-pitch) — Mejoras UX

- [ ] Exportar reporte a PDF (via html2canvas + jsPDF o Puppeteer server-side)
- [ ] Animacion de transicion entre tabs
- [ ] Responsive refinado para mobile (radar → barras horizontales en pantallas <640px)
- [ ] Soporte para multiples marcas/lineas en el selector
- [ ] Alerta visual cuando una dimension cae por debajo de un umbral configurable
- [ ] `prefers-reduced-motion` para desactivar animaciones

### v2.0 (si se gana la cuenta) — Produccion

- [ ] Backend con Supabase (o API propia): persistencia, autenticacion, multi-tenant
- [ ] Historico de periodos con grafico de tendencia del BH360 en el tiempo
- [ ] Analisis de sensibilidad Monte Carlo integrado (1000 iteraciones, intervalo de confianza al 90%)
- [ ] Comparativa entre marcas/lineas (San Fernando Total vs Pollo vs Pavo vs Embutidos)
- [ ] Importacion de datos desde Excel/CSV
- [ ] Dashboard embeddable (iframe) para que el cliente lo vea en su intranet
- [ ] Modo light/dark toggle
- [ ] Pruebas de accesibilidad con axe-core y screen readers

### v3.0 (con historico suficiente) — Optimizacion estadistica

- [ ] Migracion a pesos data-driven via PCA o regresion vs ventas
- [ ] Benchmarks sectoriales FMCG Peru (si se acumulan datos de 3+ marcas)
- [ ] Integracion directa con APIs de plataformas (Meta Ads, Google Ads, Kantar IBOPE)
- [ ] Forecast del BH360 basado en inversion planificada

---

## Sustento metodologico

El BH360 se fundamenta en las siguientes fuentes (todas citadas en la vista de Metodologia):

| Fuente | Hallazgo clave | Impacto en BH360 |
|--------|---------------|-------------------|
| Binet & Davis (IPA, 2025) | El presupuesto explica el 89% de las variaciones en beneficio | Peso significativo para pilar Input (35%) |
| Binet & Field (IPA, 2013) | ESOV predice market share growth; 60/40 brand/activation | Peso de Alcance como puente entre inversion y resultados |
| Brand Finance BrandBeta (2022) | Familiaridad (65%) + consideracion (35%) = 80%+ de varianza en market share | Compra Declarada como metrica de equity mas predictiva (25%) |
| IPA Databank (1600+ casos) | Numero total de metricas que mejoran predice exito mejor que cualquier metrica individual | Justificacion del indice compuesto como "metrica de metricas" |
| Field (IPA, 2026) | 93% de campanas con grandes mejoras en trust reportan efectos de negocio | Inclusion de Sentiment como dimension; peso moderado (15%) |
| Sharp (2010) | Mental availability + physical availability = drivers de crecimiento | Alcance como proxy de mental availability |
| OCDE/JRC (2008) | Handbook on Constructing Composite Indicators | Normalizacion Min-Max, goalposting, analisis de sensibilidad |
| ISO 20671 (2019) | Brand evaluation: inputs + stakeholder equity + performance | Estructura tripartita del BH360 |
| Profit Ability 2 (Ebiquity/Thinkbox, 2024) | TV + BVOD genera 54.7% del beneficio total con ROI de 5.61 | Importancia de canales de amplio alcance |
| Saisana et al. (2005) | Uncertainty + sensitivity analysis para indices compuestos | Protocolo Monte Carlo para validar robustez de pesos |

---

## Convenciones y reglas

### Codigo

- TypeScript estricto (`strict: true` en tsconfig)
- Nombres de variables y funciones en camelCase ingles (`calculateBH360`, `normalizeNSS`)
- Nombres de dimensiones en ingles como IDs (`investment`, `reach`, `purchase`, `sentiment`, `sales`)
- Labels y textos de UI en espanol sin tildes (para evitar problemas de encoding en bundle)
- Componentes React como funciones (no clases)
- State management: useState local (no Redux, no Zustand en v1)
- Imports de shadcn/ui via `@/components/ui/`
- Imports de lib via `@/lib/`

### Diseno

- NUNCA emojis. Solo Lucide icons
- NUNCA Inter, Roboto o Arial. Tipografia principal: Outfit
- Graficos siempre via Recharts (no SVG manual para charts)
- SVG manual solo para el score ring (gauge)
- Dark mode como unico tema en v1
- Contraste minimo WCAG AA (4.5:1 para texto, 3:1 para graficos)
- Cards con `bg-zinc-900/60 border-zinc-800` como patron base
- Accent color: amber para BH360, colores de pilar para dimensiones
- Spacing: Tailwind scale (gap-2, gap-3, gap-4, gap-6 como mas usados)

### Datos

- Todos los montos en soles peruanos (S/)
- Reach siempre en porcentaje del universo target (0-100)
- Sentiment siempre en NSS (-100 a +100), NO en porcentaje positivo
- Los pesos DEBEN sumar 1.0
- Los goalposts son fijos por categoria/cliente y se documentan en DIMENSIONS

### Git (cuando se configure)

- Commits en espanol, formato: `tipo(scope): descripcion`
- Tipos: `feat`, `fix`, `refactor`, `docs`, `style`, `chore`
- Branch principal: `main`
- Feature branches: `feat/nombre-corto`
- No commitear `node_modules/`, `dist/`, ni `bundle.html`
