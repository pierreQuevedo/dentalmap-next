/** MAQUETTE. Tous les états d'ouverture du tableau de bord : chaque bouton Modifier, Remplir, Ajouter ouvre son panneau. */
import { EtatConfirme, EtatOuvert, type Ouverture } from './_ouvert'
import { DentCompte, DentFiche, DentFraicheur, DentPartager, DentRegistre } from './_dentiste'
import { LaboDelais, LaboRealisations } from './_labo'
import { EtabFormations, EtabGalerie, EtabPage } from './_etablissement'
import { FacAcces, FacCursus, FacSoins } from './_faculte'
import { Equipe } from './_etats'
import { CompteCommun, RegistreCommun } from './_partages'
import { EtabAdmission, Evenements, FacPage, LaboFiche } from './_bloc2'
import { CandidaturesDentiste, EmploiDentiste, EmploiLabo } from './_emploi'
import { SalAlertes, SalCandidatures, SalOffre, SalVisibilite } from './_candidat'

const SEMAINE: [string, string[]][] = [
  ['Lundi', ['8h30 à 12h30', '14h00 à 19h00']],
  ['Mardi', ['8h30 à 12h30', '14h00 à 19h00']],
  ['Mercredi', ['8h30 à 12h30']],
  ['Jeudi', ['8h30 à 12h30', '14h00 à 19h00']],
  ['Vendredi', ['8h30 à 12h30', '14h00 à 18h00']],
  ['Samedi', ['9h00 à 12h00']],
  ['Dimanche', []],
]

