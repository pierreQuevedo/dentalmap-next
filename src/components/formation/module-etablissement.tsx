import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, CalendarDays, Clock, GraduationCap, Phone, Stethoscope } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { VOIES, actives, dateLongue, portesOuvertesAJour, type Donnees } from '@/lib/espace-pro/etablissement'
import type { DeclarationPublique } from '@/lib/espace-pro/etablissement-donnees'

/**
 * Ce que l'établissement déclare depuis son espace, sur sa page publique :
 * portes ouvertes, présentation, formations, galerie et, pour une faculté,
 * centres de soins. Toujours signalé « renseigné par l'établissement », à
 * côté des informations relevées, jamais mêlé à elles. Une section vide ne
 * s'affiche pas.
 */
export function ModuleEtablissement({ declaration, faculte }: { declaration: DeclarationPublique; faculte: boolean }) {
  const d = declaration.donnees
  const formations = actives(d)
  const po = portesOuvertesAJour(d) && d.portesOuvertes
  return (
    <section id="etablissement" aria-labelledby="etablissement-titre" className="scroll-mt-24">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="etablissement-titre" className="text-2xl font-semibold tracking-tight text-fg">
          L’établissement en parle
        </h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-teal/15 px-2 py-0.5 text-xs font-medium text-teal">
          <BadgeCheck className="size-3.5" aria-hidden /> Renseigné par l’établissement
        </span>
      </div>

      {po && (
        <p className="squircle-xl mt-6 flex items-center gap-3 border border-line bg-bg-soft px-4 py-3 text-sm text-fg">
          <CalendarDays className="size-4 shrink-0 text-teal" aria-hidden />
          Prochaines portes ouvertes le <span className="font-semibold">{dateLongue(po)}</span>
        </p>
      )}

      {(d.accroche || d.presentation) && (
        <div className="mt-6 max-w-2xl">
          {d.accroche && <p className="text-lg font-medium text-fg">« {d.accroche} »</p>}
          {d.presentation && <p className="mt-3 whitespace-pre-line text-fg-2">{d.presentation}</p>}
        </div>
      )}

      {d.galerie.length > 0 && (
        <figure className="mt-6">
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {d.galerie.slice(0, 5).map((p, i) => (
              <li key={p.url} className={`squircle-xl relative overflow-hidden bg-bg-soft ${i === 0 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-[4/3]'}`}>
                <Image src={p.url} alt={p.legende} fill sizes={i === 0 ? '(min-width: 768px) 30rem, 100vw' : '15rem'} className="object-cover" />
              </li>
            ))}
          </ul>
          <figcaption className="mt-2 text-xs text-fg-2">{d.credit ? `Crédit photo : ${d.credit}` : 'Photos publiées par l’établissement'}</figcaption>
        </figure>
      )}

      {formations.length > 0 && !faculte && (
        <ul className="mt-6 divide-y divide-line rounded-2xl border border-line">
          {formations.map((f) => (
            <li key={f.id} className="flex flex-wrap items-start gap-x-6 gap-y-2 px-5 py-4">
              <span className="flex min-w-0 flex-1 items-start gap-3">
                <GraduationCap className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                <span>
                  <span className="block font-medium text-fg">{f.intitule}</span>
                  {f.acces && <span className="block text-sm text-fg-2">{f.acces}</span>}
                </span>
              </span>
              <span className="flex flex-wrap gap-1.5 text-xs">
                {[f.niveau, f.duree, ...VOIES.filter((v) => f.voies.includes(v.code)).map((v) => v.libelle), f.places ? `${f.places} places` : null]
                  .filter(Boolean)
                  .map((x) => (
                    <span key={x} className="rounded-full bg-bg-soft px-2 py-0.5 text-fg-2">
                      {x}
                    </span>
                  ))}
              </span>
            </li>
          ))}
        </ul>
      )}

      {faculte && <Centres centres={d.centres} />}

      <p className="mt-4 flex items-center gap-1.5 text-xs text-fg-2">
        <Clock className="size-3.5" aria-hidden /> Mis à jour par l’établissement le {new Date(declaration.misAJourLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })}
      </p>
    </section>
  )
}

function Centres({ centres }: { centres: Donnees['centres'] }) {
  if (!centres.length) return null
  return (
    <div className="mt-6 grid gap-3 md:grid-cols-2">
      {centres.map((c) => (
        <div key={c.id} className="squircle-2xl border border-line p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold text-fg">
            <Stethoscope className="size-4 text-teal" aria-hidden /> {c.nom}
          </p>
          {c.adresse && <p className="mt-1 text-fg-2">{c.adresse}</p>}
          <p className="mt-2 text-fg-2">{c.jours.length && c.horaires ? `${c.jours.map((j) => j.slice(0, 3)).join(', ')} · ${c.horaires}` : 'Horaires non communiqués'}</p>
          {c.delai && <p className="text-fg-2">Rendez-vous : {c.delai.charAt(0).toLowerCase() + c.delai.slice(1)}</p>}
          {c.telephone && (
            <a href={`tel:${c.telephone.replace(/\s/g, '')}`} className="mt-2 inline-flex items-center gap-1.5 font-medium text-fg hover:underline">
              <Phone className="size-3.5" aria-hidden /> {c.telephone}
            </a>
          )}
          {c.soins.length > 0 && <p className="mt-2 text-xs text-fg-2">{c.soins.join(' · ')}</p>}
        </div>
      ))}
    </div>
  )
}

/** Dans la colonne de droite : la page est-elle gérée, et sinon, comment la gérer. */
export function EncartGestion({ slug, geree }: { slug: string; geree: boolean }) {
  if (geree) {
    return (
      <p className="flex items-center gap-1.5 px-1 text-xs text-fg-2">
        <BadgeCheck className="size-3.5 text-teal" aria-hidden /> Page gérée par l’établissement, identité vérifiée.
      </p>
    )
  }
  return (
    <div className="squircle-2xl border border-line p-5">
      <p className="text-sm font-semibold text-fg">Vous représentez cet établissement ?</p>
      <p className="mt-1 text-sm text-fg-2">Publiez vos formations, vos portes ouvertes et vos photos, vérifiées par votre adresse professionnelle.</p>
      <Link href={chemin(`/espace-pro/organisme/etablissement/?fiche=${encodeURIComponent(slug)}`)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-fg underline underline-offset-4 hover:no-underline">
        Gérer cette page <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  )
}
