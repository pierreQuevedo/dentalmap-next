import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { auth } from '@/lib/auth'
import { chemin } from '@/lib/navigation'
import { estPersonne, type BaseUrl, type Profession } from '@/lib/annuaire/types'
import { pscConfigure } from '@/lib/psc/config'
import { demanderRevendication } from './actions'

/**
 * Ce que le retour de Pro Santé Connect peut avoir à dire.
 *
 * Chaque code est posé par les routes `/api/psc/*`. Le message dit ce qui
 * s'est passé et ce qui reste possible : dans tous les cas, la demande
 * manuelle ci-dessous.
 */
const MESSAGES_PSC: Record<string, string> = {
  annule: 'La vérification par Pro Santé Connect a été interrompue. Vous pouvez la relancer, ou demander une vérification manuelle.',
  etat: 'La vérification a expiré ou a été ouverte dans un autre navigateur. Relancez-la depuis cette page.',
  session: 'Votre session a changé pendant la vérification. Reconnectez-vous puis relancez-la.',
  technique: 'Pro Santé Connect n’a pas répondu comme attendu. Réessayez dans quelques minutes, ou demandez une vérification manuelle.',
  profession: 'L’identité renvoyée par Pro Santé Connect n’est pas celle d’un chirurgien-dentiste, ou cette fiche n’en est pas une.',
  rpps: 'Le numéro RPPS de votre carte n’est pas celui de cette fiche. Vérifiez que vous avez choisi la bonne fiche : la vôtre porte votre numéro dans la rubrique « Identifiants officiels ».',
  fiche: 'Cette fiche n’existe plus ou n’est pas revendicable.',
  indisponible: 'La vérification par Pro Santé Connect n’est pas encore ouverte. La demande manuelle reste possible.',
}

export const metadata: Metadata = {
  title: 'Revendiquer ma fiche',
  description:
    'Vous êtes chirurgien-dentiste ou prothésiste : revendiquez votre fiche pour compléter les informations que le registre ne porte pas.',
  robots: { index: true, follow: true },
}

export const instant = false

type Params = { fiche?: string; profession?: string; envoyee?: string; psc?: string }

type Fiche = {
  slug: string
  nom: string
  prenom: string | null
  raison_sociale: string | null
  adresse: string | null
  commune: string | null
  commune_slug: string | null
  departement_slug: string | null
  profession: Profession
}

