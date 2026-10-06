'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Building2, Mail, Stethoscope, User, UserRound } from 'lucide-react'
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

const champ =
  'squircle-md mt-2 w-full border border-line-strong bg-bg px-3.5 py-3 text-fg outline-none placeholder:text-fg-2 focus:border-fg'
const principal =
  'hover-lift squircle-full mt-5 inline-flex h-12 w-full items-center justify-center bg-action px-5 font-semibold text-action-foreground hover:bg-action-hover disabled:opacity-60'
const secondaire = 'text-sm font-medium text-fg underline underline-offset-4 hover:no-underline'

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

      {etat === 'email' && (
        <form onSubmit={soumettreEmail}>
          <h1 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">Connexion</h1>
          <p className="mt-3 text-fg-2">
            Votre adresse suffit. Nous vous envoyons un lien, pas de mot de passe à retenir.
          </p>
          <label htmlFor="connexion-email" className="mt-8 block text-sm font-medium text-fg">
            Adresse électronique
          </label>
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
            className={champ}
          />
          <button type="submit" disabled={enCours} className={principal}>
            {enCours ? 'Un instant…' : 'Continuer'}
          </button>
          <p className="mt-6 text-sm text-fg-2">
            Vous êtes praticien ou laboratoire ?{' '}
            <Link href={chemin('/espace-pro/revendiquer/')} className={secondaire}>
              Revendiquez votre fiche
            </Link>
          </p>
        </form>
      )}

      {(etat === 'connu' || etat === 'motdepasse') && (
        <form onSubmit={etat === 'connu' ? soumettreLien(false) : soumettreMotDePasse}>
          <p className="text-sm font-medium text-teal">Bon retour</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-fg md:text-4xl">
            {etat === 'connu' ? 'Recevez votre lien' : 'Votre mot de passe'}
          </h1>
          <Adresse email={email || 'vous@exemple.fr'} changer={() => aller('email')} />
          {etat === 'connu' ? (
            <>
              <p className="mt-6 text-fg-2">Un lien de connexion part à cette adresse. Il vaut cinq minutes.</p>
              <button type="submit" disabled={enCours} className={principal}>
                <Mail className="mr-2 size-4" aria-hidden />
                {enCours ? 'Envoi…' : 'Recevoir mon lien de connexion'}
              </button>
              <p className="mt-6 text-sm text-fg-2">
                Vous avez un mot de passe ?{' '}
                <button type="button" onClick={() => aller('motdepasse')} className={secondaire}>
                  L’utiliser
                </button>
              </p>
            </>
          ) : (
            <>
              <label htmlFor="connexion-mdp" className="mt-6 block text-sm font-medium text-fg">
                Mot de passe
              </label>
              <input
                id="connexion-mdp"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                autoFocus
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className={champ}
              />
              <button type="submit" disabled={enCours} className={principal}>
                {enCours ? 'Connexion…' : 'Se connecter'}
              </button>
              <p className="mt-6 text-sm text-fg-2">
                Oublié ?{' '}
                <button type="button" onClick={() => aller('connu')} className={secondaire}>
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
          <p className="text-sm font-medium text-teal">Bienvenue</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-fg md:text-4xl">Qui êtes-vous ?</h1>
          <Adresse email={email || 'vous@exemple.fr'} changer={() => aller('email')} />
          <fieldset className="mt-6">
            <legend className="sr-only">Votre profil</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {PROFILS.map((p) => (
                <label
                  key={p.role}
                  className="squircle-xl flex cursor-pointer items-start gap-3 border border-line bg-bg p-4 transition-colors has-checked:border-fg has-checked:bg-bg-soft has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action"
                >
                  <input type="radio" name="role" value={p.role} checked={role === p.role} onChange={() => setRole(p.role)} className="sr-only" />
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal/10 text-teal">
                    <p.icone className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-fg">{p.titre}</span>
                    <span className="block text-xs text-fg-2">{p.detail}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label htmlFor="connexion-nom" className="mt-6 block text-sm font-medium text-fg">
            {role === 'prothesiste' ? 'Nom du laboratoire' : 'Votre nom'}
          </label>
          <input
            id="connexion-nom"
            name="nom"
            required
            minLength={2}
            maxLength={120}
            autoComplete={role === 'prothesiste' ? 'organization' : 'name'}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder={role === 'prothesiste' ? 'Laboratoire Dupont' : 'Marie Dupont'}
            className={champ}
          />
          <button type="submit" disabled={enCours} className={principal}>
            {enCours ? 'Envoi…' : 'Créer mon compte'}
          </button>
          {erreur && <Erreur>{erreur}</Erreur>}
          <p className="mt-6 text-xs leading-relaxed text-fg-2">
            En continuant vous acceptez les{' '}
            <Link href={chemin('/cgu/')} className="underline underline-offset-2 hover:text-fg">
              conditions d’utilisation
            </Link>
            . Vos données ne servent qu’à vous connecter et vous répondre.
          </p>
        </form>
      )}

      {etat === 'envoye' && (
        <div>
          <span className="grid size-12 place-items-center rounded-full bg-teal/10 text-teal">
            <Mail className="size-5" aria-hidden />
          </span>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-fg md:text-4xl">Vérifiez votre boîte mail</h1>
          <p className="mt-3 text-fg-2">
            Un lien de connexion vient de partir à <span className="font-medium text-fg">{email || 'vous@exemple.fr'}</span>.
            Ouvrez-le depuis cet appareil, il vaut cinq minutes.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-fg-2">
            <li>Rien reçu après une minute ? Regardez vos indésirables.</li>
            <li>L’expéditeur est DentalMap, le lien commence par notre adresse.</li>
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button type="button" onClick={renvoyer} disabled={enCours} className={secondaire}>
              {enCours ? 'Envoi…' : 'Renvoyer le lien'}
            </button>
            <button type="button" onClick={() => aller('email')} className="text-sm text-fg-2 hover:text-fg">
              Changer d’adresse
            </button>
          </div>
          {erreur && <Erreur>{erreur}</Erreur>}
        </div>
      )}

      {etat === 'expire' && (
        <div>
          <span className="grid size-12 place-items-center rounded-full bg-partiel-bg text-partiel">
            <Mail className="size-5" aria-hidden />
          </span>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-fg md:text-4xl">Ce lien ne fonctionne plus</h1>
          <p className="mt-3 text-fg-2">
            Il a expiré ou a déjà servi. Un lien vaut cinq minutes et ne s’ouvre qu’une fois. Demandez-en un nouveau, c’est
            immédiat.
          </p>
          <button type="button" onClick={() => aller('email')} className={principal}>
            Recevoir un nouveau lien
          </button>
        </div>
      )}
    </div>
  )
}

/** L'adresse en cours, rappelée en pastille, avec de quoi la changer. */
function Adresse({ email, changer }: { email: string; changer: () => void }) {
  return (
    <p className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-bg-soft py-1 pl-3 pr-1 text-sm text-fg">
      <span className="truncate">{email}</span>
      <button type="button" onClick={changer} className="rounded-full px-2 py-0.5 text-xs font-medium text-fg-2 hover:bg-bg hover:text-fg">
        Changer
      </button>
    </p>
  )
}

function Erreur({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-4 text-sm text-destructive">
      {children}
    </p>
  )
}
