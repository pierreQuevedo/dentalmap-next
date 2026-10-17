/** MAQUETTE, à supprimer après arbitrage. Briques communes aux deux versions de la FAQ. */
import { ArrowUpRight, Search } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import type { Categorie } from './_donnees'

/** Champ de recherche dans la FAQ. Maquette : le filtrage se branchera sur la liste WordPress. */
export function Recherche({ sombre, grande }: { sombre?: boolean; grande?: boolean }) {
  return (
    <form role="search" action="#" className="w-full">
      <label className="sr-only" htmlFor="faq-recherche">
        Rechercher dans les questions fréquentes
      </label>
      <div
        className={`flex items-center gap-3 border ${grande ? 'h-16 rounded-full px-6' : 'h-12 rounded-xl px-4'} ${
          sombre ? 'border-white/15 bg-white text-[#0e1317] shadow-pop' : 'border-line bg-bg text-fg focus-within:border-line-strong'
        }`}
      >
        <Search className={`shrink-0 ${grande ? 'size-5' : 'size-4'} ${sombre ? 'text-[#0e1317]/60' : 'text-fg-2'}`} aria-hidden />
        <input
          id="faq-recherche"
          type="search"
          placeholder="Rechercher une question"
          className={`min-w-0 flex-1 bg-transparent outline-none ${grande ? 'text-lg' : 'text-base'} ${
            sombre ? 'placeholder:text-[#0e1317]/45' : 'placeholder:text-fg-2/70'
          }`}
        />
      </div>
    </form>
  )
}

/** Lien souligné à flèche. */
export function LienFleche({ href, children, sombre, petit }: { href: string; children: React.ReactNode; sombre?: boolean; petit?: boolean }) {
  return (
    <a href={href} className={`group inline-flex items-center font-medium transition-colors hover:text-teal ${petit ? 'text-sm' : 'text-base'} ${sombre ? 'text-white' : 'text-fg'}`}>
      <span className={`border-b-2 pb-0.5 ${sombre ? 'border-white/25' : 'border-line'}`}>{children}</span>
      <ArrowUpRight className="ml-1 size-4 shrink-0" aria-hidden />
    </a>
  )
}

/** Les questions d'une catégorie en accordéon, la première ouverte. */
export function Questions({ categorie, grand, sombre }: { categorie: Categorie; grand?: boolean; sombre?: boolean }) {
  return (
    <Accordion defaultValue={[`${categorie.slug}-0`]}>
      {categorie.questions.map((q, i) => (
        <AccordionItem key={q.question} value={`${categorie.slug}-${i}`} className="border-b border-line last:border-b-0">
          <AccordionTrigger
            className={`py-5 font-semibold hover:no-underline ${grand ? 'text-lg md:text-xl' : 'text-base md:text-lg'} ${sombre ? 'text-white' : 'text-fg'}`}
          >
            <span className="pr-4">{insecable(q.question)}</span>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pr-8">
            <p className={`max-w-2xl leading-relaxed ${grand ? 'text-base md:text-lg' : 'text-base'} ${sombre ? 'text-white/70' : 'text-fg-2'}`}>{insecable(q.reponse)}</p>
            {q.lien && (
              <div className="mt-3">
                <LienFleche href={q.lien.href} sombre={sombre} petit>
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

export function nbQuestions(n: number) {
  return `${n} question${n > 1 ? 's' : ''}`
}

/** Espaces insécables de la typographie française, avant ? : ! » et après « : pas de ponctuation orpheline en bout de ligne. */
export function insecable(t: string) {
  return t.replace(/ ([?:!;»])/g, '\u00a0$1').replace(/« /g, '«\u00a0')
}