export default async function Page(props: { searchParams: Promise<Params> }) {
  const sp = await props.searchParams
  const session = await auth.api.getSession({ headers: await headers() })

  const fiche = sp.fiche
    ? (
        await db.execute<Fiche>(sql`
          SELECT DISTINCT ON (p.id) p.slug, p.nom, p.prenom, p.raison_sociale, p.profession,
                 l.adresse_ligne AS adresse, c.nom AS commune, c.slug AS commune_slug, d.slug AS departement_slug
          FROM praticiens p
          LEFT JOIN lieux_exercice l ON l.praticien_id = p.id
          LEFT JOIN communes c ON c.code_insee = l.code_insee
          LEFT JOIN departements d ON d.code = c.departement_code
          WHERE p.slug = ${sp.fiche} AND p.deleted_at IS NULL
          ORDER BY p.id, l.principal DESC
          LIMIT 1
        `)
      ).rows[0]
    : undefined

  const base: BaseUrl = fiche?.profession === 'prothesiste' ? 'prothesistes' : 'dentistes'
  const nom = fiche
    ? fiche.profession === 'prothesiste'
      ? (fiche.raison_sociale ?? fiche.nom)
      : `Dr ${[fiche.prenom, fiche.nom].filter(Boolean).join(' ')}`
    : null
  const retour = sp.fiche ? `/espace-pro/revendiquer/?fiche=${encodeURIComponent(sp.fiche)}` : '/espace-pro/revendiquer/'

  // Une demande déjà déposée ne doit pas être proposée une seconde fois.
  const deja =
    session && fiche
      ? (
          await db.execute<{ statut: string }>(sql`
            SELECT r.statut FROM revendications r
            JOIN praticiens p ON p.id = r.praticien_id
            WHERE p.slug = ${fiche.slug} AND r.user_id = ${session.user.id}
            LIMIT 1
          `)
        ).rows[0]
      : undefined

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Revendiquer ma fiche</h1>
      <p className="mt-3 text-fg-2">
        Votre fiche existe déjà : elle est construite à partir des registres publics, sans inscription de votre part.
        La revendiquer vous permet d’ajouter ce que le registre ne porte pas.
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="squircle-xl border border-line p-5">
          <h2 className="text-sm font-semibold text-fg">Ce que vous pourrez compléter</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-fg-2">
            <li>Horaires d’ouverture</li>
            <li>Langues parlées au cabinet</li>
            <li>Accessibilité des locaux</li>
            <li>Modes de paiement et tiers payant</li>
          </ul>
        </div>
        <div className="squircle-xl border border-line bg-bg-soft p-5">
          <h2 className="text-sm font-semibold text-fg">Ce qui ne changera pas</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-fg-2">
            <li>Votre identité et votre numéro RPPS</li>
            <li>Votre adresse d’exercice</li>
            <li>Votre position dans les résultats</li>
          </ul>
          <p className="mt-3 text-xs text-fg-2">
            Ces informations viennent du registre et ne peuvent pas être contredites, y compris par vous.
          </p>
        </div>
      </section>

      {sp.psc && MESSAGES_PSC[sp.psc] && (
        <p className="squircle-lg mt-8 border border-partiel-line bg-partiel-bg p-4 text-sm text-partiel">
          {MESSAGES_PSC[sp.psc]}
        </p>
      )}

      {sp.envoyee === '1' && (
        <p className="squircle-lg mt-8 border border-line bg-bg-soft p-4 text-sm text-fg">
          Votre demande est enregistrée. Nous la vérifions auprès du registre et revenons vers vous par courriel.
        </p>
      )}

      <section className="mt-8 border-t border-line pt-8">
        {!fiche ? (
          <>
            <h2 className="text-lg font-semibold text-fg">Retrouvez votre fiche</h2>
            <p className="mt-2 text-fg-2">
              Cherchez-vous dans l’annuaire, puis cliquez sur « Revendiquer cette fiche » depuis votre page.
            </p>
            <Link
              href={chemin('/recherche/')}
              className="squircle-full mt-4 inline-block bg-action px-5 py-2.5 font-medium text-action-foreground hover:bg-action-hover"
            >
              Chercher ma fiche
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-fg">Fiche concernée</h2>
            <div className="squircle-xl mt-3 border border-line p-4">
              <p className="font-semibold text-fg">{nom}</p>
              <p className="mt-1 text-sm text-fg-2">
                {[fiche.adresse, fiche.commune].filter(Boolean).join(', ')}
              </p>
              {fiche.departement_slug && fiche.commune_slug && (
                <Link
                  href={chemin(`/${base}/${fiche.departement_slug}/${fiche.commune_slug}/${fiche.slug}/`)}
                  className="mt-2 inline-block text-sm text-fg underline hover:no-underline"
                >
                  Voir la fiche publique
                </Link>
              )}
            </div>

            {deja?.statut === 'acceptee' ? (
              <div className="squircle-lg mt-6 border border-line bg-bg-soft p-4 text-sm text-fg">
                <p>Cette fiche vous est attribuée.</p>
                <Link
                  href={chemin(`/espace-pro/onboarding/?fiche=${encodeURIComponent(fiche.slug)}`)}
                  className="squircle-full mt-3 inline-block bg-action px-5 py-2.5 font-medium text-action-foreground hover:bg-action-hover"
                >
                  Compléter ma fiche
                </Link>
              </div>
            ) : (
              <>
                {estPersonne(fiche.profession) && (
                  <div className="squircle-xl mt-6 border border-line bg-bg-soft p-5">
                    <h3 className="font-semibold text-fg">Vérification immédiate avec Pro Santé Connect</h3>
                    <p className="mt-2 text-sm text-fg-2">
                      Identifiez-vous avec votre carte CPS ou l’application e-CPS. L’Agence du Numérique en Santé nous
                      transmet votre numéro RPPS : s’il est celui de cette fiche, elle vous est attribuée sur-le-champ.
                    </p>
                    {pscConfigure() ? (
                      <a
                        href={`/api/psc/connexion/?fiche=${encodeURIComponent(fiche.slug)}`}
                        className="squircle-full mt-4 inline-block bg-action px-5 py-2.5 font-medium text-action-foreground hover:bg-action-hover"
                      >
                        Vérifier avec Pro Santé Connect
                      </a>
                    ) : (
                      <p className="mt-3 text-sm text-fg-2">Cette vérification ouvrira prochainement.</p>
                    )}
                  </div>
                )}

                {deja ? (
                  <p className="squircle-lg mt-6 border border-line bg-bg-soft p-4 text-sm text-fg">
                    {deja.statut === 'en_attente'
                      ? 'Une demande manuelle est déjà en cours d’examen pour cette fiche.'
                      : 'Une demande précédente n’a pas pu être validée. Écrivez-nous pour la reprendre.'}
                  </p>
                ) : (
              <form action={demanderRevendication} className="mt-6">
                {estPersonne(fiche.profession) && (
                  <h3 className="mb-4 font-semibold text-fg">Ou demander une vérification manuelle</h3>
                )}
                <input type="hidden" name="slug" value={fiche.slug} />
                <input type="hidden" name="retour" value={retour} />

                <label htmlFor="message" className="block text-sm font-medium text-fg">
                  Comment pouvons-nous vérifier qu’il s’agit de vous ?
                </label>
                <p className="mt-1 text-sm text-fg-2">
                  Indiquez par exemple le numéro RPPS figurant sur votre carte professionnelle, ou une adresse
                  électronique au nom du cabinet. Cette vérification est faite à la main.
                </p>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  maxLength={2000}
                  className="squircle-md mt-3 w-full border border-line-strong px-3 py-2 text-fg outline-none focus:border-fg"
                />

                <button
                  type="submit"
                  className="squircle-full mt-4 bg-action px-5 py-2.5 font-medium text-action-foreground hover:bg-action-hover"
                >
                  {session ? 'Envoyer ma demande' : 'Se connecter et envoyer'}
                </button>

                {!session && (
                  <p className="mt-3 text-sm text-fg-2">
                    Vous serez d’abord invité à vous connecter par courriel, sans mot de passe.
                  </p>
                )}
              </form>
                )}
              </>
            )}
          </>
        )}
      </section>
    </main>
  )
}
