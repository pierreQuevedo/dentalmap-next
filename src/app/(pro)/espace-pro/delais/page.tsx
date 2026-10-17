import type { Metadata } from 'next'
import { lireSaisie } from '@/lib/espace-pro/saisie'
import { CheckCircle2, Clock } from 'lucide-react'
import { Encart, principal } from '@/components/compte/ui'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { SaisieDelais } from '@/components/espace/saisie-delais'
import { enregistrerDelais, reconfirmer } from '@/lib/espace-pro/actions-fiche'
import { PIECES } from '@/lib/espace-pro/labo'
import { Caches, chargerLabo } from '../_labo'

export const metadata: Metadata = { title: 'Délais de fabrication', robots: { index: false, follow: false } }
export const instant = false

const date = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })

/** Les délais moyens par pièce, leur frise publique, et la reconfirmation tous les six mois. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string }> }) {
  const sp = await props.searchParams
  const t = await chargerLabo('delais', sp.fiche)
  const c = t.espace.completee
  const gardee = await lireSaisie('/espace-pro/delais/', sp.erreur)
  const delaisGardes = sp.erreur ? Object.fromEntries(PIECES.map((p) => [p.code, Number(gardee.texte(`delai_${p.code}`))]).filter(([, v]) => Number.isFinite(v) && (v as number) > 0)) : null
  const f = t.espace.fraicheur.find((x) => x.cle === 'delais')
  const delais = Object.entries(c?.delais ?? {})
  const max = Math.max(10, ...delais.map(([, j]) => j))
  const confirme = c?.delaisConfirmesLe ?? c?.majLe ?? null
  const echeance = confirme ? new Date(new Date(confirme).getTime() + 182 * 86_400_000) : null
  return (
    <CoqueEspace c={t.coque} actif="delais" titre="Délais de fabrication" sousTitre="Délais moyens en jours ouvrés, de la réception de l’empreinte à l’expédition">
      {f && confirme && (
        <div className={`squircle-2xl mb-4 flex flex-wrap items-center justify-between gap-3 border p-4 text-sm ${f.etat === 'a_jour' ? 'border-line bg-bg-soft text-fg' : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300'}`}>
          <span className="flex items-center gap-2">
            <Clock className="size-4" aria-hidden /> Confirmés le {date(confirme)}.{echeance && ` Reconfirmez avant le ${date(echeance.toISOString())} pour qu’ils gardent tous leurs points.`}
          </span>
          <form action={reconfirmer}>
            <Caches t={t} page="delais" />
            <input type="hidden" name="bloc" value="delais" />
            <button type="submit" className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover">
              <CheckCircle2 className="size-4" aria-hidden /> Reconfirmer sans changement
            </button>
          </form>
        </div>
      )}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <form action={enregistrerDelais} className="squircle-2xl border border-line bg-bg p-5">
          <Caches t={t} page="delais" />
          {sp.erreur && <Encart ton="erreur" className="mb-4">{sp.erreur}</Encart>}
          <SaisieDelais initiaux={delaisGardes && Object.keys(delaisGardes).length ? delaisGardes : (c?.delais ?? null)} />
          <button type="submit" className={`${principal} mt-5 w-auto px-6`}>
            Enregistrer les délais
          </button>
        </form>
        <Tuile>
          <TitreTuile i={Clock}>Sur la fiche</TitreTuile>
          {delais.length === 0 ? (
            <p className="mt-4 text-sm text-fg-2">Aucun délai publié.</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {delais.map(([code, j]) => (
                <li key={code}>
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="truncate text-fg">{PIECES.find((p) => p.code === code)?.libelle ?? code}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-fg">{j} j ouvrés</span>
                  </div>
                  <span className="mt-1.5 block h-2 rounded-full bg-line">
                    <span className="block h-full rounded-full bg-teal" style={{ width: `${(j / max) * 100}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-5 text-xs text-fg-2">Un délai moyen, pas un engagement : la fiche le dit aux cabinets. Sans reconfirmation pendant un an, les délais ne sont plus affichés.</p>
        </Tuile>
      </div>
    </CoqueEspace>
  )
}
