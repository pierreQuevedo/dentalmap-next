import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, ArrowRight, Bell, ChevronDown, Search } from 'lucide-react'
import { Encart, Etapes, FicheResume, Pictogramme, Puce, lien, pastille, pastilleInvalide, principal, saisie, secondaire, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { LIBELLE } from '@/lib/annuaire/libelles'
import { nomAffiche, type Profession } from '@/lib/annuaire/types'
import { REVENDIQUER } from '@/lib/espace-pro/chemins'
import { ouvrirFiche, poserAlerte } from '@/lib/espace-pro/actions-revendication'
import { chercherFiches } from '@/lib/espace-pro/parcours'
import { nettoyerRpps, ressembleRpps, rppsMasque, rppsValide } from '@/lib/espace-pro/rpps'
import { SurvolFiche } from '@/components/compte/survol-fiche'
import { RechercheDirecte } from '@/components/compte/recherche-directe'
import { CoquilleParcours, adresseDe, garde } from '../_commun'

export const metadata: Metadata = { title: 'Retrouvons votre fiche', robots: { index: false, follow: false } }
export const instant = false

/**
 * S1, H1, S1-0 : retrouver sa fiche sans Pro Santé Connect.
 *
 * Le formulaire part en GET vers cette même page, qui cherche côté serveur :
 * un résultat mène droit à « C'est bien vous ? », plusieurs ouvrent le choix
 * entre homonymes, aucun l'écran « Aucune fiche ne correspond ». Un numéro de
 * onze chiffres dont la clé est fausse est signalé avant toute recherche.
 */
const PROFESSIONS: { valeur: Profession; libelle: string }[] = [
  { valeur: 'dentiste', libelle: 'Chirurgien-dentiste' },
  { valeur: 'stomatologue', libelle: 'Stomatologue' },
  { valeur: 'maxillo_facial', libelle: 'Maxillo-facial' },
  { valeur: 'orl', libelle: 'ORL' },
]

type Params = { profession?: string; q?: string; mode?: string; resultats?: string; alerte?: string }

export default async function Page(props: { searchParams: Promise<Params> }) {
  const sp = await props.searchParams
  const profession = PROFESSIONS.find((p) => p.valeur === sp.profession)?.valeur ?? 'dentiste'
  const q = (sp.q ?? '').trim()
  const requete = new URLSearchParams({ profession, ...(q ? { q } : {}) }).toString()
  const ici = `${REVENDIQUER}/recherche/?${requete}`
  await garde(ici)

  const estNumero = ressembleRpps(q)
  const cleFausse = estNumero && !rppsValide(q)
  const { resultats, total, exact } = q && !cleFausse && sp.resultats !== 'aucun' ? await chercherFiches(profession, q) : { resultats: [], total: 0, exact: false }
  if (resultats.length === 1) redirect(chemin(`${REVENDIQUER}/${encodeURIComponent(resultats[0].slug)}/`))

  // S1-0 : rien ne correspond, ou aucune des fiches proposées n'est la bonne.
  if (q && !cleFausse && resultats.length === 0) {
    const rpps = estNumero ? nettoyerRpps(q) : null
    return (
      <CoquilleParcours
        recherche={q}
        encart={{ icone: 'sablier', ton: 'attention', titre: estNumero ? 'Aucune fiche pour ce numéro' : 'Aucune fiche pour ce nom', texte: 'L’Annuaire Santé est synchronisé chaque semaine.' }}
        retour={ici}
        libelleRetour="Modifier ma recherche"
      >
        <Etapes etape={2} libelle="Identification" />
        <Pictogramme icone={Search} />
        <h1 className={titre}>Aucune fiche ne correspond</h1>
        <p className="mt-2 text-sm text-fg-2">
          Rien pour « <span className="font-medium text-fg">{q}</span> ». Une installation récente n’apparaît qu’après la synchronisation hebdomadaire de
          l’Annuaire Santé.
        </p>
        {sp.alerte ? (
          <Encart titre="C’est noté" className="mt-6">
            Nous vous écrivons dès qu’une fiche portant ce numéro apparaît. Vous pourrez alors la revendiquer.
          </Encart>
        ) : rpps ? (
          <>
            <Encart titre="Vérifiez le numéro" className="mt-6">
              Un RPPS compte 11 chiffres. Le dernier est une clé de contrôle : une erreur de frappe est souvent détectée.
            </Encart>
            <form action={poserAlerte}>
              <input type="hidden" name="motif" value="fiche_creee" />
              <input type="hidden" name="rpps" value={rpps} />
              <input type="hidden" name="retour" value={`${ici}&resultats=aucun`} />
              <button type="submit" className={`${principal} mt-4`}>
                <Bell className="size-4" aria-hidden />
                M’avertir à la création
              </button>
            </form>
          </>
        ) : (
          <Encart titre="Cherchez par votre numéro RPPS" className="mt-6">
            Il figure sur votre carte CPS et sur votre attestation d’inscription à l’Ordre. Avec lui, nous pouvons aussi vous avertir quand votre fiche
            apparaît.
          </Encart>
        )}
        <Link href={chemin(`${REVENDIQUER}/recherche/?profession=${profession}&q=${encodeURIComponent(q)}&mode=modifier`)} className={`${secondaire} mt-3`}>
          Modifier ma recherche
        </Link>
        <Link href={chemin(`${REVENDIQUER}/ajout/?profession=${profession}${rpps ? `&rpps=${rpps}` : ''}`)} className="mt-4 block text-center text-sm font-medium text-fg underline underline-offset-4 hover:no-underline">
          Je viens de m’installer : demander l’ajout de ma fiche
        </Link>
      </CoquilleParcours>
    )
  }

  // H1 : plusieurs fiches correspondent. Vingt au plus, les plus proches de la saisie : au-delà, mieux vaut le RPPS.
  if (resultats.length > 1) {
    const plafond = total > resultats.length
    const titreH1 = exact ? 'C’est sans doute vous' : `${total} fiches correspondent`
    const carte = (r: (typeof resultats)[number], i: number) => (
      <SurvolFiche key={r.slug} index={i}>
        <label className="group squircle-xl relative flex cursor-pointer items-center border border-line bg-bg px-[18px] py-4 transition-colors hover:border-line-strong has-[:checked]:border-fg has-[:checked]:bg-bg-soft has-[:checked]:ring-[0.5px] has-[:checked]:ring-fg has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action">
          <input type="radio" name="fiche" value={r.slug} defaultChecked={i === 0} required className="sr-only" />
          <FicheResume profession={LIBELLE[r.profession].singulier.replace(/^./, (c) => c.toUpperCase())} nom={nomAffiche({ ...r, profession: r.profession })} adresse={adresseDe(r)} rpps={rppsMasque(r.rpps)}>
            <span aria-hidden className="size-5 shrink-0 rounded-full border border-line-strong bg-bg transition-[border-width,border-color] group-has-[:checked]:border-[6px] group-has-[:checked]:border-fg" />
          </FicheResume>
        </label>
      </SurvolFiche>
    )
    return (
      <CoquilleParcours
        praticiens={resultats}
        etiquette={exact ? 'Une fiche porte ce nom' : titreH1}
        recherche={q}
        retour={`${REVENDIQUER}/recherche/?profession=${profession}&q=${encodeURIComponent(q)}&mode=modifier`}
        libelleRetour="Nouvelle recherche"
      >
        <Etapes etape={2} libelle="Identification" />
        <h1 className={titre}>{titreH1}</h1>
        <p className="mt-2 text-sm text-fg-2">
          {exact
            ? `Une fiche porte exactement ce nom. Ce n’est pas vous ? ${total - 1} autre${total - 1 > 1 ? 's' : ''} ressemble${total - 1 > 1 ? 'nt' : ''} à votre saisie.`
            : plafond
              ? `Voici les ${resultats.length} plus proches de votre saisie. Choisissez la vôtre, ou précisez : prénom et nom, ou votre numéro RPPS.`
              : 'Choisissez la vôtre.'}
        </p>
        <form action={ouvrirFiche} className="mt-6">
          <fieldset>
            <legend className="sr-only">Votre fiche</legend>
            {exact ? (
              <div className="grid gap-2.5">
                {carte(resultats[0]!, 0)}
                <details className="group/autres">
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 py-2 text-sm font-medium text-fg-2 hover:text-fg">
                    <ChevronDown className="size-4 transition-transform group-open/autres:rotate-180" aria-hidden />
                    {plafond ? `Voir les ${resultats.length - 1} plus proches de votre saisie` : `Voir ${resultats.length - 1 > 1 ? `les ${resultats.length - 1} autres` : 'l’autre'}`}
                  </summary>
                  {/* Hauteur bornée : le haut de la page et les boutons restent visibles, la liste défile. */}
                  <div className="-mx-1 grid max-h-[min(36dvh,20rem)] gap-2.5 overflow-y-auto overscroll-contain px-1 py-1">{resultats.slice(1).map((r, i) => carte(r, i + 1))}</div>
                </details>
              </div>
            ) : (
              // Hauteur bornée : le haut de la page et les boutons restent visibles, la liste défile.
              <div className="-mx-1 grid max-h-[min(46dvh,26rem)] gap-2.5 overflow-y-auto overscroll-contain px-1 py-1">{resultats.map(carte)}</div>
            )}
          </fieldset>
          <button type="submit" className={`${principal} mt-4`}>
            C’est ma fiche
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </form>
        <div className="mt-1 flex items-center justify-between gap-3">
          <Link href={chemin(`${REVENDIQUER}/recherche/?profession=${profession}&q=${encodeURIComponent(q)}&mode=modifier`)} className="inline-flex h-11 items-center gap-1.5 text-sm font-medium text-fg-2 hover:text-fg">
            <ArrowLeft className="size-4" aria-hidden />
            Étape précédente
          </Link>
          <Link href={chemin(`${ici}&resultats=aucun`)} className="inline-flex h-11 items-center text-sm font-medium text-fg underline underline-offset-4 hover:no-underline">
            Aucune n’est la mienne
          </Link>
        </div>
      </CoquilleParcours>
    )
  }

  // S1 : le formulaire.
  const parNom = sp.mode === 'nom' || (q !== '' && !estNumero)
  return (
    <CoquilleParcours recherche={q} encart={{ icone: 'carte', titre: 'Votre numéro RPPS', texte: 'Sur votre carte CPS ou votre attestation d’inscription à l’Ordre.' }} retour={`${REVENDIQUER}/`} libelleRetour="Retour">
      <Etapes etape={2} libelle="Identification" />
      <h1 className={titre}>Retrouvons votre fiche</h1>
      <p className="mt-2 text-sm text-fg-2">Votre numéro RPPS est le plus sûr. Votre nom marche aussi.</p>
      <form method="get" action={chemin(`${REVENDIQUER}/recherche/`)} className="mt-6">
        <fieldset>
          <legend className="text-[11px] font-medium uppercase tracking-[0.08em] text-fg-2">Profession</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {PROFESSIONS.map((p) => (
              <Puce key={p.valeur} name="profession" value={p.valeur} defaultChecked={p.valeur === profession}>
                {p.libelle}
              </Puce>
            ))}
          </div>
        </fieldset>
        <div className="mt-5">
          <label htmlFor="recherche-q" className="mb-1.5 block text-sm font-medium text-fg">
            {parNom ? 'Votre nom' : 'Numéro RPPS ou nom'}
          </label>
          <div className={cleFausse ? pastilleInvalide : pastille}>
            <Search className="size-4 shrink-0 text-fg-2" aria-hidden />
            <input
              id="recherche-q"
              name="q"
              required
              minLength={2}
              autoFocus
              defaultValue={q}
              placeholder={parNom ? 'Marie Dupont' : '10003456789'}
              autoComplete={parNom ? 'name' : 'off'}
              inputMode={parNom ? 'text' : undefined}
              aria-invalid={cleFausse || undefined}
              aria-describedby="recherche-aide"
              className={`${saisie} ${parNom ? '' : 'font-mono'}`}
            />
          </div>
          <p id="recherche-aide" className={`mt-1.5 text-xs ${cleFausse ? 'text-destructive' : 'text-fg-2'}`}>
            {cleFausse
              ? 'Ce numéro ne passe pas le contrôle de clé : un chiffre est sans doute mal saisi.'
              : parNom
                ? 'Prénom et nom, comme à l’Ordre. Deux caractères au moins.'
                : '11 chiffres, sur votre carte CPS ou votre attestation d’inscription à l’Ordre.'}
          </p>
        </div>
        <RechercheDirecte champ="recherche-q" profession="profession" vers={`${REVENDIQUER}/`} />
        <button type="submit" className={`${principal} mt-5`}>
          <Search className="size-4" aria-hidden />
          Rechercher ma fiche
        </button>
      </form>
      {!parNom && (
        <p className="mt-4 text-center text-sm">
          <Link href={chemin(`${REVENDIQUER}/recherche/?profession=${profession}&mode=nom`)} className={lien}>
            Je n’ai pas mon RPPS sous la main
          </Link>
        </p>
      )}
    </CoquilleParcours>
  )
}
