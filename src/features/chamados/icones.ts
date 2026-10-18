import {
  AlertTriangle,
  Bone,
  Brain,
  Building2,
  Car,
  CircleHelp,
  Crosshair,
  Droplet,
  Eye,
  FlaskConical,
  Flame,
  HeartPulse,
  House,
  LifeBuoy,
  Megaphone,
  PawPrint,
  ShieldAlert,
  TreeDeciduous,
  Trees,
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
  Bone,
  Brain,
  Building2,
  Car,
  CircleHelp,
  Crosshair,
  Droplet,
  Eye,
  FlaskConical,
  Flame,
  HeartPulse,
  House,
  LifeBuoy,
  Megaphone,
  PawPrint,
  ShieldAlert,
  TreeDeciduous,
  Trees,
  Users,
  UserX,
  Waves,
  Wind,
  Zap,
} satisfies Record<string, LucideIcon>

export type NomeIcone = keyof typeof ICONES
