'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { ArrowRight, Building2, CreditCard, Eye, EyeOff, Hash, Lock, Mail, UserRound } from 'lucide-react'
import { emailOtp, signIn, signUp } from '@/lib/auth-client'
import { chemin } from '@/lib/navigation'
import type { Role } from '@/lib/tunnel/etapes'
import { ETATS, type Etat } from './etats'

/**
 * Connexion et inscription, à la classique.
 *
 * Un écran de connexion, adresse et mot de passe, avec le lien vers
 * l'inscription et le mot de passe oublié. Un écran d'inscription : profil,
 * nom, adresse, mot de passe ; un code à six chiffres reçu par courriel
 * confirme ensuite l'adresse et ouvre la session. Le mot de passe oublié passe
 * par le même code. Pro Santé Connect est annoncé en encart, il arrive.
 *
 * Les champs reprennent la pastille de la recherche de l'accueil, icône à
 * gauche : c'est le geste du site. Chaque état entre en fondu.
 *
 * Un nouveau compte part avec son nom et son rôle, enregistrés avec le
 * compte : la page de profil n'a rien à redemander.
 *
 * `apercu` affiche des onglets pour passer d'un état à l'autre sans rien
 * envoyer : pour vérifier chaque rendu.
 */
const PROFILS: { role: Role; titre: string; detail: string }[] = [
  { role: 'patient', titre: 'Patient', detail: 'Je cherche un professionnel.' },
  { role: 'dentiste', titre: 'Dentiste', detail: 'Chirurgien-dentiste, je gère ma fiche.' },
  { role: 'prothesiste', titre: 'Laboratoire', detail: 'Laboratoire de prothèse dentaire.' },
  { role: 'medecin', titre: 'Médecin', detail: 'Chirurgien maxillo-facial, stomatologue ou ORL.' },
]

const LONGUEUR_MOT_DE_PASSE = 12

const pastille =
  'squircle-full flex items-center gap-2.5 border border-line bg-bg/80 px-4 shadow-pill backdrop-blur-xl transition-colors focus-within:border-line-strong'
const saisie = 'min-w-0 flex-1 bg-transparent py-2.5 text-sm text-fg outline-none placeholder:text-fg-2'
const principal =
  'hover-lift squircle-full inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 bg-action px-5 text-sm font-semibold text-action-foreground shadow-pill hover:bg-action-hover disabled:cursor-default disabled:opacity-60'
const lien = 'cursor-pointer font-medium text-fg underline underline-offset-4 hover:no-underline'

