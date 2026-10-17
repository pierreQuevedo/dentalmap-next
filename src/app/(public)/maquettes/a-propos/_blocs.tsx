/** MAQUETTE, à supprimer après arbitrage. Briques communes aux variantes d et e de la page « Le projet DentalMap ». */
import { ArrowUpRight } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { getChiffresCles } from '@/lib/annuaire/queries'
import { FAQ } from './_contenu'

/** Titre éditorial en deux tons, celui de « Le bon poste, près de chez vous. ». */
export function TitreDeuxTons({
  children,
  sous,
  as: Tag = 'h2',
  grand,
  className = '',
}: {
  children: React.ReactNode
  sous?: React.ReactNode
  as?: 'h1' | 'h2'
  grand?: boolean
  className?: string
}) {
  return (
    <Tag className={`font-semibold tracking-tight text-fg ${grand ? 'text-5xl leading-[1.02] md:text-7xl lg:text-8xl' : 'text-3xl leading-tight md:text-5xl'} ${className}`}>
      {children}
      {sous && <span className="block text-fg-2">{sous}</span>}
    </Tag>
  )
}

/** Surtitre à pastille, celui du héros Emploi. */
export function Surtitre({ children, sombre }: { children: React.ReactNode; sombre?: boolean }) {
  return (
    <p className={`inline-flex items-center gap-2 text-sm font-medium ${sombre ? 'text-white/70' : 'text-fg-2'}`}>
      <span className="size-1.5 rounded-full bg-teal" /> {children}
    </p>
  )
}

/** Lien souligné à flèche, celui de « Comment ça marche » et de la FAQ. */
export function LienFleche({ href, children, sombre, petit }: { href: string; children: React.ReactNode; sombre?: boolean; petit?: boolean }) {
  return (
    <a href={href} className={`group inline-flex items-center font-medium transition-colors hover:text-teal ${petit ? 'text-sm' : 'text-base'} ${sombre ? 'text-white' : 'text-fg'}`}>
      <span className={`border-b-2 pb-0.5 ${sombre ? 'border-white/25' : 'border-line'}`}>{children}</span>
      <ArrowUpRight className="ml-1 size-4 shrink-0" aria-hidden />
    </a>
  )
}

export function Bouton({
  href,
  children,
  ton = 'action',
  sombre,
}: {
  href: string
  children: React.ReactNode
  ton?: 'action' | 'brand' | 'secondaire'
  sombre?: boolean
}) {
  const c = {
    action: 'bg-action text-action-foreground hover:bg-action-hover',
    brand: 'bg-brand text-brand-foreground hover:bg-brand-hover',
    secondaire: sombre ? 'border border-white/20 bg-white/5 text-white hover:bg-white/10' : 'border border-line bg-bg text-fg hover:bg-bg-soft',
  }[ton]
  return (
    <a href={href} className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold ${c}`}>
      {children}
    </a>
  )
}

/** Accordéon de questions, le gabarit de la FAQ Emploi. */
export function FaqListe({ sombre }: { sombre?: boolean }) {
  return (
    <Accordion defaultValue={['q-0']}>
      {FAQ.map((f, i) => (
        <AccordionItem key={f.q} value={`q-${i}`} className="border-b border-line last:border-b-0">
          <AccordionTrigger className={`py-5 text-base font-semibold hover:no-underline md:text-lg ${sombre ? 'text-white' : 'text-fg'}`}>
            <span className="pr-4">{f.q}</span>
          </AccordionTrigger>
          <AccordionContent className="pb-5 pr-8 leading-relaxed text-fg-2">{f.r}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

const nombre = (n: number) => n.toLocaleString('fr-FR')

/** Les trois chiffres de l'accueil (`HomeStats`), lus sur la base, jamais saisis. */
export async function lireChiffres() {
  const c = await getChiffresCles()
  return [
    { value: nombre(c.dentistes), label: 'chirurgiens-dentistes' },
    { value: nombre(c.prothesistes), label: 'laboratoires de prothèse' },
    { value: nombre(c.communes), label: 'communes couvertes' },
  ]
}
