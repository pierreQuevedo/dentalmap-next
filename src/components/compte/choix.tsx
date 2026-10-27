'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { upload } from '@vercel/blob/client'
import { ArrowRight, Check, CreditCard, ExternalLink, FileText, IdCard, MapPin, MessageCircle, Phone, Search, Send, Upload, UserRound, X, type LucideIcon } from 'lucide-react'
import { enregistrerTelephone } from '@/lib/tunnel/telephone'
import { CarteOption, discret, pastille, principal, saisie } from './ui'

/**
 * Les choix interactifs du parcours de revendication.
 *
 * Les pages sont des composants serveur ; seuls ces morceaux ont un état : le
 * bouton principal qui dit ce que l'option cochée va faire, le dépôt d'un
 * document, la sélection des lieux.
 */
const ICONES = { carte: CreditCard, recherche: Search, courrier: Send, document: FileText, identite: IdCard, equipe: MessageCircle, personne: UserRound } satisfies Record<string, LucideIcon>

export type Voie = {
  valeur: string
  titre: string
  detail: string
  icone: keyof typeof ICONES
  badge?: string
  desactivee?: boolean
  /** Le libellé du bouton quand cette voie est cochée, et où il mène. */
  bouton: string
  href: string
  /** Une ligne sous le bouton, quand cette voie est cochée. */
  note?: string
}

/**
 * Des cartes d'option, un seul choix, et un bouton qui suit le choix.
 *
 * Les adresses peuvent sortir de l'application (Pro Santé Connect passe par
 * une route d'API) : le bouton est un vrai lien, sans routeur.
 */
export function ChoixVoies({ voies, defaut, secondaire }: { voies: Voie[]; defaut?: string; secondaire?: { libelle: string; href: string } }) {
  const premiere = voies.find((v) => !v.desactivee)
  const [choix, setChoix] = useState(defaut && voies.some((v) => v.valeur === defaut && !v.desactivee) ? defaut : premiere?.valeur)
  const voie = voies.find((v) => v.valeur === choix) ?? premiere
  const Icone = voie?.href.startsWith('/api/') ? ExternalLink : null
  return (
    <div>
      <fieldset>
        <legend className="sr-only">Votre choix</legend>
        <div className="grid gap-2.5">
          {voies.map((v) => (
            <CarteOption
              key={v.valeur}
              name="voie"
              value={v.valeur}
              titre={v.titre}
              detail={v.detail}
              icone={ICONES[v.icone]}
              badge={v.badge}
              disabled={v.desactivee}
              checked={choix === v.valeur}
              onChange={() => setChoix(v.valeur)}
            />
          ))}
        </div>
      </fieldset>
      {voie && (
        <a href={voie.href} className={`${principal} mt-4`}>
          {Icone && <Icone className="size-4" aria-hidden />}
          {voie.bouton}
          {!Icone && <ArrowRight className="size-4" aria-hidden />}
        </a>
      )}
      {voie?.note && <p className="mt-3 text-center text-xs text-fg-2">{voie.note}</p>}
      {secondaire && (
        <Link href={secondaire.href as never} className={`${discret} mt-1`}>
          {secondaire.libelle}
        </Link>
      )}
    </div>
  )
}

/** « 412 Ko », « 1,2 Mo ». */
function taille(octets: number): string {
  if (octets < 1024 * 1024) return `${Math.max(1, Math.round(octets / 1024))} Ko`
  return `${(octets / 1024 / 1024).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo`
}

const TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX = 10 * 1024 * 1024

/**
 * JD1, L3, MAN : la zone de dépôt, un emplacement par document attendu.
 *
 * On y glisse le fichier, ou on le choisit. Le contrôle de type et de taille
 * est fait ici pour répondre tout de suite, et refait côté serveur. Chaque
 * fichier choisi s'affiche sous sa zone, avec de quoi le retirer.
 */
export type Emplacement = {
  nom: string
  /** Ce que dit la zone vide : une consigne (« Glissez… ») ou le nom du document. */
  titre: string
  detail?: string
  /** Le nom du document, sous le fichier choisi. Par défaut, le titre s'il n'est pas une consigne. */
  document?: string
}

/** Une consigne d'action ne nomme pas le document : on ne la répète pas sous le fichier choisi. */
const nomDocument = (e: Emplacement) => e.document ?? (/^(glissez|déposez|choisissez)/i.test(e.titre) ? 'Prêt à l’envoi' : e.titre)

