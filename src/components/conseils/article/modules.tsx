/**
 * Les dix modules de l'article modulaire des Ressources, d'après la
 * bibliothèque Figma « Ressources · bibliothèque de modules » (node 219:1910).
 * Données : `src/lib/conseils/modules.ts`.
 *
 * Les intertitres des sections sont des `h2` porteurs d'une ancre : ce sont
 * eux que le sommaire liste et suit au défilement.
 */
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, Info, Lightbulb, Minus, Plus, TriangleAlert } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { initiales, type ImageArticle, type Module, type SectionArticle, type TonEncadre } from '@/lib/conseils/modules'

/** Intertitre de section : 28 px en desktop, 24 px en mobile. */
function Intertitre({ id, children }: { id: string | null; children: React.ReactNode }) {
  return (
    <h2 id={id ?? undefined} className="scroll-mt-28 text-2xl font-semibold leading-[30px] tracking-[-0.015em] text-fg md:text-[28px] md:leading-9">
      {children}
    </h2>
  )
}

/** Photo ronde de 40 px, ou les initiales sur le gris adouci. */
export function Avatar({ nom, photo }: { nom: string; photo?: ImageArticle | null }) {
  if (photo) return <Image src={photo.url} alt="" width={40} height={40} className="size-10 shrink-0 rounded-full object-cover" />
  return (
    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-fg-2">
      {initiales(nom)}
    </span>
  )
}

function Texte({ m, id }: { m: Extract<Module, { type: 'texte' }>; id: string | null }) {
  return (
    <div className="flex flex-col gap-4">
      {m.titre && <Intertitre id={id}>{m.titre}</Intertitre>}
      {/*
       * Le contenu vient de l'éditeur visuel de WordPress, dont le balisage
       * n'est pas sous notre contrôle : les styles sont posés par sélecteur.
       */}
      <div
        className="text-lg leading-[30px] text-fg [&_a]:text-action [&_a]:underline [&_a]:underline-offset-4 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&>*+*]:mt-4"
        dangerouslySetInnerHTML={{ __html: m.html }}
      />
    </div>
  )
}

