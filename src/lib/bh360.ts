// ─── Interfaces ───────────────────────────────────────────────

export interface DimensionConfig {
  id: string
  label: string
  pillar: "input" | "equity" | "performance"
  weight: number
  floor: number
  ceiling: number
  unit: string
  source: string
  description: string
  justification: string
}

export interface PeriodData {
  period: string
  brand: string
  campaign: string
  investment: number
  reach: number
  purchase: number
  sentiment: number
  sales: number
}

export interface NormalizedScores {
  investment: number
  reach: number
  purchase: number
  sentiment: number
  sales: number
}

export interface BH360Result {
  score: number
  normalized: NormalizedScores
  contributions: Record<string, number>
  pillarScores: Record<string, number>
  interpretation: string
  level: string
}

// ─── Constantes ───────────────────────────────────────────────

export const DIMENSIONS: DimensionConfig[] = [
  {
    id: "investment",
    label: "Inversión de Campaña",
    pillar: "input",
    weight: 0.15,
    floor: 0,
    ceiling: 8_000_000,
    unit: "S/",
    source: "Agencia de medios",
    description:
      "Inversión total en medios pagados durante el período. Incluye TV, digital, OOH, radio y prensa.",
    justification:
      "Binet & Davis (IPA, 2025): el presupuesto explica el 89% de las variaciones en beneficio. Es el input más controlable por la marca.",
  },
  {
    id: "reach",
    label: "Alcance Deduplicado",
    pillar: "input",
    weight: 0.20,
    floor: 0,
    ceiling: 95,
    unit: "%",
    source: "Agencia + plataformas",
    description:
      "Porcentaje del universo target alcanzado al menos una vez durante el período, deduplicado cross-media.",
    justification:
      "Sharp (2010): mental availability es el driver principal de crecimiento. El reach es su proxy más directo y medible.",
  },
  {
    id: "purchase",
    label: "Compra Declarada (Último Mes)",
    pillar: "equity",
    weight: 0.25,
    floor: 0,
    ceiling: 85,
    unit: "%",
    source: "Ipsos / Panel digital The Lab",
    description:
      "Porcentaje de encuestados que declaran haber comprado la marca en el último mes. Medido vía panel online o tracking.",
    justification:
      "Brand Finance BrandBeta (2022): familiaridad (65%) + consideración (35%) explican 80%+ de varianza en market share. Compra declarada es la métrica de equity más predictiva.",
  },
  {
    id: "sentiment",
    label: "Net Sentiment Score",
    pillar: "equity",
    weight: 0.15,
    floor: -100,
    ceiling: 100,
    unit: "NSS",
    source: "Agencia creativa / Social listening",
    description:
      "Net Sentiment Score: porcentaje de menciones positivas menos negativas. Rango natural de -100 a +100.",
    justification:
      "Field (IPA, 2026): 93% de campañas con grandes mejoras en trust reportan efectos de negocio. Peso moderado (15%) porque es volátil y sensible a crisis.",
  },
  {
    id: "sales",
    label: "Ventas del Período",
    pillar: "performance",
    weight: 0.25,
    floor: 0,
    ceiling: 12_000_000,
    unit: "S/",
    source: "Cliente (ERP)",
    description:
      "Ventas netas en soles del período. Dato provisto por el cliente desde su ERP o reporte financiero.",
    justification:
      "Es el resultado final de negocio. Peso igual al de Compra Declarada (25%) para balancear equity con performance real.",
  },
]

export const PILLAR_COLORS: Record<string, string> = {
  input: "#3b82f6",
  equity: "#8b5cf6",
  performance: "#10b981",
}

export const PILLAR_LABELS: Record<string, string> = {
  input: "Input",
  equity: "Equity",
  performance: "Performance",
}

export const LEVEL_COLORS: Record<string, string> = {
  critical: "#ef4444",
  weak: "#f97316",
  moderate: "#eab308",
  strong: "#22c55e",
  exceptional: "#06b6d4",
}

export const LEVEL_LABELS: Record<string, string> = {
  critical: "Crítica",
  weak: "Débil",
  moderate: "Moderada",
  strong: "Fuerte",
  exceptional: "Excepcional",
}