/* -------------------------------- Dentiste -------------------------------- */
const D: Record<string, [() => React.JSX.Element, Ouverture]> = {
  'd-horaires': [DentFiche, { forme: 'tiroir', titre: 'Horaires', meta: 'Ma fiche · confirmés le 11 octobre', intro: 'Les jours et plages d’ouverture du lieu principal. Ils ouvrent le filtre « Ouvert maintenant ».', champs: [
    { type: 'liste', l: 'Lieu d’exercice', v: '12 Rue Sainte-Catherine, Bordeaux' },
    { type: 'horaires', jours: SEMAINE },
    { type: 'interrupteur', l: 'Fermeture exceptionnelle', d: 'Congés, formation : la fiche affiche « Fermé jusqu’au… »', on: false },
    { type: 'note', v: 'Rappel dans 75 jours pour reconfirmer. Sans réponse à 180 jours, la fiche sort du filtre « Ouvert maintenant ».' },
  ] }],
  'd-conventionnement': [DentFiche, { forme: 'tiroir', titre: 'Conventionnement et tiers payant', meta: 'Ma fiche', champs: [
    { type: 'choix', l: 'Secteur de conventionnement', options: [['Secteur 1', true], ['Secteur 2', false], ['Secteur 2 avec OPTAM', false], ['Non conventionné', false]] },
    { type: 'choix', l: 'Tiers payant', options: [['Intégral, Sécurité sociale et mutuelle', true], ['Part Sécurité sociale', false], ['Non', false]] },
    { type: 'puces', l: 'Modes de paiement', options: [['Carte bancaire', true], ['Chèque', true], ['Espèces', true], ['Virement', false]] },
    { type: 'note', v: 'Ces informations sont déclaratives : la fiche les affiche avec la mention « déclaré par le praticien ».' },
  ] }],
  'd-accueil': [DentFiche, { forme: 'tiroir', titre: 'Langues, accès, enfants', meta: 'Ma fiche', champs: [
    { type: 'puces', l: 'Langues parlées au cabinet', options: [['Français', true], ['Anglais', true], ['Espagnol', false], ['Arabe', false], ['Portugais', false], ['Langue des signes', false]] },
    { type: 'puces', l: 'Accès', options: [['Accessible PMR', true], ['Ascenseur', true], ['Plain-pied', false], ['Stationnement', true], ['Transports en commun', true], ['Boucle magnétique', false]] },
    { type: 'texte', l: 'Précision sur l’accès', v: 'Entrée par la cour, sonnette à gauche' },
    { type: 'texte', l: 'Enfants reçus à partir de', v: '3 ans', aide: 'Laisser vide si vous ne recevez pas d’enfants' },
  ] }],
  'd-paiement': [DentFiche, { forme: 'tiroir', titre: 'Paiement', meta: 'Ma fiche · hors barème', champs: [
    { type: 'puces', l: 'Modes de paiement acceptés', options: [['Carte bancaire', true], ['Chèque', true], ['Espèces', true], ['Virement', false]] },
    { type: 'note', v: 'Le paiement s’affiche sur la fiche mais ne compte pas dans la force.' },
  ] }],
  'd-soins': [DentFiche, { forme: 'tiroir', titre: 'Domaines de soins', meta: 'Mission · +8 % · 1 min', intro: 'Ce que vous pratiquez le plus. Au moins deux domaines ouvrent le filtre par domaine.', champs: [
    { type: 'puces', l: 'Domaines', options: [['Implantologie', true], ['Parodontologie', true], ['Endodontie', false], ['Prothèses', false], ['Esthétique', false], ['Pédodontie', true], ['Occlusodontie et ATM', false], ['Aligneurs', false], ['Gérodontologie', false], ['Sommeil et apnée', false], ['Sédation et hypnose', false]] },
    { type: 'note', v: 'La fiche précise que ce ne sont pas des spécialités reconnues par l’Ordre. Une spécialité ordinale vient du registre.' },
  ] }],
  'd-lieu-1': [DentRegistre, { forme: 'tiroir', titre: 'Lieu principal', meta: 'Registre · lieu géré', champs: [
    { type: 'lecture', l: 'Adresse', v: '12 Rue Sainte-Catherine, 33000 Bordeaux', source: 'Annuaire Santé' },
    { type: 'texte', l: 'Téléphone du cabinet', v: '05 XX XX XX XX', aide: 'Affiché aux visiteurs connectés' },
    { type: 'horaires', jours: SEMAINE.slice(0, 4) },
    { type: 'note', v: 'Chaque lieu a ses propres horaires : la fiche affiche celui où vous êtes aujourd’hui.' },
  ] }],
  'd-lieu-2': [DentRegistre, { forme: 'tiroir', titre: 'Second lieu', meta: 'Registre · à renseigner', champs: [
    { type: 'lecture', l: 'Adresse', v: '41 Avenue de la Marne, 33700 Mérignac', source: 'Annuaire Santé' },
    { type: 'texte', l: 'Téléphone de ce lieu', vide: 'Optionnel' },
    { type: 'horaires', jours: [['Lundi', []], ['Mardi', ['9h00 à 13h00', '14h00 à 18h00']], ['Mercredi', []], ['Jeudi', []], ['Vendredi', []], ['Samedi', []], ['Dimanche', []]] },
    { type: 'interrupteur', l: 'Afficher ce lieu sur la fiche', on: true },
  ] }],
  'd-ecart': [DentRegistre, { forme: 'modale', titre: 'Signaler un écart', meta: 'Registre', champs: [
    { type: 'liste', l: 'Information concernée', v: 'Mode d’exercice' },
    { type: 'zone', l: 'Ce qui est inexact', v: 'J’exerce en libéral depuis janvier, le registre indique encore salarié.' },
    { type: 'note', v: 'La correction se fait auprès de l’Ordre. Nous vérifions de notre côté et vous répondons sous cinq jours ouvrés.' },
  ], principal: 'Envoyer' }],
  'd-email': [DentCompte, { forme: 'modale', titre: 'Changer d’adresse électronique', champs: [
    { type: 'lecture', l: 'Adresse actuelle', v: 'm.dupont@cabinet-sainte-catherine.fr', source: 'Compte' },
    { type: 'texte', l: 'Nouvelle adresse', v: 'martin.dupont@cabinet-sainte-catherine.fr' },
    { type: 'note', v: 'Un code à 6 chiffres est envoyé à la nouvelle adresse pour la confirmer.' },
  ], principal: 'Recevoir le code' }],
  'd-mdp': [DentCompte, { forme: 'modale', titre: 'Changer de mot de passe', champs: [
    { type: 'texte', l: 'Mot de passe actuel', v: '••••••••••' },
    { type: 'texte', l: 'Nouveau mot de passe', v: '••••••••••••', aide: '12 caractères au moins' },
    { type: 'texte', l: 'Confirmer', v: '••••••••••••' },
  ] }],
  'd-deconnexion': [DentCompte, { forme: 'modale', titre: 'Déconnecter les autres appareils ?', champs: [
    { type: 'note', v: 'L’iPhone connecté il y a 2 jours devra se reconnecter. Cet appareil reste connecté.' },
  ], principal: 'Déconnecter', danger: true }],
  'd-visuel': [DentPartager, { forme: 'modale', titre: 'Visuel pour les réseaux sociaux', champs: [
    { type: 'choix', l: 'Format', options: [['Carré, publication', true], ['Story', false]] },
    { type: 'depot', l: 'Aperçu', d: 'Dr Martin Dupont · Vérifié sur DentalMap · code QR vers dentalmap.fr/p/dupont-bdx' },
  ], principal: 'Télécharger' }],
  'd-parrain': [DentPartager, { forme: 'modale', titre: 'Parrainer un confrère', champs: [
    { type: 'recherche', l: 'Nom ou numéro RPPS', v: 'Rivière', resultats: [['Dr Camille Rivière', 'Bordeaux · fiche non revendiquée'], ['Dr Paul Rivière', 'Talence · fiche non revendiquée']] },
    { type: 'texte', l: 'Son adresse électronique', vide: 'Pour lui envoyer l’invitation' },
    { type: 'note', v: 'Aucun effet sur votre place ni sur la sienne.' },
  ], principal: 'Envoyer l’invitation' }],
}

