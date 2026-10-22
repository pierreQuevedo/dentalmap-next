import { BadgeCheck, CalendarDays, Compass, Eye, EyeOff, FlaskConical, GraduationCap, HeartHandshake, Microscope, SprayCan, Stethoscope, VenetianMask, type LucideIcon } from 'lucide-react'

/*
 * Les choix en encarts du profil candidat : parcours de bienvenue (situation,
 * qualification, visibilité) et page « Visibilité ». Sans état : utilisable
 * côté serveur comme dans un formulaire client.
 */

/** Un encart par situation, en grille sur toute la largeur : l'icône, le libellé, le détail. */
export const ICONES_SITUATION: Record<string, LucideIcon> = { assistant: HeartHandshake, assistant_specialise: Microscope, secretaire: CalendarDays, prothesiste: FlaskConical, aide: SprayCan, dentiste: Stethoscope, etudiant: GraduationCap }
const encart =
  'squircle-2xl relative flex cursor-pointer flex-col gap-3 border border-line bg-bg p-5 transition-colors hover:border-line-strong has-[:checked]:border-teal has-[:checked]:bg-teal/[0.06] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-action'
export const ICONES_QUALIFICATION: Record<string, LucideIcon> = { titre: BadgeCheck, formation: GraduationCap, autre: Compass }
export const ICONES_VISIBILITE: Record<string, LucideIcon> = { visible: Eye, anonyme: VenetianMask, discret: EyeOff }

/** Un choix en encart : l'icône et le rond de sélection en haut, le libellé et le détail dessous. */
export function EncartChoix({ nom, valeur, coche, icone: Icone, libelle, detail }: { nom: string; valeur: string; coche: boolean; icone: LucideIcon; libelle: string; detail?: string }) {
  return (
    <label className={`group ${encart}`}>
      <input type="radio" name={nom} value={valeur} defaultChecked={coche} className="peer sr-only" />
      <span className="flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-xl bg-bg-soft text-fg-2 group-has-[:checked]:bg-teal/15 group-has-[:checked]:text-teal">
          <Icone className="size-5" aria-hidden />
        </span>
        <span aria-hidden className="size-5 rounded-full border border-line-strong bg-bg transition-[border-width,border-color] group-has-[:checked]:border-[6px] group-has-[:checked]:border-teal" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-fg">{libelle}</span>
        {detail && <span className="mt-0.5 block text-xs text-fg-2">{detail}</span>}
      </span>
    </label>
  )
}
