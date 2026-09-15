import Link from 'next/link'
import { formaterAdresse } from '@/lib/annuaire/nom'
import { chemin } from '@/lib/navigation'

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

export function Adresse({
  ligne,
  codePostal,
  commune,
  approximative,
}: {
  ligne: string | null
  codePostal: string | null
  commune: string | null
  approximative?: boolean
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
      {approximative && (
        <span className="mt-1 block text-xs text-fg-2">
          Position approximative, au centre de la commune
        </span>
      )}
    </address>
  )
}

export function Telephone({ numero }: { numero: string | null }) {
  if (!numero) return null
  const nettoye = numero.replace(/[^\d+]/g, '')
  return (
    <a href={`tel:${nettoye}`} className="font-medium text-fg hover:underline">
      {numero}
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
