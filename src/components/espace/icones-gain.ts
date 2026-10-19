import { Globe, MapPin, Megaphone, RefreshCw, Sparkles, UserPlus, type LucideIcon } from 'lucide-react'
import type { CleGain } from '@/lib/espace-pro/progression'

/** L'icône de chaque source de points, lisible côté serveur comme côté client. */
export const ICONE_GAIN: Record<CleGain, LucideIcon> = { fiche: Sparkles, google: MapPin, badge: Globe, partage: Megaphone, parrainage: UserPlus, a_jour: RefreshCw }
