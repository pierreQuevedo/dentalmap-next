'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { ArrowRight, BadgeCheck, Building2, Check, Clock, CreditCard, Hash, KeyRound, Lock, Mail, ShieldCheck, Stethoscope, User, UserRound } from 'lucide-react'
import { emailOtp, signIn, signUp } from '@/lib/auth-client'
import { chemin } from '@/lib/navigation'
import { etatCompte } from '@/lib/tunnel/actions'
import type { Role } from '@/lib/tunnel/etapes'

/**
 * Le flux de connexion, en un seul écran qui change d'état.
 *
 * 1. l'adresse ; 2a. compte connu : le mot de passe, ou un code à six
 * chiffres envoyé par courriel pour qui l'a oublié ; 2b. nouveau compte : qui
 * êtes-vous, le nom, le mot de passe ; 3. le code reçu confirme l'adresse et
 * ouvre la session. Pro Santé Connect est annoncé en encart, il arrive.
 *
 * Les champs reprennent la pastille de la recherche de l'accueil, icône à
 * gauche et bouton rond à droite : c'est le geste du site. Chaque état
 * entre en fondu, et un fil d'étapes dit où l'on en est.
 *
 * Un nouveau compte part avec son nom et son rôle, enregistrés avec le
 * compte : la page de profil n'a rien à redemander.
 *
 * `apercu` affiche des onglets pour passer d'un état à l'autre sans rien
 * envoyer : pour vérifier chaque rendu.
 */
import { ETATS, type Etat } from './etats'

const PROFILS: { role: Role; titre: string; detail: string; icone: typeof User }[] = [
  { role: 'patient', titre: 'Patient', detail: 'Je cherche un professionnel', icone: UserRound },
  { role: 'dentiste', titre: 'Chirurgien-dentiste', detail: 'Je gère ma fiche', icone: Stethoscope },
  { role: 'prothesiste', titre: 'Laboratoire', detail: 'Prothèse dentaire', icone: Building2 },
  { role: 'medecin', titre: 'Médecin', detail: 'Maxillo-facial, stomatologue, ORL', icone: User },
]

/** Le fil d'étapes de chaque état : le chemin parcouru, l'étape en cours, ce qui reste. */
const FIL: Record<Etat, { etapes: string[]; courante: number }> = {
  email: { etapes: ['Adresse', 'Identification', 'Connecté'], courante: 0 },
  motdepasse: { etapes: ['Adresse', 'Mot de passe', 'Connecté'], courante: 1 },
  code: { etapes: ['Adresse', 'Code reçu', 'Connecté'], courante: 1 },
  oubli: { etapes: ['Adresse', 'Nouveau mot de passe', 'Connecté'], courante: 1 },
  nouveau: { etapes: ['Adresse', 'Profil', 'Confirmation'], courante: 1 },
  verifier: { etapes: ['Adresse', 'Profil', 'Confirmation'], courante: 2 },
}

const LONGUEUR_MOT_DE_PASSE = 12

const pastille =
  'squircle-full flex items-center gap-3 border border-line bg-bg/80 p-1.5 pl-5 shadow-pill backdrop-blur-xl transition-colors focus-within:border-line-strong'
const saisie = 'min-w-0 flex-1 bg-transparent py-2.5 text-base text-fg outline-none placeholder:text-fg-2'
const rond =
  'squircle-full hover-lift flex size-11 shrink-0 items-center justify-center bg-action text-action-foreground hover:bg-action-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action disabled:opacity-60'
const lien = 'font-medium text-fg underline underline-offset-4 hover:no-underline'

