import { sql, type SQL } from 'drizzle-orm'
import { CONFIRMATION_JOURS } from './offre-pro'

/**
 * Une offre visible : en ligne, avant son échéance, et confirmée depuis moins
 * de 15 jours. Sans confirmation, elle sort de la recherche sans être
 * supprimée : le recruteur la retrouve dans ses offres et la remet en ligne en
 * la confirmant. `a` est l'alias de la table `offres` dans la requête.
 */
export function offreEnLigne(a: 'o' | '' = 'o'): SQL {
  const c = (col: string) => sql.raw(a ? `${a}.${col}` : col)
  return sql`(${c('statut')} = 'en_ligne' AND (${c('expire_le')} IS NULL OR ${c('expire_le')} > now())
    AND coalesce(${c('confirmee_le')}, ${c('publiee_le')}) > now() - make_interval(days => ${CONFIRMATION_JOURS}))`
}
