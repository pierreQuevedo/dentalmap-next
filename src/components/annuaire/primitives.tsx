import Link from 'next/link'
import type { Route } from 'next'

/**
 * Les chemins de l'annuaire sont composés à l'exécution à partir de slugs venus
 * de la base : `typedRoutes` ne peut pas les connaître à la compilation. Cette
 * fonction isole la conversion en un seul endroit, plutôt que de parsemer le
 * code de conversions de type.
 */
export const chemin = (href: string) => href as Route

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
    <nav aria-label="Fil d'Ariane" className="text-sm text-slate-600">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {segments.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-slate-300">/</span>}
            {s.href ? (
              <Link href={chemin(s.href)} className="hover:text-slate-900 hover:underline">
                {s.libelle}
              </Link>
            ) : (
              <span className="text-slate-900">{s.libelle}</span>
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
export function Verification({ statut }: { statut: 'verifie' | 'partiel' | 'non_verifie' }) {
  const contenu = {
    verifie: { texte: 'Vérifié auprès des registres officiels', classe: 'bg-emerald-50 text-emerald-900 ring-emerald-200' },
    partiel: { texte: 'Identité en cours de vérification', classe: 'bg-amber-50 text-amber-900 ring-amber-200' },
    non_verifie: { texte: 'Non confronté à un registre public', classe: 'bg-slate-100 text-slate-700 ring-slate-200' },
  }[statut]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${contenu.classe}`}>
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
    <address className="not-italic text-slate-700">
      {ligne && <span className="block">{ligne}</span>}
      {(codePostal || commune) && (
        <span className="block">
          {codePostal} {commune}
        </span>
      )}
      {approximative && (
        <span className="mt-1 block text-xs text-slate-500">
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
    <a href={`tel:${nettoye}`} className="font-medium text-slate-900 hover:underline">
      {numero}
    </a>
  )
}

export function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-slate-200 py-6">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{titre}</h2>
      {children}
    </section>
  )
}
