import { z } from 'zod'
import { cleAdminValide, refusAdmin } from '@/lib/admin/cle'
import { STATUTS_CONTACT, enregistrerContact, getContact, supprimerContact } from '@/lib/admin/base-pros'

/** Un contact saisi par l'équipe, pour la fiche détail de « Base pros ». */
export async function GET(requete: Request) {
  if (!cleAdminValide(requete)) return refusAdmin()
  const contact = await getContact(new URL(requete.url).searchParams.get('id') ?? '')
  return contact ? Response.json({ ok: true, contact }) : Response.json({ ok: false }, { status: 404 })
}

const court = z.string().trim().max(200).optional()
const Saisie = z.object({
  profession: z.enum(['dentiste', 'prothesiste', 'maxillo_facial', 'stomatologue', 'orl', 'autre']),
  prenom: court,
  nom: z.string().trim().min(1, 'Le nom est obligatoire.').max(200),
  structure: court,
  email: z.union([z.literal(''), z.email('Adresse électronique invalide.')]).optional(),
  telephone: z.string().trim().max(40).optional(),
  ville: court,
  codePostal: z.string().trim().max(10).optional(),
  rpps: z.union([z.literal(''), z.string().regex(/^\d{11}$/, 'Un RPPS compte 11 chiffres.')]).optional(),
  siren: z.union([z.literal(''), z.string().regex(/^\d{9}(\d{5})?$/, 'Un SIREN compte 9 chiffres, un SIRET 14.')]).optional(),
  statut: z.enum(STATUTS_CONTACT),
  source: court,
  notes: z.string().max(5000).optional(),
})

const Corps = z.discriminatedUnion('action', [
  z.object({ action: z.literal('enregistrer'), id: z.string().uuid().optional(), par: z.string().max(200).optional(), contact: Saisie }),
  z.object({ action: z.literal('supprimer'), id: z.string().uuid(), par: z.string().max(200).optional() }),
])

/** Création, modification ou suppression d'un contact depuis wp-admin. */
export async function POST(requete: Request) {
  if (!cleAdminValide(requete)) return refusAdmin()
  const r = Corps.safeParse(await requete.json().catch(() => null))
  if (!r.success) return Response.json({ ok: false, erreur: r.error.issues[0]?.message }, { status: 400 })
  const d = r.data
  if (d.action === 'supprimer') {
    const fait = await supprimerContact(d.id)
    if (fait) console.info('[base-pros] contact supprimé', { id: d.id, par: d.par })
    return fait ? Response.json({ ok: true }) : Response.json({ ok: false }, { status: 404 })
  }
  const id = await enregistrerContact(d.contact, d.par, d.id)
  return id ? Response.json({ ok: true, id }) : Response.json({ ok: false }, { status: 404 })
}
