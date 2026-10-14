import Link from 'next/link'
import { ArrowUpRight, Building2, FileWarning, Handshake, Megaphone, Newspaper, ShieldCheck, Stethoscope } from 'lucide-react'
import { chemin } from '@/lib/navigation'

/**
 * « À qui vous adressez-vous ? » : les entrées de la page, avant le
 * formulaire. Celles qui mènent au formulaire y arrivent avec l'objet déjà
 * choisi ; les autres mènent à la page qui répond mieux qu'un message. La
 * première, la plus fréquente, est mise en avant.
 */
const ENTREES = [
  {
    icone: FileWarning,
    titre: 'Une erreur sur une fiche',
    texte: 'Une adresse, un téléphone, un praticien qui n’exerce plus ici : nous vérifions auprès des registres et corrigeons.',
    lien: 'Signaler une erreur',
    href: '/contact?objet=erreur-fiche#formulaire',
  },
  {
    icone: Stethoscope,
    titre: 'Praticiens',
    texte: 'Votre fiche existe déjà : revendiquez-la pour la compléter.',
    lien: 'Revendiquer ma fiche',
    href: '/espace-pro/revendiquer',
  },
  {
    icone: Building2,
    titre: 'Laboratoires',
    texte: 'Un changement d’activité, de nom ou d’adresse.',
    lien: 'Nous écrire',
    href: '/contact?objet=laboratoire#formulaire',
  },
  {
    icone: Megaphone,
    titre: 'Une offre ou une annonce',
    texte: 'Une offre d’emploi, une cession ou une formation qui pose problème.',
    lien: 'Signaler',
    href: '/contact?objet=annonce#formulaire',
  },
  {
    icone: Handshake,
    titre: 'Partenariats',
    texte: 'Ordres, écoles, éditeurs, collectivités : tout passe par une convention écrite.',
    lien: 'Devenir partenaire',
    href: '/partenaires',
  },
  {
    icone: Newspaper,
    titre: 'Presse',
    texte: 'Chiffres de l’annuaire, méthode, entretiens.',
    lien: 'Nous écrire',
    href: '/contact?objet=presse#formulaire',
  },
  {
    icone: ShieldCheck,
    titre: 'Données personnelles',
    texte: 'Accès, rectification, opposition : réponse sous un mois.',
    lien: 'Exercer mes droits',
    href: '/contact?objet=donnees#formulaire',
  },
] as const

export function EntreesContact() {
  const [premiere, ...suite] = ENTREES
  return (
    <section className="container pb-16 md:pb-20">
      <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">
        À qui vous adressez-vous ?
        <span className="block text-fg-2">Choisir la bonne entrée accélère la réponse.</span>
      </h2>
      <ul className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <li className="col-span-2">
          <Link
            href={chemin(premiere.href)}
            className="squircle-3xl dark group relative flex h-full min-h-64 flex-col justify-between overflow-hidden bg-background p-6 text-fg md:p-8"
          >
            <span aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-teal/30 blur-3xl" />
            <span className="relative grid size-12 place-items-center rounded-2xl bg-teal text-white">
              <premiere.icone className="size-6" aria-hidden />
            </span>
            <span className="relative mt-10 block">
              <span className="block text-3xl font-semibold tracking-tight text-white md:text-4xl">{premiere.titre}</span>
              <span className="mt-3 block max-w-md text-white/70">{premiere.texte}</span>
              <span className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground">
                {premiere.lien} <ArrowUpRight className="size-4" aria-hidden />
              </span>
            </span>
          </Link>
        </li>
        {suite.map((e) => (
          <li key={e.href}>
            <Link href={chemin(e.href)} className="squircle-3xl group flex h-full flex-col border border-line bg-bg p-4 transition-colors hover:bg-bg-soft sm:p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-teal/10 text-teal">
                <e.icone className="size-5" aria-hidden />
              </span>
              <span className="mt-4 block text-base font-semibold leading-snug tracking-tight text-fg sm:mt-6 sm:text-lg">{e.titre}</span>
              <span className="mt-1 hidden text-sm text-fg-2 sm:block">{e.texte}</span>
              <span className="mt-auto block pt-5 text-sm font-semibold text-fg">
                {e.lien}&nbsp;
                <ArrowUpRight className="inline size-3.5 align-[-2px] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
