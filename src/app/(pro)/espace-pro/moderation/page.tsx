import type { Metadata } from 'next'
import { accepterRevendication, refuserRevendication, traiterDemandeCreation } from '@/lib/tunnel/actions'
import { exigerModerateur, getDemandesCreationEnAttente, getRevendicationsEnAttente } from '@/lib/tunnel/compte'
import { MOTIFS_REFUS } from '@/lib/espace-pro/chemins'
import { deciderAttestation, traiterAjoutEtablissement } from '@/lib/espace-pro/actions-etablissement'
import { getModerationEtablissements } from '@/lib/espace-pro/etablissement-donnees'
import { accepterFormation, publierFormation, refuserFormation, verifierMention } from '@/lib/formation/actions-privee'
import { getPropositionsAModerer } from '@/lib/formation/privee-donnees'
import { nomRegion, SOURCES_VERIFICATION } from '@/lib/formation/privee'
import { deciderSignalementAvis } from '@/lib/formation/actions-avis'
import { MOTIFS_SIGNALEMENT, libelleLien } from '@/lib/formation/avis'
import { getAvisSignales } from '@/lib/formation/avis-donnees'

export const metadata: Metadata = { title: 'Modération', robots: { index: false, follow: false } }
export const instant = false

/**
 * File de modération : revendications manuelles et demandes de création,
 * les plus anciennes d'abord. Réservée aux adresses de `MODERATEURS`.
 * Squelette sans mise en page.
 */
