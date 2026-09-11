/**
 * Coquille affichée pendant que le contenu arrive.
 *
 * Avec Cache Components, la partie statique de la page est prérendue et le
 * contenu est streamé dans la même réponse : les moteurs voient le HTML final,
 * le visiteur voit immédiatement la structure. Ce squelette doit donc avoir la
 * même géométrie que le contenu réel, sans quoi la page saute au chargement.
 */
export function SqueletteContenu() {
  return (
    <div className="animate-pulse" aria-hidden>
      <div className="h-4 w-64 rounded bg-slate-200" />
      <div className="mt-6 h-9 w-96 max-w-full rounded bg-slate-200" />
      <div className="mt-3 h-5 w-72 max-w-full rounded bg-slate-100" />
      <div className="mt-8 space-y-4 border-y border-slate-200 py-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-5 w-56 rounded bg-slate-200" />
            <div className="h-4 w-80 max-w-full rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
