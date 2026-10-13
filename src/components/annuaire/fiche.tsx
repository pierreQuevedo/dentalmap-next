import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { connection } from 'next/server'
import type { Metadata } from 'next'
import { HeaderTransparent } from '@/components/home/HeaderTransparent'
import { getFicheCompletee, getPraticien, getPraticiensProches, getRedirection } from '@/lib/annuaire/queries'
import { aDuContenu } from '@/lib/espace-pro/fiche-completee'
import { momentParis } from '@/lib/annuaire/ouverture'
import { LIBELLE as LIBELLE_PROFESSION } from '@/lib/annuaire/libelles'
import { BASE_URL, estPersonne, nomAffiche, type Profession } from '@/lib/annuaire/types'
import { Voisins } from './voisins'
import { estFavori, getCompte } from '@/lib/tunnel/compte'
import { chemin } from './primitives'
import { SectionRecrute } from './recrutement'
import { getOffresEnLigne } from '@/lib/annuaire/recrutement'
import { Balisage, fichePraticien, filAriane } from '@/lib/seo/jsonld'
import { FichePersonne } from './fiche-personne'
import { FicheLabo } from './fiche-labo'
import type { ContexteFiche } from './fiche-blocs'

type Params = { departement: string; commune: string; slug: string }

const LIBELLE: Record<Profession, { singulier: string; pluriel: string }> = {
  dentiste: { singulier: 'Chirurgien-dentiste', pluriel: 'Chirurgiens-dentistes' },
  prothesiste: { singulier: 'Laboratoire de prothèse dentaire', pluriel: 'Laboratoires de prothèse dentaire' },
  maxillo_facial: { singulier: 'Chirurgien maxillo-facial', pluriel: 'Chirurgiens maxillo-faciaux' },
  stomatologue: { singulier: 'Stomatologue', pluriel: 'Stomatologues' },
  orl: { singulier: 'Oto-rhino-laryngologiste', pluriel: 'Oto-rhino-laryngologistes' },
}

/** Rayon de recherche des confrères proposés en bas de fiche, en mètres. */
const RAYON_VOISINS = 3_000

export async function metadonneesFiche(profession: Profession, params: Params): Promise<Metadata> {
  const { departement, commune, slug } = await params
  const p = await getPraticien(profession, departement, commune, slug)
  if (!p) return { title: 'Fiche introuvable' }
  const principal = p.lieux.find((l) => l.principal) ?? p.lieux[0]
  const nom = nomAffiche(p)
  const lieu = principal?.communeNom ?? ''
  const qualite = p.specialite ?? LIBELLE[profession].singulier
  const titre = `${nom}, ${qualite.toLowerCase()} à ${lieu}`
  return {
    title: titre,
    description:
      `${nom}, ${qualite.toLowerCase()} à ${lieu}. ` +
      `Adresse, téléphone, numéro RPPS et informations vérifiées auprès des registres officiels.`,
    alternates: { canonical: `/${BASE_URL[profession]}/${departement}/${commune}/${slug}/` },
    // Une fiche non indexable reste consultable et trouvable par recherche
    // nominative, mais sort des moteurs : sans position, elle n'apporte rien.
    robots: p.indexable ? undefined : { index: false, follow: true },
  }
}

/**
 * Fiche d'un professionnel.
 *
 * Deux natures d'information, toujours distinguées : ce que le registre
 * affirme, identité, adresses, identifiants, qui se vérifie ; et ce que le
 * professionnel renseigne, horaires, langues, accès, délais, qui se croit et
 * porte sa mention de source. Deux mises en page : les personnes
 * (`FichePersonne`), lues par des patients, et les laboratoires
 * (`FicheLabo`), lus par des cabinets. Les confrères à proximité et les
 * offres d'emploi viennent après, communs aux deux.
 */