function Zone({ e, fichier, onFichier, onRetirer, pdfSeul = false }: { e: Emplacement; fichier: File | null; onFichier: (f: File) => void; onRetirer: () => void; pdfSeul?: boolean }) {
  const [survol, setSurvol] = useState(false)
  if (fichier) {
    return (
      <div className="squircle-xl flex items-center gap-3 border border-line bg-bg px-4 py-3">
        <FileText className="size-4 shrink-0 text-fg" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-fg">{fichier.name}</p>
          <p className="text-xs text-teal">
            {nomDocument(e)} · {fichier.type === 'application/pdf' ? 'PDF' : fichier.type === 'image/png' ? 'PNG' : 'JPG'} · {taille(fichier.size)}
          </p>
        </div>
        <button type="button" onClick={onRetirer} aria-label={`Retirer ${fichier.name}`} className="grid size-8 cursor-pointer place-items-center rounded-full text-fg-2 hover:bg-bg-soft hover:text-fg">
          <X className="size-4" aria-hidden />
        </button>
      </div>
    )
  }
  return (
    <label
      onDragOver={(ev) => {
        ev.preventDefault()
        setSurvol(true)
      }}
      onDragLeave={() => setSurvol(false)}
      onDrop={(ev) => {
        ev.preventDefault()
        setSurvol(false)
        if (ev.dataTransfer.files[0]) onFichier(ev.dataTransfer.files[0])
      }}
      className={`squircle-xl flex cursor-pointer flex-col items-center border border-dashed px-6 py-7 text-center transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-action ${
        survol ? 'border-teal bg-teal/5' : 'border-line-strong bg-bg-soft/60 hover:border-fg-2'
      }`}
    >
      <span className="grid size-10 place-items-center rounded-full border border-line bg-bg text-fg">
        <Upload className="size-4" aria-hidden />
      </span>
      <span className="mt-3 text-sm font-semibold text-fg">{e.titre}</span>
      <span className="mt-1 text-xs text-fg-2">{e.detail ?? 'Glissez le fichier ici, ou choisissez-le · PDF, JPG ou PNG, 10 Mo au plus'}</span>
      <input type="file" accept={pdfSeul ? '.pdf,application/pdf' : '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png'} className="sr-only" onChange={(ev) => ev.target.files?.[0] && onFichier(ev.target.files[0])} />
    </label>
  )
}

export function DepotJustificatif({
  action,
  champsCaches,
  avant,
  apres,
  dossier,
  direct,
  erreurInitiale,
  emplacements = [{ nom: 'document', titre: 'Glissez votre fichier ici', detail: 'ou choisissez-le · PDF, JPG ou PNG, 10 Mo au plus', document: 'Justificatif' }],
  libelle = 'Envoyer le justificatif',
  pdfSeul = false,
  defilant = false,
  telephone,
}: {
  action: (d: FormData) => Promise<void>
  champsCaches: Record<string, string>
  /** Ce qui vient entre les zones et le bouton : un encart, un champ. */
  apres: React.ReactNode
  /** Ce qui vient avant les zones. */
  avant?: React.ReactNode
  /** Dossier de stockage de la fiche : `justificatifs/<id>`. */
  dossier: string
  /** Téléversement direct vers le stockage privé (production). Sinon, les fichiers partent avec le formulaire. */
  direct: boolean
  erreurInitiale?: string
  emplacements?: Emplacement[]
  libelle?: string
  /** Seul le PDF est accepté (demande à l'équipe d'un soignant). */
  pdfSeul?: boolean
  /** Hauteur bornée : le contenu défile, le bouton d'envoi reste visible sous lui. */
  defilant?: boolean
  /** Le numéro déjà donné par le compte : le champ, obligatoire, part prérempli. */
  telephone: string | null
}) {
  const [fichiers, setFichiers] = useState<Record<string, File | null>>({})
  const [erreur, setErreur] = useState<string | null>(erreurInitiale ?? null)
  const [envoi, setEnvoi] = useState(false)
  const complet = emplacements.every((e) => fichiers[e.nom])

  const prendre = (nom: string, f: File) => {
    setErreur(null)
    if (pdfSeul ? f.type !== 'application/pdf' : !TYPES.includes(f.type)) return setErreur(pdfSeul ? 'Le document doit être un PDF.' : 'Le document doit être un PDF, un JPG ou un PNG.')
    if (f.size > MAX) return setErreur('Le document dépasse 10 Mo.')
    setFichiers((x) => ({ ...x, [nom]: f }))
  }

  /*
   * En production, chaque fichier part d'abord vers le stockage, puis
   * l'action reçoit chemins, noms et tailles : une fonction Vercel refuse
   * plus de 4,5 Mo de corps. Sans stockage, les fichiers partent avec le
   * formulaire.
   */
  const soumettre = async (donnees: FormData) => {
    setEnvoi(true)
    setErreur(null)
    try {
      // Le numéro passe avant les fichiers : refusé, rien n'est envoyé.
      const tel = await enregistrerTelephone(String(donnees.get('telephone') ?? ''), { obligatoire: true })
      if (tel.erreur) {
        setErreur(tel.erreur)
        setEnvoi(false)
        return
      }
      for (const e of emplacements) {
        const f = fichiers[e.nom]
        if (!f) continue
        if (direct) {
          // Un seul point, devant l'extension : le stockage n'accepte que `justificatifs/<dossier>/<nom>.<ext>`.
          const extension = (/\.([a-z0-9]+)$/i.exec(f.name)?.[1] ?? 'pdf').toLowerCase()
          const nom = `${f.name.replace(/\.[^.]*$/, '').replace(/[^\w-]+/g, '-').slice(-70) || 'justificatif'}.${extension}`
          const blob = await upload(`${dossier}/${nom}`, f, { access: 'private', handleUploadUrl: '/api/espace-pro/justificatif/televerser/', contentType: f.type })
          donnees.set(`chemin_${e.nom}`, blob.pathname)
        } else {
          donnees.set(e.nom, f)
        }
        donnees.set(`nom_${e.nom}`, f.name)
        donnees.set(`taille_${e.nom}`, String(f.size))
      }
      await action(donnees)
    } catch (ex) {
      // `redirect` lancé par l'action traverse ce bloc : on le laisse passer.
      if (ex && typeof ex === 'object' && 'digest' in ex) throw ex
      setErreur('Le document n’a pas pu être envoyé. Réessayez.')
      setEnvoi(false)
    }
  }

  return (
    <form action={soumettre}>
      {Object.entries(champsCaches).map(([n, v]) => (
        <input key={n} type="hidden" name={n} value={v} />
      ))}
      <div className={defilant ? '-mx-1 max-h-[min(46dvh,26rem)] overflow-y-auto overscroll-contain px-1 py-1' : undefined}>
        {avant}
        <div className="space-y-3">
          {emplacements.map((e) => (
            <Zone key={e.nom} e={e} pdfSeul={pdfSeul} fichier={fichiers[e.nom] ?? null} onFichier={(f) => prendre(e.nom, f)} onRetirer={() => setFichiers((x) => ({ ...x, [e.nom]: null }))} />
          ))}
        </div>
        <ChampTelephone defaut={telephone} />
        {apres}
      </div>
      {/* Hors de la zone qui défile : l'erreur reste visible au-dessus du bouton. */}
      {erreur && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {erreur}
        </p>
      )}
      <Envoyer libelle={envoi ? 'Envoi…' : libelle} desactive={!complet || envoi} />
    </form>
  )
}