export function Connexion({ retour, etatInitial = 'connexion', apercu = false }: { retour: string; etatInitial?: Etat; apercu?: boolean }) {
  const [etat, setEtat] = useState<Etat>(etatInitial)
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [codeSaisi, setCodeSaisi] = useState('')
  const [codeEnvoye, setCodeEnvoye] = useState(false)
  const [role, setRole] = useState<Role>('patient')
  const [nom, setNom] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [enCours, demarrer] = useTransition()

  const aller = (e: Etat) => {
    setErreur(null)
    setInfo(null)
    setCodeSaisi('')
    setCodeEnvoye(false)
    setMotDePasse('')
    setEtat(e)
  }

  /** Mène là où l'on voulait aller : la page de profil relit le compte et décide de la suite. */
  const continuer = () => window.location.assign(chemin(`/inscription/profil/?retour=${encodeURIComponent(retour)}`))

  const soumettreConnexion = (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)
    demarrer(async () => {
      const { error } = await signIn.email({ email, password: motDePasse })
      if (!error) return window.location.assign(chemin(retour))
      if (error.status === 403) {
        // Adresse jamais confirmée : on envoie un code et on passe à la confirmation.
        await emailOtp.sendVerificationOtp({ email, type: 'email-verification' })
        aller('verifier')
        setInfo(`Votre adresse n’a pas encore été confirmée. Un code vient de partir à ${email}.`)
        return
      }
      setErreur('Adresse ou mot de passe incorrect.')
    })
  }

  const soumettreInscription = (e: React.FormEvent) => {
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
      if (error) setErreur('Le code n’a pas pu être renvoyé.')
      else setInfo(`Un nouveau code vient de partir à ${email}.`)
    })
  }

  const demanderCodeOubli = (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)
    demarrer(async () => {
      const { error } = await emailOtp.sendVerificationOtp({ email, type: 'forget-password' })
      if (error) {
        setErreur('Le code n’a pas pu être envoyé. Vérifiez l’adresse.')
        return
      }
      setCodeEnvoye(true)
      setInfo(`Un code à six chiffres vient de partir à ${email}.`)
    })
  }

  const soumettreOubli = (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)
    demarrer(async () => {
      const { error } = await emailOtp.resetPassword({ email, otp: codeSaisi, password: motDePasse })
      if (error) {
        setErreur('Ce code ne correspond pas, ou il a expiré.')
        return
      }
      const connexion = await signIn.email({ email, password: motDePasse })
      if (connexion.error) aller('connexion')
      else window.location.assign(chemin(retour))
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
              className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium ${etat === e.cle ? 'bg-fg text-bg' : 'text-fg-2 hover:bg-bg-soft hover:text-fg'}`}
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

      {/* La clé remonte le bloc à chaque état : il rejoue son entrée. */}
      <div key={etat} className="animate-fiche-entree">
        {etat === 'connexion' && (
          <form onSubmit={soumettreConnexion}>
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-fg md:text-3xl">Connexion</h1>
            <p className="mt-2 text-sm text-fg-2">Votre adresse et votre mot de passe.</p>
            <div className="mt-6 grid gap-2.5">
              <Champ id="connexion-email" icone={Mail} libelle="Adresse électronique">
                <input
                  id="connexion-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse électronique"
                  className={saisie}
                />
              </Champ>
              <ChampMotDePasse id="connexion-mdp" libelle="Mot de passe" placeholder="Mot de passe" autoComplete="current-password" valeur={motDePasse} onChange={setMotDePasse} />
            </div>
            <div className="mt-2.5 text-right text-xs">
              <button type="button" onClick={() => aller('oubli')} className="cursor-pointer text-fg-2 underline-offset-4 hover:text-fg hover:underline">
                Mot de passe oublié ?
              </button>
            </div>
            {erreur && <Erreur>{erreur}</Erreur>}
            <button type="submit" disabled={enCours} className={`${principal} mt-5`}>
              {enCours ? <Point /> : 'Se connecter'}
              {!enCours && <ArrowRight className="size-4" aria-hidden />}
            </button>
            <ProSanteConnect />
            <p className="mt-5 text-sm text-fg-2">
              Professionnel de santé sans compte ?{' '}
              <button
                type="button"
                onClick={() => {
                  setRole('dentiste')
                  aller('inscription')
                }}
                className={lien}
              >
                Inscrivez-vous
              </button>
            </p>
          </form>
        )}

        {etat === 'inscription' && (
          <form onSubmit={soumettreInscription}>
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-fg md:text-3xl">Créer un compte</h1>
            <p className="mt-2 text-sm text-fg-2">
              Déjà inscrit ?{' '}
              <button type="button" onClick={() => aller('connexion')} className={lien}>
                Connectez-vous
              </button>
            </p>
            {/*
              Le profil : un sélecteur à quatre segments sur toute la largeur
              des champs, comme celui de la recherche de l'accueil. Le
              surligneur glisse sous le segment choisi ; une ligne dessous dit
              ce qu'il recouvre.
            */}
            <fieldset className="mt-6">
              <legend className="mb-2.5 text-sm font-medium text-fg">Vous êtes</legend>
              <div className="relative grid grid-cols-4 rounded-full border border-line bg-bg-soft p-1">
                <span
                  aria-hidden
                  className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/4)] rounded-full bg-bg shadow-pill transition-transform duration-moderate ease-spring motion-reduce:transition-none"
                  style={{ transform: `translateX(${PROFILS.findIndex((p) => p.role === role) * 100}%)` }}
                />
                {PROFILS.map((p) => {
                  const choisi = role === p.role
                  return (
                    <label
                      key={p.role}
                      className={`relative z-10 flex h-9 cursor-pointer items-center justify-center whitespace-nowrap rounded-full px-1 text-[13px] font-medium transition-colors duration-fast has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action ${
                        choisi ? 'text-fg' : 'text-fg-2 hover:text-fg'
                      }`}
                    >
                      <input type="radio" name="role" value={p.role} checked={choisi} onChange={() => setRole(p.role)} className="sr-only" />
                      {p.titre}
                    </label>
                  )
                })}
              </div>
              <p className="mt-2 text-xs text-fg-2" aria-live="polite">
                {PROFILS.find((p) => p.role === role)?.detail}
              </p>
            </fieldset>
            <div className="mt-5 grid gap-2.5">
              <Champ id="inscription-nom" icone={role === 'prothesiste' ? Building2 : UserRound} libelle={role === 'prothesiste' ? 'Nom du laboratoire' : 'Votre nom'}>
                <input
                  id="inscription-nom"
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
              </Champ>
              <Champ id="inscription-email" icone={Mail} libelle="Adresse électronique">
                <input
                  id="inscription-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse électronique"
                  className={saisie}
                />
              </Champ>
              <ChampMotDePasse
                id="inscription-mdp"
                libelle="Mot de passe"
                placeholder={`Mot de passe, ${LONGUEUR_MOT_DE_PASSE} caractères au moins`}
                autoComplete="new-password"
                minLength={LONGUEUR_MOT_DE_PASSE}
                valeur={motDePasse}
                onChange={setMotDePasse}
              />
            </div>
            <Jauge motDePasse={motDePasse} />
            {erreur && <Erreur>{erreur}</Erreur>}
            <button type="submit" disabled={enCours} className={`${principal} mt-6`}>
              {enCours ? <Point /> : 'Créer mon compte'}
              {!enCours && <ArrowRight className="size-4" aria-hidden />}
            </button>
            <p className="mt-5 text-xs leading-relaxed text-fg-2">
              En continuant vous acceptez les{' '}
              <Link href={chemin('/cgu/')} className="underline underline-offset-2 hover:text-fg">
                conditions d’utilisation
              </Link>
              . Un code vous sera envoyé pour confirmer l’adresse.
            </p>
          </form>
        )}

        {etat === 'oubli' && (
          <form onSubmit={codeEnvoye ? soumettreOubli : demanderCodeOubli}>
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-fg md:text-3xl">Un nouveau mot de passe</h1>
            <p className="mt-2 text-sm text-fg-2">
              {codeEnvoye ? 'Saisissez le code reçu et choisissez votre nouveau mot de passe.' : 'Indiquez votre adresse, nous vous envoyons un code à six chiffres.'}
            </p>
            <div className="mt-6 grid gap-2.5">
              <Champ id="oubli-email" icone={Mail} libelle="Adresse électronique">
                <input
                  id="oubli-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  autoFocus={!codeEnvoye}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse électronique"
                  readOnly={codeEnvoye}
                  className={`${saisie} ${codeEnvoye ? 'text-fg-2' : ''}`}
                />
              </Champ>
              {codeEnvoye && (
                <>
                  <ChampCode valeur={codeSaisi} onChange={setCodeSaisi} />
                  <ChampMotDePasse
                    id="oubli-mdp"
                    libelle="Nouveau mot de passe"
                    placeholder={`Nouveau mot de passe, ${LONGUEUR_MOT_DE_PASSE} caractères au moins`}
                    autoComplete="new-password"
                    minLength={LONGUEUR_MOT_DE_PASSE}
                    valeur={motDePasse}
                    onChange={setMotDePasse}
                  />
                </>
              )}
            </div>
            {info && !erreur && <Info>{info}</Info>}
            {erreur && <Erreur>{erreur}</Erreur>}
            <button type="submit" disabled={enCours || (codeEnvoye && codeSaisi.length < 6)} className={`${principal} mt-6`}>
              {enCours ? <Point /> : codeEnvoye ? 'Enregistrer et me connecter' : 'Recevoir un code'}
              {!enCours && <ArrowRight className="size-4" aria-hidden />}
            </button>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-2">
              {codeEnvoye && (
                <button type="button" onClick={(e) => demanderCodeOubli(e)} disabled={enCours} className={lien}>
                  Renvoyer un code
                </button>
              )}
              <button type="button" onClick={() => aller('connexion')} className={lien}>
                Retour à la connexion
              </button>
            </div>
          </form>
        )}

        {etat === 'verifier' && (
          <form onSubmit={soumettreVerification}>
            <Sceau>
              <Mail className="size-5" aria-hidden />
            </Sceau>
            <h1 className="mt-5 text-balance text-2xl font-semibold tracking-tight text-fg md:text-3xl">Confirmez votre adresse</h1>
            <p className="mt-2 text-sm text-fg-2">
              Un code à six chiffres vient de partir à <span className="font-medium text-fg">{email || 'votre adresse'}</span>. Il vaut dix minutes.
            </p>
            <div className="mt-8">
              <ChampCode valeur={codeSaisi} onChange={setCodeSaisi} />
            </div>
            {erreur && <Erreur>{erreur}</Erreur>}
            {info && !erreur && <Info>{info}</Info>}
            <button type="submit" disabled={enCours || codeSaisi.length < 6} className={`${principal} mt-6`}>
              {enCours ? <Point /> : 'Confirmer'}
              {!enCours && <ArrowRight className="size-4" aria-hidden />}
            </button>
            <p className="mt-6 text-sm text-fg-2">
              L’expéditeur est DentalMap. Rien après une minute ? Regardez vos indésirables, ou{' '}
              <button type="button" onClick={renvoyerVerification} disabled={enCours} className={lien}>
                renvoyez un code
              </button>
              .
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

/** Un champ de mot de passe avec l'œil qui le montre ou le masque. */
function ChampMotDePasse({
  id,
  libelle,
  placeholder,
  autoComplete,
  valeur,
  onChange,
  minLength,
}: {
  id: string
  libelle: string
  placeholder: string
  autoComplete: 'current-password' | 'new-password'
  valeur: string
  onChange: (v: string) => void
  minLength?: number
}) {
  const [visible, setVisible] = useState(false)
  return (
    <Champ id={id} icone={Lock} libelle={libelle}>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        name={autoComplete}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={saisie}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        aria-pressed={visible}
        className="-mr-1.5 grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-fg-2 hover:bg-bg-soft hover:text-fg"
      >
        {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      </button>
    </Champ>
  )
}

/** Un champ en pastille : l'icône à gauche, l'étiquette pour les lecteurs d'écran, la saisie. */
function Champ({ id, icone: Icone, libelle, children }: { id: string; icone: typeof Mail; libelle: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {libelle}
      </label>
      <div className={pastille}>
        <Icone className="size-4 shrink-0 text-fg-2" aria-hidden />
        {children}
      </div>
    </div>
  )
}

/** L'encart Pro Santé Connect : annoncé, pas encore ouvert. */
function ProSanteConnect() {
  return (
    <div className="squircle-xl mt-6 flex items-center gap-3 border border-dashed border-line bg-bg-soft/60 p-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-bg text-fg-2 ring-1 ring-inset ring-line">
        <CreditCard className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-fg">
          Pro Santé Connect
          <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-medium text-fg-2 ring-1 ring-inset ring-line">Bientôt</span>
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-fg-2">Pour les professionnels de santé : connexion par carte CPS ou e-CPS, avec l’Agence du Numérique en Santé.</p>
      </div>
    </div>
  )
}

/** Le champ du code à six chiffres, espacé comme sur un clavier. */
function ChampCode({ valeur, onChange }: { valeur: string; onChange: (v: string) => void }) {
  return (
    <Champ id="connexion-code" icone={Hash} libelle="Code à six chiffres">
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
        className={`${saisie} font-mono text-base tracking-[0.4em]`}
      />
    </Champ>
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

/** Le gros rond qui annonce un état, sarcelle avec une onde. */
function Sceau({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-grid size-12 place-items-center">
      <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-teal/20 motion-reduce:animate-none" />
      <span className="relative grid size-12 place-items-center rounded-full bg-teal text-white shadow-pill">{children}</span>
    </span>
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
