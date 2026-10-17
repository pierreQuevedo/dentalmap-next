/**
 * MAQUETTE. Lien entre une fiche et ses offres d'emploi : la pastille
 * « Recrute » du héros et la section d'offres en bas de fiche.
 *
 * Règles retenues :
 * - La pastille s'affiche tant qu'au moins une offre de la structure est en
 *   ligne ; elle disparaît quand la dernière est pourvue ou expirée.
 * - Neutralité : elle est purement informative. Elle ne change jamais l'ordre
 *   des résultats (distance puis alphabétique) ni la mise en avant d'une fiche.
 * - Le patient reste le lecteur principal : pas de bandeau, une pastille de la
 *   même famille que celles du héros, et une section placée après les
 *   informations utiles au patient.
 */
import { ArrowUpRight, Briefcase } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import Link from 'next/link'
import { CarteOffre } from '../emploi/_blocs'
import type { Offre } from '../emploi/_donnees'

/** Une offre en ligne de la structure, telle que la fiche la résume. */
export type OffreResume = Offre

export const ANCRE_RECRUTEMENT = 'recrutement'

/** Pastille du héros, même gabarit que « Vérifié auprès des registres officiels ». Mène à la section. */
export function BadgeRecrute({ sombre }: { sombre?: boolean }) {
  return (
    <a
      href={`#${ANCRE_RECRUTEMENT}`}
      className={`squircle-full inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors ${
        sombre ? 'bg-white/10 text-white ring-white/15 hover:bg-white/15' : 'bg-bg text-fg ring-line hover:bg-bg-soft'
      }`}
    >
      <Briefcase className="size-3.5 text-teal" aria-hidden /> Recrute
    </a>
  )
}

/** Lien souligné à flèche, forme de `LienFleche`, avec une vraie destination. */
export function LienOffres({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={chemin(href)} className="group inline-flex items-center text-sm font-medium text-fg transition-colors hover:text-teal">
      <span className="border-b-2 border-line pb-0.5">{children}</span>
      <ArrowUpRight className="ml-1 size-4 shrink-0" aria-hidden />
    </Link>
  )
}

/**
 * Section d'offres, en fin de fiche. Deux colonnes comme « Le cabinet » :
 * le titre et le lien à gauche, les offres à droite, en lignes.
 */
export function SectionRecrute({
  titre,
  sous,
  offres,
  lien,
}: {
  titre: string
  sous: string
  offres: OffreResume[]
  lien: { href: string; libelle: string }
}) {
  if (offres.length === 0) return null
  return (
    <section id={ANCRE_RECRUTEMENT} className="scroll-mt-24 border-t border-line">
      <div className="container py-16 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-fg-2">
              <Briefcase className="size-4 text-teal" aria-hidden /> Emploi
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-fg md:text-3xl">{titre}</h2>
            <p className="mt-2 max-w-md text-fg-2">{sous}</p>
            <div className="mt-6 hidden lg:block">
              <LienOffres href={lien.href}>{lien.libelle}</LienOffres>
            </div>
          </div>
          <div>
            <ul className="grid gap-3">
              {offres.map((o) => (
                <CarteOffre key={o.id} o={o} forme="ligne" />
              ))}
            </ul>
            <div className="mt-6 lg:hidden">
              <LienOffres href={lien.href}>{lien.libelle}</LienOffres>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/*
 * Offres d'exemple. Sur une fiche, pas de distance : elle n'aurait pas de
 * point de départ. Photo seulement quand le recruteur en a déposé une.
 */
const BASE = { publiee: '6 octobre 2026', depuis: 'il y a 6 jours', type: 'cabinet' as const }

export const OFFRES_DENTISTE: OffreResume[] = [
  {
    ...BASE,
    id: 'f-d1',
    slug: 'assistant-dentaire-qualifie-cdi-bordeaux-cabinet-vital-carles',
    titre: 'Assistant(e) dentaire qualifié(e)',
    metier: 'Assistant(e) dentaire',
    contrat: 'CDI',
    temps: 'Temps plein, 35 h',
    debut: '3 novembre 2026',
    min: 2100,
    max: 2400,
    recruteur: 'Cabinet dentaire Vital Carles',
    adresse: '14 Rue Vital Carles',
    cp: '33000',
    commune: 'Bordeaux',
    lon: -0.5768,
    lat: 44.8417,
    photo: '/images/demo/pexels-8413334.jpg',
  },
]

export const OFFRES_LABO: OffreResume[] = [
  {
    ...BASE,
    id: 'f-l1',
    slug: 'prothesiste-ceramiste-cdi-merignac-artemis',
    titre: 'Prothésiste céramiste',
    metier: 'Prothésiste dentaire',
    contrat: 'CDI',
    temps: 'Temps plein, 35 h',
    debut: '5 janvier 2027',
    min: 2300,
    max: 2800,
    recruteur: 'Laboratoire Artemis Dentaire',
    type: 'laboratoire',
    adresse: '8 Avenue de la Somme',
    cp: '33700',
    commune: 'Mérignac',
    lon: -0.6436,
    lat: 44.8386,
    publiee: '10 octobre 2026',
    depuis: 'il y a 2 jours',
  },
  {
    ...BASE,
    id: 'f-l2',
    slug: 'prothesiste-alternance-btms-merignac',
    titre: 'Prothésiste dentaire en alternance, BTMS',
    metier: 'Prothésiste dentaire',
    contrat: 'Alternance',
    duree: '2 ans',
    temps: 'Rythme école et laboratoire',
    debut: '1er septembre 2027',
    min: 1200,
    max: 1450,
    recruteur: 'Laboratoire Artemis Dentaire',
    type: 'laboratoire',
    adresse: '8 Avenue de la Somme',
    cp: '33700',
    commune: 'Mérignac',
    lon: -0.6436,
    lat: 44.8386,
    publiee: '10 octobre 2026',
    depuis: 'il y a 2 jours',
    photo: '/images/demo/pexels-6627325.jpg',
  },
]