export async function PageFiche({ profession, params }: { profession: Profession; params: Promise<Params> }) {
  const { departement, commune, slug } = await params
  const p = await getPraticien(profession, departement, commune, slug)
  if (!p) {
    // Avant de conclure à une page introuvable, on regarde si l'URL vient de
    // l'ancien site. `permanentRedirect` émet un 308, que Google traite comme
    // un 301.
    const cible = await getRedirection(`/${BASE_URL[profession]}/${departement}/${commune}/${slug}/`)
    if (cible) permanentRedirect(chemin(cible))
    notFound()
  }

  const base = BASE_URL[profession]
  const principal = p.lieux.find((l) => l.principal) ?? p.lieux[0]
  const nom = nomAffiche(p)
  const cheminFiche = `/${base}/${departement}/${commune}/${slug}/`
  const situe = principal?.lon != null && principal.lat != null && !principal.approximative
  const personne = estPersonne(profession)

  const [completee, compte, voisins, offres] = await Promise.all([
    getFicheCompletee(slug),
    getCompte(),
    situe ? getPraticiensProches(profession, principal.lon!, principal.lat!, RAYON_VOISINS, 4) : Promise.resolve([]),
    // Offres d'emploi en ligne : pastille « Recrute » et section en fin de fiche.
    getOffresEnLigne(p.id, slug),
  ])
  const favori = compte ? await estFavori(compte.id, slug) : false
  const proches = voisins.filter((v) => v.slug !== slug).slice(0, 3)
  // L'état « ouvert » et le jour courant se lisent à la requête, jamais au prérendu.
  await connection()
  const maintenant = new Date()

  const segments = [
    { nom: 'Accueil', chemin: '/' },
    { nom: LIBELLE[profession].pluriel, chemin: `/${base}/` },
    { nom: principal?.communeNom ?? commune, chemin: `/${base}/${departement}/${commune}/` },
    { nom, chemin: cheminFiche },
  ]
  const contexte: ContexteFiche = {
    p,
    base,
    nom,
    qualite: LIBELLE[profession].singulier,
    principal,
    appel: principal?.aTelephone ? principal : (p.lieux.find((l) => l.aTelephone) ?? principal),
    fiche: aDuContenu(completee) ? completee : null,
    geree: completee !== null,
    favori,
    recrute: offres.length > 0,
    radie: p.supprimeLe !== null,
    etudiant: p.categorieProfessionnelle === 'Etudiant',
    cheminFiche,
    ariane: segments.map((s, i) => (i < segments.length - 1 ? { libelle: s.nom, href: s.chemin } : { libelle: s.nom })),
    liens: [
      { libelle: `Tous les ${LIBELLE_PROFESSION[profession].pluriel} à ${principal?.communeNom ?? commune}`, href: `/${base}/${departement}/${commune}/` },
      { libelle: 'Dans le département', href: `/${base}/${departement}/` },
      { libelle: 'Comment cette fiche est vérifiée', href: '/a-propos/#methode' },
    ],
    aujourdhui: momentParis(maintenant).jour,
    maintenant,
  }

  return (
    <>
      <Balisage donnees={fichePraticien(p, cheminFiche, nom)} />
      <Balisage donnees={filAriane(segments)} />
      {/* L'en-tête du site reste transparent sur le haut sombre de la fiche. */}
      <HeaderTransparent />

      {personne ? <FichePersonne c={contexte} /> : <FicheLabo c={contexte} />}

      {(proches.length > 0 || offres.length > 0) && (
        <div className="container pb-20">
          {proches.length > 0 && principal && (
            <section className="border-t border-line pt-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-2xl font-semibold tracking-tight text-fg">{LIBELLE[profession].pluriel} à proximité</h2>
                <Link href={chemin(`/${base}/${departement}/${commune}/`)} className="text-sm font-medium text-fg hover:underline">
                  Tous à {principal.communeNom ?? commune}
                </Link>
              </div>
              <p className="mt-2 text-sm text-fg-2">
                Les plus proches de ce {personne ? 'cabinet' : 'laboratoire'}, par distance puis par ordre alphabétique.
              </p>
              <Voisins praticiens={proches} base={base} profession={profession} />
            </section>
          )}
          {/* Après tout ce qui sert le patient : les offres de la structure, s'il y en a. */}
          <SectionRecrute offres={offres} recruteur={nom} labo={!personne} />
        </div>
      )}
    </>
  )
}
