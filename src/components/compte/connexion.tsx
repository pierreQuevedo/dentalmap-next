'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { ArrowRight, BadgeCheck, Building2, Check, Clock, KeyRound, Lock, Mail, ShieldCheck, Stethoscope, User, UserRound } from 'lucide-react'
import { signIn } from '@/lib/auth-client'
import { chemin } from '@/lib/navigation'
import { etatCompte } from '@/lib/tunnel/actions'
import type { Role } from '@/lib/tunnel/etapes'

/**
 * Le flux de connexion, en un seul écran qui change d'état.
 *
 * 1. l'adresse ; 2a. compte connu : lien magique, ou mot de passe pour qui
 * en a un ; 2b. nouveau compte : qui êtes-vous, puis le nom ; 3. le lien est
 * parti ; 5. le lien était expiré ou invalide. Le retour du lien (4) n'a pas
 * d'écran : la session s'ouvre et la page de retour s'affiche.
 *
 * Les champs reprennent la pastille de la recherche de l'accueil, icône à
 * gauche et bouton rond à droite : c'est le geste du site. Chaque état
 * entre en fondu, et un fil d'étapes dit où l'on en est.
 *
 * Un nouveau compte part avec son nom et son rôle : le nom est créé avec le
 * compte par le lien, le rôle est porté dans l'URL d'arrivée, que la page de
 * profil enregistre sans rien redemander.
 *
 * `apercu` affiche des onglets pour passer d'un état à l'autre sans rien
 * envoyer : pour vérifier chaque rendu.
 */
export type Etat = 'email' | 'connu' | 'motdepasse' | 'nouveau' | 'envoye' | 'expire'

const ETATS: { cle: Etat; libelle: string }[] = [
  { cle: 'email', libelle: 'Adresse' },
  { cle: 'connu', libelle: 'Compte connu' },
  { cle: 'motdepasse', libelle: 'Mot de passe' },
  { cle: 'nouveau', libelle: 'Nouveau compte' },
  { cle: 'envoye', libelle: 'Lien envoyé' },
  { cle: 'expire', libelle: 'Lien expiré' },
]

const PROFILS: { role: Role; titre: string; detail: string; icone: typeof User }[] = [
  { role: 'patient', titre: 'Patient', detail: 'Je cherche un professionnel', icone: UserRound },
  { role: 'dentiste', titre: 'Chirurgien-dentiste', detail: 'Je gère ma fiche', icone: Stethoscope },
  { role: 'prothesiste', titre: 'Laboratoire', detail: 'Prothèse dentaire', icone: Building2 },
  { role: 'medecin', titre: 'Médecin', detail: 'Maxillo-facial, stomatologue, ORL', icone: User },
]

/** Le fil d'étapes de chaque état : le chemin parcouru, l'étape en cours, ce qui reste. */
const FIL: Record<Etat, { etapes: string[]; courante: number }> = {
  email: { etapes: ['Adresse', 'Vérification', 'Connecté'], courante: 0 },
  connu: { etapes: ['Adresse', 'Vérification', 'Connecté'], courante: 1 },
  motdepasse: { etapes: ['Adresse', 'Mot de passe', 'Connecté'], courante: 1 },
  nouveau: { etapes: ['Adresse', 'Profil', 'Vérification'], courante: 1 },
  envoye: { etapes: ['Adresse', 'Vérification', 'Connecté'], courante: 2 },
  expire: { etapes: ['Adresse', 'Vérification', 'Connecté'], courante: 1 },
}

const pastille =
  'squircle-full flex items-center gap-3 border border-line bg-bg/80 p-1.5 pl-5 shadow-pill backdrop-blur-xl transition-colors focus-within:border-line-strong'
const saisie = 'min-w-0 flex-1 bg-transparent py-2.5 text-base text-fg outline-none placeholder:text-fg-2'
const rond =
  'squircle-full hover-lift flex size-11 shrink-0 items-center justify-center bg-action text-action-foreground hover:bg-action-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action disabled:opacity-60'
const principal =
  'hover-lift squircle-full inline-flex h-12 w-full items-center justify-center gap-2 bg-action px-5 font-semibold text-action-foreground shadow-pill hover:bg-action-hover disabled:opacity-60'
const discret =
  'squircle-full inline-flex h-12 w-full items-center justify-center gap-2 border border-line bg-bg px-5 font-medium text-fg hover:border-line-strong hover:bg-bg-soft'
const lien = 'font-medium text-fg underline underline-offset-4 hover:no-underline'

