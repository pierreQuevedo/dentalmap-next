import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { ChoixVoies } from '@/components/compte/choix'
import { Etapes, FicheResume, cadre, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { pscOuvert } from '@/lib/psc/config'
import { COOKIE_FICHE, REVENDIQUER } from '@/lib/espace-pro/chemins'
import { getFicheRevendication } from '@/lib/espace-pro/parcours'
import { CoquilleParcours, adresseDe, dejaEngage, garde, libelleProfession, nomDe, pageFiche, versFiche } from './_commun'

export const metadata: Metadata = { title: 'Revendiquer ma fiche', robots: { index: false, follow: false } }
export const instant = false

/**
 * S0, « Comment vous identifier ? ».
 *
 * Deux voies : Pro Santé Connect, immédiate, ou la recherche de sa fiche puis
 * une preuve. Arrivé depuis une fiche (« Revendiquer cette fiche »), la
 * recherche est déjà faite : la carte pointe sur le praticien, son RPPS est
 * dans la pastille, son résumé est ici, et « Rechercher ma fiche » mène droit
 * à « C'est bien vous ? » sans repasser par la recherche.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const { fiche: slug } = await props.searchParams
  const ici = `${REVENDIQUER}/${slug ? `?fiche=${encodeURIComponent(slug)}` : ''}`
  const compte = await garde(ici)
  if (!slug) {
    // On revient sur sa fiche : la dernière demande du compte, sinon la dernière fiche visée par le parcours.
    const { rows } = await db.execute<{ slug: string }>(sql`
      SELECT p.slug FROM revendications r JOIN praticiens p ON p.id = r.praticien_id AND p.deleted_at IS NULL
      WHERE r.user_id = ${compte.id}::uuid AND r.objet = 'revendication' AND r.statut <> 'refusee'
      ORDER BY r.demande_le DESC LIMIT 1
    `)
    const memoire = rows[0]?.slug ?? (await cookies()).get(COOKIE_FICHE)?.value
    const visee = memoire ? await getFicheRevendication(memoire, compte.id) : null
    // Le cookie vit dans le navigateur, pas dans le compte : sur un poste partagé, la fiche d'un autre profil (un laboratoire pour un dentiste) ne compte pas.
    if (visee && (rows[0] || (visee.profession === 'prothesiste') === (compte.role === 'prothesiste'))) redirect(chemin(`${REVENDIQUER}/?fiche=${encodeURIComponent(visee.slug)}`))
  }
  const fiche = slug ? await getFicheRevendication(slug, compte.id) : null
  // Un laboratoire a son propre parcours : SIREN, rôle, Kbis.
  if (fiche?.profession === 'prothesiste') redirect(chemin(`/espace-pro/laboratoire/revendiquer/?fiche=${encodeURIComponent(fiche.slug)}`))
  if (!fiche && compte.role === 'prothesiste') redirect(chemin('/espace-pro/laboratoire/revendiquer/'))
  const deja = fiche && dejaEngage(fiche)
  if (deja) redirect(chemin(deja))

  // Pro Santé Connect ne connaît que le RPPS : rien à faire pour une fiche de laboratoire.
  const psc = pscOuvert() && (!fiche || fiche.rpps !== null)
  const versRecherche = fiche ? versFiche(fiche) : `${REVENDIQUER}/recherche/`
  const versPsc = `${REVENDIQUER}/psc/${fiche ? `?fiche=${encodeURIComponent(fiche.slug)}` : ''}`

  return (
    <CoquilleParcours
      fiche={fiche}
      etiquette={fiche ? (fiche.gereeParUnAutre ? 'Gérée par un autre compte' : 'Fiche non revendiquée') : undefined}
      recherche={fiche ? (fiche.rpps ?? nomDe(fiche)) : ''}
      encart={{ icone: 'carte', titre: 'Pro Santé Connect', texte: 'Votre carte CPS ou e-CPS retrouve la fiche toute seule.', badge: psc ? undefined : 'Bientôt' }}
      retour={fiche ? pageFiche(fiche) : '/'}
    >
      <Etapes etape={1} libelle="Identification" />
      <h1 className={titre}>Comment vous identifier ?</h1>
      <p className="mt-2 text-sm text-fg-2">Deux voies pour rattacher votre fiche. Pro Santé Connect est la plus rapide.</p>

      {fiche && (
        <div className={`${cadre} mt-6`}>
          <FicheResume profession={libelleProfession(fiche)} nom={nomDe(fiche)} adresse={adresseDe(fiche.resume)} rpps={fiche.rpps} />
        </div>
      )}

      <div className="mt-6">
        <ChoixVoies
          defaut={psc ? 'psc' : 'recherche'}
          voies={[
            {
              valeur: 'psc',
              titre: 'Pro Santé Connect',
              detail: 'Avec votre carte CPS ou l’application e-CPS. La fiche est validée sur-le-champ.',
              icone: 'carte',
              badge: psc ? 'Immédiat' : 'Bientôt',
              desactivee: !psc,
              bouton: 'S’identifier avec Pro Santé Connect',
              href: versPsc,
            },
            {
              valeur: 'recherche',
              titre: fiche ? 'Confirmer ma fiche' : 'Rechercher ma fiche',
              detail: fiche
                ? 'Vérifiez les données du registre, puis prouvez que c’est vous : Pro Santé Connect ou un justificatif PDF.'
                : 'Par numéro RPPS ou par nom, puis vérification de votre identité, par Pro Santé Connect ou sur justificatif.',
              icone: 'recherche',
              badge: '1 min à 2 jours',
              bouton: fiche ? 'Confirmer ma fiche' : 'Rechercher ma fiche',
              href: versRecherche,
            },
          ]}
          secondaire={psc ? { libelle: fiche ? 'Continuer sans Pro Santé Connect' : 'Rechercher ma fiche sans PSC', href: versRecherche } : undefined}
        />
      </div>
    </CoquilleParcours>
  )
}