/* --------------------------------- Labo --------------------------------- */
const L: Record<string, [() => React.JSX.Element, Ouverture]> = {
  'l-piece': [LaboDelais, { forme: 'tiroir', titre: 'Ajouter une pièce', meta: 'Délais de fabrication', champs: [
    { type: 'recherche', l: 'Type de pièce', v: 'Inlay', resultats: [['Inlay-core', 'Prothèse fixe'], ['Inlay-onlay céramique', 'Prothèse fixe']] },
    { type: 'compteur', l: 'Délai moyen', v: '6 j ouvrés' },
    { type: 'note', v: 'De la réception de l’empreinte à l’expédition. La frise de la fiche se met à jour en direct.' },
  ], principal: 'Ajouter' }],
  'l-retirer': [LaboDelais, { forme: 'modale', titre: 'Retirer « Gouttière » ?', champs: [
    { type: 'note', v: 'La pièce disparaît de la frise de la fiche. Les cabinets qui filtrent sur les gouttières ne vous trouveront plus.' },
  ], principal: 'Retirer', danger: true }],
  'l-upload': [LaboRealisations, { forme: 'modale', titre: 'Ajouter des réalisations', champs: [
    { type: 'depot', l: 'Photos', d: 'Glissez jusqu’à 4 photos, JPG ou PNG' },
    { type: 'interrupteur', l: 'Aucun patient n’est reconnaissable', on: true },
  ], principal: 'Ajouter' }],
  'l-legende': [LaboRealisations, { forme: 'tiroir', titre: 'Photo 4', meta: 'Réalisations', champs: [
    { type: 'depot', l: 'Photo', d: 'Recadrer ou remplacer' },
    { type: 'texte', l: 'Légende', vide: 'Ex. : Couronnes zircone sur 11 et 21', alerte: 'Sans légende, la photo reste publiée mais compte moins.' },
    { type: 'texte', l: 'Crédit pour cette photo', vide: 'Laboratoire Artemis Dentaire (par défaut)' },
  ] }],
  'l-inviter': [() => <Equipe profil="labo" />, { forme: 'modale', titre: 'Inviter un membre', champs: [
    { type: 'texte', l: 'Adresse électronique', v: 'paul.renard@artemis-dentaire.fr' },
    { type: 'liste', l: 'Rôle', v: 'Prothésiste' },
    { type: 'puces', l: 'Peut modifier', options: [['Délais', true], ['Savoir-faire', true], ['Réalisations', true], ['Zone et logistique', false], ['Équipe', false]] },
  ], principal: 'Envoyer l’invitation' }],
  'l-membre': [() => <Equipe profil="labo" />, { forme: 'tiroir', titre: 'Thomas Leroy', meta: 'Équipe · prothésiste', champs: [
    { type: 'liste', l: 'Rôle', v: 'Prothésiste' },
    { type: 'puces', l: 'Peut modifier', options: [['Délais', true], ['Savoir-faire', true], ['Réalisations', true], ['Zone et logistique', false], ['Conformité', false], ['Équipe', false]] },
    { type: 'note', v: 'Dernière modification : délais de la couronne sur implant, le 3 octobre.' },
  ], secondaire: 'Retirer de l’équipe' }],
  'l-ecart': [() => <RegistreCommun profil="labo" />, { forme: 'modale', titre: 'Signaler un écart', meta: 'Base Sirene', champs: [
    { type: 'liste', l: 'Information concernée', v: 'Adresse' },
    { type: 'zone', l: 'Ce qui est inexact', v: 'Nous avons déménagé au 10 Avenue de la Somme en septembre.' },
    { type: 'note', v: 'Le changement se déclare au guichet des formalités des entreprises ; Sirene le reprend ensuite.' },
  ], principal: 'Envoyer' }],
  'l-ceder': [() => <CompteCommun profil="labo" />, { forme: 'modale', titre: 'Céder la gestion', champs: [
    { type: 'liste', l: 'Nouveau gérant de la fiche', v: 'Thomas Leroy' },
    { type: 'note', v: 'Il reçoit tous les droits. Vous restez membre de l’équipe, avec les droits qu’il vous laissera.', ton: 'alerte' },
  ], principal: 'Céder la gestion', danger: true }],
}