export const SAMPLE_DATA: PeriodData[] = [
  {
    period: "Q3 2025",
    brand: "San Fernando",
    campaign: "Jueves de Pavita + Always On",
    investment: 1_850_000,
    reach: 58,
    purchase: 42,
    sentiment: 35,
    sales: 7_200_000,
  },
  {
    period: "Q4 2025",
    brand: "San Fernando",
    campaign: "Navidad + Pavo",
    investment: 3_200_000,
    reach: 74,
    purchase: 61,
    sentiment: 52,
    sales: 9_800_000,
  },
  {
    period: "Q1 2026",
    brand: "San Fernando",
    campaign: "Verano + Embutidos",
    investment: 2_100_000,
    reach: 62,
    purchase: 48,
    sentiment: 41,
    sales: 6_900_000,
  },
  {
    period: "Q2 2026",
    brand: "San Fernando",
    campaign: "Día de la Madre + Always On",
    investment: 2_350_000,
    reach: 65,
    purchase: 52,
    sentiment: 45,
    sales: 7_500_000,
  },
]

// ─── Funciones de normalización ───────────────────────────────

export function normalize(value: number, floor: number, ceiling: number): number {
  return Math.min(100, Math.max(0, ((value - floor) / (ceiling - floor)) * 100))
}

export function normalizeNSS(nss: number): number {
  return ((nss + 100) / 200) * 100
}

// ─── Función principal de cálculo ─────────────────────────────

export function calculateBH360(data: PeriodData): BH360Result {
  const normalized: NormalizedScores = {
    investment: normalize(data.investment, 0, 8_000_000),
    reach: normalize(data.reach, 0, 95),
    purchase: normalize(data.purchase, 0, 85),
    sentiment: normalizeNSS(data.sentiment),
    sales: normalize(data.sales, 0, 12_000_000),
  }

  const contributions: Record<string, number> = {}
  let score = 0

  for (const dim of DIMENSIONS) {
    const normValue = normalized[dim.id as keyof NormalizedScores]
    const contrib = normValue * dim.weight
    contributions[dim.id] = contrib
    score += contrib
  }

  // Pillar scores: weighted average within each pillar
  const inputWeight = 0.15 + 0.20
  const equityWeight = 0.25 + 0.15
  const pillarScores: Record<string, number> = {
    input:
      (normalized.investment * 0.15 + normalized.reach * 0.20) / inputWeight,
    equity:
      (normalized.purchase * 0.25 + normalized.sentiment * 0.15) / equityWeight,
    performance: normalized.sales,
  }

  let level: string
  let interpretation: string

  if (score <= 30) {
    level = "critical"
    interpretation =
      "Salud de marca crítica. Se requiere intervención inmediata en múltiples dimensiones."
  } else if (score <= 50) {
    level = "weak"
    interpretation =
      "Salud de marca débil. Hay oportunidades significativas de mejora en las dimensiones con menor puntaje."
  } else if (score <= 70) {
    level = "moderate"
    interpretation =
      "Salud de marca moderada. La marca tiene bases sólidas pero puede optimizar dimensiones específicas."
  } else if (score <= 85) {
    level = "strong"
    interpretation =
      "Salud de marca fuerte. La marca muestra buen desempeño en la mayoría de dimensiones."
  } else {
    level = "exceptional"
    interpretation =
      "Salud de marca excepcional. Desempeño sobresaliente en todas las dimensiones."
  }

  return {
    score: Math.round(score * 10) / 10,
    normalized,
    contributions,
    pillarScores,
    interpretation,
    level,
  }
}

// ─── Utilidades de formato ────────────────────────────────────

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `S/ ${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `S/ ${(value / 1_000).toFixed(0)}K`
  }
  return `S/ ${value.toFixed(0)}`
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatDimensionValue(dimId: string, value: number): string {
  switch (dimId) {
    case "investment":
    case "sales":
      return formatCurrency(value)
    case "reach":
    case "purchase":
      return formatPercent(value)
    case "sentiment":
      return value >= 0 ? `+${value}` : `${value}`
    default:
      return String(value)
  }
}

export function getDimensionValue(
  data: PeriodData,
  dimId: string
): number {
  return data[dimId as keyof Omit<PeriodData, "period" | "brand" | "campaign">] as number
}
