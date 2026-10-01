import Link from 'next/link'
import { ChevronRight, Clock, GraduationCap, School } from 'lucide-react'

/** Z9. Aucun block : trois cartes de navigation, plus discrètes que le bandeau de confiance. */
export function HomeFormation() {
  const cartes = [
    {
      icone: School,
      titre: 'Écoles de prothèse dentaire',
      texte: 'Bac professionnel, BTM, BTMS et BTS, en initial comme en alternance, par académie.',
      lien: 'Voir les écoles',
      href: '/formation/ecoles-de-prothese',
    },
    {
      icone: GraduationCap,
      titre: 'Facultés d’odontologie',
      texte: 'Les seize UFR françaises, les voies d’accès et les internats par spécialité.',
      lien: 'Voir les facultés',
      href: '/formation/facultes-odontologie',
    },
    {
      icone: Clock,
      titre: 'Formation continue',
      texte: 'Implantologie, parodontologie, esthétique, gestion : les organismes de formation privés, par spécialité. Le recensement est en cours.',
      lien: 'En savoir plus',
      href: '/formation/formations-privees',
      badge: 'Bientôt',
    },
  ] as const

  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Se former aux métiers dentaires</h2>
        <p className="mt-3 max-w-[58ch] text-muted-foreground">
          Les établissements, leurs diplômes et leurs conditions d’accès, recensés au même titre que les praticiens.
        </p>
        <ul className="mt-8 grid gap-3 md:grid-cols-3">
          {cartes.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                className="flex h-full flex-col gap-2 rounded-2xl border border-border p-6 hover:bg-muted"
              >
                <span className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-teal text-white">
                    <c.icone className="size-5" />
                  </span>
                  {'badge' in c && (
                    <span className="rounded-full bg-bg-soft text-fg-2 ring-1 ring-inset ring-line px-2.5 py-0.5 text-xs font-medium">{c.badge}</span>
                  )}
                </span>
                <h3 className="text-lg font-semibold tracking-tight">{c.titre}</h3>
                <p className="text-sm text-muted-foreground">{c.texte}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold">
                  {c.lien}
                  <ChevronRight className="size-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