/* ------------------------------ Établissement ------------------------------ */
const E: Record<string, [() => React.JSX.Element, Ouverture]> = {
  'e-heros': [EtabPage, { forme: 'tiroir', titre: 'Héros', meta: 'Ma page · section 01', champs: [
    { type: 'lecture', l: 'Nom et statut', v: 'École de prothèse dentaire de Bordeaux · privé sous contrat', source: 'UAI' },
    { type: 'depot', l: 'Logo', d: 'SVG ou PNG transparent, carré ou horizontal. Monogramme affiché tant qu’il manque.' },
    { type: 'texte', l: 'Accroche', v: 'Former des prothésistes prêts pour le laboratoire.' },
    { type: 'note', v: 'Portes ouvertes et période de candidature viennent des sections Événements et Admission.' },
  ] }],
  'e-presentation': [EtabPage, { forme: 'tiroir', titre: 'Présentation', meta: 'Ma page · section 02', champs: [
    { type: 'zone', l: 'Texte de présentation', v: 'Depuis 1987, l’école forme les prothésistes dentaires de Nouvelle-Aquitaine, du bac professionnel au brevet technique des métiers supérieur…', compteur: '386 / 800 caractères' },
  ] }],
  'e-admission': [EtabPage, { forme: 'tiroir', titre: 'Admission', meta: 'Ma page · section 05 · vide', intro: 'Les étapes de sélection, dans l’ordre, avec leur période.', champs: [
    { type: 'deux', a: { type: 'texte', l: 'Étape 1', v: 'Vous candidatez' }, b: { type: 'texte', l: 'Période', v: 'Janvier à mars' } },
    { type: 'deux', a: { type: 'texte', l: 'Étape 2', v: 'Étude du dossier' }, b: { type: 'texte', l: 'Période', v: 'Mars' } },
    { type: 'deux', a: { type: 'texte', l: 'Étape 3', vide: 'Ex. : entretien' }, b: { type: 'texte', l: 'Période', vide: 'Ex. : avril' } },
    { type: 'zone', l: 'Ce que l’école attend', vide: 'Trois points au plus' },
  ] }],
  'e-alternance': [EtabPage, { forme: 'tiroir', titre: 'Alternance', meta: 'Ma page · section 06', champs: [
    { type: 'texte', l: 'Rythme', v: 'Deux semaines à l’école, deux semaines au laboratoire' },
    { type: 'zone', l: 'Aide à la recherche d’un laboratoire', v: 'L’école transmet votre candidature à ses laboratoires partenaires et organise un forum de recrutement en mai.' },
    { type: 'compteur', l: 'Laboratoires partenaires', v: '38' },
  ] }],
  'e-plateau': [EtabPage, { forme: 'tiroir', titre: 'Plateau technique et vie étudiante', meta: 'Ma page · section 08', champs: [
    { type: 'texte', l: 'Atelier 1', v: 'Plateau CFAO' },
    { type: 'texte', l: 'Atelier 2', v: 'Atelier céramique' },
    { type: 'texte', l: 'Internat', v: '60 places, à 300 m de l’école' },
    { type: 'texte', l: 'Référent handicap', vide: 'Nom ou fonction', alerte: 'Manquant : la section reste « À compléter ».' },
  ] }],
  'e-couts': [EtabPage, { forme: 'tiroir', titre: 'Coûts et aides', meta: 'Ma page · section 09 · vide', champs: [
    { type: 'deux', a: { type: 'texte', l: 'Frais de scolarité', vide: 'Ex. : gratuits' }, b: { type: 'texte', l: 'Équipement', vide: 'Ex. : 450 €' } },
    { type: 'zone', l: 'Aides', vide: 'Bourses, aides régionales…' },
    { type: 'interrupteur', l: 'Apprentissage financé, sans frais pour l’apprenti', on: true },
  ] }],
  'e-evenements': [EtabPage, { forme: 'tiroir', titre: 'Portes ouvertes et rendez-vous', meta: 'Ma page · section 10', champs: [
    { type: 'deux', a: { type: 'texte', l: 'Date', v: '6 février 2027' }, b: { type: 'texte', l: 'Horaires', v: '9h00 à 16h00' } },
    { type: 'texte', l: 'Intitulé', v: 'Journée portes ouvertes' },
    { type: 'interrupteur', l: 'Sur inscription', on: false },
    { type: 'note', v: 'Un événement passé disparaît de la page de lui-même.' },
  ], principal: 'Ajouter l’événement' }],
  'e-contacts': [EtabPage, { forme: 'tiroir', titre: 'Accès et contacts', meta: 'Ma page · section 11', champs: [
    { type: 'deux', a: { type: 'texte', l: 'Secrétariat · téléphone', v: '05 XX XX XX XX' }, b: { type: 'texte', l: 'Courriel', v: 'secretariat@…' } },
    { type: 'deux', a: { type: 'texte', l: 'Référent handicap', vide: 'Téléphone' }, b: { type: 'texte', l: 'Courriel', vide: 'Courriel' } },
    { type: 'texte', l: 'Site web', v: 'https://ecole-prothese-bordeaux.fr' },
  ] }],
  'e-formation': [EtabFormations, { forme: 'tiroir', titre: 'Ajouter une formation', meta: 'Formations', champs: [
    { type: 'recherche', l: 'Diplôme', v: 'prothésiste', aide: 'Dans le Répertoire national des certifications', resultats: [['BTS Prothésiste dentaire', 'Niveau 5'], ['BTMS Prothésiste dentaire', 'Niveau 5'], ['Bac pro Technicien en prothèse dentaire', 'Niveau 4']] },
    { type: 'note', v: 'Niveau et code se remplissent seuls ; vous complétez durée, voies, places et rentrée.' },
  ], principal: 'Continuer' }],
  'e-upload': [EtabGalerie, { forme: 'modale', titre: 'Ajouter des photos', champs: [
    { type: 'depot', l: 'Photos', d: 'Glissez jusqu’à 12 photos, JPG ou PNG' },
    { type: 'interrupteur', l: 'Les personnes reconnaissables ont donné leur accord', on: true },
  ], principal: 'Ajouter' }],
  'e-inviter': [() => <Equipe profil="etablissement" />, { forme: 'modale', titre: 'Inviter un membre', champs: [
    { type: 'texte', l: 'Adresse électronique', v: 'secretariat@ecole-prothese-bordeaux.fr' },
    { type: 'liste', l: 'Rôle', v: 'Secrétariat' },
    { type: 'puces', l: 'Peut modifier', options: [['Contacts', true], ['Calendrier', true], ['Événements', true], ['Formations', false], ['Galerie', false]] },
  ], principal: 'Envoyer l’invitation' }],
}

