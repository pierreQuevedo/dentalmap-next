'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from 'react'
import { ArrowRight, BriefcaseBusiness, Building2, Circle, CircleCheck, CreditCard, Eye, EyeOff, Hourglass, KeyRound, Lock, Mail, RefreshCw, UserRound } from 'lucide-react'
import { emailOtp, signIn, signUp } from '@/lib/auth-client'
import { chemin } from '@/lib/navigation'
import type { Role } from '@/lib/tunnel/etapes'
import { CRITERES_MOT_DE_PASSE, LONGUEUR_MOT_DE_PASSE, MESSAGE_MOT_DE_PASSE, motDePasseValide } from '@/lib/tunnel/mot-de-passe'
import { EVENEMENT_PROFIL } from './chiffres-profil'
import { suggererAdresse } from './suggestion'
import { CarteOption, Encart, Marque, Pictogramme, lien, pastille, pastilleInvalide, principal, saisie, secondaire, titre } from './ui'

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
 * Les erreurs ont leur écran : identifiants refusés avec suggestion de
 * correction de l'adresse (CX1-E), code faux avec les essais restants
 * (CX2-E), code expiré ou épuisé avec l'adresse gardée (CX5). Sans accès à
 * son adresse, on choisit sa voie selon son profil (CX6).
 *
 * `?mode=inscription` ouvre directement l'inscription, `&profil=` y
 * présélectionne le profil : les boutons « Créer un compte » du site.
 */
const PROFILS: { role: Role; titre: string; detail: string }[] = [
  { role: 'patient', titre: 'Patient', detail: 'Je cherche un professionnel.' },
  { role: 'dentiste', titre: 'Dentiste', detail: 'Chirurgien-dentiste, je gère ma fiche.' },
  { role: 'prothesiste', titre: 'Laboratoire', detail: 'Laboratoire de prothèse dentaire.' },
  { role: 'medecin', titre: 'Médecin', detail: 'Chirurgien maxillo-facial, stomatologue ou ORL.' },
  { role: 'organisme', titre: 'École', detail: 'École ou faculté : je gère la page de l’établissement.' },
]

/** Le bouton d'inscription dit pour quel profil le compte est créé. */
const BOUTON_INSCRIPTION: Record<Role, string> = {
  patient: 'Créer mon compte patient',
  dentiste: 'Créer mon compte dentiste',
  prothesiste: 'Créer mon compte laboratoire',
  medecin: 'Créer mon compte médecin',
  organisme: 'Créer mon compte école',
}

/** Essais par code, comme `allowedAttempts` dans `src/lib/auth.ts`. */
const ESSAIS_PAR_CODE = 5

type TypeCode = 'email-verification' | 'forget-password'
type Voie = 'sante' | 'structure' | 'patient'

/** Le code est mort : expiré, ou trop d'essais. Il faut en demander un autre. */
const codeMort = (code?: string) => code === 'OTP_EXPIRED' || code === 'TOO_MANY_ATTEMPTS'

type Etat = 'connexion' | 'inscription' | 'oubli' | 'verifier' | 'expire' | 'recuperation'

