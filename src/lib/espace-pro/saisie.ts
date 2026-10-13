import { cookies } from 'next/headers'

/**
 * La saisie gardée le temps d'un aller-retour d'erreur.
 *
 * Une action refusée renvoie sur la même page avec `?erreur=` : sans ce
 * cookie, le formulaire repartirait de la dernière version enregistrée et
 * ce qui vient d'être tapé serait perdu. Les champs texte envoyés sont donc
 * gardés une minute, pour cette page seulement, et relus seulement quand la
 * page s'ouvre sur une erreur.
 */
const COOKIE = 'dm_saisie'
const TECHNIQUES = new Set(['fiche', 'ici', 'suite', 'avant', 'bloc'])
/** Un cookie tient 4 Ko : au-delà, on renonce plutôt que de tronquer un champ. */
const TAILLE_MAX = 3500

/** Le chemin d'une adresse, sans la requête : la clé de la page. */
const cheminDe = (adresse: string) => adresse.split('?')[0]!.replace(/\/?$/, '/')

export async function garderSaisie(donnees: FormData, ici: string): Promise<void> {
  const champs: Record<string, string | string[]> = {}
  for (const cle of new Set(donnees.keys())) {
    if (TECHNIQUES.has(cle) || cle.startsWith('$ACTION')) continue
    const valeurs = donnees.getAll(cle).filter((v): v is string => typeof v === 'string')
    if (!valeurs.length) continue
    champs[cle] = valeurs.length > 1 ? valeurs : valeurs[0]!
  }
  const valeur = JSON.stringify({ page: cheminDe(ici), champs })
  if (encodeURIComponent(valeur).length > TAILLE_MAX) return
  ;(await cookies()).set(COOKIE, valeur, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60, path: '/' })
}

export type Saisie = { texte: (cle: string) => string | undefined; liste: (cle: string) => string[] | undefined }

const VIDE: Saisie = { texte: () => undefined, liste: () => undefined }

/** Ce qui a été envoyé sur cette page juste avant l'erreur ; rien hors d'une erreur. */
export async function lireSaisie(page: string, erreur: string | undefined): Promise<Saisie> {
  if (!erreur) return VIDE
  const brut = (await cookies()).get(COOKIE)?.value
  if (!brut) return VIDE
  try {
    const { page: p, champs } = JSON.parse(brut) as { page: string; champs: Record<string, string | string[]> }
    if (p !== cheminDe(page)) return VIDE
    return {
      texte: (cle) => {
        const v = champs[cle]
        return Array.isArray(v) ? v[0] : v
      },
      liste: (cle) => {
        const v = champs[cle]
        return v === undefined ? undefined : Array.isArray(v) ? v : [v]
      },
    }
  } catch {
    return VIDE
  }
}