/* -------------------------------- Faculté -------------------------------- */
const F: Record<string, [() => React.JSX.Element, Ouverture]> = {
  'f-etape': [FacAcces, { forme: 'tiroir', titre: 'Passerelles', meta: 'Accès aux études · étape 03', champs: [
    { type: 'texte', l: 'Intitulé', v: 'Passerelles' },
    { type: 'zone', l: 'Description', v: 'Pour les titulaires de certains masters, diplômes paramédicaux ou d’ingénieur, sur dossier et entretien.' },
    { type: 'texte', l: 'Période 2027', vide: 'Ex. : dossier en mars', alerte: 'À confirmer pour 2027.' },
  ] }],
  'f-centre': [FacSoins, { forme: 'tiroir', titre: 'Ajouter un centre de soins', meta: 'Centres de soins', champs: [
    { type: 'texte', l: 'Nom', vide: 'Ex. : Centre de soins dentaires de Pessac' },
    { type: 'recherche', l: 'Adresse', v: '2 Avenue', resultats: [['2 Avenue de Canéjan, 33600 Pessac', 'Base Adresse Nationale']] },
    { type: 'texte', l: 'Téléphone de rendez-vous', vide: 'Testé chaque semaine' },
    { type: 'puces', l: 'Soins proposés', options: [['Soins courants', true], ['Prothèses', false], ['Orthodontie', false], ['Chirurgie orale', false], ['Enfants', false]] },
  ], principal: 'Ajouter' }],
  'f-cycle': [FacCursus, { forme: 'tiroir', titre: 'DFASO', meta: 'Cursus · 4e et 5e années', champs: [
    { type: 'texte', l: 'Intitulé', v: 'Diplôme de formation approfondie en sciences odontologiques' },
    { type: 'zone', l: 'Ce qu’on y fait', v: 'Premiers soins aux patients dans les centres de soins, stages hospitaliers.' },
  ] }],
  'f-diplome': [FacCursus, { forme: 'tiroir', titre: 'Ajouter un diplôme', meta: 'Après le diplôme d’État', champs: [
    { type: 'texte', l: 'Intitulé', vide: 'Ex. : Diplôme universitaire d’orthodontie' },
    { type: 'choix', l: 'Type', options: [['Diplôme universitaire', true], ['Certificat d’études supérieures', false], ['Autre', false]] },
    { type: 'texte', l: 'Durée', vide: 'Ex. : 1 an' },
  ], principal: 'Ajouter' }],
  'f-inviter': [() => <Equipe profil="faculte" />, { forme: 'modale', titre: 'Inviter un membre', champs: [
    { type: 'texte', l: 'Adresse électronique', v: 'scolarite@odontologie.universite-estuaire.fr' },
    { type: 'liste', l: 'Rôle', v: 'Scolarité' },
    { type: 'puces', l: 'Peut modifier', options: [['Accès aux études', true], ['Cursus', true], ['Centres de soins', false], ['Galerie', false]] },
  ], principal: 'Envoyer l’invitation' }],
}