export function Connexion({ retour, etatInitial = 'email', apercu = false }: { retour: string; etatInitial?: Etat; apercu?: boolean }) {
  const [etat, setEtat] = useState<Etat>(etatInitial)
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [role, setRole] = useState<Role>('patient')
  const [nom, setNom] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, demarrer] = useTransition()
  // Le dernier envoi était-il une création de compte ? Pour « Renvoyer le lien ».
  const [dernierNouveau, setDernierNouveau] = useState(false)
  const adresse = email || 'vous@exemple.fr'

  const aller = (e: Etat) => {
    setErreur(null)
    setEtat(e)
  }

  const envoyerLien = async (nouveau: boolean) => {
    setDernierNouveau(nouveau)
    const { error } = await signIn.magicLink({
      email,
      callbackURL: retour,
      errorCallbackURL: `/connexion/?erreur=lien&retour=${encodeURIComponent(retour)}`,
      ...(nouveau
        ? { name: nom.trim(), newUserCallbackURL: `/inscription/profil/?role=${role}&retour=${encodeURIComponent(retour)}` }
        : {}),
    })
    if (error) throw new Error(error.message ?? 'envoi')
  }

  const soumettreEmail = (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)
    demarrer(async () => {
      const { existe } = await etatCompte(email)
      setEtat(existe ? 'connu' : 'nouveau')
    })
  }

  const soumettreLien = (nouveau: boolean) => (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)
    demarrer(async () => {
      try {
        await envoyerLien(nouveau)
        setEtat('envoye')
      } catch {
        setErreur('Le lien n’a pas pu être envoyé. Vérifiez l’adresse et réessayez.')
      }
    })
  }

  const soumettreMotDePasse = (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)
    demarrer(async () => {
      const { error } = await signIn.email({ email, password: motDePasse })
      if (error) setErreur('Adresse ou mot de passe incorrect.')
      else window.location.assign(retour)
    })
  }

  const renvoyer = () => {
    setErreur(null)
    demarrer(async () => {
      try {
        await envoyerLien(dernierNouveau)
      } catch {
        setErreur('Le lien n’a pas pu être renvoyé.')
      }
    })
  }

  return (
    <div>
      {apercu && (
        <nav aria-label="Aperçu des états" className="mb-8 flex flex-wrap gap-1.5 rounded-2xl border border-dashed border-line p-1.5">
          {ETATS.map((e) => (
            <button
              key={e.cle}
              type="button"
              aria-pressed={etat === e.cle}
              onClick={() => aller(e.cle)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${etat === e.cle ? 'bg-fg text-bg' : 'text-fg-2 hover:bg-bg-soft hover:text-fg'}`}
            >
              {e.libelle}
            </button>
          ))}
        </nav>
      )}

      <div className="mb-8 flex items-center gap-3 lg:hidden">
        <span aria-hidden className="size-[30px] rounded-md bg-brand" />
        <span className="text-xl font-bold tracking-tight text-brand">DentalMap</span>
      </div>

      <Fil {...FIL[etat]} />

      {/* La clé remonte le bloc à chaque état : il rejoue son entrée. */}
      <div key={etat} className="animate-fiche-entree mt-8">
        {etat === 'email' && (
          <form onSubmit={soumettreEmail}>
            <Badge>Annuaire vérifié par les registres</Badge>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-fg md:text-5xl">
              Bienvenue sur DentalMap
            </h1>
            <p className="mt-4 text-lg text-fg-2">
              Votre adresse suffit. Nous vous envoyons un lien, rien à retenir.
            </p>
            <label htmlFor="connexion-email" className="sr-only">
              Adresse électronique
            </label>
            <div className={`${pastille} mt-8`}>
              <Mail className="size-5 shrink-0 text-fg-2" aria-hidden />
              <input
                id="connexion-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@exemple.fr"
                className={saisie}
              />
              <button type="submit" disabled={enCours} aria-label="Continuer" className={rond}>
                {enCours ? <Point /> : <ArrowRight className="size-5" aria-hidden />}
              </button>
            </div>
            <ul className="mt-6 grid gap-3 text-sm text-fg-2 sm:grid-cols-3">
              <Atout icone={KeyRound}>Sans mot de passe</Atout>
              <Atout icone={Clock}>Lien valable cinq minutes</Atout>
              <Atout icone={ShieldCheck}>Adresse jamais revendue</Atout>
            </ul>
            <p className="mt-8 border-t border-line pt-6 text-sm text-fg-2">
              Nouveau ici ? Votre compte se crée en une étape. Vous êtes praticien ou laboratoire ?{' '}
              <Link href={chemin('/espace-pro/revendiquer/')} className={lien}>
                Revendiquez votre fiche
              </Link>
            </p>
          </form>
        )}

        {(etat === 'connu' || etat === 'motdepasse') && (
          <form onSubmit={etat === 'connu' ? soumettreLien(false) : soumettreMotDePasse}>
            <Badge>Bon retour</Badge>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-fg md:text-5xl">
              {etat === 'connu' ? 'On vous envoie votre lien' : 'Votre mot de passe'}
            </h1>
            <Adresse email={adresse} changer={() => aller('email')} />
            {etat === 'connu' ? (
              <>
                <p className="mt-6 text-lg text-fg-2">Un clic dans le courriel et vous êtes connecté. Le lien vaut cinq minutes.</p>
                <button type="submit" disabled={enCours} className={`${principal} mt-8`}>
                  {enCours ? <Point /> : <Mail className="size-4" aria-hidden />}
                  {enCours ? 'Envoi…' : 'Recevoir mon lien de connexion'}
                </button>
                <button type="button" onClick={() => aller('motdepasse')} className={`${discret} mt-3`}>
                  <Lock className="size-4 text-fg-2" aria-hidden />
                  Utiliser mon mot de passe
                </button>
              </>
            ) : (
              <>
                <label htmlFor="connexion-mdp" className="sr-only">
                  Mot de passe
                </label>
                <div className={`${pastille} mt-8`}>
                  <Lock className="size-5 shrink-0 text-fg-2" aria-hidden />
                  <input
                    id="connexion-mdp"
                    type="password"
                    name="password"
                    required
                    autoComplete="current-password"
                    autoFocus
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    placeholder="Votre mot de passe"
                    className={saisie}
                  />
                  <button type="submit" disabled={enCours} aria-label="Se connecter" className={rond}>
                    {enCours ? <Point /> : <ArrowRight className="size-5" aria-hidden />}
                  </button>
                </div>
                <p className="mt-6 text-sm text-fg-2">
                  Oublié ?{' '}
                  <button type="button" onClick={() => aller('connu')} className={lien}>
                    Recevoir un lien à la place
                  </button>
                </p>
              </>
            )}
            {erreur && <Erreur>{erreur}</Erreur>}
          </form>
        )}

        {etat === 'nouveau' && (
          <form onSubmit={soumettreLien(true)}>
            <Badge>Bienvenue</Badge>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-fg md:text-5xl">Qui êtes-vous ?</h1>
            <Adresse email={adresse} changer={() => aller('email')} />
            <fieldset className="mt-8">
              <legend className="sr-only">Votre profil</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {PROFILS.map((p) => {
                  const choisi = role === p.role
                  return (
                    <label
                      key={p.role}
                      className={`squircle-xl hover-lift relative flex cursor-pointer items-start gap-3 border p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action ${
                        choisi ? 'border-teal bg-teal/5 shadow-pill' : 'border-line bg-bg hover:border-line-strong'
                      }`}
                    >
                      <input type="radio" name="role" value={p.role} checked={choisi} onChange={() => setRole(p.role)} className="sr-only" />
                      <span className={`grid size-10 shrink-0 place-items-center rounded-full ${choisi ? 'bg-teal text-white' : 'bg-bg-soft text-teal'}`}>
                        <p.icone className="size-4.5" aria-hidden />
                      </span>
                      <span className="min-w-0 pr-5">
                        <span className="block text-sm font-semibold text-fg">{p.titre}</span>
                        <span className="block text-xs text-fg-2">{p.detail}</span>
                      </span>
                      {choisi && (
                        <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-teal text-white">
                          <Check className="size-3" aria-hidden strokeWidth={3} />
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
            </fieldset>
            <label htmlFor="connexion-nom" className="sr-only">
              {role === 'prothesiste' ? 'Nom du laboratoire' : 'Votre nom'}
            </label>
            <div className={`${pastille} mt-5`}>
              {role === 'prothesiste' ? <Building2 className="size-5 shrink-0 text-fg-2" aria-hidden /> : <UserRound className="size-5 shrink-0 text-fg-2" aria-hidden />}
              <input
                id="connexion-nom"
                name="nom"
                required
                minLength={2}
                maxLength={120}
                autoComplete={role === 'prothesiste' ? 'organization' : 'name'}
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder={role === 'prothesiste' ? 'Nom du laboratoire' : 'Votre nom'}
                className={saisie}
              />
              <button type="submit" disabled={enCours} aria-label="Créer mon compte" className={rond}>
                {enCours ? <Point /> : <ArrowRight className="size-5" aria-hidden />}
              </button>
            </div>
            {erreur && <Erreur>{erreur}</Erreur>}
            <p className="mt-5 text-xs leading-relaxed text-fg-2">
              En continuant vous acceptez les{' '}
              <Link href={chemin('/cgu/')} className="underline underline-offset-2 hover:text-fg">
                conditions d’utilisation
              </Link>
              . Votre adresse ne sert qu’à vous connecter et vous répondre.
            </p>
          </form>
        )}

        {etat === 'envoye' && (
          <div>
            <Sceau>
              <Mail className="size-6" aria-hidden />
            </Sceau>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-fg md:text-5xl">Regardez votre boîte mail</h1>
            <p className="mt-4 text-lg text-fg-2">
              Un lien de connexion vient de partir à <span className="font-medium text-fg">{adresse}</span>. Ouvrez-le depuis cet appareil.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-fg-2">
              <Atout icone={Clock}>Il vaut cinq minutes et ne s’ouvre qu’une fois.</Atout>
              <Atout icone={BadgeCheck}>L’expéditeur est DentalMap. Rien après une minute ? Regardez vos indésirables.</Atout>
            </ul>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={renvoyer} disabled={enCours} className={discret}>
                {enCours ? <Point sombre /> : <Mail className="size-4 text-fg-2" aria-hidden />}
                {enCours ? 'Envoi…' : 'Renvoyer le lien'}
              </button>
              <button type="button" onClick={() => aller('email')} className={discret}>
                Changer d’adresse
              </button>
            </div>
            {erreur && <Erreur>{erreur}</Erreur>}
          </div>
        )}

        {etat === 'expire' && (
          <div>
            <Sceau attention>
              <Clock className="size-6" aria-hidden />
            </Sceau>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-fg md:text-5xl">Ce lien ne fonctionne plus</h1>
            <p className="mt-4 text-lg text-fg-2">
              Il a expiré ou a déjà servi. Un lien vaut cinq minutes et ne s’ouvre qu’une fois. Demandez-en un nouveau, c’est
              immédiat.
            </p>
            <button type="button" onClick={() => aller('email')} className={`${principal} mt-8`}>
              Recevoir un nouveau lien
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/** Le fil d'étapes : un trait par étape, plein jusqu'à l'étape en cours. */
function Fil({ etapes, courante }: { etapes: string[]; courante: number }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Étapes">
      {etapes.map((e, i) => (
        <li key={e} aria-current={i === courante ? 'step' : undefined} className="min-w-0">
          <span aria-hidden className={`block h-1 rounded-full ${i <= courante ? 'bg-teal' : 'bg-line'}`} />
          <span className={`mt-2 block truncate text-xs ${i === courante ? 'font-semibold text-fg' : 'text-fg-2'}`}>{e}</span>
        </li>
      ))}
    </ol>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal ring-1 ring-inset ring-teal/30">
      <BadgeCheck className="size-3.5" aria-hidden />
      {children}
    </span>
  )
}

/** Le gros rond qui annonce un état : sarcelle avec une onde, ou ambre pour l'avertissement. */
function Sceau({ children, attention = false }: { children: React.ReactNode; attention?: boolean }) {
  return (
    <span className="relative inline-grid size-16 place-items-center">
      {!attention && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-teal/20 motion-reduce:animate-none" />}
      <span className={`relative grid size-16 place-items-center rounded-full ${attention ? 'bg-partiel-bg text-partiel' : 'bg-teal text-white shadow-pill'}`}>
        {children}
      </span>
    </span>
  )
}

/** Une ligne de réassurance, icône et texte. */
function Atout({ icone: Icone, children }: { icone: typeof Clock; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Icone className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
      <span>{children}</span>
    </li>
  )
}

/** L'adresse en cours, rappelée en pastille, avec de quoi la changer. */
function Adresse({ email, changer }: { email: string; changer: () => void }) {
  return (
    <p className="mt-5 inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-bg-soft py-1.5 pl-3 pr-1.5 text-sm text-fg">
      <Mail className="size-4 shrink-0 text-fg-2" aria-hidden />
      <span className="truncate">{email}</span>
      <button type="button" onClick={changer} className="rounded-full bg-bg px-2.5 py-1 text-xs font-medium text-fg-2 ring-1 ring-inset ring-line hover:text-fg">
        Changer
      </button>
    </p>
  )
}

/** Trois points qui battent, le temps d'une attente. */
function Point({ sombre = false }: { sombre?: boolean }) {
  const c = sombre ? 'bg-fg-2' : 'bg-current'
  return (
    <span className="inline-flex items-center gap-1" aria-label="Chargement">
      <span className={`size-1.5 animate-bounce rounded-full ${c} [animation-delay:-0.3s]`} />
      <span className={`size-1.5 animate-bounce rounded-full ${c} [animation-delay:-0.15s]`} />
      <span className={`size-1.5 animate-bounce rounded-full ${c}`} />
    </span>
  )
}

function Erreur({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-4 text-sm text-destructive">
      {children}
    </p>
  )
}
