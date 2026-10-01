import {
  ACCESSIBILITE,
  JOURS,
  LANGUES,
  LIBELLE_JOUR,
  PAIEMENTS,
  TIERS_PAYANT,
  libelle,
  type FicheCompletee,
} from '@/lib/espace-pro/fiche-completee'
import { Section } from './primitives'

/**
 * Ce que le praticien a lui-même déclaré.
 *
 * Rendu à part des données de registre, dans un cadre qui dit d'où cela vient
 * et depuis quand. Le lecteur doit pouvoir distinguer d'un coup d'œil ce que
 * l'Annuaire Santé affirme de ce que le cabinet annonce : l'un se vérifie,
 * l'autre se croit.
 */
export function SectionFicheCompletee({ fiche }: { fiche: FicheCompletee }) {
  const horaires = fiche.horaires ?? {}
  const aHoraires = JOURS.some((j) => (horaires[j]?.length ?? 0) > 0)
  const maj = new Date(fiche.majLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <Section titre="Informations fournies par le cabinet">
      <div className="squircle-xl border border-line bg-bg-soft p-5">
        <p className="text-xs text-fg-2">
          Déclarées par le praticien, dont l’identité a été vérifiée avant qu’il puisse écrire ici. Mises à jour le {maj}.
          Elles ne proviennent pas d’un registre.
        </p>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          {aHoraires && (
            <div className="sm:col-span-2">
              <h3 className="text-sm font-semibold text-fg">Horaires d’ouverture</h3>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
                {JOURS.map((j) => {
                  const plages = horaires[j] ?? []
                  return (
                    <Ligne key={j} libelle={LIBELLE_JOUR[j]}>
                      {plages.length === 0 ? (
                        <span className="text-fg-2">Fermé</span>
                      ) : (
                        plages.map((p) => `${p.debut.replace(':', 'h')} à ${p.fin.replace(':', 'h')}`).join(', ')
                      )}
                    </Ligne>
                  )
                })}
              </dl>
            </div>
          )}

          {fiche.langues.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-fg">Langues parlées</h3>
              <p className="mt-2 text-sm text-fg">{fiche.langues.map((c) => libelle(LANGUES, c)).join(', ')}</p>
            </div>
          )}

          {(fiche.accessibilite.length > 0 || fiche.accessibiliteCommentaire) && (
            <div>
              <h3 className="text-sm font-semibold text-fg">Accessibilité</h3>
              {fiche.accessibilite.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-fg">
                  {fiche.accessibilite.map((c) => (
                    <li key={c}>{libelle(ACCESSIBILITE, c)}</li>
                  ))}
                </ul>
              )}
              {fiche.accessibiliteCommentaire && (
                <p className="mt-2 text-sm text-fg-2">{fiche.accessibiliteCommentaire}</p>
              )}
            </div>
          )}

          {(fiche.paiements.length > 0 || fiche.tiersPayant) && (
            <div>
              <h3 className="text-sm font-semibold text-fg">Paiement</h3>
              {fiche.paiements.length > 0 && (
                <p className="mt-2 text-sm text-fg">{fiche.paiements.map((c) => libelle(PAIEMENTS, c)).join(', ')}</p>
              )}
              {fiche.tiersPayant && <p className="mt-1 text-sm text-fg">{libelle(TIERS_PAYANT, fiche.tiersPayant)}</p>}
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}

function Ligne({ libelle, children }: { libelle: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-fg-2">{libelle}</dt>
      <dd className="text-fg">{children}</dd>
    </>
  )
}
