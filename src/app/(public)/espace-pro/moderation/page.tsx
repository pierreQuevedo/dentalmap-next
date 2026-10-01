import type { Metadata } from 'next'
import { accepterRevendication, refuserRevendication, traiterDemandeCreation } from '@/lib/tunnel/actions'
import { exigerModerateur, getDemandesCreationEnAttente, getRevendicationsEnAttente } from '@/lib/tunnel/compte'

export const metadata: Metadata = { title: 'Modération', robots: { index: false, follow: false } }
export const instant = false

/**
 * File de modération : revendications manuelles et demandes de création,
 * les plus anciennes d'abord. Réservée aux adresses de `MODERATEURS`.
 * Squelette sans mise en page.
 */
export default async function Page() {
  await exigerModerateur('/espace-pro/moderation/')
  const [revendications, creations] = await Promise.all([getRevendicationsEnAttente(), getDemandesCreationEnAttente()])

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
            {r.message && <p className="mt-2 whitespace-pre-line text-sm text-fg">{r.message}</p>}
            <div className="mt-3 flex flex-wrap gap-3">
              <form action={accepterRevendication}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="rounded-full bg-action px-4 py-2 text-sm font-medium text-action-foreground">Accepter</button>
              </form>
              <form action={refuserRevendication} className="flex gap-2">
                <input type="hidden" name="id" value={r.id} />
                <input name="motif" placeholder="Motif du refus" className="rounded-md border border-line px-3 py-2 text-sm" />
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
            <form action={traiterDemandeCreation} className="mt-3 flex flex-wrap gap-2">
              <input type="hidden" name="id" value={d.id} />
              <input name="slug" placeholder="Slug de la fiche créée (facultatif)" className="rounded-md border border-line px-3 py-2 text-sm" />
              <button type="submit" name="decision" value="acceptee" className="rounded-full bg-action px-4 py-2 text-sm font-medium text-action-foreground">Fiche créée</button>
              <button type="submit" name="decision" value="refusee" className="rounded-full border border-line px-4 py-2 text-sm font-medium text-fg">Refuser</button>
            </form>
          </li>
        ))}
      </ol>
    </main>
  )
}