function ARetenir({ m, id }: { m: Extract<Module, { type: 'a_retenir' }>; id: string | null }) {
  return (
    <div className="squircle-xl flex flex-col gap-4 bg-bg-soft px-6 py-7 md:p-8">
      <h2 id={id ?? undefined} className="scroll-mt-28 text-xl font-semibold leading-7 text-fg">
        {m.titre}
      </h2>
      <ul className="flex flex-col gap-4">
        {m.points.map((p) => (
          <li key={p} className="flex items-start gap-3 text-[17px] leading-[26px] text-fg">
            <Check className="mt-[3px] size-5 shrink-0 text-action" strokeWidth={2} aria-hidden />
            {p}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Etapes({ m, id }: { m: Extract<Module, { type: 'etapes' }>; id: string | null }) {
  return (
    <div>
      {m.titre && (
        <div className="mb-6">
          <Intertitre id={id}>{m.titre}</Intertitre>
        </div>
      )}
      <ol>
        {m.etapes.map((e, k) => (
          <li key={e.titre} className="flex items-start gap-5 border-t border-line py-6 md:gap-8">
            <span aria-hidden className="text-[32px] leading-9 tracking-[-0.02em] text-fg tabular-nums md:text-[44px] md:leading-[48px]">
              {String(k + 1).padStart(2, '0')}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 leading-[26px]">
              <h3 className="text-[19px] font-semibold text-fg">{e.titre}</h3>
              <p className="text-base text-fg-2">{e.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

const TONS: Record<TonEncadre, { boite: string; icone: typeof Info; couleurIcone: string; titre: string; texte: string }> = {
  information: { boite: 'border-line bg-bg-soft', icone: Info, couleurIcone: 'text-geo', titre: 'text-fg', texte: 'text-fg-2' },
  conseil: { boite: 'border-teal/20 bg-teal/[0.07]', icone: Lightbulb, couleurIcone: 'text-teal', titre: 'text-fg', texte: 'text-fg-2' },
  attention: { boite: 'border-amber-100 bg-amber-100', icone: TriangleAlert, couleurIcone: 'text-amber-700', titre: 'text-amber-700', texte: 'text-amber-700' },
}

/** Encart du site, en pleine largeur de colonne : Information, Conseil ou Attention. */
function Encadre({ m }: { m: Extract<Module, { type: 'encadre' }> }) {
  const t = TONS[m.ton]
  const I = t.icone
  return (
    <aside className={`squircle-xl flex items-start gap-3 border px-4 py-3.5 text-[13px] leading-[18px] ${t.boite}`}>
      <I className={`size-[18px] shrink-0 ${t.couleurIcone}`} strokeWidth={2} aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {m.titre && <p className={`font-semibold ${t.titre}`}>{m.titre}</p>}
        <p className={t.texte}>{m.texte}</p>
      </div>
    </aside>
  )
}

function Chiffres({ m, id }: { m: Extract<Module, { type: 'chiffres' }>; id: string | null }) {
  return (
    <div className="flex flex-col gap-6">
      {m.titre && <Intertitre id={id}>{m.titre}</Intertitre>}
      {/* Empilés en mobile, côte à côte dès la tablette. */}
      <dl className="flex flex-col gap-5 md:flex-row md:gap-6">
        {m.chiffres.map((c) => (
          <div key={c.valeur + c.libelle} className="flex min-w-0 flex-1 flex-col-reverse gap-2 border-t-2 border-action pt-5">
            <dt className="text-[15px] leading-[22px] text-fg-2">{c.libelle}</dt>
            <dd className="text-[44px] font-bold leading-[48px] tracking-[-0.025em] text-fg">{c.valeur}</dd>
          </div>
        ))}
      </dl>
      {m.source && <p className="text-[13px] leading-[18px] text-fg-2">Source : {m.source}</p>}
    </div>
  )
}

function Comparatif({ m, id }: { m: Extract<Module, { type: 'comparatif' }>; id: string | null }) {
  // Au-delà de trois colonnes, le tableau garde sa largeur et défile en mobile.
  const large = m.entetes.length > 3
  return (
    <div className="flex flex-col gap-5">
      {m.titre && <Intertitre id={id}>{m.titre}</Intertitre>}
      <div className="squircle-xl overflow-x-auto border border-line">
        <table className={`w-full table-fixed border-collapse text-left text-[15px] leading-[22px] ${large ? 'min-w-[36rem]' : ''}`}>
          <thead className="bg-bg-soft">
            <tr>
              {m.entetes.map((e) => (
                <th key={e} scope="col" className="px-3 py-4 align-top [overflow-wrap:anywhere] hyphens-auto md:px-5 font-semibold text-fg">
                  {e}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {m.rangees.map((r, i) => (
              <tr key={i} className="border-t border-line">
                {r.map((c, j) =>
                  j === 0 ? (
                    <th key={j} scope="row" className="px-3 py-4 align-top [overflow-wrap:anywhere] hyphens-auto md:px-5 font-medium text-fg">
                      {c}
                    </th>
                  ) : (
                    <td key={j} className="px-3 py-4 align-top [overflow-wrap:anywhere] hyphens-auto md:px-5 text-fg-2">
                      {c}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {m.note && <p className="text-[13px] leading-[18px] text-fg-2">{m.note}</p>}
    </div>
  )
}

/**
 * Accordéon natif : chaque question s'ouvre sans script, la première est
 * ouverte. Le balisage FAQPage reprend exactement ces questions.
 */
function Questions({ m, id }: { m: Extract<Module, { type: 'questions' }>; id: string | null }) {
  return (
    <div className="flex flex-col gap-2">
      <Intertitre id={id}>{m.titre}</Intertitre>
      <div>
        {m.questions.map((q, i) => (
          <details key={q.question} open={i === 0} className="group border-b border-line py-5">
            <summary className="flex cursor-pointer list-none items-center gap-4 text-[17px] font-semibold leading-[26px] text-fg [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 flex-1">{q.question}</span>
              <Plus className="size-5 shrink-0 group-open:hidden" strokeWidth={2} aria-hidden />
              <Minus className="hidden size-5 shrink-0 group-open:block" strokeWidth={2} aria-hidden />
            </summary>
            <p className="mt-2 text-base leading-[26px] text-fg-2">{q.reponse}</p>
          </details>
        ))}
      </div>
    </div>
  )
}

function Citation({ m }: { m: Extract<Module, { type: 'citation' }> }) {
  return (
    <figure className="flex gap-7">
      <span aria-hidden className="w-[3px] shrink-0 bg-action" />
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <blockquote className="text-xl font-medium leading-[30px] tracking-[-0.01em] text-fg md:text-2xl md:leading-[34px]">
          <p>« {m.citation} »</p>
        </blockquote>
        {m.auteur && (
          <figcaption className="flex items-center gap-3">
            <Avatar nom={m.auteur} photo={m.photo} />
            <span className="flex min-w-0 flex-col gap-0.5 leading-5">
              <span className="text-[15px] font-semibold text-fg">{m.auteur}</span>
              {m.fonction && <span className="text-sm text-fg-2">{m.fonction}</span>}
            </span>
          </figcaption>
        )}
      </div>
    </figure>
  )
}

function ModuleImage({ m }: { m: Extract<Module, { type: 'image' }> }) {
  const portrait = m.format === 'portrait'
  return (
    <figure className="flex flex-col gap-3">
      <div className={`squircle-xl relative overflow-hidden bg-accent ${portrait ? 'mx-auto aspect-[4/5] w-full max-w-[26rem]' : 'aspect-video w-full'}`}>
        <Image src={m.image.url} alt={m.image.alt} fill sizes={portrait ? '416px' : '(min-width: 1024px) 720px, 100vw'} className="object-cover" />
      </div>
      {(m.legende || m.credit) && (
        <figcaption className={`flex flex-col gap-3 ${portrait ? 'mx-auto w-full max-w-[26rem]' : ''}`}>
          {m.legende && <span className="text-sm leading-5 text-fg-2">{m.legende}</span>}
          {m.credit && <span className="text-xs leading-4 text-fg-2">{m.credit}</span>}
        </figcaption>
      )}
    </figure>
  )
}

function Appel({ m }: { m: Extract<Module, { type: 'appel' }> }) {
  const externe = /^https?:/.test(m.href)
  const bouton =
    'mt-2 inline-flex h-11 items-center justify-center gap-2 self-start rounded-full bg-action px-5 text-sm font-semibold text-action-foreground shadow-pill transition-colors hover:bg-action-hover'
  return (
    <div className="squircle-xl flex flex-col gap-4 bg-ardoise px-6 py-7 text-white md:p-10">
      <p className="text-[22px] font-semibold leading-[30px] tracking-[-0.01em] md:text-[26px] md:leading-[34px]">{m.titre}</p>
      {m.texte && <p className="text-base leading-[26px]">{m.texte}</p>}
      {externe ? (
        <a href={m.href} rel="noopener" className={bouton}>
          {m.libelle} <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
        </a>
      ) : (
        <Link href={chemin(m.href)} className={bouton}>
          {m.libelle} <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
        </Link>
      )}
    </div>
  )
}

export function SectionModule({ section }: { section: SectionArticle }) {
  const { module: m, ancre: id } = section
  switch (m.type) {
    case 'texte':
      return <Texte m={m} id={id} />
    case 'a_retenir':
      return <ARetenir m={m} id={id} />
    case 'etapes':
      return <Etapes m={m} id={id} />
    case 'encadre':
      return <Encadre m={m} />
    case 'chiffres':
      return <Chiffres m={m} id={id} />
    case 'comparatif':
      return <Comparatif m={m} id={id} />
    case 'questions':
      return <Questions m={m} id={id} />
    case 'citation':
      return <Citation m={m} />
    case 'image':
      return <ModuleImage m={m} />
    case 'appel':
      return <Appel m={m} />
  }
}