/**
 * Le numéro de contact qui accompagne un justificatif : l'équipe appelle si
 * le document demande une vérification complémentaire. Jamais publié.
 */
function ChampTelephone({ defaut }: { defaut: string | null }) {
  return (
    <div className="mt-4">
      <label htmlFor="justificatif-telephone" className="mb-1.5 block text-sm font-medium text-fg">
        Téléphone
      </label>
      <div className={pastille}>
        <Phone className="size-4 shrink-0 text-fg-2" aria-hidden />
        <input
          id="justificatif-telephone"
          type="tel"
          name="telephone"
          required
          autoComplete="tel"
          defaultValue={defaut ?? ''}
          placeholder="06 12 34 56 78"
          aria-describedby="justificatif-telephone-aide"
          className={saisie}
        />
      </div>
      <p id="justificatif-telephone-aide" className="mt-1.5 text-xs text-fg-2">
        Pour vous joindre si le document demande une vérification complémentaire. Ce numéro reste confidentiel : il n’est jamais publié sur le site.
      </p>
    </div>
  )
}

function Envoyer({ libelle, desactive }: { libelle: string; desactive?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={desactive || pending} className={`${principal} mt-4`}>
      {pending ? 'Envoi…' : libelle}
      {!pending && <ArrowRight className="size-4" aria-hidden />}
    </button>
  )
}

/**
 * M1 : les lieux à gérer, cases à cocher. Tous cochés au départ ; le bouton dit
 * combien seront gérés, et refuse zéro.
 */
export function ChoixLieux({
  action,
  fiche,
  lieux,
}: {
  action: (d: FormData) => Promise<void>
  fiche: string
  lieux: { id: string; titre: string; detail: string; principal: boolean }[]
}) {
  const [choisis, setChoisis] = useState(() => new Set(lieux.map((l) => l.id)))
  const basculer = (id: string) =>
    setChoisis((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  return (
    <form action={action}>
      <input type="hidden" name="fiche" value={fiche} />
      <fieldset>
        <legend className="sr-only">Vos lieux d’exercice</legend>
        <div className="grid gap-2.5">
          {lieux.map((l) => (
            <label
              key={l.id}
              className="group squircle-xl flex cursor-pointer items-center gap-3.5 border border-line bg-bg px-[18px] py-4 transition-colors hover:border-line-strong has-[:checked]:border-fg has-[:checked]:bg-bg-soft has-[:checked]:ring-[0.5px] has-[:checked]:ring-fg has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action"
            >
              <input type="checkbox" name="lieu" value={l.id} checked={choisis.has(l.id)} onChange={() => basculer(l.id)} className="sr-only" />
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-bg-soft text-fg-2">
                <MapPin className="size-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold leading-snug text-fg">{l.titre}</span>
                <span className="mt-0.5 block text-xs text-fg-2">{l.detail}</span>
                {l.principal && <span className="mt-0.5 block text-[11px] text-fg-2">Lieu principal</span>}
              </span>
              <span aria-hidden className="grid size-5 shrink-0 place-items-center rounded-md border border-line-strong bg-bg text-bg group-has-[:checked]:border-fg group-has-[:checked]:bg-fg">
                <Check className="size-3.5" />
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Envoyer libelle={choisis.size > 1 ? `Gérer ces ${choisis.size} lieux` : choisis.size === 1 ? 'Gérer ce lieu' : 'Choisissez au moins un lieu'} desactive={choisis.size === 0} />
    </form>
  )
}
