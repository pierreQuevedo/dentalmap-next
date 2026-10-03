# DentalMap — Spécialités des praticiens

**1er octobre 2026**
*Référentiel des spécialités des chirurgiens-dentistes, chirurgiens maxillo-faciaux, stomatologues et ORL. Distingue ce que l'annuaire officiel (RPPS) expose de ce qui reste déclaratif. Sert à filtrer l'API Annuaire Santé et à construire les filtres de spécialité de la carte.*

---

## Partie 1 — Ce que l'annuaire sait, et ce qu'il ne sait pas

L'Annuaire Santé de l'ANS (RPPS) n'expose que les **spécialités ordinales**, celles reconnues par l'Ordre. Elles sont codées dans la nomenclature **TRE_R38 « Spécialité ordinale »** (OID `1.2.250.1.213.2.28`).

Tout le reste (implantologie, endodontie, parodontologie…) n'est **pas** une spécialité en France : ce sont des orientations d'exercice, souvent validées par un DU, absentes du RPPS. Un dentiste qui ne fait que de l'endo apparaît comme omnipraticien.

| Profession RPPS | Code |
|---|---|
| Chirurgien-dentiste | `40` |
| Médecin (maxillo-facial, stomatologue, ORL) | `10` |

Aucun des codes listés ci-dessous n'a de date de fin dans la nomenclature : un praticien qualifié sous l'ancien régime garde son ancien code.

---

## Partie 2 — Par cible

### Chirurgiens-dentistes (profession `40`)

**Avec code RPPS**

| Code | Spécialité |
|---|---|
| — | Omnipratique (aucun code `SCD`) |
| `SCD01` | Orthopédie dento-faciale (ODF) |
| `SCD02` | Chirurgie orale |
| `SCD03` | Médecine bucco-dentaire |

**Sans code (déclaratif)**

- Implantologie
- Chirurgie pré-implantaire (greffes osseuses, sinus lift)
- Parodontologie
- Endodontie
- Prothèse fixe et amovible, réhabilitation complète
- Dentisterie esthétique (facettes, blanchiment)
- Pédodontie
- Occlusodontie et dysfonctions de l'ATM
- Orthodontie par aligneurs (omnipraticiens)
- Gérodontologie
- Médecine dentaire du sommeil (orthèses d'avancée mandibulaire)
- Sédation, hypnose, soins aux patients handicapés

### Chirurgiens maxillo-faciaux (profession `10`)

**Avec code RPPS**

| Code | Spécialité |
|---|---|
| `SM68` | Chirurgie maxillo-faciale (réforme 2017) |
| `SM77` | Chirurgie maxillo-faciale, option orthodontie des dysmorphies maxillo-faciales |
| `SM07` | Chirurgie maxillo-faciale et stomatologie (ancien régime) |
| `SM06` | Chirurgie maxillo-faciale (ancien régime) |

**Sans code (déclaratif)**

- Chirurgie orthognathique
- Implantologie complexe (implants zygomatiques, reconstructions osseuses)
- Traumatologie faciale
- Cancérologie et chirurgie reconstructrice de la face
- Chirurgie plastique et esthétique de la face
- Malformations : fentes labio-palatines, chirurgie craniofaciale
- Chirurgie de l'ATM

### Stomatologues (profession `10`)

Le DES de stomatologie a disparu avec la réforme de 2017 ; les praticiens en exercice gardent leur titre. Les nouveaux passent par la chirurgie orale ou la chirurgie maxillo-faciale.

**Avec code RPPS**

| Code | Spécialité |
|---|---|
| `SM50` | Stomatologie |
| `SM07` | Chirurgie maxillo-faciale et stomatologie |
| `SM56` | Chirurgie orale (côté médecin, équivalent de `SCD02`) |

**Sans code (déclaratif)**

- Chirurgie buccale (dents de sagesse, kystes)
- Implantologie
- Pathologie de la muqueuse buccale
- ODF (anciens stomatologues)

### ORL (profession `10`)

**Avec code RPPS**

| Code | Spécialité |
|---|---|
| `SM34` | ORL et chirurgie cervico-faciale |
| `SM86` | ORL et chirurgie cervico-faciale, option audiophonologie |
| `SM39` | Oto-rhino-laryngologie (ancien libellé) |

**Sans code (déclaratif)**

- Otologie (oreille, implants cochléaires)
- Audiologie
- Rhinologie (nez, sinus)
- Laryngologie
- Phoniatrie (voix, déglutition)
- Chirurgie cervico-faciale (thyroïde, glandes salivaires)
- Cancérologie de la tête et du cou
- Chirurgie plastique de la face
- ORL pédiatrique
- Sommeil et apnée (orthèses d'avancée mandibulaire)

---

## Partie 3 — Filtrer l'annuaire

Pour couvrir les quatre cibles :

- **Dentistes :** profession `40`, avec ou sans `SCD01`, `SCD02`, `SCD03`
- **Médecins :** profession `10` et spécialité parmi `SM06`, `SM07`, `SM34`, `SM39`, `SM50`, `SM56`, `SM68`, `SM77`, `SM86`

Où trouver le code :

- **API FHIR** : `Practitioner.qualification` (ou `PractitionerRole.specialty`), système de codage TRE_R38.
- **Extraction RPPS en fichiers** : colonne « Code savoir-faire », avec le type de savoir-faire `S` (spécialité ordinale).

---

## Partie 4 — Sur la carte : orientations déclaratives

Les orientations sans code ne peuvent venir que du praticien lui-même (fiche revendiquée, formulaire d'inscription). Pour qu'elles servent de filtre, il faut une **liste fermée** à cocher, pas un champ libre. Les listes « sans code » ci-dessus sont des listes d'usage, pas un référentiel officiel : à valider avant de les figer.

---

## Sources

- Nomenclature TRE_R38 (ANS, mise à jour du 28/09/2026) : `https://mos.esante.gouv.fr/NOS/TRE_R38-SpecialiteOrdinale/TRE_R38-SpecialiteOrdinale.tabs` (encodé en Latin-1)
- Version FHIR : `https://mos.esante.gouv.fr/NOS/TRE_R38-SpecialiteOrdinale/FHIR/TRE-R38-SpecialiteOrdinale/TRE_R38-SpecialiteOrdinale-FHIR.json`
