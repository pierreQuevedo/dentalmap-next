import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { sql } from 'drizzle-orm'
import { ArrowRight, Building2, Check, CreditCard, Fingerprint, GraduationCap, KeyRound, Mail, Phone, Plus, ShieldCheck, Smartphone } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { db } from '@/db'
import { CoqueEspace, Statut, TitreTuile, Tuile } from '@/components/espace/coque'
import { Appareils, ClesAcces, MotDePasse, Telephone } from '@/components/espace/compte-securite'
import { EnTeteEtab } from '@/components/espace/en-tete-etablissement'
import { auth } from '@/lib/auth'
import { LIBELLE_TYPE } from '@/lib/espace-pro/etablissement'
import { ESPACE_ETAB, ORGANISME, getGestions } from '@/lib/espace-pro/etablissement-donnees'
import { chargerEtablissement } from '../_commun'

export const metadata: Metadata = { title: 'Compte et sécurité', robots: { index: false, follow: false } }
export const instant = false

/** Ce qui protège le compte, lu dans les tables de Better Auth. */
async function securiteDu(userId: string) {
  const { rows } = await db.execute<{ verifiee: boolean; mot_de_passe: boolean; cles: number }>(sql`
    SELECT u.email_verified AS verifiee,
           EXISTS (SELECT 1 FROM account a WHERE a.user_id = u.id AND a.provider_id = 'credential' AND a.password IS NOT NULL) AS mot_de_passe,
           (SELECT count(*)::int FROM passkey p WHERE p.user_id = u.id) AS cles
    FROM "user" u WHERE u.id = ${userId}::uuid
  `)
  return rows[0] ?? { verifiee: false, mot_de_passe: false, cles: 0 }
}