/* --------------------------------- Bloc 2 --------------------------------- */
const B2: Record<string, [() => React.JSX.Element, Ouverture]> = {
  'l-presentation': [LaboFiche, { forme: 'tiroir', titre: 'Présentation', meta: 'Mission · +5 % · 4 min', intro: 'La citation en tête de fiche : ce que le laboratoire fait le mieux, pour qui, comment il travaille.', champs: [
    { type: 'zone', l: 'Phrase d’accroche', v: 'Huit prothésistes, la prothèse fixe céramique et l’implantologie.' },
    { type: 'zone', l: 'Texte', v: 'Vos empreintes numériques arrivent directement au laboratoire, et un prothésiste référent suit votre cabinet.', compteur: '214 / 800 caractères' },
    { type: 'note', v: 'Pas de prix ni de comparaison avec d’autres laboratoires.' },
  ] }],
  'e-periode': [EtabAdmission, { forme: 'tiroir', titre: 'BTS Prothésiste dentaire', meta: 'Période de candidature 2027 · à confirmer', champs: [
    { type: 'lecture', l: 'Plateforme', v: 'Parcoursup', source: 'RNCP' },
    { type: 'deux', a: { type: 'texte', l: 'Ouverture des vœux', v: '18 janvier 2027' }, b: { type: 'texte', l: 'Clôture', v: '12 mars 2027' } },
    { type: 'note', v: 'Dates proposées d’après le calendrier national de Parcoursup. Confirmez-les pour retirer la mention « à confirmer ».' },
  ], principal: 'Confirmer les dates' }],
  'e-evt': [() => <Evenements profil="etablissement" />, { forme: 'tiroir', titre: 'Ajouter un événement', meta: 'Événements', champs: [
    { type: 'choix', l: 'Type', options: [['Portes ouvertes', false], ['Mini-stage', true], ['Forum', false], ['Autre', false]] },
    { type: 'deux', a: { type: 'texte', l: 'Date', v: '11 avril 2027' }, b: { type: 'texte', l: 'Horaires', v: '9h00 à 16h00' } },
    { type: 'texte', l: 'Intitulé', v: 'Mini-stage de printemps' },
    { type: 'interrupteur', l: 'Sur inscription', d: 'Nombre de places', on: true },
    { type: 'compteur', l: 'Places', v: '20' },
  ], principal: 'Ajouter' }],
  'f-vie': [FacPage, { forme: 'tiroir', titre: 'Vie étudiante', meta: 'Ma page · section vide', champs: [
    { type: 'texte', l: 'Bibliothèque', v: 'Section santé, ouverte jusqu’à 22h00 en semaine' },
    { type: 'texte', l: 'Restauration', v: 'Restaurant universitaire à 200 m' },
    { type: 'texte', l: 'Logement', vide: 'Ex. : résidences universitaires' },
    { type: 'texte', l: 'Handicap', vide: 'Ex. : mission handicap de l’université' },
  ] }],
  'f-evt': [() => <Evenements profil="faculte" />, { forme: 'tiroir', titre: 'Ajouter un événement', meta: 'Événements', champs: [
    { type: 'choix', l: 'Type', options: [['Portes ouvertes', false], ['Réunion d’information', true], ['Conférence', false], ['Autre', false]] },
    { type: 'deux', a: { type: 'texte', l: 'Date', v: '4 février 2027' }, b: { type: 'texte', l: 'Horaires', v: '18h00 à 19h30' } },
    { type: 'texte', l: 'Intitulé', v: 'Réunion PASS et L.AS pour les parents' },
    { type: 'interrupteur', l: 'Sur inscription', on: false },
  ], principal: 'Ajouter' }],
}

/* --------------------------------- Emploi, côté pros --------------------------------- */
/** Les longs tiroirs d’offre demandent un écran de base plus haut en bureau. */
const Haut = (B: () => React.JSX.Element) => () => (
  <div className="grid lg:min-h-[1440px]">
    <B />
  </div>
)

