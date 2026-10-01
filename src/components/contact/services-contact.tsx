import Image from 'next/image'
import Link from 'next/link'
import { Building2, ChevronRight, FileWarning, Handshake, Newspaper, ShieldCheck, Stethoscope } from 'lucide-react'
import { chemin } from '@/lib/navigation'

/**
 * À qui s'adresser. Six entrées au lieu des trois du modèle : DentalMap n'a
 * ni commerciaux ni bureau à visiter, mais il a des publics distincts, et
 * chacun arrive avec une demande différente. Les cartes qui mènent au
 * formulaire y arrivent avec l'objet déjà choisi ; les autres mènent à la
 * page qui répond mieux qu'un message.
 */
const SERVICES = [
  {
    icone: FileWarning,
    titre: 'Une erreur sur une fiche',
    texte: 'Une adresse, un téléphone, un praticien qui n’exerce plus ici. Nous vérifions auprès des registres et corrigeons.',
    lien: 'Signaler une erreur',
    href: '/contact?objet=erreur-fiche#formulaire',
  },
  {
    icone: Stethoscope,
    titre: 'Praticiens',
    texte: 'Votre fiche existe déjà, construite depuis le répertoire partagé. Revendiquez-la avec votre carte CPS pour la compléter.',
    lien: 'Revendiquer ma fiche',
    href: '/espace-pro/revendiquer',
  },
  {
    icone: Building2,
    titre: 'Laboratoires',
    texte: 'Votre laboratoire est référencé depuis le répertoire Sirene. Signalez un changement d’activité, de nom ou d’adresse.',
    lien: 'Nous écrire',
    href: '/contact?objet=laboratoire#formulaire',
  },
  {
    icone: Handshake,
    titre: 'Partenariats',
    texte: 'Ordres, écoles, syndicats, éditeurs : tout partenariat passe par une convention écrite.',
    lien: 'Devenir partenaire',
    href: '/partenaires',
  },
  {
    icone: Newspaper,
    titre: 'Presse',
    texte: 'Chiffres de l’annuaire, méthode de vérification, entretiens : nous répondons aux journalistes.',
    lien: 'Nous écrire',
    href: '/contact?objet=presse#formulaire',
  },
  {
    icone: ShieldCheck,
    titre: 'Données personnelles',
    texte: 'Accès, rectification, opposition : exercez vos droits sur les données que nous détenons. Nous répondons sous un mois.',
    lien: 'Exercer mes droits',
    href: '/contact?objet=donnees#formulaire',
  },
] as const

export function ServicesContact() {
  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[.06em] text-muted-foreground">
            Contact
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">À qui vous adressez-vous ?</h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Une petite équipe lit chaque message. Choisir la bonne entrée nous fait gagner du temps, et à vous une réponse plus vite.
          </p>
        </div>

        <Image
          src="/images/demo/pexels-6627325.jpg"
          alt=""
          width={1200}
          height={800}
          sizes="(min-width: 1288px) 1128px, 100vw"
          className="mt-12 aspect-[4/3] w-full rounded-3xl object-cover md:mt-16 md:aspect-[2.4/1]"
        />

        <ul className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <li key={s.href}>
              <Link href={chemin(s.href)} className="flex h-full flex-col gap-2 rounded-2xl border border-border p-6 hover:bg-muted">
                <span className="flex size-9 items-center justify-center rounded-lg bg-teal text-white">
                  <s.icone className="size-5" />
                </span>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">{s.titre}</h3>
                <p className="text-sm text-muted-foreground">{s.texte}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold">
                  {s.lien}
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
