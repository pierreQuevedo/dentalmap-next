import { createHash, randomBytes } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { db } from '@/db'

/**
 * L'équipe d'une fiche : les comptes qui la gèrent, et les invitations en
 * cours. Les titulaires sont ceux dont la revendication a été vérifiée ; les
 * invités gèrent la fiche mais n'invitent ni ne retirent personne.
 */
export type Membre = { revendicationId: string; userId: string; nom: string; email: string; titulaire: boolean; fonction: string | null; depuis: string }
export type Invitation = { id: string; email: string; fonction: string | null; creeLe: string }

export async function getEquipe(praticienId: string): Promise<{ membres: Membre[]; invitations: Invitation[] }> {
  const [{ rows: membres }, { rows: invitations }] = await Promise.all([
    db.execute<{ id: string; user_id: string; name: string; email: string; methode: string; role_labo: string | null; fonction: string | null; traite_le: string | null; demande_le: string }>(sql`
      SELECT r.id, r.user_id, u.name, u.email, r.methode, r.role_labo, r.traite_le, r.demande_le,
             (SELECT i.fonction FROM invitations_fiche i WHERE i.praticien_id = r.praticien_id AND lower(i.email) = lower(u.email) AND i.statut = 'acceptee' LIMIT 1) AS fonction
      FROM revendications r JOIN "user" u ON u.id = r.user_id
      WHERE r.praticien_id = ${praticienId} AND r.statut = 'acceptee' AND r.objet = 'revendication'
      ORDER BY (r.methode = 'invitation'), r.traite_le
    `),
    db.execute<{ id: string; email: string; fonction: string | null; cree_le: string }>(sql`
      SELECT id, email, fonction, cree_le FROM invitations_fiche WHERE praticien_id = ${praticienId} AND statut = 'envoyee' ORDER BY cree_le DESC
    `),
  ])
  return {
    membres: membres.map((m) => ({
      revendicationId: m.id,
      userId: m.user_id,
      nom: m.name,
      email: m.email,
      titulaire: m.methode !== 'invitation',
      fonction: m.fonction ?? (m.role_labo === 'gerant' ? 'Gérant' : m.role_labo === 'mandate' ? 'Mandaté par le gérant' : m.methode === 'invitation' ? 'Membre' : 'Titulaire'),
      depuis: m.traite_le ?? m.demande_le,
    })),
    invitations: invitations.map((i) => ({ id: i.id, email: i.email, fonction: i.fonction, creeLe: i.cree_le })),
  }
}

export function nouveauJeton(): { jeton: string; hash: string } {
  const jeton = randomBytes(32).toString('base64url')
  return { jeton, hash: hacherJeton(jeton) }
}

export function hacherJeton(jeton: string): string {
  return createHash('sha256').update(jeton).digest('hex')
}
