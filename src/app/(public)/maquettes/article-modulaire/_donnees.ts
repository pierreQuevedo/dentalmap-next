/**
 * Saisie d'exemple du groupe ACF « Article modulaire », telle que l'API REST
 * la renverrait (format « standard ») : les dix modules de la bibliothèque
 * Figma, dans l'ordre du gabarit. Elle passe par les mêmes parseurs que les
 * articles réels.
 */
export const ACF_EXEMPLE: Record<string, unknown> = {
  article_chapo:
    'Avant une couronne ou un bridge, le chirurgien-dentiste vous remet un devis au format réglementaire. Voici comment le lire et le comparer.',
  article_relu_par: 'Dr Camille Rivière, chirurgienne-dentiste',
  article_date_relecture: '20261011',
  article_sources: [
    'Assurance maladie · Le devis dentaire | https://www.ameli.fr/assure/remboursements/rembourse/soins-protheses-dentaires',
    'Légifrance · Arrêté fixant le modèle de devis | https://www.legifrance.gouv.fr/',
    'Ministère de la Santé · Le 100 % Santé | https://sante.gouv.fr/systeme-de-sante/100pourcent-sante/',
  ].join('\n'),
  article_lies: [],
  section_1: {
    type: 'texte',
    titre: 'Ce que le devis doit indiquer',
    contenu:
      '<p>Pour chaque acte, le devis précise la nature du traitement, la dent concernée, le matériau utilisé et le lieu de fabrication de la prothèse.</p>\n<p>Il distingue le prix de vente de l’acte, la base de remboursement de l’Assurance maladie et le montant restant à votre charge avant intervention de votre complémentaire santé.</p>',
  },
  section_2: {
    type: 'a_retenir',
    titre: '',
    points: [
      'Le devis est obligatoire avant toute prothèse et suit un modèle réglementaire.',
      'Il doit proposer une alternative du panier 100 % Santé quand elle existe.',
      'Signer un devis n’engage pas à commencer les soins.',
    ].join('\n'),
  },
  section_3: {
    type: 'etapes',
    titre: 'Comparer deux devis, étape par étape',
    etapes: [
      'Alignez les actes | Vérifiez que les deux devis portent sur les mêmes dents et le même type de prothèse.',
      'Comparez les matériaux | Céramique, zircone ou métal : le matériau change le prix et l’aspect.',
      'Lisez le reste à charge | C’est la ligne qui compte, après Assurance maladie et avant complémentaire.',
    ].join('\n'),
  },
  section_4: {
    type: 'encadre',
    ton: 'information',
    titre: 'Le panier 100 % Santé',
    texte: 'Il concerne les patients couverts par un contrat de complémentaire santé responsable, soit la grande majorité des contrats.',
  },
  section_5: {
    type: 'chiffres',
    titre: 'Les repères',
    chiffres: [
      '3 | paniers de soins : 100 % Santé, tarifs maîtrisés, tarifs libres',
      '0 € | de reste à charge sur le panier 100 % Santé',
      '2 | devis au moins, pour comparer sur les mêmes lignes',
    ].join('\n'),
    source: 'Assurance maladie, ameli.fr',
  },
  section_6: {
    type: 'comparatif',
    titre: 'Les trois paniers',
    tableau: [
      'Panier | Reste à charge | Choix des matériaux',
      '100 % Santé | Aucun | Encadré par la réglementation',
      'Tarifs maîtrisés | Plafonné | Plus large',
      'Tarifs libres | Libre | Libre',
    ].join('\n'),
    note: 'Le reste à charge s’entend après remboursement de l’Assurance maladie et de la complémentaire santé.',
  },
  section_7: {
    type: 'citation',
    citation: 'Un bon devis se lit en cinq minutes. S’il vous en faut davantage, posez vos questions avant de signer.',
    auteur: 'Dr Camille Rivière',
    fonction: 'Chirurgienne-dentiste à Bordeaux',
    photo: false,
  },
  section_8: {
    type: 'image',
    image: { url: '/images/demo/pexels-6627320.jpg', alt: 'Une patiente relit un document au cabinet dentaire.', width: 1200, height: 800 },
    legende: 'Prenez le temps de relire le devis chez vous, avant de le signer.',
    credit: 'Photo : Pexels',
    format: 'large',
  },
  section_9: {
    type: 'questions',
    titre: '',
    questions: [
      'Le dentiste peut-il refuser de me remettre un devis ? | Non. Au-delà d’un certain montant et pour toute prothèse, le devis écrit est obligatoire et doit vous être remis avant le début des soins.',
      'Puis-je faire réaliser la prothèse ailleurs ? | Le devis indique le lieu de fabrication de la prothèse. Vous pouvez demander un autre devis à un autre chirurgien-dentiste et comparer.',
      'Le devis est-il payant ? | Le devis lui-même ne peut pas vous être facturé ; seuls l’examen et les éventuelles radiographies le sont.',
    ].join('\n'),
  },
  section_10: {
    type: 'appel',
    destination: 'recherche',
    titre: '',
    texte: 'Chaque fiche est rapprochée des registres officiels de l’Ordre et de l’Assurance maladie.',
  },
  section_11: { type: 'aucun' },
  section_12: { type: 'aucun' },
}

/** Repli de « À lire aussi » si WordPress ne répond pas. */
export const A_LIRE_AUSSI_EXEMPLE = [
  { slug: 'verifier-inscription-ordre', titre: 'Comment vérifier qu’un dentiste est bien inscrit à l’Ordre', extrait: null, date: null, categorie: 'patients', tempsLecture: 4, image: null },
  { slug: 'secteur-1-secteur-2', titre: 'Secteur 1, secteur 2 : ce que le conventionnement change pour vous', extrait: null, date: null, categorie: 'patients', tempsLecture: 4, image: null },
  { slug: 'marquage-ce-sur-mesure', titre: 'Marquage CE des dispositifs sur mesure : ce que dit le règlement', extrait: null, date: null, categorie: 'prothesistes', tempsLecture: 4, image: null },
]
