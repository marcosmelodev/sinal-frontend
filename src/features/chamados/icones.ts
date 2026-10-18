import {
  AlertTriangle,
  Car,
  CircleHelp,
  Droplet,
  Eye,
  Flame,
  HeartPulse,
  House,
  ShieldAlert,
  Users,
  UserX,
  Waves,
  Wind,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Ícones disponíveis para as ocorrências, referenciados por nome nos dados.
 * Registro explícito para não importar a biblioteca inteira do lucide no bundle.
 */
export const ICONES = {
  AlertTriangle,
  Car,
  CircleHelp,
  Droplet,
  Eye,
  Flame,
  HeartPulse,
  House,
  ShieldAlert,
  Users,
  UserX,
  Waves,
  Wind,
  Zap,
} satisfies Record<string, LucideIcon>

export type NomeIcone = keyof typeof ICONES
