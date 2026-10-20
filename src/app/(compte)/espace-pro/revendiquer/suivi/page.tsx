import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { ArrowRight, Check, Hourglass, TriangleAlert } from 'lucide-react'
import { ChoixVoies } from '@/components/compte/choix'
import { Encart, Pictogramme, discret, principal, titre } from '@/components/compte/ui'
import { db } from '@/db'
import { chemin } from '@/lib/navigation'
import { pscOuvert } from '@/lib/psc/config'
import { REVENDIQUER, apresAccord, dateLongue, echeanceOuvree } from '@/lib/espace-pro/chemins'
import { getFicheRevendication, sirenDe } from '@/lib/espace-pro/parcours'
import { CoquilleParcours, garde, nomDe, pageFiche, versFiche, voiesIdentite } from '../_commun'

export const metadata: Metadata = { title: 'Suivi de votre demande', robots: { index: false, follow: false } }
export const instant = false

/**
 * K et L : le suivi d'une demande examinée par l'équipe.
 *
 * En attente (K) : une frise, reçu, examen, publication, et la possibilité de
 * préparer sa fiche sans attendre. Refusée (L) : le motif, le commentaire de
 * l'équipe, et les autres preuves possibles ; la revendication reste ouverte.
 * Sans fiche dans l'adresse, la plus récente demande du compte.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  let { fiche: slug } = await props.searchParams
  const compte = await garde(`${REVENDIQUER}/suivi/${slug ? `?fiche=${encodeURIComponent(slug)}` : ''}`)
  if (!slug) {
    const { rows } = await db.execute<{ slug: string }>(sql`
      SELECT p.slug FROM revendications r JOIN praticiens p ON p.id = r.praticien_id
      WHERE r.user_id = ${compte.id}::uuid AND r.statut <> 'acceptee' ORDER BY r.demande_le DESC LIMIT 1
    `)
    slug = rows[0]?.slug
    if (!slug) redirect(chemin(`${REVENDIQUER}/`))
  }
  // Retirées comprises : un retrait accepté mène à sa confirmation, où il s'annule pendant 30 jours.
  const fiche = await getFicheRevendication(slug, compte.id, { retirees: true })
  const d = fiche?.demande
  if (!fiche || !d) redirect(chemin(`${REVENDIQUER}/`))
  if (d.statut === 'acceptee') redirect(chemin(d.objet === 'retrait' ? versFiche(fiche, 'retrait/confirme') : apresAccord(fiche.slug, fiche.lieux.length)))

  const retrait = d.objet === 'retrait'
  // Une contestation (la fiche a déjà un titulaire) ne se prépare pas : rien ne se modifie avant la décision.
  const contestation = !retrait && fiche.gereeParUnAutre
  const document = d.methode === 'justificatif'
  // Un laboratoire prouve par Kbis, et n'a pas Pro Santé Connect.
  const labo = fiche.profession === 'prothesiste'
  const piece = labo ? 'Kbis' : 'justificatif'
  // Seul un laboratoire dépose encore un document ; un soignant n'en envoie plus (JD1 retiré).
  const versDocument = `/espace-pro/laboratoire/revendiquer/${encodeURIComponent(fiche.slug)}/${d.roleLabo === 'mandate' ? 'mandat' : 'preuve'}/`

  if (d.statut === 'refusee') {
    const psc = pscOuvert() && fiche.rpps !== null && !labo
    // « Écrire à l'équipe » ouvre « Mon laboratoire » avec le nom et le SIREN déjà saisis.
    const siren = labo ? await sirenDe(fiche.id) : null
    return (
      <CoquilleParcours
        fiche={fiche}
        etiquette="Preuve refusée · revendication ouverte"
        encart={{ icone: 'document', ton: 'erreur', titre: labo ? 'Kbis refusé' : document ? 'Justificatif refusé' : 'Demande refusée', texte: d.motifRefus ? `Motif : ${d.motifRefus.toLowerCase()}.` : 'Choisissez une autre preuve.' }}
      >
        <Pictogramme icone={TriangleAlert} ton="erreur" />
        <h1 className={titre}>Nous n’avons pas pu valider {document ? `ce ${piece}` : 'votre demande'}</h1>
        <p className="mt-2 text-sm text-fg-2">Rien de grave : choisissez une autre preuve, la revendication reste ouverte.</p>
        {(d.motifRefus || d.commentaireRefus) && (
          <Encart ton="erreur" titre={d.motifRefus ? `Motif : ${d.motifRefus.toLowerCase()}` : undefined} className="mt-6">
            {d.commentaireRefus ? `Commentaire de l’équipe : « ${d.commentaireRefus} »` : 'Un nouveau document lisible suffira.'}
          </Encart>
        )}
        <div className="mt-4">
          <ChoixVoies
            defaut={labo ? 'document' : psc ? 'psc' : 'equipe'}
            voies={
              labo
                ? [
                    { valeur: 'document', titre: 'Envoyer un autre Kbis', detail: 'Nouvel examen sous 48 h.', icone: 'document', badge: '48 h', bouton: 'Continuer', href: versDocument },
                    { valeur: 'courrier', titre: 'Recevoir un courrier', detail: 'Code à 8 chiffres au siège.', icone: 'courrier', badge: 'Bientôt', desactivee: true, bouton: 'Continuer', href: '#' },
                  ]
                : voiesIdentite(fiche, { psc, retrait })
            }
            secondaire={labo ? { libelle: 'Écrire à l’équipe', href: `/contact/?${new URLSearchParams({ objet: 'laboratoire', laboratoire: nomDe(fiche), ...(siren ? { siren } : {}) })}` } : undefined}
          />
        </div>
      </CoquilleParcours>
    )
  }

  const recu = new Date(d.demandeLe)
  const echeance = echeanceOuvree(recu, 2)
  const etapes = [
    { titre: document ? `${labo ? 'Kbis' : 'Justificatif'} reçu` : 'Demande reçue', detail: dateLongue(recu), etat: 'fait' as const },
    { titre: 'Examen par l’équipe', detail: `Réponse avant ${dateLongue(echeance)}`, etat: 'encours' as const },
    { titre: retrait ? 'Fiche retirée' : contestation ? 'Fiche transférée' : 'Fiche publiée', detail: 'Dès la validation', etat: 'avenir' as const },
  ]

  return (
    <CoquilleParcours
      fiche={fiche}
      etiquette={retrait ? 'Retrait demandé' : 'Vérification en cours'}
      encart={{ icone: 'sablier', ton: 'attention', titre: document ? `${labo ? 'Kbis' : 'Justificatif'} en examen` : 'Demande en examen', texte: `Réponse avant ${dateLongue(echeance)}.` }}
    >
      <Pictogramme icone={Hourglass} ton="attention" />
      <h1 className={titre}>
        {retrait ? 'Votre demande de retrait est en cours d’examen' : document ? `Votre ${piece} est en cours d’examen` : 'Votre demande est en cours d’examen'}
      </h1>
      <p className="mt-2 text-sm text-fg-2">
        Réponse sous 48 heures ouvrées.
        {retrait ? '' : contestation ? ' Cette fiche est déjà gérée par un autre compte : vous ne pouvez pas la modifier avant la décision de l’équipe.' : ' En attendant, vous pouvez préparer votre fiche : elle sera publiée dès la validation.'}
      </p>
      <ol className="mt-6 space-y-3">
        {etapes.map((e, i) => (
          <li key={e.titre} className="relative flex gap-3">
            {i < etapes.length - 1 && <span aria-hidden className="absolute left-[9px] top-6 h-[calc(100%-0.75rem)] w-px bg-line" />}
            <span
              aria-hidden
              className={`relative grid size-5 shrink-0 place-items-center rounded-full ${
                e.etat === 'fait' ? 'bg-teal text-white' : e.etat === 'encours' ? 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300' : 'border border-line-strong bg-bg'
              }`}
            >
              {e.etat === 'fait' ? <Check className="size-3" /> : e.etat === 'encours' ? <Hourglass className="size-3" /> : null}
            </span>
            <div>
              <p className="text-sm font-medium text-fg">{e.titre}</p>
              <p className="text-xs text-fg-2">{e.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      {contestation ? (
        <Link href={chemin(pageFiche(fiche))} className={`${principal} mt-6`}>
          Voir la fiche publique
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      ) : (
        // La fiche nommée : un compte qui en gère plusieurs retomberait sinon sur la première.
        <Link
          href={chemin(retrait ? '/espace-pro/' : labo ? `/espace-pro/laboratoire/onboarding/?fiche=${encodeURIComponent(fiche.slug)}` : `/espace-pro/?fiche=${encodeURIComponent(fiche.slug)}`)}
          className={`${principal} mt-6`}
        >
          {retrait ? 'Retour à mon espace' : labo ? 'Préparer la fiche' : 'Préparer ma fiche'}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
      {document && labo && (
        <Link href={chemin(versDocument)} className={`${discret} mt-1`}>
          Remplacer le document
        </Link>
      )}
    </CoquilleParcours>
  )
}
