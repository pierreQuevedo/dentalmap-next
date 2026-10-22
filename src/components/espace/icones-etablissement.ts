import { CalendarDays, GraduationCap, HeartPulse, ImagePlus, Route, ShieldCheck, type LucideIcon } from 'lucide-react'

/** L'icône de chaque bloc de la page complète d'un établissement. */
export const ICONE_SOURCE: Record<string, LucideIcon> = {
  identite: ShieldCheck,
  formations: GraduationCap,
  acces: Route,
  alternance: GraduationCap,
  centres: HeartPulse,
  portes_ouvertes: CalendarDays,
  photo: ImagePlus,
}