export default async function Page() {
  await exigerModerateur('/espace-pro/moderation/')
  const [revendications, creations, etab, formations, avisSignales] = await Promise.all([getRevendicationsEnAttente(), getDemandesCreationEnAttente(), getModerationEtablissements(), getPropositionsAModerer(), getAvisSignales()])

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Modération</h1>

      <h2 className="mt-8 text-lg font-semibold text-fg">Revendications en attente ({revendications.length})</h2>
      <ol className="mt-3 space-y-4">
        {revendications.map((r) => (
          <li key={r.id} className="rounded-xl border border-line p-4">
            <p className="font-medium text-fg">
              {[r.fiche.prenom, r.fiche.nom].filter(Boolean).join(' ') || r.fiche.raisonSociale} · {r.fiche.communeNom ?? 'commune inconnue'}
            </p>
            <p className="text-sm text-fg-2">
              {r.fiche.profession}, RPPS {r.fiche.rpps ?? '—'}, SIRET {r.fiche.siret ?? '—'} · demandé par {r.compteNom} ({r.compteEmail}) le{' '}
              {new Date(r.demandeLe).toLocaleDateString('fr-FR')}
            </p>
            <p className="mt-1 text-sm text-fg">
              {r.objet === 'retrait' ? 'Retrait de la fiche' : r.contestation ? 'Contestation : fiche déjà gérée par un autre compte' : 'Revendication'} ·{' '}
              {r.methode === 'justificatif' ? 'justificatif' : r.methode === 'pro_sante_connect' ? 'Pro Santé Connect' : 'demande manuelle'}
            </p>
            {r.justificatifNom && (
              <a href={`/api/espace-pro/justificatif/${r.id}/`} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-fg underline">
                Ouvrir le justificatif : {r.justificatifNom}
              </a>
            )}
            {r.roleLabo && (
              <p className="mt-1 text-sm text-fg">
                Rôle déclaré : {r.roleLabo === 'gerant' ? 'gérant ou dirigeant' : r.roleLabo === 'mandate' ? `salarié mandaté, gérant : ${r.gerantEmail ?? '?'}` : r.roleLabo}
              </p>
            )}
            {r.mandatNom && (
              <a href={`/api/espace-pro/justificatif/${r.id}/?doc=mandat`} target="_blank" rel="noreferrer" className="mt-1 block text-sm text-fg underline">
                Ouvrir le mandat : {r.mandatNom}
              </a>
            )}
            {r.message && <p className="mt-2 whitespace-pre-line text-sm text-fg">{r.message}</p>}
            <div className="mt-3 flex flex-wrap gap-3">
              <form action={accepterRevendication}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="rounded-full bg-action px-4 py-2 text-sm font-medium text-action-foreground">Accepter</button>
              </form>
              <form action={refuserRevendication} className="flex flex-wrap gap-2">
                <input type="hidden" name="id" value={r.id} />
                <select name="motif" className="rounded-md border border-line px-3 py-2 text-sm">
                  {MOTIFS_REFUS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
                <input name="commentaire" placeholder="Commentaire pour le praticien" className="rounded-md border border-line px-3 py-2 text-sm" />
                <button type="submit" className="rounded-full border border-line px-4 py-2 text-sm font-medium text-fg">Refuser</button>
              </form>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-10 text-lg font-semibold text-fg">Demandes de création de fiche ({creations.length})</h2>
      <ol className="mt-3 space-y-4">
        {creations.map((d) => (
          <li key={d.id} className="rounded-xl border border-line p-4">
            <p className="font-medium text-fg">
              {[d.prenom, d.nom].filter(Boolean).join(' ')} {d.raisonSociale && `· ${d.raisonSociale}`}
            </p>
            <p className="text-sm text-fg-2">
              {d.profession}, RPPS {d.rpps ?? '—'}, SIRET {d.siret ?? '—'} · {d.adresse}, {d.codePostal} {d.ville} · {d.telephone ?? ''} {d.email ?? ''} · compte {d.compteEmail}
            </p>
            {d.message && <p className="mt-2 whitespace-pre-line text-sm text-fg">{d.message}</p>}
            {d.justificatifNom && (
              <a href={`/api/espace-pro/justificatif/${d.id}/?doc=creation`} target="_blank" rel="noreferrer" className="mt-1 block text-sm text-fg underline">
                Ouvrir le Kbis : {d.justificatifNom}
              </a>
            )}
            <form action={traiterDemandeCreation} className="mt-3 flex flex-wrap gap-2">
              <input type="hidden" name="id" value={d.id} />
              <input name="slug" placeholder="Slug de la fiche créée (facultatif)" className="rounded-md border border-line px-3 py-2 text-sm" />
              <button type="submit" name="decision" value="acceptee" className="rounded-full bg-action px-4 py-2 text-sm font-medium text-action-foreground">Fiche créée</button>
              <button type="submit" name="decision" value="refusee" className="rounded-full border border-line px-4 py-2 text-sm font-medium text-fg">Refuser</button>
            </form>
          </li>
        ))}
      </ol>

      <h2 className="mt-10 text-lg font-semibold text-fg">Attestations de fonction, établissements ({etab.attestations.length})</h2>
      <ol className="mt-3 space-y-4">
        {etab.attestations.map((a) => (
          <li key={a.id} className="rounded-xl border border-line p-4">
            <p className="font-medium text-fg">{a.titre}</p>
            <p className="text-sm text-fg-2">
              Demandé par {a.compteNom} ({a.compteEmail}) le {new Date(a.demandeLe).toLocaleDateString('fr-FR')} · domaine attendu : {a.domaine ?? 'inconnu'}
            </p>
            {a.justificatifNom && (
              <a href={`/api/espace-pro/justificatif/${a.id}/?doc=attestation`} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-fg underline">
                Ouvrir l’attestation : {a.justificatifNom}
              </a>
            )}
            <form action={deciderAttestation} className="mt-3 flex flex-wrap gap-2">
              <input type="hidden" name="id" value={a.id} />
              <input name="motif" placeholder="Motif en cas de refus" className="rounded-md border border-line px-3 py-2 text-sm" />
              <button type="submit" name="decision" value="acceptee" className="rounded-full bg-action px-4 py-2 text-sm font-medium text-action-foreground">Accepter</button>
              <button type="submit" name="decision" value="refusee" className="rounded-full border border-line px-4 py-2 text-sm font-medium text-fg">Refuser</button>
            </form>
          </li>
        ))}
      </ol>

      <h2 className="mt-10 text-lg font-semibold text-fg">Établissements à ajouter ({etab.ajouts.length})</h2>
      <ol className="mt-3 space-y-4">
        {etab.ajouts.map((d) => (
          <li key={d.id} className="rounded-xl border border-line p-4">
            <p className="font-medium text-fg">{d.nom}</p>
            <p className="text-sm text-fg-2">
              UAI {d.uai} · {d.ville} · compte {d.compteEmail} · le {new Date(d.demandeLe).toLocaleDateString('fr-FR')}
            </p>
            <form action={traiterAjoutEtablissement} className="mt-3 flex flex-wrap gap-2">
              <input type="hidden" name="id" value={d.id} />
              <button type="submit" name="decision" value="acceptee" className="rounded-full bg-action px-4 py-2 text-sm font-medium text-action-foreground">Page créée</button>
              <button type="submit" name="decision" value="refusee" className="rounded-full border border-line px-4 py-2 text-sm font-medium text-fg">Refuser</button>
            </form>
          </li>
        ))}
      </ol>

      <h2 className="mt-10 text-lg font-semibold text-fg">Formations proposées ({formations.length})</h2>
      <ol className="mt-3 space-y-4">
        {formations.map((f) => (
          <li key={f.id} className="rounded-xl border border-line p-4">
            <p className="font-medium text-fg">
              {f.d.intitule} {f.statut === 'acceptee' && <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Acceptée, à publier</span>}
            </p>
            <p className="text-sm text-fg-2">
              {f.d.organisme}
              {f.d.siren ? `, SIREN ${f.d.siren}` : ''} · {f.d.theme} · {f.d.publics.join(', ')} · {f.d.format}, {f.d.duree}
              {f.d.tarif ? ` · ${f.d.tarif}` : ''} · proposé par {f.compteNom} ({f.compteEmail}) le {new Date(f.demandeLe).toLocaleDateString('fr-FR')}
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-fg">
              {f.d.sessions.map((s, i) => (
                <li key={i}>
                  {s.dates} · {s.ville ?? nomRegion(s.region)}
                  {s.places ? ` · ${s.places} places` : ''}
                </li>
              ))}
            </ul>
            <p className="mt-1 text-sm">
              <a href={f.d.lienInscription} target="_blank" rel="noreferrer" className="text-fg underline">Lien d’inscription</a>
              {f.d.siteOrganisme && (
                <>
                  {' · '}
                  <a href={f.d.siteOrganisme} target="_blank" rel="noreferrer" className="text-fg underline">Site de l’organisme</a>
                </>
              )}
            </p>
            {f.d.priseEnCharge.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {f.d.priseEnCharge.map((m) => (
                  <form key={m} action={verifierMention}>
                    <input type="hidden" name="id" value={f.id} />
                    <input type="hidden" name="mention" value={m} />
                    <button type="submit" title={f.verifications[m] ? 'Retirer la vérification' : `Vérifié sur la ${SOURCES_VERIFICATION[m]}`} className={`rounded-full border px-3 py-1 text-xs font-medium ${f.verifications[m] ? 'border-teal bg-teal/10 text-teal' : 'border-line text-fg'}`}>
                      {m} : {f.verifications[m] ? 'vérifié' : 'déclaré, vérifier'}
                    </button>
                  </form>
                ))}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-3">
              {f.statut === 'en_attente' ? (
                <form action={accepterFormation}>
                  <input type="hidden" name="id" value={f.id} />
                  <button type="submit" className="rounded-full bg-action px-4 py-2 text-sm font-medium text-action-foreground">Accepter</button>
                </form>
              ) : (
                <form action={publierFormation} className="flex flex-wrap gap-2">
                  <input type="hidden" name="id" value={f.id} />
                  <input name="slug" required placeholder="Slug de l’article WordPress créé" className="rounded-md border border-line px-3 py-2 text-sm" />
                  <button type="submit" className="rounded-full bg-action px-4 py-2 text-sm font-medium text-action-foreground">Mettre en ligne</button>
                </form>
              )}
              <form action={refuserFormation} className="flex flex-wrap gap-2">
                <input type="hidden" name="id" value={f.id} />
                <input name="motif" placeholder="Motif du refus" className="rounded-md border border-line px-3 py-2 text-sm" />
                <button type="submit" className="rounded-full border border-line px-4 py-2 text-sm font-medium text-fg">Refuser</button>
              </form>
            </div>
          </li>
        ))}
      </ol>

      <h2 id="avis" className="mt-10 scroll-mt-6 text-lg font-semibold text-fg">Avis signalés ({avisSignales.length})</h2>
      <p className="mt-1 text-sm text-fg-2">Un avis n’est jamais retiré pour sa note ou parce qu’il est négatif : seulement s’il est injurieux, faux, vise une personne ou est hors sujet.</p>
      <ol className="mt-3 space-y-4">
        {avisSignales.map((a) => (
          <li key={a.id} className="rounded-xl border border-line p-4">
            <p className="text-sm text-fg-2">
              {a.slug} · {a.note}/5 · {a.auteur}, {libelleLien(a.lien)} · {new Date(a.creeLe).toLocaleDateString('fr-FR')}
            </p>
            <p className="mt-2 whitespace-pre-line text-sm text-fg">{a.texte}</p>
            <ul className="mt-2 space-y-1 text-sm text-fg-2">
              {a.signalements.map((s, i) => (
                <li key={i}>
                  {s.parEtablissement ? 'Établissement' : 'Lecteur'} : {MOTIFS_SIGNALEMENT.find((m) => m.cle === s.motif)?.libelle ?? s.motif}
                  {s.detail ? ` · « ${s.detail} »` : ''}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-3">
              <form action={deciderSignalementAvis}>
                <input type="hidden" name="avis" value={a.id} />
                <input type="hidden" name="decision" value="maintenir" />
                <button type="submit" className="rounded-full bg-action px-4 py-2 text-sm font-medium text-action-foreground">Maintenir l’avis</button>
              </form>
              <form action={deciderSignalementAvis} className="flex flex-wrap gap-2">
                <input type="hidden" name="avis" value={a.id} />
                <input type="hidden" name="decision" value="retirer" />
                <input name="motif" required placeholder="Motif du retrait" className="rounded-md border border-line px-3 py-2 text-sm" />
                <button type="submit" className="rounded-full border border-line px-4 py-2 text-sm font-medium text-fg">Retirer</button>
              </form>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-sm text-fg-2">Liste d’attente de la formation continue : {etab.listeAttente} organisme{etab.listeAttente > 1 ? 's' : ''} inscrit{etab.listeAttente > 1 ? 's' : ''}.</p>
    </main>
  )
}
