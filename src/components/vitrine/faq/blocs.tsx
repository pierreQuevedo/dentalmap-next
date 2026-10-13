/** Briques de la page FAQ : champ de recherche, lien à flèche, questions d'une catégorie en accordéon. */
import Link from 'next/link'
import { ArrowUpRight, Search } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { chemin } from '@/lib/navigation'
import type { Categorie } from './donnees'

/** Champ de recherche dans les questions. Le filtrage se fait dans la page, sans rechargement. */
export function Recherche({ valeur, onChange }: { valeur: string; onChange: (v: string) => void }) {
  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} className="w-full">
      <label className="sr-only" htmlFor="faq-recherche">
        Rechercher dans les questions fréquentes
      </label>
      <div className="flex h-12 items-center gap-3 rounded-xl border border-line bg-bg px-4 text-fg focus-within:border-line-strong">
        <Search className="size-4 shrink-0 text-fg-2" aria-hidden />
        <input
          id="faq-recherche"
          type="search"
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Rechercher une question"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-fg-2/70"
        />
      </div>
    </form>
  )
}

/** Lien souligné à flèche. */
export function LienFleche({ href, children, petit }: { href: string; children: React.ReactNode; petit?: boolean }) {
  return (
    <Link href={chemin(href)} className={`group inline-flex items-center font-medium text-fg transition-colors hover:text-teal ${petit ? 'text-sm' : 'text-base'}`}>
      <span className="border-b-2 border-line pb-0.5">{children}</span>
      <ArrowUpRight className="ml-1 size-4 shrink-0" aria-hidden />
    </Link>
  )
}

/** Les questions d'une catégorie en accordéon, la première ouverte. */
export function Questions({ categorie }: { categorie: Categorie }) {
  return (
    <Accordion defaultValue={[`${categorie.slug}-0`]}>
      {categorie.questions.map((q, i) => (
        <AccordionItem key={q.question} value={`${categorie.slug}-${i}`} className="border-b border-line last:border-b-0">
          <AccordionTrigger className="py-5 text-base font-semibold text-fg hover:no-underline md:text-lg">
            <span className="pr-4">{insecable(q.question)}</span>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pr-8">
            <p className="max-w-2xl text-base leading-relaxed text-fg-2">{insecable(q.reponse)}</p>
            {q.lien && (
              <div className="mt-3">
                <LienFleche href={q.lien.href} petit>
                  {q.lien.texte}
                </LienFleche>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

/** Espaces insécables de la typographie française, avant ? : ! » et après « : pas de ponctuation orpheline en bout de ligne. */
export function insecable(t: string) {
  return t.replace(/ ([?:!;»])/g, ' $1').replace(/« /g, '« ')
}
