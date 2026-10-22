import type { StatutCandidature } from '@/lib/emploi/candidature'
import { etapeFrise } from '@/lib/emploi/profil-candidat'

/*
 * La frise d'une candidature, vue du candidat, et la phrase qui dit où elle
 * en est. Partagée par la vue d'ensemble et « Mes candidatures ».
 */

/** La frise d'une candidature : Envoyée, Vue, puis Retenue ou Non retenue. */
export function Frise({ statut, type }: { statut: Parameters<typeof etapeFrise>[0]; type: string }) {
  const { etape, issue } = etapeFrise(statut)
  const etapes = ['Envoyée', `Vue par le ${type}`, issue === 'non' ? 'Non retenue' : 'Retenue']
  return (
    <ol className="grid grid-cols-3 gap-1.5">
      {etapes.map((e, i) => {
        const fait = issue === 'non' ? i <= 1 : i <= etape
        const non = issue === 'non' && i === 2
        return (
          <li key={e}>
            <span className={`block h-1.5 rounded-full ${non ? 'bg-fg-2/40' : fait ? 'bg-teal' : 'bg-line'}`} />
            <span className={`mt-1.5 block text-[11px] leading-tight ${i === etape && !non ? 'font-semibold text-fg' : fait ? 'text-fg-2' : 'text-fg-2/70'}`}>{e}</span>
          </li>
        )
      })}
    </ol>
  )
}

/** Ce que veut dire l'état, pour la personne qui a postulé. */
export const PHRASE_ETAT: Record<StatutCandidature, string> = {
  nouvelle: 'Le recruteur a reçu votre candidature, avec votre téléphone et votre email.',
  vue: 'Le recruteur a lu votre candidature. S’il souhaite donner suite, il vous appelle ou vous écrit directement.',
  retenue: 'Bonne nouvelle : votre candidature est retenue. Le recruteur vous contacte directement.',
  non_retenue: 'Votre candidature n’a pas été retenue. D’autres offres vous attendent dans « Offres pour vous ».',
}
