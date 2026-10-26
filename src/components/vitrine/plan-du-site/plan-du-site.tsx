/**
 * Plan du site HTML, dans la lignée de la FAQ et des pages légales : héros
 * court, blocs par rubrique en trois colonnes (une sur mobile), départements
 * par région. Indexé.
 *
 * Lu sur la base, comme le pied de page et les pages « par département » :
 * - départements : `getDepartementsAvecPraticiens(p)` pour chaque profession,
 *   en onglets, groupés par région (seuls ceux qui comptent au moins un
 *   praticien de la profession) ;
 * - grandes villes : `getAccesRapide(18)`, la liste du pied de page.
 *
 * Le reste est écrit en dur, avec des routes qui existent dans `src/app`.
 * `/espace-pro` (groupe `(pro)`) renvoie vers la connexion hors session. Les
 * pages d'erreur sont exclues.
 */
import { Suspense } from 'react'
import Link from 'next/link'
import { Briefcase, BookOpen, Building2, GraduationCap, Info, MapPin, Scale, Search, Stethoscope, Tag, UserCheck } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { BASE_URL, PROFESSIONS, type Profession } from '@/lib/annuaire/types'
import { LIBELLE } from '@/lib/annuaire/libelles'
import { getDepartementsAvecPraticiens } from '@/lib/annuaire/queries'
import { getAccesRapide } from '@/lib/annuaire/acces-rapide'
import { FAVORIS_VISIBLE, RESSOURCES_VISIBLE } from '@/lib/visibilite'

/**
 * `aVenir` : la page est conçue mais sa route n'existe pas encore. Le lien
 * reste dans la donnée et s'affichera dès que la route existera : il suffira
 * de retirer le drapeau. En attendant, il est filtré à l'affichage pour ne
 * mener à aucune 404.
 */
type Lien = { libelle: string; href: string; aVenir?: boolean }
type Rubrique = { titre: string; icone: typeof MapPin; liens: Lien[] }

const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const RUBRIQUES: Rubrique[] = [
  {
    titre: 'Annuaire',
    icone: Stethoscope,
    liens: [
      ...PROFESSIONS.map((p) => ({ libelle: majuscule(LIBELLE[p].pluriel), href: `/${BASE_URL[p]}/` })),
      { libelle: 'Dentistes par département', href: '/dentistes/par-departement/' },
      { libelle: 'Laboratoires par département', href: '/prothesistes/par-departement/' },
      { libelle: 'Un dentiste près de chez vous', href: '/dentistes/pres-de-chez-vous/' },
      { libelle: 'Un laboratoire près de chez vous', href: '/prothesistes/pres-de-chez-vous/' },
      { libelle: 'Recherche sur la carte', href: '/recherche/' },
    ],
  },
  {
    titre: 'Formation',
    icone: GraduationCap,
    liens: [
      { libelle: 'Toutes les formations', href: '/formation/' },
      { libelle: 'Écoles de prothèse dentaire', href: '/formation/ecoles-de-prothese/' },
      { libelle: 'Facultés d’odontologie', href: '/formation/facultes-odontologie/' },
      // Formations privées : retirées tant que la rubrique n’est pas conçue (13 octobre 2026).
    ],
  },
  // Ressources masquées pour le moment (`RESSOURCES_VISIBLE`).
  ...(RESSOURCES_VISIBLE
    ? [
        {
          titre: 'Ressources',
          icone: BookOpen,
          liens: [
            { libelle: 'Toutes les ressources', href: '/conseils/' },
            { libelle: 'Pour les patients', href: '/conseils/patients/' },
            { libelle: 'Pour les praticiens', href: '/conseils/praticiens/' },
            { libelle: 'Pour les prothésistes', href: '/conseils/prothesistes/' },
            { libelle: 'Les métiers du dentaire', href: '/conseils/metiers/' },
          ],
        },
      ]
    : []),
  {
    titre: 'Emploi',
    icone: Briefcase,
    liens: [
      { libelle: 'Toutes les offres', href: '/emploi/' },
      { libelle: 'Assistant(e) dentaire', href: '/emploi/assistant-dentaire/' },
      { libelle: 'Alternance et stages', href: '/emploi/alternance/' },
      { libelle: 'Remplacements et collaborations', href: '/emploi/remplacements/' },
      { libelle: 'Recruter', href: '/emploi/recruter/' },
    ],
  },
  {
    titre: 'Annonces',
    icone: Tag,
    liens: [
      { libelle: 'Cessions de cabinet', href: '/annonces/cession/' },
      { libelle: 'Déposer une annonce', href: '/annonces/cession/deposer/' },
    ],
  },
  {
    titre: 'Professionnels',
    icone: UserCheck,
    liens: [
      { libelle: 'Espace pro', href: '/espace-pro/' },
      { libelle: 'Revendiquer ma fiche', href: '/espace-pro/revendiquer/' },
      { libelle: 'Établissements de formation', href: '/espace-pro/organisme/' },
      { libelle: 'Devenir partenaire', href: '/partenaires/' },
      { libelle: 'Se connecter', href: '/connexion/' },
      { libelle: 'Créer un compte', href: '/connexion/?mode=inscription' },
    ],
  },
  {
    titre: 'DentalMap',
    icone: Info,
    liens: [
      { libelle: 'Le projet', href: '/a-propos/' },
      { libelle: 'Notre méthode de vérification', href: '/a-propos/#methode' },
      { libelle: 'Questions fréquentes', href: '/faq/' },
      { libelle: 'Contact', href: '/contact/' },
      { libelle: 'Signaler une erreur sur une fiche', href: '/contact/?objet=erreur-fiche' },
      ...(FAVORIS_VISIBLE ? [{ libelle: 'Mes favoris', href: '/favoris/' }] : []),
    ],
  },
  {
    titre: 'Informations légales',
    icone: Scale,
    liens: [
      { libelle: 'Mentions légales', href: '/mentions-legales/' },
      { libelle: 'Conditions d’utilisation', href: '/cgu/' },
      { libelle: 'Politique de confidentialité', href: '/confidentialite/' },
    ],
  },
]