/**
 * Compte et sécurité d'un gestionnaire d'établissement : l'état de la
 * protection du compte en tête, les établissements gérés, puis connexion,
 * clés d'accès et appareils.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const t = await chargerEtablissement('compte', (await props.searchParams).fiche)
  const { coque, compte, gestion, source } = t
  const [session, securite, gestions] = await Promise.all([auth.api.getSession({ headers: await headers() }), securiteDu(compte.id), getGestions(compte.id)])
  const fac = source.type === 'faculte'
  const points = [
    { fait: securite.verifiee, libelle: 'Adresse vérifiée' },
    { fait: securite.mot_de_passe, libelle: 'Mot de passe' },
    { fait: securite.cles > 0, libelle: 'Clé d’accès' },
    { fait: gestion.statut === 'acceptee', libelle: 'Fonction vérifiée' },
  ]
  const faits = points.filter((p) => p.fait).length
  const manque = points.find((p) => !p.fait)
  const preuve =
    gestion.statut === 'acceptee'
      ? gestion.methode === 'domaine'
        ? 'Adresse sur le domaine de l’établissement'
        : 'Attestation de fonction vérifiée par l’équipe'
      : 'Attestation en cours d’examen'
  return (
    <CoqueEspace c={coque} actif="compte" titre="Compte et sécurité" sousTitre="Votre connexion à l’espace pro">
      <EnTeteEtab
        i={ShieldCheck}
        etiquette="Sécurité du compte"
        titre={!manque ? 'Votre compte est bien protégé' : manque.libelle === 'Clé d’accès' ? 'Ajoutez une clé d’accès' : `Encore une étape : ${manque.libelle.toLowerCase()}`}
        texte={
          manque?.libelle === 'Clé d’accès'
            ? 'Avec une clé d’accès, vous vous connectez avec Face ID, Touch ID ou le code de votre appareil : rien à retenir, et rien qu’un tiers puisse dérober. Votre mot de passe reste valable.'
            : 'Le compte qui gère la page d’un établissement mérite une protection solide : adresse vérifiée, mot de passe robuste, clé d’accès sur votre appareil.'
        }
        pct={Math.round((faits / points.length) * 100)}
        legende="protégé"
        gain={null}
        puces={points}
        progression={coque.progressionEtab!}
        q={t.q}
      />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Tuile className="lg:col-span-2">
          <TitreTuile
            i={Building2}
            droite={
              <Link href={chemin(`${ORGANISME}/etablissement/ajout/`)} className="inline-flex items-center gap-1 text-xs font-medium text-fg hover:underline">
                <Plus className="size-3.5" aria-hidden /> Ajouter un établissement
              </Link>
            }
          >
            Vos établissements
          </TitreTuile>
          <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {gestions
              .filter((g) => g.statut !== 'refusee')
              .map((g) => {
                const courant = g.slug === source.slug
                return (
                  <li key={g.id}>
                    <Link
                      href={chemin(`${ESPACE_ETAB}/?fiche=${encodeURIComponent(g.slug)}`)}
                      aria-current={courant ? 'page' : undefined}
                      className={`squircle-xl flex items-center gap-3 border p-3 transition-colors ${courant ? 'border-teal/40 bg-teal/5' : 'border-line hover:border-line-strong hover:bg-bg-soft'}`}
                    >
                      <span className={`squircle-lg grid size-9 shrink-0 place-items-center ${courant ? 'bg-teal text-white' : 'bg-bg-soft text-fg-2'}`}>
                        {courant ? <Check className="size-4" aria-hidden /> : <Building2 className="size-4" aria-hidden />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-fg">{g.titre}</span>
                        <span className="block text-xs text-fg-2">
                          {LIBELLE_TYPE[g.type]}
                          {courant ? ' · affiché' : ''}
                        </span>
                      </span>
                      <Statut s={g.statut === 'acceptee' ? 'publiee' : 'attente'} libelle={g.statut === 'acceptee' ? 'Vérifiée' : 'En vérification'} />
                      {!courant && <ArrowRight className="size-4 shrink-0 text-fg-2" aria-hidden />}
                    </Link>
                  </li>
                )
              })}
          </ul>
        </Tuile>
        <Tuile>
          <TitreTuile i={Mail}>Adresse électronique</TitreTuile>
          <p className="mt-4 text-sm text-fg">{compte.email}</p>
          <p className="mt-1 text-xs text-fg-2">Pour en changer, écrivez-nous depuis cette adresse : le changement passe par une vérification.</p>
        </Tuile>
        <Tuile>
          <TitreTuile i={Phone}>Téléphone</TitreTuile>
          <Telephone initial={compte.telephone} />
        </Tuile>
        <Tuile>
          <TitreTuile i={CreditCard}>Preuve de fonction</TitreTuile>
          <p className="mt-4 text-sm text-fg">{preuve}</p>
          <p className="mt-1 text-xs text-fg-2">Elle rattache la page à votre compte. Elle n’apparaît pas sur la page publique.</p>
        </Tuile>
        <Tuile>
          <TitreTuile i={KeyRound}>Mot de passe</TitreTuile>
          <MotDePasse />
        </Tuile>
        <Tuile>
          <TitreTuile i={Fingerprint}>Clés d’accès</TitreTuile>
          <ClesAcces />
        </Tuile>
        <Tuile>
          <TitreTuile i={Smartphone}>Appareils connectés</TitreTuile>
          <Appareils jetonCourant={session?.session.token ?? null} />
        </Tuile>
        <Tuile>
          <TitreTuile i={GraduationCap}>Proposer une formation</TitreTuile>
          <p className="mt-4 text-sm text-fg-2">
            {fac
              ? 'Vous proposez un diplôme universitaire (DU, DIU) ou une formation continue aux chirurgiens-dentistes ? Proposez-la : l’équipe la vérifie avant de la publier dans la rubrique des formations privées.'
              : 'Vous organisez une formation continue pour les prothésistes ou les cabinets ? Proposez-la : l’équipe la vérifie avant de la publier dans la rubrique des formations privées.'}
          </p>
          <Link href={chemin('/espace-pro/compte/formation/')} className="mt-3 inline-flex text-sm font-medium text-fg underline underline-offset-4 hover:no-underline">
            Proposer une formation
          </Link>
        </Tuile>
      </div>
    </CoqueEspace>
  )
}
