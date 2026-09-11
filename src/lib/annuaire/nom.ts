/**
 * Mise en forme des noms propres.
 *
 * L'Annuaire Santé livre tout en capitales : « MARIE HELENE BIRAY », « D ARGENT ».
 * Afficher ça tel quel sur une fiche publique donne un rendu criard et daté. On
 * recasse en capitale initiale, en respectant les cas du français.
 *
 * On ne touche pas aux accents manquants : les restituer serait deviner, et une
 * fiche d'annuaire vérifié ne doit rien inventer.
 */

/** Particules qui restent en minuscules quand elles ne commencent pas le nom. */
const PARTICULES = new Set([
  // françaises
  'de', 'du', 'des', 'le', 'la', 'les', 'et', 'aux',
  // romanes
  'da', 'di', 'del', 'della', 'dos', 'das', 'do', 'y',
  // germaniques et néerlandaises
  'van', 'von', 'der', 'den', 'ter', 'ten', 'zu',
])

/** Sigles et formes que l'on garde en capitales. */
const GARDE_CAPITALES = /^(?:[IVXLCDM]+|[A-Z]{1,3})$/

function capitaliser(mot: string): string {
  if (!mot) return mot
  return mot.charAt(0).toUpperCase() + mot.slice(1).toLowerCase()
}

/** Applique la capitalisation à l'intérieur d'un mot composé : tirets et apostrophes. */
function motCompose(mot: string): string {
  // Une parenthèse ouvrante colle au mot suivant : « (burdigala » doit donner
  // « (Burdigala ».
  if (mot.startsWith('(')) return '(' + motCompose(mot.slice(1))
  return mot
    .split('-')
    .map((partie) =>
      partie
        .split("'")
        .map((bout, i) => (i > 0 && bout.length <= 1 ? bout.toLowerCase() : capitaliser(bout)))
        .join("'"),
    )
    .join('-')
}

export function formaterNom(valeur: string | null | undefined): string {
  if (!valeur) return ''
  const mots = valeur.trim().split(/\s+/)
  // Quand la source est intégralement en capitales, comme l'Annuaire Santé, un
  // mot court en capitales n'est pas un sigle : « EL », « DE » ou « LE » sont
  // des morceaux de nom. La préservation des sigles n'a de sens que sur une
  // source en casse mixte.
  const casseMixte = /[a-z]/.test(valeur)
  return mots
    .map((mot, i) => {
      const bas = mot.toLowerCase()
      if (i > 0 && PARTICULES.has(bas)) return bas
      if (casseMixte && mot.length <= 3 && GARDE_CAPITALES.test(mot)) return mot
      return motCompose(mot)
    })
    .join(' ')
}

/**
 * Raison sociale d'un laboratoire.
 *
 * Sirene renvoie « LABORATOIRE DENTAIRE GIRONDIN » ou « SARL BANCE ». Même
 * traitement, en conservant les formes juridiques en capitales.
 */
const FORMES_JURIDIQUES = new Set(['SARL', 'SAS', 'SASU', 'EURL', 'SCP', 'SELARL', 'SNC', 'SA', 'SCI', 'SCM', 'EI'])

/**
 * Sirene renvoie « RAISON SOCIALE (ENSEIGNE) ». Quand l'enseigne répète la
 * raison sociale, la parenthèse n'apporte rien et alourdit chaque titre de
 * fiche : on la retire.
 */
function sansEnseigneRedondante(valeur: string): string {
  const m = valeur.match(/^(.*?)\s*\((.+)\)\s*$/)
  if (!m) return valeur
  const [, principal = '', enseigne = ''] = m
  const norme = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, '')
  return norme(principal) === norme(enseigne) ? principal : valeur
}

export function formaterRaisonSociale(valeur: string | null | undefined): string {
  if (!valeur) return ''
  const m = valeur.trim().match(/^(.*?)\s*\((.+)\)$/)
  if (!m) return formaterSegment(valeur.trim())

  const [, principal = '', enseigne = ''] = m
  const norme = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, '')
  // Une enseigne qui répète la raison sociale n'apporte rien et alourdit chaque
  // titre de fiche : Sirene renvoie souvent « X (X) ».
  if (norme(principal) === norme(enseigne)) return formaterSegment(principal)

  // Un sigle court reste en capitales : « (ODF) », « (LDP) ».
  const estSigle = /^[A-Z0-9&.\-]{2,6}$/.test(enseigne.trim())
  return `${formaterSegment(principal)} (${estSigle ? enseigne.trim() : formaterSegment(enseigne)})`
}

function formaterSegment(valeur: string): string {
  return valeur
    .trim()
    .split(/\s+/)
    .map((mot) => (FORMES_JURIDIQUES.has(mot.toUpperCase()) ? mot.toUpperCase() : motCompose(mot.toLowerCase())))
    .join(' ')
}
