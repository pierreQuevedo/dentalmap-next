'use client'

import { Contraste, Jeton } from './jetons'

/**
 * Le système de couleur, et le raisonnement qui l'a produit.
 *
 * Écrit dans la page plutôt que dans un document à part : une charte qui vit
 * ailleurs que dans le produit finit toujours par décrire un produit qui
 * n'existe plus.
 */
function Niveau({
  rang,
  titre,
  regle,
  children,
}: {
  rang: string
  titre: string
  regle: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-5 rounded-2xl border border-line p-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.06em] text-fg-2">Niveau {rang}</p>
        <h3 className="mt-1 text-base font-semibold text-fg">{titre}</h3>
        <p className="mt-2 text-sm text-fg-2">{regle}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function Strategie() {
  return (
    <div className="space-y-5">
      <Niveau
        rang="0"
        titre="L’encre et le papier"
        regle="Quatre-vingt-dix-huit pour cent de la surface. Une page d’annuaire est d’abord du texte : c’est ici que se joue l’impression de soin, pas dans l’accent."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Jeton nom="bg" classe="bg-bg" bordure note="fond des pages" />
          <Jeton nom="bg-soft" classe="bg-bg-soft" bordure note="fond adouci" />
          <Jeton nom="fg" classe="bg-fg" note="ardoise profonde, texte" />
          <Jeton nom="fg-2" classe="bg-fg-2" note="texte secondaire" />
          <Jeton nom="line" classe="bg-line" bordure note="filets" />
          <Jeton nom="brand" classe="bg-brand" note="encre d’identité, logo" />
        </div>
      </Niveau>

      <Niveau
        rang="1"
        titre="L’action"
        regle="Une seule couleur, et elle n’apparaît que sur ce qui attend un clic délibéré : rechercher, revendiquer sa fiche, ouvrir l’espace pro. Jamais sur un lien de liste, sinon une page de commune compterait cinquante bleus et le bleu ne voudrait plus rien dire."
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Jeton nom="action" classe="bg-action" note="fond des boutons d’action" />
            <Jeton nom="action-hover" classe="bg-action-hover" note="au survol" />
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-4">
            <span className="rounded-full bg-action px-4 py-2 text-sm font-semibold text-action-foreground">
              Rechercher
            </span>
            <span className="rounded-full border border-line px-4 py-2 text-sm font-medium text-fg">
              Appeler
            </span>
            <span className="text-sm text-fg">
              Chirurgiens-dentistes à Bordeaux, <span className="underline">445 fiches</span>
            </span>
          </div>
        </div>
      </Niveau>

      <Niveau
        rang="2"
        titre="La fiabilité"
        regle="Vert et ambre ne décorent jamais : ils disent l’état d’une fiche au regard des registres. C’est la seule information que DentalMap porte par la couleur, et c’est pourquoi aucune autre couleur ne doit leur ressembler."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Jeton nom="verifie" classe="bg-verifie" note="vérifié" />
          <Jeton nom="partiel" classe="bg-partiel" note="en cours de vérification" />
          <Jeton nom="verifie-bg" classe="bg-verifie-bg" bordure note="fond du badge vérifié" />
          <Jeton nom="partiel-bg" classe="bg-partiel-bg" bordure note="fond du badge partiel" />
        </div>
      </Niveau>

      <Niveau
        rang="3"
        titre="L’éditorial"
        regle="Trois teintes pour distinguer les rubriques de conseils, et rien d’autre. Elles n’apparaissent qu’en pastille devant un titre ou en filet sous une vignette, jamais en aplat, jamais sur un bouton."
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Jeton nom="editorial-1" classe="bg-editorial-1" note="patients" />
            <Jeton nom="editorial-2" classe="bg-editorial-2" note="praticiens" />
            <Jeton nom="editorial-3" classe="bg-editorial-3" note="prothésistes" />
          </div>
          <div className="flex flex-wrap gap-4 rounded-xl border border-line p-4 text-sm">
            <span className="inline-flex items-center gap-2 text-fg">
              <span aria-hidden className="size-2 rounded-full bg-editorial-1" />
              Pour les patients
            </span>
            <span className="inline-flex items-center gap-2 text-fg">
              <span aria-hidden className="size-2 rounded-full bg-editorial-2" />
              Pour les praticiens
            </span>
            <span className="inline-flex items-center gap-2 text-fg">
              <span aria-hidden className="size-2 rounded-full bg-editorial-3" />
              Pour les prothésistes
            </span>
          </div>
        </div>
      </Niveau>
    </div>
  )
}

export function Contrastes() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-line p-5">
        <h3 className="text-sm font-semibold text-fg">Texte courant</h3>
        <p className="mt-1 mb-3 text-sm text-fg-2">Seuil AA : 4,5.</p>
        <Contraste libelle="Texte principal sur le fond" texte="fg" fond="bg" />
        <Contraste libelle="Texte secondaire sur le fond" texte="fg-2" fond="bg" />
        <Contraste libelle="Texte secondaire sur fond adouci" texte="fg-2" fond="bg-soft" />
        <Contraste libelle="Badge vérifié" texte="verifie" fond="verifie-bg" />
        <Contraste libelle="Badge en cours" texte="partiel" fond="partiel-bg" />
      </div>
      <div className="rounded-2xl border border-line p-5">
        <h3 className="text-sm font-semibold text-fg">Actions et rubriques</h3>
        <p className="mt-1 mb-3 text-sm text-fg-2">Seuil AA : 4,5 pour un libellé de bouton.</p>
        <Contraste libelle="Libellé sur bouton d’action" texte="action-foreground" fond="action" />
        <Contraste libelle="Libellé sur bouton d’identité" texte="brand-foreground" fond="brand" />
        <Contraste libelle="Pastille patients sur le fond" texte="editorial-1" fond="bg" seuil={3} />
        <Contraste libelle="Pastille praticiens sur le fond" texte="editorial-2" fond="bg" seuil={3} />
        <Contraste libelle="Pastille prothésistes sur le fond" texte="editorial-3" fond="bg" seuil={3} />
      </div>
    </div>
  )
}

