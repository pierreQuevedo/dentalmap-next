'use client'

import { Verification } from '@/components/annuaire/primitives'
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
        regle="Un teal, et lui seul, sur ce qui attend un clic délibéré : rechercher, revendiquer sa fiche, ouvrir l’espace pro. Jamais sur un lien de liste, sinon une page de commune compterait quatre cents teals et la couleur ne voudrait plus rien dire."
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
        titre="Le repère géographique"
        regle="Le bleu ne sert plus à agir, il sert à situer : marqueurs de carte, rayon de recherche, distances. Une couleur par question posée, « où ? » pour le bleu, « que faire ? » pour le teal."
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Jeton nom="geo" classe="bg-geo" note="marqueurs et distances" />
            <Jeton nom="action" classe="bg-action" note="pour comparaison" />
          </div>
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line p-4 text-sm">
            <span className="inline-flex items-center gap-2 text-fg">
              <span aria-hidden className="size-3 rounded-full bg-geo ring-2 ring-bg" />
              Cabinet sur la carte
            </span>
            <span className="tabular-nums text-fg-2">510 m</span>
            <span className="tabular-nums text-fg-2">1,0 km</span>
          </div>
        </div>
      </Niveau>

      <Niveau
        rang="3"
        titre="La fiabilité"
        regle="La vérification est la règle : cinquante mille fiches sur soixante-cinq mille sont confrontées à un registre. Une règle ne se signale pas en couleur, une coche suffit. L’ambre est réservé à l’exception, la fiche dont l’identité n’est pas confirmée, seul cas où le lecteur doit ralentir."
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Jeton nom="partiel" classe="bg-partiel" note="identité à confirmer" />
            <Jeton nom="partiel-bg" classe="bg-partiel-bg" bordure note="fond du badge" />
          </div>
          <div className="flex flex-wrap gap-2 rounded-xl border border-line p-4">
            <Verification statut="verifie" />
            <Verification statut="partiel" />
            <Verification statut="non_verifie" />
          </div>
        </div>
      </Niveau>

      <Niveau
        rang="4"
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
        <Contraste libelle="Badge vérifié, encre sur fond adouci" texte="fg" fond="bg-soft" />
        <Contraste libelle="Badge en cours" texte="partiel" fond="partiel-bg" />
      </div>
      <div className="rounded-2xl border border-line p-5">
        <h3 className="text-sm font-semibold text-fg">Actions et rubriques</h3>
        <p className="mt-1 mb-3 text-sm text-fg-2">Seuil AA : 4,5 pour un libellé de bouton.</p>
        <Contraste libelle="Libellé sur bouton d’action" texte="action-foreground" fond="action" />
        <Contraste libelle="Libellé sur bouton d’identité" texte="brand-foreground" fond="brand" />
        <Contraste libelle="Marqueur de carte sur le fond" texte="geo" fond="bg" seuil={3} />
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
            La méthode vient d’apple.com, relevée dans ses propres feuilles de style : une encre
            presque noire, <span className="font-mono text-fg">#1d1d1f</span>, des gris de texte{' '}
            <span className="font-mono text-fg">#6e6e73</span> et{' '}
            <span className="font-mono text-fg">#86868b</span>, des fonds adoucis{' '}
            <span className="font-mono text-fg">#f5f5f7</span>, et une seule couleur d’action,{' '}
            <span className="font-mono text-fg">#0071e3</span>, qui revient vingt fois dans le
            fichier quand aucune autre teinte saturée n’apparaît. Aucune de ces valeurs n’est
            publiée comme spécification : elles sont lues dans le produit, ce qui vaut mieux qu’une
            citation de mémoire.
          </p>
          <p>
            Nous gardons la méthode et changeons la teinte : le teal{' '}
            <span className="font-mono text-fg">#0a8074</span> tient exactement la place du bleu
            d’Apple, à un rapport de contraste comparable, 4,82 contre 4,70 sur blanc. Le bleu,
            libéré, part sur la géographie, où il est de toute façon la convention de toutes les
            cartes.
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
            La force du modèle n’est pas la couleur, c’est sa rareté. Sur une page de commune, le
            teal n’apparaît pas une seule fois : il attend sur le bouton de recherche, une page plus
            loin. Les quatre cent quarante-cinq liens de praticiens restent en encre, distingués par
            la position et le soulignement au survol. Une couleur par ligne, et la page devient une
            bouillie où plus rien n’attire l’œil.
          </p>
          <p>
            La pagination courante reste en encre pour la même raison : elle indique un état, elle
            n’attend pas de clic. Le logo aussi : une marque qui se peint de la couleur de ses
            boutons se confond avec eux.
          </p>
          <p className="text-fg">
            Le vert de vérification est abandonné, et c’est la conséquence directe du choix du teal :
            deux couleurs voisines qui ne disent pas la même chose valent moins que pas de couleur du
            tout. Le badge vérifié devient une coche sobre, ce qui se défend seul : cinquante mille
            fiches sur soixante-cinq mille sont vérifiées, et une règle ne se signale pas en couleur.
            Reste l’ambre pour l’exception.
          </p>
        </div>
      </div>
    </div>
  )
}