/** Liens affichables : ceux dont la route existe déjà. */
const visibles = (liens: Lien[]) => liens.filter((l) => !l.aVenir)

function Bloc({ titre, icone: I, children, id }: { titre: string; icone: typeof MapPin; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="break-inside-avoid scroll-mt-28">
      <h2 className="flex items-center gap-2.5 border-b-2 border-fg pb-3 text-xl font-semibold tracking-tight text-fg">
        <I className="size-5 text-teal" strokeWidth={1.75} aria-hidden /> {titre}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Liens({ liens }: { liens: Lien[] }) {
  return (
    <ul className="space-y-2.5">
      {visibles(liens).map((l) => (
        <li key={l.href + l.libelle}>
          <Link href={chemin(l.href)} className="text-fg underline decoration-line underline-offset-4 hover:text-teal hover:decoration-teal">
            {l.libelle}
          </Link>
        </li>
      ))}
    </ul>
  )
}

async function Villes() {
  const villes = await getAccesRapide(18)
  return (
    <Bloc titre="Grandes villes" icone={Building2}>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
        {villes.map((v) => (
          <li key={v.href}>
            <Link href={chemin(`/${v.href.replace(/^\//, '')}/`)} className="text-fg underline decoration-line underline-offset-4 hover:text-teal">
              {v.label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-fg-2">Chirurgiens-dentistes, par ville.</p>
    </Bloc>
  )
}

/*
 * Onglets sans script : un bouton radio par profession, et chaque panneau ne
 * s'affiche que si son bouton est coché. Toutes les listes restent dans le
 * HTML, donc lisibles par un moteur. Les classes sont écrites en entier pour
 * que Tailwind les trouve.
 */
const ONGLETS: Record<Profession, { onglet: string; panneau: string }> = {
  dentiste: {
    onglet: 'group-has-[#dep-dentiste:checked]:bg-fg group-has-[#dep-dentiste:checked]:text-bg',
    panneau: 'hidden group-has-[#dep-dentiste:checked]:block',
  },
  prothesiste: {
    onglet: 'group-has-[#dep-prothesiste:checked]:bg-fg group-has-[#dep-prothesiste:checked]:text-bg',
    panneau: 'hidden group-has-[#dep-prothesiste:checked]:block',
  },
  maxillo_facial: {
    onglet: 'group-has-[#dep-maxillo_facial:checked]:bg-fg group-has-[#dep-maxillo_facial:checked]:text-bg',
    panneau: 'hidden group-has-[#dep-maxillo_facial:checked]:block',
  },
  stomatologue: {
    onglet: 'group-has-[#dep-stomatologue:checked]:bg-fg group-has-[#dep-stomatologue:checked]:text-bg',
    panneau: 'hidden group-has-[#dep-stomatologue:checked]:block',
  },
  orl: {
    onglet: 'group-has-[#dep-orl:checked]:bg-fg group-has-[#dep-orl:checked]:text-bg',
    panneau: 'hidden group-has-[#dep-orl:checked]:block',
  },
}

async function Departements() {
  const listes = await Promise.all(PROFESSIONS.map(async (p) => [p, await getDepartementsAvecPraticiens(p)] as const))
  return (
    <section id="departements" className="group scroll-mt-28 border-t border-line pt-14">
      <h2 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-fg md:text-3xl">
        <MapPin className="size-6 text-teal" strokeWidth={1.75} aria-hidden /> Les professionnels par département
      </h2>
      <p className="mt-2 text-fg-2">Choisissez une profession : les départements où elle est présente, groupés par région.</p>

      <div role="radiogroup" aria-label="Profession" className="relative -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {listes.map(([p, deps], i) => (
          <label
            key={p}
            className={`relative flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-line px-4 text-sm font-medium whitespace-nowrap text-fg transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal ${ONGLETS[p].onglet}`}
          >
            <input type="radio" name="profession-departements" id={`dep-${p}`} defaultChecked={i === 0} className="sr-only" />
            {majuscule(LIBELLE[p].pluriel)}
            <span className="tabular-nums opacity-60">{deps.length}</span>
          </label>
        ))}
      </div>

      {listes.map(([p, deps]) => {
        const regions = new Map<string, typeof deps>()
        for (const d of deps) regions.set(d.regionNom, [...(regions.get(d.regionNom) ?? []), d])
        return (
          <div key={p} className={`mt-8 ${ONGLETS[p].panneau}`}>
            <h3 className="sr-only">{majuscule(LIBELLE[p].pluriel)} par département</h3>
            <div className="columns-2 gap-x-6 sm:gap-x-12 lg:columns-3 xl:columns-4">
              {[...regions].map(([region, liste]) => (
                <div key={region} className="mb-7 break-inside-avoid">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-fg-2">{region}</h4>
                  <ul className="mt-2 space-y-1.5 text-sm sm:text-[15px]">
                    {liste.map((d) => (
                      <li key={d.code} className="flex gap-2">
                        <span className="w-8 shrink-0 tabular-nums text-fg-2">{d.code}</span>
                        <Link href={chemin(`/${BASE_URL[p]}/${d.slug}/`)} className="text-fg hover:text-teal hover:underline">
                          {d.nom}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}

export function PlanDuSite() {
  return (
    <main>
      <section className="border-b border-line">
        <div className="container pb-12 pt-12 md:pb-16 md:pt-20">
          <h1 className="text-4xl font-semibold tracking-tight text-fg md:text-6xl">Plan du site</h1>
          <p className="mt-4 max-w-xl text-lg text-fg-2">Toutes les pages de DentalMap, par rubrique.</p>
          <form action="/recherche/" role="search" className="mt-8 max-w-xl">
            <label htmlFor="plan-recherche" className="sr-only">
              Votre ville ou votre code postal
            </label>
            <div className="flex h-12 items-center gap-3 rounded-xl border border-line bg-bg px-4 focus-within:border-line-strong">
              <Search className="size-4 shrink-0 text-fg-2" aria-hidden />
              <input id="plan-recherche" name="q" placeholder="Ville ou code postal" className="min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-fg-2/70" />
            </div>
          </form>
        </div>
      </section>

      <div className="container space-y-14 py-12 md:py-16 lg:py-20">
        <div className="grid gap-x-12 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          <Bloc titre={RUBRIQUES[0]!.titre} icone={RUBRIQUES[0]!.icone}>
            <Liens liens={RUBRIQUES[0]!.liens} />
            <p className="mt-4 text-sm">
              <a href="#departements" className="font-medium text-teal">
                Tous les départements ↓
              </a>
            </p>
          </Bloc>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" aria-hidden />}>
            <Villes />
          </Suspense>
          {/* Une rubrique dont aucun lien n'a encore de route n'est pas affichée. */}
          {RUBRIQUES.slice(1)
            .filter((r) => visibles(r.liens).length > 0)
            .map((r) => (
              <Bloc key={r.titre} titre={r.titre} icone={r.icone}>
                <Liens liens={r.liens} />
              </Bloc>
            ))}
        </div>
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" aria-hidden />}>
          <Departements />
        </Suspense>
      </div>
    </main>
  )
}
