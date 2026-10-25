import { NextResponse, type NextRequest } from 'next/server'
import { LIBELLE } from '@/lib/annuaire/libelles'
import { nomAffiche, type Profession } from '@/lib/annuaire/types'
import { chercherFiches } from '@/lib/espace-pro/parcours'
import { ressembleRpps, rppsMasque, rppsValide } from '@/lib/espace-pro/rpps'
import { getCompte } from '@/lib/tunnel/compte'

const PROFESSIONS: Profession[] = ['dentiste', 'stomatologue', 'maxillo_facial', 'orl']

/**
 * S1 : les premières fiches pendant la frappe. Réservé à un compte connecté,
 * comme la page ; cinq au plus, avec le total pour « Voir les N fiches ». Un
 * numéro RPPS n'est cherché qu'entier et valide.
 */
export async function GET(request: NextRequest) {
  if (!(await getCompte())) return new NextResponse('Connexion requise.', { status: 401 })
  const p = request.nextUrl.searchParams
  const profession = PROFESSIONS.find((x) => x === p.get('profession')) ?? 'dentiste'
  const q = (p.get('q') ?? '').trim().slice(0, 80)
  const chiffres = q.replace(/\s/g, '')
  if (q.length < 3 || (/^\d+$/.test(chiffres) && (!ressembleRpps(q) || !rppsValide(q)))) return NextResponse.json({ resultats: [], total: 0, exact: false })
  const { resultats, total, exact } = await chercherFiches(profession, q)
  return NextResponse.json({
    total,
    exact,
    resultats: resultats.slice(0, 5).map((r) => ({
      slug: r.slug,
      nom: nomAffiche({ ...r, profession: r.profession }),
      detail: [LIBELLE[r.profession].singulier.replace(/^./, (c) => c.toUpperCase()), r.communeNom].filter(Boolean).join(' · '),
      rpps: rppsMasque(r.rpps),
    })),
  })
}
