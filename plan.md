# Plan: Ocultar la receta del frontend, documentar internamente

## Problema
El frontend expone toda la metodologia propietaria: formulas exactas, pesos, goalposts, justificaciones academicas, analisis de sensibilidad y referencias. Cualquier cliente o competidor puede ver la "receta completa" inspeccionando la app.

## Filosofia: "Lleva arroz y pollo, pero no te doy la receta"

### Lo que SE QUEDA en el frontend (conceptual, sin numeros sensibles)
- Que es el BH360 (descripcion general, sin formulas)
- Los 3 pilares (Input, Equity, Performance) con descripcion conceptual, SIN porcentajes de peso
- Las 5 dimensiones: nombre + descripcion breve + fuente de datos, SIN pesos, SIN goalposts (floor/ceiling), SIN justificaciones academicas
- Roadmap (es sobre el producto, no la metodologia)
- Niveles de salud (Critica → Excepcional) pero SIN los rangos numericos exactos

### Lo que SE ELIMINA del frontend
1. **Seccion "Pesos y Evidencia"**: tabla con pesos exactos y fuentes clave → ELIMINAR
2. **Seccion "Formula"**: normalizacion min-max, formula ponderada exacta (0.15*N_inv + ...) → ELIMINAR
3. **Seccion "Analisis de Sensibilidad"**: protocolo Dirichlet, Spearman → ELIMINAR
4. **Seccion "Referencias"**: 9 citas academicas → ELIMINAR
5. **InfoModal**: quitar "Peso" (%), "Piso", "Techo", "Sustento", "Formula de normalizacion" → solo dejar Definicion y Fuente
6. **Dimension cards (ReportView)**: quitar "+X.X pts" de contribucion individual
7. **Waterfall chart "Contribucion por Dimension"**: revela cuanto aporta cada dimension → reemplazar por bar chart simple de scores normalizados (sin revelar pesos)
8. **Tooltip del waterfall**: decia "Contribucion" con pts exactos → eliminar
9. **DataEntryView**: quitar "Peso en el indice: X%" del texto de ayuda de cada campo

### Lo que SE MUEVE a documentacion interna (METHODOLOGY.md)
Crear archivo `METHODOLOGY.md` en la raiz del repo con toda la informacion tecnica completa:
- Formula completa con normalizacion y ponderacion
- Tabla de pesos con justificaciones academicas
- Goalposts por dimension con fuentes
- Protocolo de sensibilidad (Dirichlet/Spearman)
- Referencias bibliograficas completas
- Notas de calibracion para San Fernando

Este archivo vive en el repo (accesible al equipo) pero NO se renderiza en la app.

## Archivos a modificar

1. **`src/App.tsx`** — MethodView, InfoModal, ReportView, DataEntryView
2. **`METHODOLOGY.md`** — nuevo archivo con toda la documentacion tecnica
3. **`README.md`** — actualizar si tiene metodologia expuesta (la tiene: tabla de 10 fuentes)

## Orden de ejecucion
1. Crear `METHODOLOGY.md` con toda la documentacion completa (mover antes de borrar)
2. Simplificar MethodView (quitar secciones sensibles)
3. Simplificar InfoModal (solo Definicion + Fuente)
4. Quitar contribucion pts de dimension cards y waterfall → cambiar a bar chart de scores
5. Quitar peso del indice en DataEntryView
6. Limpiar README (mover metodologia detallada a METHODOLOGY.md)
7. Build + verificar
