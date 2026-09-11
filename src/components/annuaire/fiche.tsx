import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getPraticien, getRedirection } from '@/lib/annuaire/queries'
import { BASE_URL, nomAffiche, type Profession } from '@/lib/annuaire/types'
import { Adresse, chemin, FilAriane, Section, Telephone, Verification } from './primitives'
import { Balisage, fichePraticien, filAriane } from '@/lib/seo/jsonld'

type Params = { departement: string; commune: string; slug: string }

const LIBELLE: Record<Profession, { singulier: string; pluriel: string }> = {
  dentiste: { singulier: 'Chirurgien-dentiste', pluriel: 'Chirurgiens-dentistes' },
  prothesiste: { singulier: 'Laboratoire de prothèse dentaire', pluriel: 'Laboratoires de prothèse dentaire' },
}

export async function metadonneesFiche(profession: Profession, params: Params): Promise<Metadata> {
  const { departement, commune, slug } = await params
  const p = await getPraticien(profession, departement, commune, slug)
  if (!p) return { title: 'Fiche introuvable' }

  const principal = p.lieux.find((l) => l.principal) ?? p.lieux[0]
  const nom = nomAffiche(p)
  const lieu = principal?.communeNom ?? ''
  const titre = `${nom}, ${LIBELLE[profession].singulier.toLowerCase()} à ${lieu}`

  return {
    title: titre,
    description:
      `${nom}, ${LIBELLE[profession].singulier.toLowerCase()} à ${lieu}. ` +
      `Adresse, téléphone et informations vérifiées auprès des registres officiels.`,
    alternates: { canonical: `/${BASE_URL[profession]}/${departement}/${commune}/${slug}/` },
    // Une fiche non indexable reste consultable et trouvable par recherche
    // nominative, mais sort des moteurs : sans position, elle n'apporte rien.
    robots: p.indexable ? undefined : { index: false, follow: true },
  }
}

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
  const autres = p.lieux.filter((l) => l !== principal)
  const nom = nomAffiche(p)

  // Un praticien radié n'est pas supprimé : sa fiche reste, mais elle annonce
  // clairement qu'il ne figure plus au registre.
  const radie = p.supprimeLe !== null

  const cheminFiche = `/${base}/${departement}/${commune}/${slug}/`

  return (
    <>
      <Balisage donnees={fichePraticien(p, cheminFiche, nom)} />
      <Balisage
        donnees={filAriane([
          { nom: 'Accueil', chemin: '/' },
          { nom: LIBELLE[profession].pluriel, chemin: `/${base}/` },
          { nom: principal?.communeNom ?? commune, chemin: `/${base}/${departement}/${commune}/` },
          { nom, chemin: cheminFiche },
        ])}
      />
      <FilAriane
        segments={[
          { libelle: 'Accueil', href: '/' },
          { libelle: LIBELLE[profession].pluriel, href: `/${base}/` },
          { libelle: principal?.communeNom ?? commune, href: `/${base}/${departement}/${commune}/` },
          { libelle: nom },
        ]}
      />

      <header className="mt-5">
        <p className="text-sm font-medium text-slate-500">{LIBELLE[profession].singulier}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{nom}</h1>
        <div className="mt-3">
          <Verification statut={p.statutVerification} />
        </div>
      </header>

      {radie && (
        <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Ce professionnel ne figure plus au registre officiel. La fiche est conservée à titre d&apos;archive.
        </p>
      )}

      {principal && (
        <Section titre="Coordonnées">
          <Adresse
            ligne={principal.adresseLigne}
            codePostal={principal.codePostal}
            commune={principal.communeNom}
            approximative={principal.approximative}
          />
          {principal.telephone && (
            <p className="mt-3">
              <span className="text-slate-500">Téléphone </span>
              <Telephone numero={principal.telephone} />
              <span className="ml-2 text-xs text-slate-500">numéro figurant au registre</span>
            </p>
          )}
        </Section>
      )}

      {autres.length > 0 && (
        <Section titre={autres.length > 1 ? 'Autres lieux d’exercice' : 'Autre lieu d’exercice'}>
          <ul className="space-y-4">
            {autres.map((l) => (
              <li key={l.id}>
                <Adresse
                  ligne={l.adresseLigne}
                  codePostal={l.codePostal}
                  commune={l.communeNom}
                  approximative={l.approximative}
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section titre="Source des informations">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          {p.rpps && (
            <>
              <dt className="text-slate-500">Numéro RPPS</dt>
              <dd className="font-mono text-slate-900">{p.rpps}</dd>
            </>
          )}
          {p.siren && (
            <>
              <dt className="text-slate-500">SIREN</dt>
              <dd className="font-mono text-slate-900">{p.siren}</dd>
            </>
          )}
          <dt className="text-slate-500">Registre</dt>
          <dd className="text-slate-900">
            {profession === 'dentiste'
              ? 'Annuaire Santé, Agence du Numérique en Santé'
              : 'Base Sirene, INSEE'}
          </dd>
          <dt className="text-slate-500">Dernière mise à jour</dt>
          <dd className="text-slate-900">
            {new Date(p.majLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </dd>
        </dl>
        <p className="mt-4 text-sm text-slate-600">
          Ces informations proviennent de registres publics et ne sont pas modifiables par le professionnel.{' '}
          <Link href={chemin('/methode-de-verification/')} className="underline hover:text-slate-900">
            Notre méthode de vérification
          </Link>
          .
        </p>
      </Section>

      <Section titre="Voir aussi">
        <Link
          href={chemin(`/${base}/${departement}/${commune}/`)}
          className="text-slate-900 underline hover:no-underline"
        >
          Tous les {LIBELLE[profession].pluriel.toLowerCase()} à {principal?.communeNom ?? commune}
        </Link>
      </Section>
    </>
  )
}