const EMP: Record<string, [() => React.JSX.Element, Ouverture]> = {
  'pd-offre': [Haut(EmploiDentiste), { forme: 'tiroir', titre: 'Publier une offre', meta: 'Emploi · nouvelle offre', intro: 'L’offre apparaît sur votre fiche et dans la recherche d’emploi, triée par distance.', champs: [
    { type: 'liste', l: 'Poste', v: 'Assistant(e) dentaire qualifié(e)' },
    { type: 'choix', l: 'Contrat', options: [['CDI', true], ['CDD', false], ['Remplacement', false], ['Alternance', false], ['Stage', false]] },
    { type: 'choix', l: 'Temps de travail', options: [['Temps plein', true], ['Temps partiel', false], ['Quelques jours par semaine', false]] },
    { type: 'texte', l: 'Date de début', v: 'Dès que possible' },
    { type: 'deux', a: { type: 'texte', l: 'Rémunération minimum', v: '2 100 € brut', aide: 'Brut mensuel' }, b: { type: 'texte', l: 'Maximum', v: '2 400 € brut', aide: 'Brut mensuel' } },
    { type: 'note', v: 'Obligatoire : une fourchette brute mensuelle. Sans elle, l’offre n’est pas publiée.', ton: 'alerte' },
    { type: 'liste', l: 'Lieu', v: '12 Rue Sainte-Catherine, Bordeaux', aide: 'Parmi vos lieux d’exercice' },
    { type: 'zone', l: 'Description', v: 'Cabinet d’omnipratique et d’implantologie en centre-ville, un praticien, deux fauteuils. Vous assistez au fauteuil, gérez la stérilisation et participez à l’accueil.', compteur: '186 / 1 500 caractères' },
    { type: 'puces', l: 'Avantages', options: [['Tickets restaurant', true], ['Mutuelle', true], ['Prime annuelle', true], ['Samedi libre', true], ['Formation continue', true], ['Stationnement', false]] },
    { type: 'interrupteur', l: 'Recevoir les candidatures sur DentalMap', d: 'Sinon, les candidats voient l’adresse de candidature du cabinet', on: true },
    { type: 'note', v: 'Publiée 30 jours, renouvelable en un clic.' },
  ], principal: 'Publier l’offre', secondaire: 'Enregistrer le brouillon' }],
  'pd-echange': [CandidaturesDentiste, { forme: 'modale', titre: 'Proposer un échange', meta: 'Julie R. · Assistante dentaire qualifiée', champs: [
    { type: 'zone', l: 'Message', v: 'Bonjour, merci pour votre candidature. Votre expérience en implantologie nous intéresse : seriez-vous disponible pour un premier échange au cabinet ou par téléphone ?' },
    { type: 'puces', l: 'Créneaux proposés', aide: 'Deux ou trois créneaux, la candidate en choisit un', options: [['Mardi 14 oct., 18h00', true], ['Jeudi 16 oct., 12h30', true], ['Vendredi 17 oct., 18h30', false], ['Autre créneau', false]] },
    { type: 'note', v: 'Si elle accepte, vous recevez son téléphone et son courriel, et elle reçoit ceux du cabinet. Sinon, rien n’est partagé.' },
  ], principal: 'Envoyer la proposition' }],
  'pd-pourvue': [CandidaturesDentiste, { forme: 'modale', titre: 'Marquer l’offre comme pourvue', meta: 'Assistant(e) dentaire qualifié(e) · 8 candidatures', champs: [
    { type: 'liste', l: 'Personne retenue', v: 'Inès H.', aide: 'Facultatif' },
    { type: 'note', v: 'Les candidats non retenus reçoivent un message automatique. L’offre est retirée de votre fiche et de la recherche.' },
    { type: 'note', v: 'Les candidatures sont supprimées 6 mois après la clôture, le 12 avril 2027.' },
  ], principal: 'Confirmer' }],
  'pl-offre': [Haut(EmploiLabo), { forme: 'tiroir', titre: 'Publier une offre', meta: 'Emploi · nouvelle offre', intro: 'L’offre apparaît sur votre fiche et dans la recherche d’emploi, triée par distance.', champs: [
    { type: 'liste', l: 'Poste', v: 'Prothésiste céramiste' },
    { type: 'choix', l: 'Contrat', options: [['CDI', true], ['CDD', false], ['Remplacement', false], ['Alternance', false], ['Stage', false]] },
    { type: 'choix', l: 'Temps de travail', options: [['Temps plein', true], ['Temps partiel', false]] },
    { type: 'texte', l: 'Date de début', v: '5 janvier 2027' },
    { type: 'deux', a: { type: 'texte', l: 'Rémunération minimum', v: '2 300 € brut', aide: 'Brut mensuel' }, b: { type: 'texte', l: 'Maximum', v: '2 800 € brut', aide: 'Brut mensuel' } },
    { type: 'note', v: 'Obligatoire : une fourchette brute mensuelle. Sans elle, l’offre n’est pas publiée.', ton: 'alerte' },
    { type: 'liste', l: 'Lieu', v: '8 Avenue de la Somme, Mérignac', aide: 'Parmi vos lieux d’exercice' },
    { type: 'zone', l: 'Description', v: 'Huit prothésistes, prothèse fixe céramique et implantologie. Vous stratifiez sur zircone et disilicate, en lien avec notre plateau CFAO.', compteur: '164 / 1 500 caractères' },
    { type: 'puces', l: 'Avantages', options: [['Tickets restaurant', true], ['Mutuelle', true], ['Horaires fixes', true], ['Formation céramique', true], ['Intéressement', false]] },
    { type: 'interrupteur', l: 'Recevoir les candidatures sur DentalMap', on: true },
    { type: 'note', v: 'Publiée 30 jours, renouvelable en un clic.' },
  ], principal: 'Publier l’offre', secondaire: 'Enregistrer le brouillon' }],
}

