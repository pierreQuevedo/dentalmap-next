import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ChoixVoies } from '@/components/compte/choix'
import { Etapes, FicheResume, cadre, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { CoquilleParcours, adresseDe, dejaEngage, ficheOu404, garde, nomDe, pageFiche } from '@/app/(compte)/espace-pro/revendiquer/_commun'
import { LABO, libelleSiren, lieuxDe, versLabo } from '@/app/(compte)/espace-pro/laboratoire/_commun'
import { sirenDe } from '@/lib/espace-pro/parcours'

export const metadata: Metadata = { title: 'C’est bien votre laboratoire ?', robots: { index: false, follow: false } }
export const instant = false

/**
 * L2 : l'établissement et le rôle. Le rôle détermine la preuve : le gérant
 * envoie un Kbis (L3), le salarié mandaté un Kbis et un mandat (MAN), le
 * prothésiste salarié n'a pas de fiche à gérer (LINFO). Un laboratoire à
 * plusieurs établissements passe d'abord par leur choix (LE1).
 */
export default async function Page(props: { params: Promise<{ slug: string }>; searchParams: Promise<{ lieux?: string | string[]; lieu?: string | string[] }> }) {
  const { slug } = await props.params
  const sp = await props.searchParams
  const compte = await garde(`${LABO}/${slug}/`, 'prothesiste')
  const fiche = await ficheOu404(slug, compte)
  const deja = dejaEngage(fiche)
  if (deja) redirect(chemin(deja))
  if (fiche.gereeParUnAutre) redirect(chemin(versLabo(fiche.slug, 'conflit')))
  // LE1 envoie ses cases en `lieu=…` répétés ; on les garde ensuite en `lieux=a,b`.
  const lieux = [...lieuxDe(sp.lieux), ...lieuxDe(sp.lieu)]
  if (fiche.lieux.length > 1 && !lieux.length) redirect(chemin(versLabo(fiche.slug, 'etablissements')))
  const siren = await sirenDe(fiche.id)

  return (
    <CoquilleParcours fiche={fiche} etiquette="Fiche non revendiquée" recherche={siren ?? nomDe(fiche)} retour={pageFiche(fiche)}>
      <Etapes etape={2} libelle="Rôle" />
      <h1 className={titre}>C’est bien votre laboratoire ?</h1>
      <p className="mt-2 text-sm text-fg-2">Indiquez aussi votre rôle : il détermine la preuve demandée.</p>
      <div className={`${cadre} mt-6`}>
        <FicheResume profession="Laboratoire de prothèse" nom={nomDe(fiche)} adresse={adresseDe(fiche.resume)} rpps={libelleSiren(siren)} libelleIdentifiant="SIREN" />
      </div>
      <p className="mb-2 mt-5 text-[11px] font-medium uppercase tracking-[0.08em] text-fg-2">Votre rôle</p>
      <ChoixVoies
        defaut="gerant"
        voies={[
          { valeur: 'gerant', titre: 'Gérant ou dirigeant', detail: 'Vous figurez sur l’extrait Kbis.', icone: 'document', bouton: 'C’est mon laboratoire', href: versLabo(fiche.slug, 'preuve', lieux) },
          { valeur: 'mandate', titre: 'Salarié mandaté', detail: 'Le gérant vous autorise à gérer la fiche.', icone: 'document', bouton: 'C’est mon laboratoire', href: versLabo(fiche.slug, 'mandat', lieux) },
          { valeur: 'salarie', titre: 'Prothésiste salarié', detail: 'Vous travaillez au laboratoire sans le représenter.', icone: 'recherche', bouton: 'C’est mon laboratoire', href: versLabo(fiche.slug, 'salarie') },
        ]}
        secondaire={{ libelle: 'Ce n’est pas le bon établissement', href: `${LABO}/` }}
      />
    </CoquilleParcours>
  )
}