export function Connexion({ retour, inscription = false, profil }: { retour: string; inscription?: boolean; profil?: Role }) {
  const [etat, setEtat] = useState<Etat>(inscription ? 'inscription' : 'connexion')
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [codeSaisi, setCodeSaisi] = useState('')
  /** Le code est mort de trop d'essais, pas de son âge : l'écran d'expiration le dit. */
  const [tropDEssais, setTropDEssais] = useState(false)
  const formulaireCode = useRef<HTMLFormElement>(null)
  const [codeEnvoye, setCodeEnvoye] = useState(false)
  // Le profil demandé par le lien, sinon soignant quand on vient de l'espace pro.
  const [role, setRole] = useState<Role>(
    profil && PROFILS.some((p) => p.role === profil)
      ? profil
      : // Depuis le parcours d'un établissement (O1, page publique d'une école), l'école est choisie d'office.
        retour.startsWith('/espace-pro/organisme') || retour.startsWith('/espace-pro/etablissement')
        ? 'organisme'
        : retour.startsWith('/espace-pro')
          ? 'dentiste'
          : 'patient',
  )
  const [nom, setNom] = useState('')
  // Le volet de gauche suit le profil choisi pendant toute l'inscription, code compris (`ChiffresProfil`).
  const sInscrit = etat === 'inscription' || (etat === 'verifier' && !!nom)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(EVENEMENT_PROFIL, { detail: sInscrit ? role : null }))
  }, [sInscrit, role])
  const [erreur, setErreur] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  /** Identifiants refusés : l'écran passe en CX1-E. */
  const [refuse, setRefuse] = useState(false)
  /** Échecs sur le code en cours : au-delà de cinq, il est annulé. */
  const [echecs, setEchecs] = useState(0)
  const [typeCode, setTypeCode] = useState<TypeCode>('email-verification')
  const [adresseVue, setAdresseVue] = useState(false)
  const [voie, setVoie] = useState<Voie>('structure')
  const [enCours, demarrer] = useTransition()
  /** Le navigateur sait-il utiliser une clé d'accès ? Faux au rendu serveur, lu dans le navigateur ensuite. */
  const webauthn = useSyncExternalStore(
    () => () => {},
    () => 'PublicKeyCredential' in window,
    () => false,
  )

  const aller = (e: Etat) => {
    setErreur(null)
    setInfo(null)
    setRefuse(false)
    setEchecs(0)
    setCodeSaisi('')
    setCodeEnvoye(false)
    setMotDePasse('')
    setEtat(e)
  }

  const suggestion = adresseVue || refuse ? suggererAdresse(email) : null
  const essaisRestants = ESSAIS_PAR_CODE - echecs

  /** Un code refusé : faux, on compte ; mort, on passe à l'écran d'expiration. */
  const codeRefuse = (code?: string) => {
    if (codeMort(code) || echecs + 1 >= ESSAIS_PAR_CODE) {
      const e = email
      setTropDEssais(code === 'TOO_MANY_ATTEMPTS' || (code !== 'OTP_EXPIRED' && echecs + 1 >= ESSAIS_PAR_CODE))
      aller('expire')
      setEmail(e)
      return
    }
    setEchecs((n) => n + 1)
    // Les six cases se vident et la première reprend la main : on ressaisit sans effacer chiffre par chiffre.
    setCodeSaisi('')
    requestAnimationFrame(() => document.getElementById('connexion-code-0')?.focus())
  }

  /** Mène là où l'on voulait aller : la page de profil relit le compte et décide de la suite. */
  const continuer = () => window.location.assign(chemin(`/inscription/profil/?retour=${encodeURIComponent(retour)}`))

  const soumettreConnexion = (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)
    demarrer(async () => {
      const { error } = await signIn.email({ email, password: motDePasse })
      if (!error) return window.location.assign(chemin(`/connexion/cle-d-acces/?retour=${encodeURIComponent(retour)}`))
      if (error.status === 403) {
        // Adresse jamais confirmée : on envoie un code et on passe à la confirmation.
        await emailOtp.sendVerificationOtp({ email, type: 'email-verification' })
        aller('verifier')
        setTypeCode('email-verification')
        setInfo(`Votre adresse n’a pas encore été confirmée. Un code vient de partir à ${email}.`)
        return
      }
      // Le message ne dit jamais lequel des deux est faux.
      setRefuse(true)
    })
  }

  /** Connexion par clé d'accès : le navigateur propose les clés enregistrées pour DentalMap. */
  const connexionParCle = () => {
    setErreur(null)
    demarrer(async () => {
      const { error } = await signIn.passkey()
      if (!error) return window.location.assign(chemin(retour))
      setErreur('La connexion par clé d’accès n’a pas abouti. Réessayez, ou utilisez votre adresse et votre mot de passe.')
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
        etapeTunnel: role === 'patient' || role === 'organisme' ? 'tableau-de-bord' : 'fiche',
      })
      if (error) {
        setErreur(
          error.status === 422 || /exist/i.test(error.message ?? '')
            ? 'Un compte existe déjà avec cette adresse.'
            : error.code === 'PASSWORD_TOO_WEAK' || error.code === 'PASSWORD_TOO_SHORT'
              ? MESSAGE_MOT_DE_PASSE
              : 'Le compte n’a pas pu être créé. Réessayez dans un instant ; si cela persiste, écrivez-nous.',
        )
        return
      }
      // Le code de confirmation part avec l'inscription ; l'écran suivant le dit déjà dans son texte.
      aller('verifier')
      setTypeCode('email-verification')
    })
  }

  const soumettreVerification = (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)
    demarrer(async () => {
      const { error } = await emailOtp.verifyEmail({ email, otp: codeSaisi })
      if (error) codeRefuse(error.code)
      else continuer()
    })
  }

  const renvoyerVerification = () => {
    setErreur(null)
    demarrer(async () => {
      const { error } = await emailOtp.sendVerificationOtp({ email, type: 'email-verification' })
      if (error) setErreur('Le code n’a pas pu être renvoyé.')
      else {
        setEchecs(0)
        setCodeSaisi('')
        setInfo(`Un nouveau code vient de partir à ${email}.`)
      }
    })
  }

  /** CX5 : un nouveau code pour la même adresse, et retour à l'écran qui l'attend. */
  const redemanderCode = (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)
    demarrer(async () => {
      const { error } = await emailOtp.sendVerificationOtp({ email, type: typeCode })
      if (error) {
        setErreur('Le code n’a pas pu être envoyé. Vérifiez l’adresse.')
        return
      }
      if (typeCode === 'forget-password') {
        aller('oubli')
        setCodeEnvoye(true)
      } else aller('verifier')
      setInfo(`Un nouveau code vient de partir à ${email}.`)
    })
  }

  /** CX6 : chaque profil sa voie. */
  const choisirVoie = (e: React.FormEvent) => {
    e.preventDefault()
    if (voie === 'structure') return window.location.assign(chemin('/contact/'))
    setRole('patient')
    setEmail('')
    aller('inscription')
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
      setTypeCode('forget-password')
      setEchecs(0)
      setInfo(`Un code à six chiffres vient de partir à ${email}.`)
    })
  }

  const soumettreOubli = (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)
    demarrer(async () => {
      const { error } = await emailOtp.resetPassword({ email, otp: codeSaisi, password: motDePasse })
      if (error) {
        if (error.code === 'INVALID_OTP' || codeMort(error.code)) codeRefuse(error.code)
        else setErreur(error.code === 'PASSWORD_TOO_WEAK' || error.code === 'PASSWORD_TOO_SHORT' ? MESSAGE_MOT_DE_PASSE : 'Le mot de passe n’a pas pu être enregistré. Réessayez dans un instant.')
        return
      }
      const connexion = await signIn.email({ email, password: motDePasse })
      // Même suite qu'une connexion : la proposition de clé d'accès, puis la page visée (l'espace pro pour un professionnel).
      if (connexion.error) aller('connexion')
      else window.location.assign(chemin(`/connexion/cle-d-acces/?retour=${encodeURIComponent(retour)}`))
    })
  }

  return (
    <div>
      <Marque />

      {/* La clé remonte le bloc à chaque état : il rejoue son entrée. */}
      <div key={etat} className="animate-fiche-entree">
        {etat === 'connexion' && (
          <form onSubmit={soumettreConnexion}>
            <h1 className={titre}>Connexion</h1>
            <p className="mt-2 text-sm text-fg-2">Votre adresse et votre mot de passe.</p>
            <div className="mt-6 grid gap-4">
              <Champ
                id="connexion-email"
                icone={Mail}
                libelle="Adresse électronique"
                invalide={!!suggestion}
                aide={
                  suggestion && (
                    <button type="button" onClick={() => setEmail(suggestion)} className="cursor-pointer text-left hover:underline">
                      Vouliez-vous dire {suggestion} ?
                    </button>
                  )
                }
              >
                <input
                  id="connexion-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setAdresseVue(true)}
                  placeholder="prenom.nom@exemple.fr"
                  className={saisie}
                />
              </Champ>
              <ChampMotDePasse id="connexion-mdp" libelle="Mot de passe" placeholder="••••••••••••" autoComplete="current-password" valeur={motDePasse} onChange={setMotDePasse} />
            </div>
            {refuse ? (
              <Encart ton="erreur" className="mt-4">
                Adresse ou mot de passe incorrect. Vérifiez la saisie, ou passez par « Mot de passe oublié ».
              </Encart>
            ) : (
              <div className="mt-2.5 text-right text-xs">
                <button type="button" onClick={() => aller('oubli')} className="cursor-pointer text-fg-2 underline-offset-4 hover:text-fg hover:underline">
                  Mot de passe oublié ?
                </button>
              </div>
            )}
            <button type="submit" disabled={enCours} className={`${principal} mt-5`}>
              {enCours ? <Point /> : 'Se connecter'}
              {!enCours && <ArrowRight className="size-4" aria-hidden />}
            </button>
            {webauthn && (
              <button type="button" onClick={connexionParCle} disabled={enCours} className={`${secondaire} mt-2.5`}>
                <KeyRound className="size-4" aria-hidden />
                Se connecter avec une clé d’accès
              </button>
            )}
            {erreur && (
              <Encart ton="erreur" className="mt-4">
                {erreur}
              </Encart>
            )}
            {refuse ? (
              <p className="mt-4 text-sm">
                <button type="button" onClick={() => aller('oubli')} className={lien}>
                  Mot de passe oublié ?
                </button>
              </p>
            ) : (
              <>
                <ProSanteConnect />
                <p className="mt-5 text-sm text-fg-2">
              Vous n’avez pas encore de compte ?{' '}
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
              </>
            )}
          </form>
        )}

        {etat === 'inscription' && (
          <form onSubmit={soumettreInscription}>
            <h1 className={titre}>Créer un compte</h1>
            <p className="mt-2 text-sm text-fg-2">
              Déjà inscrit ?{' '}
              <button type="button" onClick={() => aller('connexion')} className={lien}>
                Connectez-vous
              </button>
            </p>
            {/*
              Le profil : un sélecteur à cinq segments sur toute la largeur
              des champs, comme celui de la recherche de l'accueil. Le
              surligneur glisse sous le segment choisi ; une ligne dessous dit
              ce qu'il recouvre.
            */}
            <fieldset className="mt-6">
              <legend className="mb-2.5 text-sm font-medium text-fg">Vous êtes</legend>
              <div className="relative grid grid-cols-5 rounded-full border border-line bg-bg-soft p-1">
                <span
                  aria-hidden
                  className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/5)] rounded-full bg-bg shadow-pill transition-transform duration-moderate ease-spring motion-reduce:transition-none"
                  style={{ transform: `translateX(${PROFILS.findIndex((p) => p.role === role) * 100}%)` }}
                />
                {PROFILS.map((p) => {
                  const choisi = role === p.role
                  return (
                    <label
                      key={p.role}
                      className={`relative z-10 flex h-9 cursor-pointer items-center justify-center whitespace-nowrap rounded-full px-0.5 text-[12px] font-medium sm:px-1 sm:text-[13px] transition-colors duration-fast has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action ${
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
            <div className="mt-5 grid gap-4">
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
                  placeholder={role === 'prothesiste' ? 'Laboratoire Dupont' : 'Marie Dupont'}
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
                  placeholder="prenom.nom@exemple.fr"
                  className={saisie}
                />
              </Champ>
              <ChampMotDePasse
                id="inscription-mdp"
                libelle="Mot de passe"
                placeholder={`${LONGUEUR_MOT_DE_PASSE} caractères au moins`}
                autoComplete="new-password"
                minLength={LONGUEUR_MOT_DE_PASSE}
                valeur={motDePasse}
                onChange={setMotDePasse}
              />
            </div>
            <Criteres motDePasse={motDePasse} />
            {erreur && <Erreur>{erreur}</Erreur>}
            <button type="submit" disabled={enCours || !motDePasseValide(motDePasse)} className={`${principal} mt-6`}>
              {enCours ? <Point /> : BOUTON_INSCRIPTION[role]}
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
            <h1 className={titre}>Un nouveau mot de passe</h1>
            <p className="mt-2 text-sm text-fg-2">
              {codeEnvoye ? 'Saisissez le code reçu et choisissez votre nouveau mot de passe.' : 'Indiquez votre adresse, nous vous envoyons un code à six chiffres.'}
            </p>
            <div className="mt-6 grid gap-4">
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
                  placeholder="prenom.nom@exemple.fr"
                  readOnly={codeEnvoye}
                  className={`${saisie} ${codeEnvoye ? 'text-fg-2' : ''}`}
                />
              </Champ>
              {codeEnvoye && (
                <>
                  <ChampCode valeur={codeSaisi} onChange={setCodeSaisi} invalide={echecs > 0} />
                  <ChampMotDePasse
                    id="oubli-mdp"
                    libelle="Nouveau mot de passe"
                    placeholder={`${LONGUEUR_MOT_DE_PASSE} caractères au moins`}
                    autoComplete="new-password"
                    minLength={LONGUEUR_MOT_DE_PASSE}
                    valeur={motDePasse}
                    onChange={setMotDePasse}
                  />
                  <Criteres motDePasse={motDePasse} />
                </>
              )}
            </div>
            {echecs > 0 && <CodeFaux restants={essaisRestants} />}
            {info && !erreur && echecs === 0 && <Info>{info}</Info>}
            {erreur && <Erreur>{erreur}</Erreur>}
            <button type="submit" disabled={enCours || (codeEnvoye && (codeSaisi.length < 6 || !motDePasseValide(motDePasse)))} className={`${principal} mt-6`}>
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
              {!codeEnvoye && (
                <button type="button" onClick={() => aller('recuperation')} className="cursor-pointer text-fg-2 underline-offset-4 hover:text-fg hover:underline">
                  Plus accès à votre adresse ?
                </button>
              )}
            </div>
          </form>
        )}

        {etat === 'verifier' && (
          <form ref={formulaireCode} onSubmit={soumettreVerification}>
            <h1 className={titre}>Confirmez votre adresse</h1>
            <p className="mt-2 text-sm text-fg-2">
              Un code à six chiffres vient de partir à <span className="font-medium text-fg">{email || 'votre adresse'}</span>. Il vaut dix minutes.
            </p>
            <div className="mt-8">
              <ChampCode
                valeur={codeSaisi}
                onChange={(v) => {
                  setCodeSaisi(v)
                  // Le sixième chiffre, saisi ou collé, envoie le code : plus besoin de « Confirmer ».
                  if (v.length === 6 && codeSaisi.length < 6 && !enCours) requestAnimationFrame(() => formulaireCode.current?.requestSubmit())
                }}
                invalide={echecs > 0}
              />
            </div>
            {echecs > 0 && <CodeFaux restants={essaisRestants} />}
            {erreur && <Erreur>{erreur}</Erreur>}
            {info && !erreur && echecs === 0 && <Info>{info}</Info>}
            <button type="submit" disabled={enCours || codeSaisi.length < 6} className={`${principal} ${echecs > 0 ? 'mt-4' : 'mt-6'}`}>
              {enCours ? <Point /> : 'Confirmer'}
              {!enCours && <ArrowRight className="size-4" aria-hidden />}
            </button>
            {echecs > 0 ? (
              <button type="button" onClick={renvoyerVerification} disabled={enCours} className={`${secondaire} mt-3`}>
                <RefreshCw className="size-4" aria-hidden />
                Recevoir un nouveau code
              </button>
            ) : (
              <p className="mt-6 text-sm text-fg-2">
                L’expéditeur est DentalMap. Rien après une minute ? Regardez vos indésirables, ou{' '}
                <button type="button" onClick={renvoyerVerification} disabled={enCours} className={lien}>
                  renvoyez un code
                </button>
                .
              </p>
            )}
          </form>
        )}

        {etat === 'expire' && (
          <form onSubmit={redemanderCode}>
            <Pictogramme icone={Hourglass} ton="attention" />
            <h1 className={titre}>{tropDEssais ? 'Ce code est annulé' : 'Ce code a expiré'}</h1>
            <p className="mt-2 text-sm text-fg-2">
              {tropDEssais ? 'Trop d’essais : par sécurité, il ne vaut plus.' : 'Il valait dix minutes, ou il a déjà servi.'} Votre adresse est gardée : un clic suffit pour en recevoir un autre.
            </p>
            <div className="mt-6">
              <Champ id="expire-email" icone={Mail} libelle="Adresse électronique">
                <input
                  id="expire-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prenom.nom@exemple.fr"
                  className={saisie}
                />
              </Champ>
            </div>
            {erreur && <Erreur>{erreur}</Erreur>}
            <button type="submit" disabled={enCours} className={`${principal} mt-4`}>
              {enCours ? <Point /> : 'Recevoir un nouveau code'}
              {!enCours && <ArrowRight className="size-4" aria-hidden />}
            </button>
            <p className="mt-6 text-sm">
              <button type="button" onClick={() => aller('connexion')} className={lien}>
                Retour à la connexion
              </button>
            </p>
          </form>
        )}

        {etat === 'recuperation' && (
          <form onSubmit={choisirVoie}>
            <h1 className={titre}>Plus accès à votre adresse ?</h1>
            <p className="mt-2 text-sm text-fg-2">Selon votre profil, nous vous proposons la voie la plus rapide.</p>
            <fieldset className="mt-6">
              <legend className="sr-only">Votre profil</legend>
              <div className="grid gap-2.5">
                {/* Pro Santé Connect n'ouvre pas encore de session : annoncé, comme sur l'écran de connexion. */}
                <CarteOption
                  name="voie"
                  value="sante"
                  titre="Professionnel de santé"
                  detail="Identifiez-vous avec votre carte CPS ou e-CPS."
                  icone={CreditCard}
                  badge="Bientôt"
                  disabled
                  checked={voie === 'sante'}
                  onChange={() => setVoie('sante')}
                />
                <CarteOption
                  name="voie"
                  value="structure"
                  titre="Laboratoire ou établissement"
                  detail="Nous vérifions votre lien avec la structure, puis changeons l’adresse."
                  icone={BriefcaseBusiness}
                  badge="48 h"
                  checked={voie === 'structure'}
                  onChange={() => setVoie('structure')}
                />
                <CarteOption
                  name="voie"
                  value="patient"
                  titre="Patient"
                  detail="Créez un compte avec votre nouvelle adresse."
                  icone={UserRound}
                  checked={voie === 'patient'}
                  onChange={() => setVoie('patient')}
                />
              </div>
            </fieldset>
            <button type="submit" className={`${principal} mt-4`}>
              Continuer
              <ArrowRight className="size-4" aria-hidden />
            </button>
            <p className="mt-6 text-sm">
              <button type="button" onClick={() => aller('connexion')} className={lien}>
                Retour à la connexion
              </button>
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

/** Un champ en pastille : l'icône à gauche, l'étiquette, la saisie. En erreur, contour rouge et aide dessous. */
function Champ({
  id,
  icone: Icone,
  libelle,
  invalide = false,
  aide,
  children,
}: {
  id: string
  icone: typeof Mail
  libelle: string
  invalide?: boolean
  aide?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg">
        {libelle}
      </label>
      <div className={invalide ? pastilleInvalide : pastille}>
        <Icone className="size-4 shrink-0 text-fg-2" aria-hidden />
        {children}
      </div>
      {aide && (
        <p className="mt-1.5 text-xs text-destructive" aria-live="polite">
          {aide}
        </p>
      )}
    </div>
  )
}

/** CX2-E : le code refusé, et ce qu'il reste d'essais avant qu'il soit annulé. */
function CodeFaux({ restants }: { restants: number }) {
  return (
    <Encart ton="erreur" titre="Ce code ne correspond pas" className="mt-4">
      Il vous reste {restants} essai{restants > 1 ? 's' : ''}. Au-delà, ce code sera annulé.
    </Encart>
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

/**
 * Le code à six chiffres, une case par chiffre.
 *
 * Chaque case ne prend qu'un chiffre et passe la main à la suivante ; un
 * retour arrière sur une case vide revient à la précédente ; un code collé
 * remplit les six d'un coup. La première case porte `one-time-code` pour
 * que le navigateur propose le code reçu. Le formulaire voit une seule
 * valeur, par le champ caché.
 */
function ChampCode({ valeur, onChange, invalide = false }: { valeur: string; onChange: (v: string) => void; invalide?: boolean }) {
  const cases = Array.from({ length: 6 }, (_, i) => valeur[i] ?? '')
  const focaliser = (i: number) => document.getElementById(`connexion-code-${Math.max(0, Math.min(5, i))}`)?.focus()
  const poser = (i: number, chiffres: string) => {
    const propres = chiffres.replace(/\D/g, '')
    if (!propres) return
    const suivant = (valeur.slice(0, i) + propres + valeur.slice(i + propres.length)).slice(0, 6)
    onChange(suivant)
    focaliser(i + propres.length)
  }
  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-medium text-fg">Code à six chiffres</legend>
      <input type="hidden" name="code" value={valeur} />
      <div className="grid grid-cols-6 gap-2">
        {cases.map((c, i) => (
          <input
            key={i}
            id={`connexion-code-${i}`}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            aria-label={`Chiffre ${i + 1} sur 6`}
            maxLength={6}
            autoFocus={i === 0}
            value={c}
            onChange={(e) => {
              const v = e.target.value
              if (v === '') {
                onChange(valeur.slice(0, i) + valeur.slice(i + 1))
                return
              }
              poser(i, v.length > 1 ? v.replace(c, '') || v : v)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !c && i > 0) {
                e.preventDefault()
                onChange(valeur.slice(0, i - 1) + valeur.slice(i))
                focaliser(i - 1)
              } else if (e.key === 'ArrowLeft') focaliser(i - 1)
              else if (e.key === 'ArrowRight') focaliser(i + 1)
            }}
            onPaste={(e) => {
              e.preventDefault()
              poser(0, e.clipboardData.getData('text'))
            }}
            onFocus={(e) => e.target.select()}
            aria-invalid={invalide || undefined}
            className={`champ-compte squircle-lg h-12 w-full border bg-bg text-center font-mono text-xl text-fg shadow-pill outline-none ${invalide ? 'border-destructive' : 'border-line focus:border-fg'}`}
          />
        ))}
      </div>
    </fieldset>
  )
}

/** Les critères du mot de passe, cochés au fil de la saisie. */
export function Criteres({ motDePasse }: { motDePasse: string }) {
  return (
    <ul className="mt-3 grid gap-1 text-xs sm:grid-cols-2" aria-live="polite" aria-label="Règles du mot de passe">
      {CRITERES_MOT_DE_PASSE.map((c) => {
        const ok = c.test(motDePasse)
        return (
          <li key={c.cle} className={`flex items-center gap-1.5 ${ok ? 'text-teal' : 'text-fg-2'}`}>
            {ok ? <CircleCheck className="size-3.5 shrink-0" aria-hidden /> : <Circle className="size-3.5 shrink-0" aria-hidden />}
            {c.libelle}
            <span className="sr-only">{ok ? ' : respecté' : ' : manquant'}</span>
          </li>
        )
      })}
    </ul>
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