export function Recherche() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-line bg-bg-soft p-5">
        <p className="text-xs font-semibold uppercase tracking-[.06em] text-fg-2">D’où viennent ces valeurs</p>
        <div className="mt-3 space-y-3 text-sm text-fg-2">
          <p>
            Le bleu d’action est celui d’apple.com, relevé dans ses propres feuilles de style :{' '}
            <span className="font-mono text-fg">#0071e3</span> pour le bouton,{' '}
            <span className="font-mono text-fg">#0077ed</span> au survol,{' '}
            <span className="font-mono text-fg">#2997ff</span> pour les liens sur fond sombre. L’encre
            y est <span className="font-mono text-fg">#1d1d1f</span>, les gris de texte{' '}
            <span className="font-mono text-fg">#6e6e73</span> et{' '}
            <span className="font-mono text-fg">#86868b</span>, les fonds adoucis{' '}
            <span className="font-mono text-fg">#f5f5f7</span>. Aucune de ces valeurs n’est publiée
            comme spécification : elles sont lues dans le produit, ce qui vaut mieux qu’une citation
            de mémoire.
          </p>
          <p>
            Apple ne publie pas non plus de hexadécimal garanti pour les couleurs système : sa
            consigne est de viser le rôle, <span className="italic">systemBlue</span>, et non une
            valeur. C’est exactement ce que fait la couche sémantique ici : les composants
            n’écrivent jamais une couleur, ils écrivent un rôle.
          </p>
          <p>
            Notre ardoise est plus froide et plus profonde que l’encre d’Apple :{' '}
            <span className="font-mono text-fg">#16222b</span> contre{' '}
            <span className="font-mono text-fg">#1d1d1f</span>. Le gris neutre d’Apple sert un
            catalogue de produits photographiés ; un annuaire n’a presque pas d’images, et une encre
            légèrement bleutée tient mieux sur de longues listes.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-line p-5">
        <p className="text-xs font-semibold uppercase tracking-[.06em] text-fg-2">Ce que la stratégie change</p>
        <div className="mt-3 space-y-3 text-sm text-fg-2">
          <p>
            La force du modèle n’est pas le bleu, c’est sa rareté. Sur une page de commune, le bleu
            n’apparaît qu’une fois, sur le bouton de recherche. Les quatre cent quarante-cinq liens
            de praticiens restent en encre : ils se distinguent par la position et le soulignement
            au survol, pas par la couleur. Un lien bleu par ligne, et la page devient une bouillie
            où plus rien n’attire l’œil.
          </p>
          <p>
            La pagination courante reste en encre pour la même raison : elle indique un état, elle
            n’attend pas de clic. Le logo aussi : une marque qui se peint de la couleur de ses
            boutons se confond avec eux.
          </p>
          <p className="text-fg">
            Le teal est abandonné : il appartenait à la même famille que le vert de vérification, et
            deux verts qui ne disent pas la même chose sur une page, c’est une information perdue.
          </p>
        </div>
      </div>
    </div>
  )
}