/* ------------------------------ Emploi, côté candidats ------------------------------ */
const CAND: Record<string, [() => React.JSX.Element, Ouverture]> = {
  'c-postuler': [SalOffre, { forme: 'tiroir', titre: 'Postuler', meta: 'Cabinet Sainte-Catherine · Bordeaux', champs: [
    { type: 'lecture', l: 'Offre', v: 'Assistant(e) dentaire qualifié(e) · CDI, temps plein · 2 100 à 2 400 € brut par mois', source: 'Offre' },
    { type: 'lecture', l: 'Profil joint', v: 'Assistante dentaire qualifiée · 9 ans d’expérience · préavis d’un mois · 15 km', source: 'Mon profil' },
    { type: 'zone', l: 'Votre message', v: 'Bonjour, assistante dentaire depuis neuf ans, j’assiste en implantologie et je cherche un cabinet en centre-ville. Je serais ravie d’en parler avec vous.', compteur: '164 / 1 000 caractères' },
    { type: 'depot', l: 'CV, facultatif', d: 'CV_Camille_Martin.pdf déjà joint · remplacer par un autre PDF' },
    { type: 'note', v: 'Le cabinet voit votre profil et votre message. Vos coordonnées ne sont partagées que si vous acceptez un échange.' },
  ], principal: 'Envoyer ma candidature' }],
  'c-alerte': [SalAlertes, { forme: 'modale', titre: 'Créer une alerte', champs: [
    { type: 'liste', l: 'Poste', v: 'Assistant(e) dentaire' },
    { type: 'puces', l: 'Contrat', options: [['CDI', true], ['CDD', true], ['Remplacement', false], ['Alternance', false]] },
    { type: 'deux', a: { type: 'liste', l: 'Autour de', v: 'Bordeaux' }, b: { type: 'liste', l: 'Rayon', v: '15 km' } },
    { type: 'choix', l: 'Fréquence', options: [['Dès qu’une offre paraît', false], ['Chaque matin', true], ['Chaque semaine', false]] },
  ], principal: 'Créer l’alerte' }],
  'c-echange': [SalCandidatures, { forme: 'modale', titre: 'Accepter l’échange', meta: 'Cabinet Sainte-Catherine · Assistant(e) dentaire qualifié(e)', champs: [
    { type: 'choix', l: 'Créneau proposé', aide: 'Choisissez celui qui vous convient', options: [['Mardi 14 octobre, 18h00', true], ['Jeudi 16 octobre, 12h30', false]] },
    { type: 'lecture', l: 'Coordonnées partagées avec le cabinet', v: 'Camille Martin · 06 XX XX XX XX · c.martin@exemple.fr', source: 'Mon profil' },
    { type: 'note', v: 'Vous recevez en retour le téléphone du cabinet et le nom de la personne qui vous appellera.' },
  ], principal: 'Accepter' }],
  'c-masquer': [SalVisibilite, { forme: 'modale', titre: 'Masquer mon profil à une structure', champs: [
    { type: 'recherche', l: 'Cabinet ou laboratoire', v: 'Ormeaux', aide: 'Elle ne verra ni votre profil, ni vos candidatures', resultats: [['Cabinet d’orthodontie des Ormeaux', 'Le Bouscat · fiche vérifiée'], ['Cabinet des Ormeaux', 'Eysines · fiche vérifiée']] },
    { type: 'note', v: 'La structure n’est pas prévenue. Vous pouvez la retirer de la liste à tout moment.' },
  ], principal: 'Masquer' }],
}

export const OUVERTS: Record<string, () => React.JSX.Element> = {}
for (const [k, [B, o]] of Object.entries({ ...D, ...L, ...E, ...F, ...B2, ...EMP, ...CAND })) OUVERTS[k] = () => <EtatOuvert base={<B />} o={o} />
OUVERTS['d-reconfirme'] = () => <EtatConfirme base={<DentFraicheur />} texte="Horaires reconfirmés, prochain rappel le 25 décembre" />
OUVERTS['l-reconfirme'] = () => <EtatConfirme base={<LaboDelais />} texte="Délais reconfirmés jusqu’au 12 avril 2027" />
OUVERTS['pd-publiee'] = () => <EtatConfirme base={<EmploiDentiste />} texte="Offre publiée, visible 30 jours" />
OUVERTS['c-envoyee'] = () => <EtatConfirme base={<SalCandidatures />} texte="Candidature envoyée" />
