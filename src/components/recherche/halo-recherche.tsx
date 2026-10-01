/**
 * Le halo de recherche : un dégradé qui tourne au bord de l'écran pendant
 * qu'on choisit un lieu.
 *
 * Même geste que l'anneau lumineux d'Apple Intelligence, dans la palette de
 * DentalMap : un dégradé conique sur les teintes de l'action, du sarcelle au
 * bleu clair, qui tourne lentement sur tout le pourtour de la fenêtre. Trois
 * anneaux superposés le composent : un large, très flou, qui pose la lueur ;
 * un moyen qui la densifie ; un fin et net qui dessine le bord. Il apparaît
 * en fondu quand le champ de lieu prend le focus et s'efface quand il le
 * perd, sans jamais gêner le pointeur.
 *
 * Tout est en CSS : la rotation anime une propriété enregistrée, le fondu est
 * une transition d'opacité, et le mouvement s'arrête pour qui préfère moins
 * d'animation. Voir `.halo-recherche` dans `globals.css`.
 */
export function HaloRecherche({ actif }: { actif: boolean }) {
  return (
    <div aria-hidden className="halo-recherche" data-actif={actif ? 'true' : 'false'}>
      <div className="halo-anneau" style={{ '--epaisseur': '44px', '--flou': '40px', '--voile': 0.45 } as React.CSSProperties} />
      <div className="halo-anneau" style={{ '--epaisseur': '12px', '--flou': '14px', '--voile': 0.7 } as React.CSSProperties} />
      <div className="halo-anneau" style={{ '--epaisseur': '2px', '--flou': '0px', '--voile': 1 } as React.CSSProperties} />
    </div>
  )
}
