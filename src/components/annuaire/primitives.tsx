import Link from 'next/link'
import { formaterAdresse } from '@/lib/annuaire/nom'
import { chemin } from '@/lib/navigation'
import type { PrecisionPosition, Profession } from '@/lib/annuaire/types'

// Réexporté pour les modules de l'annuaire qui l'importent déjà d'ici ; la
// définition vit dans `navigation.ts`, partagée avec le header et le footer.
export { chemin }

/**
 * Briques d'interface de l'annuaire.
 *
 * Parti pris visuel : sobre, dense, lisible. C'est un annuaire institutionnel,
 * pas une vitrine. La donnée officielle et la donnée déclarative doivent rester
 * visuellement distinctes, conformément à la règle « rien de déclaratif, tout
 * est sourcé ».
 */

export function FilAriane({ segments }: { segments: { libelle: string; href?: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="text-sm text-fg-2">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {segments.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-line-strong">/</span>}
            {s.href ? (
              <Link href={chemin(s.href)} className="hover:text-fg hover:underline">
                {s.libelle}
              </Link>
            ) : (
              <span className="text-fg">{s.libelle}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/**
 * Marque de vérification.
 *
 * Le libellé dit d'où vient l'information, jamais « certifié » ou « de
 * confiance » : la page doit pouvoir être défendue ligne par ligne.
 */
/**
 * État d'une fiche au regard des registres.
 *
 * La vérification est la règle, pas l'exploit : cinquante mille fiches sur
 * soixante-cinq mille sont confrontées à un registre. Un badge de couleur sur
 * chaque ligne d'une liste de quatre cents praticiens ne signale plus rien, il
 * fait du bruit. La coche suffit à dire que le contrôle a eu lieu.
 *
 * L'ambre est réservé à l'exception, la fiche dont l'identité n'est pas
 * confirmée : c'est le seul cas où le lecteur a besoin de ralentir.
 */
export function Verification({ statut }: { statut: 'verifie' | 'partiel' | 'non_verifie' }) {
  const contenu = {
    verifie: {
      texte: 'Vérifié auprès des registres officiels',
      classe: 'bg-bg-soft text-fg ring-line',
      coche: true,
    },
    partiel: {
      texte: 'Identité en cours de vérification',
      classe: 'bg-partiel-bg text-partiel ring-partiel-line',
      coche: false,
    },
    non_verifie: {
      texte: 'Non confronté à un registre public',
      classe: 'bg-bg-soft text-fg-2 ring-line',
      coche: false,
    },
  }[statut]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${contenu.classe}`}
    >
      {contenu.coche && (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3 shrink-0" aria-hidden>
          <path d="M3 8.5l3.5 3.5L13 5" />
        </svg>
      )}
      {contenu.texte}
    </span>
  )
}

/**
 * Mention de précision.
 *
 * Le score de géocodage ne dit rien de ce que la position désigne : la Base
 * Adresse Nationale rend volontiers un score excellent pour le centroïde d'une
 * voie dont le numéro lui est inconnu. Un cabinet posé au milieu de sa rue peut
 * être à cent mètres de sa porte, et le lecteur qui compare avec une autre
 * carte le voit. La fiche le dit donc, plutôt que de laisser croire à une
 * adresse pointée.
 *
 * Rien n'est affiché pour `numero`, qui est la règle, ni pour une précision
 * inconnue : le silence ne prétend rien.
 */
const MENTION_PRECISION: Record<string, string> = {
  voie: 'Position au milieu de la voie, le numéro est inconnu du référentiel',
  lieu_dit: 'Position au centre du lieu-dit',
  commune: 'Position approximative, au centre de la commune',
}

export function Adresse({
  ligne,
  codePostal,
  commune,
  approximative,
  precision,
}: {
  ligne: string | null
  codePostal: string | null
  commune: string | null
  approximative?: boolean
  precision?: PrecisionPosition | null
}) {
  if (!ligne && !commune) return null
  return (
    <address className="not-italic text-fg">
      {ligne && <span className="block">{formaterAdresse(ligne)}</span>}
      {(codePostal || commune) && (
        <span className="block">
          {codePostal} {commune}
        </span>
      )}
      {(() => {
        const mention = MENTION_PRECISION[precision ?? (approximative ? 'commune' : '')]
        return mention ? <span className="mt-1 block text-xs text-fg-2">{mention}</span> : null
      })()}
    </address>
  )
}

/**
 * Numéro de téléphone, groupé par paires.
 *
 * Les registres livrent le numéro d'un bloc, « 0491131919 ». Un numéro français
 * se lit par deux chiffres, et un lecteur qui doit le recopier à la main ne
 * devrait pas avoir à le découper lui-même. Seuls les dix chiffres commençant
 * par zéro sont regroupés : tout autre format est rendu tel quel plutôt que
 * découpé au hasard.
 */
function grouper(numero: string): string {
  const chiffres = numero.replace(/\D/g, '')
  if (chiffres.length !== 10 || !chiffres.startsWith('0')) return numero
  return chiffres.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
}

export function Telephone({ numero }: { numero: string | null }) {
  if (!numero) return null
  const nettoye = numero.replace(/[^\d+]/g, '')
  return (
    <a href={`tel:${nettoye}`} className="font-medium tabular-nums text-fg hover:underline">
      {grouper(numero)}
    </a>
  )
}

export function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-6">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-fg-2">{titre}</h2>
      {children}
    </section>
  )
}

/**
 * Étiquette d'une fiche gérée par son titulaire.
 *
 * Elle apparaît quand une revendication a été acceptée : le praticien, ou le
 * laboratoire, a prouvé sa qualité et complète lui-même sa fiche. Le mot
 * « revendiquée » reste dans le code, pas à l'écran.
 */
export function BadgeGeree({ profession, className = '' }: { profession: Profession; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-bg/90 px-2 py-0.5 text-xs font-medium text-fg backdrop-blur ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-teal" aria-hidden>
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
      {profession === 'prothesiste' ? 'Gérée par le laboratoire' : 'Gérée par le praticien'}
    </span>
  )
}