export function Connexion({ retour, etatInitial = 'email', apercu = false }: { retour: string; etatInitial?: Etat; apercu?: boolean }) {
  const [etat, setEtat] = useState<Etat>(etatInitial)
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [codeSaisi, setCodeSaisi] = useState('')
  const [role, setRole] = useState<Role>('patient')
  const [nom, setNom] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [enCours, demarrer] = useTransition()
  const adresse = email || 'vous@exemple.fr'

  const aller = (e: Etat) => {
    setErreur(null)
    setInfo(null)
    setCodeSaisi('')
    setEtat(e)
  }

  /** Mène là où l'on voulait aller : la page de profil relit le compte et décide de la suite. */
  const continuer = () => window.location.assign(chemin(`/inscription/profil/?retour=${encodeURIComponent(retour)}`))

  const soumettreEmail = (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)
    demarrer(async () => {
      const { existe } = await etatCompte(email)
      setEtat(existe ? 'motdepasse' : 'nouveau')
    })
  }

  const soumettreMotDePasse = (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)
    demarrer(async () => {
      const { error } = await signIn.email({ email, password: motDePasse })
      if (!error) return window.location.assign(chemin(retour))
      if (error.status === 403) {
        // Adresse jamais confirmée : on renvoie un code et on passe à la confirmation.
        await emailOtp.sendVerificationOtp({ email, type: 'email-verification' })
        setMotDePasse('')
        aller('verifier')
        return
      }
      setErreur('Adresse ou mot de passe incorrect.')
    })
  }

  const demanderCode = (type: 'sign-in' | 'forget-password') => {
    setErreur(null)
    demarrer(async () => {
      const { error } = await emailOtp.sendVerificationOtp({ email, type })
      if (error) {
        setErreur('Le code n’a pas pu être envoyé. Réessayez dans un instant.')
        return
      }
      setMotDePasse('')
      aller(type === 'sign-in' ? 'code' : 'oubli')
      setInfo(`Un code à six chiffres vient de partir à ${email}.`)
    })
  }

  const soumettreCode = (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)
    demarrer(async () => {
      const { error } = await signIn.emailOtp({ email, otp: codeSaisi })
      if (error) setErreur('Ce code ne correspond pas, ou il a expiré.')
      else window.location.assign(chemin(retour))
    })
  }

  const soumettreOubli = (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)
    demarrer(async () => {
      const { error } = await emailOtp.resetPassword({ email, otp: codeSaisi, password: motDePasse })
      if (error) {
        setErreur(error.status === 400 && /password/i.test(error.message ?? '') ? `Douze caractères au moins.` : 'Ce code ne correspond pas, ou il a expiré.')
        return
      }
      const connexion = await signIn.email({ email, password: motDePasse })
      if (connexion.error) aller('motdepasse')
      else window.location.assign(chemin(retour))
    })
  }

  const soumettreNouveau = (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)
    demarrer(async () => {
      const { error } = await signUp.email({
        email,
        password: motDePasse,
        name: nom.trim(),
        role,
        etapeTunnel: role === 'patient' ? 'tableau-de-bord' : 'fiche',
      })
      if (error) {
        setErreur(error.status === 422 || /exist/i.test(error.message ?? '') ? 'Un compte existe déjà avec cette adresse.' : 'Le compte n’a pas pu être créé. Vérifiez le mot de passe, douze caractères au moins.')
        return
      }
      // Le code de confirmation part avec l'inscription.
      aller('verifier')
      setInfo(`Un code à six chiffres vient de partir à ${email}.`)
    })
  }

  const soumettreVerification = (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)
    demarrer(async () => {
      const { error } = await emailOtp.verifyEmail({ email, otp: codeSaisi })
      if (error) setErreur('Ce code ne correspond pas, ou il a expiré.')
      else continuer()
    })
  }

  const renvoyerVerification = () => {
    setErreur(null)
    demarrer(async () => {
      const { error } = await emailOtp.sendVerificationOtp({ email, type: 'email-verification' })
      setInfo(error ? null : `Un nouveau code vient de partir à ${email}.`)
      if (error) setErreur('Le code n’a pas pu être renvoyé.')
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
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-fg md:text-5xl">Bienvenue sur DentalMap</h1>
            <p className="mt-4 text-lg text-fg-2">Votre adresse, puis votre mot de passe. Nouveau ici ? Le compte se crée dans la foulée.</p>
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
              <Atout icone={KeyRound}>Mot de passe, ou code reçu par courriel</Atout>
              <Atout icone={ShieldCheck}>Adresse confirmée par un code</Atout>
              <Atout icone={Clock}>Deux minutes pour s’inscrire</Atout>
            </ul>
            <ProSanteConnect />
            <p className="mt-6 text-sm text-fg-2">
              Vous êtes praticien ou laboratoire ?{' '}
              <Link href={chemin('/espace-pro/revendiquer/')} className={lien}>
                Revendiquez votre fiche
              </Link>
            </p>
          </form>
        )}

        {etat === 'motdepasse' && (
          <form onSubmit={soumettreMotDePasse}>
            <Badge>Bon retour</Badge>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-fg md:text-5xl">Votre mot de passe</h1>
            <Adresse email={adresse} changer={() => aller('email')} />
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
            {erreur && <Erreur>{erreur}</Erreur>}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-2">
              <button type="button" onClick={() => demanderCode('forget-password')} disabled={enCours} className={lien}>
                Mot de passe oublié
              </button>
              <button type="button" onClick={() => demanderCode('sign-in')} disabled={enCours} className={lien}>
                Recevoir un code à la place
              </button>
            </div>
            <ProSanteConnect />
          </form>
        )}

        {etat === 'code' && (
          <form onSubmit={soumettreCode}>
            <Badge>Code de connexion</Badge>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-fg md:text-5xl">Saisissez le code reçu</h1>
            <Adresse email={adresse} changer={() => aller('email')} />
            {info && <Info>{info}</Info>}
            <ChampCode valeur={codeSaisi} onChange={setCodeSaisi} enCours={enCours} />
            {erreur && <Erreur>{erreur}</Erreur>}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-2">
              <button type="button" onClick={() => demanderCode('sign-in')} disabled={enCours} className={lien}>
                Renvoyer un code
              </button>
              <button type="button" onClick={() => aller('motdepasse')} className={lien}>
                Utiliser mon mot de passe
              </button>
            </div>
          </form>
        )}

        {etat === 'oubli' && (
          <form onSubmit={soumettreOubli}>
            <Badge>Mot de passe oublié</Badge>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-fg md:text-5xl">Choisissez-en un nouveau</h1>
            <Adresse email={adresse} changer={() => aller('email')} />
            {info && <Info>{info}</Info>}
            <ChampCode valeur={codeSaisi} onChange={setCodeSaisi} enCours={enCours} sansBouton />
            <label htmlFor="connexion-nouveau-mdp" className="sr-only">
              Nouveau mot de passe
            </label>
            <div className={`${pastille} mt-3`}>
              <Lock className="size-5 shrink-0 text-fg-2" aria-hidden />
              <input
                id="connexion-nouveau-mdp"
                type="password"
                name="new-password"
                required
                minLength={LONGUEUR_MOT_DE_PASSE}
                autoComplete="new-password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder={`Nouveau mot de passe, ${LONGUEUR_MOT_DE_PASSE} caractères au moins`}
                className={saisie}
              />
              <button type="submit" disabled={enCours} aria-label="Enregistrer et se connecter" className={rond}>
                {enCours ? <Point /> : <ArrowRight className="size-5" aria-hidden />}
              </button>
            </div>
            {erreur && <Erreur>{erreur}</Erreur>}
            <p className="mt-6 text-sm text-fg-2">
              <button type="button" onClick={() => demanderCode('forget-password')} disabled={enCours} className={lien}>
                Renvoyer un code
              </button>
            </p>
          </form>
        )}

        {etat === 'nouveau' && (
          <form onSubmit={soumettreNouveau}>
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
                className={`${saisie} pr-3`}
              />
            </div>
            <label htmlFor="connexion-mdp-nouveau" className="sr-only">
              Mot de passe
            </label>
            <div className={`${pastille} mt-3`}>
              <Lock className="size-5 shrink-0 text-fg-2" aria-hidden />
              <input
                id="connexion-mdp-nouveau"
                type="password"
                name="new-password"
                required
                minLength={LONGUEUR_MOT_DE_PASSE}
                autoComplete="new-password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder={`Mot de passe, ${LONGUEUR_MOT_DE_PASSE} caractères au moins`}
                className={saisie}
              />
              <button type="submit" disabled={enCours} aria-label="Créer mon compte" className={rond}>
                {enCours ? <Point /> : <ArrowRight className="size-5" aria-hidden />}
              </button>
            </div>
            <Jauge motDePasse={motDePasse} />
            {erreur && <Erreur>{erreur}</Erreur>}
            <p className="mt-5 text-xs leading-relaxed text-fg-2">
              En continuant vous acceptez les{' '}
              <Link href={chemin('/cgu/')} className="underline underline-offset-2 hover:text-fg">
                conditions d’utilisation
              </Link>
              . Un code vous sera envoyé pour confirmer l’adresse.
            </p>
          </form>
        )}

        {etat === 'verifier' && (
          <form onSubmit={soumettreVerification}>
            <Sceau>
              <Mail className="size-6" aria-hidden />
            </Sceau>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-fg md:text-5xl">Confirmez votre adresse</h1>
            <p className="mt-4 text-lg text-fg-2">
              Un code à six chiffres vient de partir à <span className="font-medium text-fg">{adresse}</span>. Il vaut dix minutes.
            </p>
            <ChampCode valeur={codeSaisi} onChange={setCodeSaisi} enCours={enCours} />
            {erreur && <Erreur>{erreur}</Erreur>}
            {info && !erreur && <Info>{info}</Info>}
            <ul className="mt-6 grid gap-3 text-sm text-fg-2">
              <Atout icone={BadgeCheck}>L’expéditeur est DentalMap. Rien après une minute ? Regardez vos indésirables.</Atout>
            </ul>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-2">
              <button type="button" onClick={renvoyerVerification} disabled={enCours} className={lien}>
                Renvoyer un code
              </button>
              <button type="button" onClick={() => aller('email')} className={lien}>
                Changer d’adresse
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

/** L'encart Pro Santé Connect : annoncé, pas encore ouvert. */
function ProSanteConnect() {
  return (
    <div className="squircle-xl mt-8 flex items-center gap-4 border border-dashed border-line bg-bg-soft/60 p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-bg text-fg-2 ring-1 ring-inset ring-line">
        <CreditCard className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-fg">
          Pro Santé Connect
          <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-medium text-fg-2 ring-1 ring-inset ring-line">Bientôt</span>
        </p>
        <p className="mt-0.5 text-xs text-fg-2">Pour les professionnels de santé : connexion par carte CPS ou e-CPS, avec l’Agence du Numérique en Santé.</p>
      </div>
    </div>
  )
}

/** Le champ du code à six chiffres, espacé comme sur un clavier, avec ou sans son bouton. */
function ChampCode({ valeur, onChange, enCours, sansBouton = false }: { valeur: string; onChange: (v: string) => void; enCours: boolean; sansBouton?: boolean }) {
  return (
    <>
      <label htmlFor="connexion-code" className="sr-only">
        Code à six chiffres
      </label>
      <div className={`${pastille} mt-8`}>
        <Hash className="size-5 shrink-0 text-fg-2" aria-hidden />
        <input
          id="connexion-code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoFocus
          value={valeur}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className={`${saisie} font-mono text-xl tracking-[0.4em] ${sansBouton ? 'pr-3' : ''}`}
        />
        {!sansBouton && (
          <button type="submit" disabled={enCours || valeur.length < 6} aria-label="Valider le code" className={rond}>
            {enCours ? <Point /> : <ArrowRight className="size-5" aria-hidden />}
          </button>
        )}
      </div>
    </>
  )
}

/** Une jauge sobre : la longueur du mot de passe, jusqu'au minimum puis au-delà. */
function Jauge({ motDePasse }: { motDePasse: string }) {
  const part = Math.min(1, motDePasse.length / (LONGUEUR_MOT_DE_PASSE + 4))
  const ok = motDePasse.length >= LONGUEUR_MOT_DE_PASSE
  return (
    <div className="mt-3 flex items-center gap-3 text-xs text-fg-2" aria-live="polite">
      <span className="h-1 flex-1 overflow-hidden rounded-full bg-line">
        <span className={`block h-full rounded-full transition-[width] duration-moderate ${ok ? 'bg-teal' : 'bg-fg-2'}`} style={{ width: `${part * 100}%` }} />
      </span>
      <span className="shrink-0">{ok ? 'Longueur suffisante' : `${LONGUEUR_MOT_DE_PASSE} caractères au moins`}</span>
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

/** Le gros rond qui annonce un état, sarcelle avec une onde. */
function Sceau({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-grid size-16 place-items-center">
      <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-teal/20 motion-reduce:animate-none" />
      <span className="relative grid size-16 place-items-center rounded-full bg-teal text-white shadow-pill">{children}</span>
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
function Point() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Chargement">
      <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-current" />
    </span>
  )
}

function Info({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="mt-4 text-sm text-fg-2">
      {children}
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
