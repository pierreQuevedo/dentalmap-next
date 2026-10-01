/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query FormationsPanneau($first: Int = 100) {\n    formations(first: $first) {\n      nodes {\n        id\n        formationFields { typeFormation }\n      }\n    }\n  }\n": typeof types.FormationsPanneauDocument,
    "\n  query ConseilsRecents($first: Int = 5) {\n    conseils(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        excerpt\n        date\n        conseilFields { tempsLecture }\n      }\n    }\n  }\n": typeof types.ConseilsRecentsDocument,
    "\n  query Conseils($first: Int = 100) {\n    conseils(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        excerpt\n        date\n        conseilFields { categorie tempsLecture }\n      }\n    }\n  }\n": typeof types.ConseilsDocument,
    "\n  query Conseil($slug: ID!) {\n    conseil(id: $slug, idType: SLUG) {\n      id\n      slug\n      title\n      content\n      excerpt\n      date\n      modified\n      conseilFields { categorie tempsLecture }\n      seoFields { metaTitle metaDescription noindex }\n    }\n  }\n": typeof types.ConseilDocument,
    "\n  query ConseilsAccueil($first: Int = 3) {\n    conseils(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        date\n        excerpt\n        featuredImage { node { sourceUrl altText } }\n        conseilFields { categorie }\n      }\n    }\n  }\n": typeof types.ConseilsAccueilDocument,
    "\n  query AnnoncesRecentes($first: Int = 10) {\n    annonces(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        date\n        annonceFields { typeAnnonce departement dateExpiration }\n      }\n    }\n  }\n": typeof types.AnnoncesRecentesDocument,
    "\n  query Faq($first: Int = 50) {\n    faqs(first: $first) {\n      nodes {\n        id\n        title\n        content\n        faqFields { ordre }\n      }\n    }\n  }\n": typeof types.FaqDocument,
    "\n  query VillesFormation($first: Int = 500) {\n    formations(first: $first) {\n      nodes {\n        id\n        formationFields { ville }\n      }\n    }\n  }\n": typeof types.VillesFormationDocument,
    "\n  query FormationsAccueil($first: Int = 8) {\n    formations(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        featuredImage { node { sourceUrl altText } }\n        formationFields { ville diplome duree typeFormation }\n      }\n    }\n  }\n": typeof types.FormationsAccueilDocument,
    "\n  query Formations($first: Int = 200) {\n    formations(first: $first, where: { orderby: { field: TITLE, order: ASC } }) {\n      nodes {\n        id\n        slug\n        title\n        excerpt\n        content\n        featuredImage { node { sourceUrl altText } }\n        formationFields { typeFormation ville departement diplome duree }\n      }\n    }\n    logos: mediaItems(first: 300, where: { search: \"logo\", mimeType: IMAGE_PNG }) {\n      nodes { slug sourceUrl altText }\n    }\n  }\n": typeof types.FormationsDocument,
    "\n  query Formation($slug: ID!, $logo: ID!) {\n    formation(id: $slug, idType: SLUG) {\n      id\n      slug\n      title\n      content\n      excerpt\n      date\n      modified\n      featuredImage { node { sourceUrl altText caption } }\n      formationFields { typeFormation ville departement diplome duree siteWeb }\n      seoFields { metaTitle metaDescription noindex }\n    }\n    logo: mediaItem(id: $logo, idType: SLUG) { sourceUrl altText }\n  }\n": typeof types.FormationDocument,
};
const documents: Documents = {
    "\n  query FormationsPanneau($first: Int = 100) {\n    formations(first: $first) {\n      nodes {\n        id\n        formationFields { typeFormation }\n      }\n    }\n  }\n": types.FormationsPanneauDocument,
    "\n  query ConseilsRecents($first: Int = 5) {\n    conseils(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        excerpt\n        date\n        conseilFields { tempsLecture }\n      }\n    }\n  }\n": types.ConseilsRecentsDocument,
    "\n  query Conseils($first: Int = 100) {\n    conseils(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        excerpt\n        date\n        conseilFields { categorie tempsLecture }\n      }\n    }\n  }\n": types.ConseilsDocument,
    "\n  query Conseil($slug: ID!) {\n    conseil(id: $slug, idType: SLUG) {\n      id\n      slug\n      title\n      content\n      excerpt\n      date\n      modified\n      conseilFields { categorie tempsLecture }\n      seoFields { metaTitle metaDescription noindex }\n    }\n  }\n": types.ConseilDocument,
    "\n  query ConseilsAccueil($first: Int = 3) {\n    conseils(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        date\n        excerpt\n        featuredImage { node { sourceUrl altText } }\n        conseilFields { categorie }\n      }\n    }\n  }\n": types.ConseilsAccueilDocument,
    "\n  query AnnoncesRecentes($first: Int = 10) {\n    annonces(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        date\n        annonceFields { typeAnnonce departement dateExpiration }\n      }\n    }\n  }\n": types.AnnoncesRecentesDocument,
    "\n  query Faq($first: Int = 50) {\n    faqs(first: $first) {\n      nodes {\n        id\n        title\n        content\n        faqFields { ordre }\n      }\n    }\n  }\n": types.FaqDocument,
    "\n  query VillesFormation($first: Int = 500) {\n    formations(first: $first) {\n      nodes {\n        id\n        formationFields { ville }\n      }\n    }\n  }\n": types.VillesFormationDocument,
    "\n  query FormationsAccueil($first: Int = 8) {\n    formations(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        featuredImage { node { sourceUrl altText } }\n        formationFields { ville diplome duree typeFormation }\n      }\n    }\n  }\n": types.FormationsAccueilDocument,
    "\n  query Formations($first: Int = 200) {\n    formations(first: $first, where: { orderby: { field: TITLE, order: ASC } }) {\n      nodes {\n        id\n        slug\n        title\n        excerpt\n        content\n        featuredImage { node { sourceUrl altText } }\n        formationFields { typeFormation ville departement diplome duree }\n      }\n    }\n    logos: mediaItems(first: 300, where: { search: \"logo\", mimeType: IMAGE_PNG }) {\n      nodes { slug sourceUrl altText }\n    }\n  }\n": types.FormationsDocument,
    "\n  query Formation($slug: ID!, $logo: ID!) {\n    formation(id: $slug, idType: SLUG) {\n      id\n      slug\n      title\n      content\n      excerpt\n      date\n      modified\n      featuredImage { node { sourceUrl altText caption } }\n      formationFields { typeFormation ville departement diplome duree siteWeb }\n      seoFields { metaTitle metaDescription noindex }\n    }\n    logo: mediaItem(id: $logo, idType: SLUG) { sourceUrl altText }\n  }\n": types.FormationDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FormationsPanneau($first: Int = 100) {\n    formations(first: $first) {\n      nodes {\n        id\n        formationFields { typeFormation }\n      }\n    }\n  }\n"): (typeof documents)["\n  query FormationsPanneau($first: Int = 100) {\n    formations(first: $first) {\n      nodes {\n        id\n        formationFields { typeFormation }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ConseilsRecents($first: Int = 5) {\n    conseils(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        excerpt\n        date\n        conseilFields { tempsLecture }\n      }\n    }\n  }\n"): (typeof documents)["\n  query ConseilsRecents($first: Int = 5) {\n    conseils(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        excerpt\n        date\n        conseilFields { tempsLecture }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Conseils($first: Int = 100) {\n    conseils(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        excerpt\n        date\n        conseilFields { categorie tempsLecture }\n      }\n    }\n  }\n"): (typeof documents)["\n  query Conseils($first: Int = 100) {\n    conseils(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        excerpt\n        date\n        conseilFields { categorie tempsLecture }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Conseil($slug: ID!) {\n    conseil(id: $slug, idType: SLUG) {\n      id\n      slug\n      title\n      content\n      excerpt\n      date\n      modified\n      conseilFields { categorie tempsLecture }\n      seoFields { metaTitle metaDescription noindex }\n    }\n  }\n"): (typeof documents)["\n  query Conseil($slug: ID!) {\n    conseil(id: $slug, idType: SLUG) {\n      id\n      slug\n      title\n      content\n      excerpt\n      date\n      modified\n      conseilFields { categorie tempsLecture }\n      seoFields { metaTitle metaDescription noindex }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ConseilsAccueil($first: Int = 3) {\n    conseils(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        date\n        excerpt\n        featuredImage { node { sourceUrl altText } }\n        conseilFields { categorie }\n      }\n    }\n  }\n"): (typeof documents)["\n  query ConseilsAccueil($first: Int = 3) {\n    conseils(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        date\n        excerpt\n        featuredImage { node { sourceUrl altText } }\n        conseilFields { categorie }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AnnoncesRecentes($first: Int = 10) {\n    annonces(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        date\n        annonceFields { typeAnnonce departement dateExpiration }\n      }\n    }\n  }\n"): (typeof documents)["\n  query AnnoncesRecentes($first: Int = 10) {\n    annonces(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        date\n        annonceFields { typeAnnonce departement dateExpiration }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Faq($first: Int = 50) {\n    faqs(first: $first) {\n      nodes {\n        id\n        title\n        content\n        faqFields { ordre }\n      }\n    }\n  }\n"): (typeof documents)["\n  query Faq($first: Int = 50) {\n    faqs(first: $first) {\n      nodes {\n        id\n        title\n        content\n        faqFields { ordre }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query VillesFormation($first: Int = 500) {\n    formations(first: $first) {\n      nodes {\n        id\n        formationFields { ville }\n      }\n    }\n  }\n"): (typeof documents)["\n  query VillesFormation($first: Int = 500) {\n    formations(first: $first) {\n      nodes {\n        id\n        formationFields { ville }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FormationsAccueil($first: Int = 8) {\n    formations(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        featuredImage { node { sourceUrl altText } }\n        formationFields { ville diplome duree typeFormation }\n      }\n    }\n  }\n"): (typeof documents)["\n  query FormationsAccueil($first: Int = 8) {\n    formations(first: $first, where: { orderby: { field: DATE, order: DESC } }) {\n      nodes {\n        id\n        slug\n        title\n        featuredImage { node { sourceUrl altText } }\n        formationFields { ville diplome duree typeFormation }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Formations($first: Int = 200) {\n    formations(first: $first, where: { orderby: { field: TITLE, order: ASC } }) {\n      nodes {\n        id\n        slug\n        title\n        excerpt\n        content\n        featuredImage { node { sourceUrl altText } }\n        formationFields { typeFormation ville departement diplome duree }\n      }\n    }\n    logos: mediaItems(first: 300, where: { search: \"logo\", mimeType: IMAGE_PNG }) {\n      nodes { slug sourceUrl altText }\n    }\n  }\n"): (typeof documents)["\n  query Formations($first: Int = 200) {\n    formations(first: $first, where: { orderby: { field: TITLE, order: ASC } }) {\n      nodes {\n        id\n        slug\n        title\n        excerpt\n        content\n        featuredImage { node { sourceUrl altText } }\n        formationFields { typeFormation ville departement diplome duree }\n      }\n    }\n    logos: mediaItems(first: 300, where: { search: \"logo\", mimeType: IMAGE_PNG }) {\n      nodes { slug sourceUrl altText }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Formation($slug: ID!, $logo: ID!) {\n    formation(id: $slug, idType: SLUG) {\n      id\n      slug\n      title\n      content\n      excerpt\n      date\n      modified\n      featuredImage { node { sourceUrl altText caption } }\n      formationFields { typeFormation ville departement diplome duree siteWeb }\n      seoFields { metaTitle metaDescription noindex }\n    }\n    logo: mediaItem(id: $logo, idType: SLUG) { sourceUrl altText }\n  }\n"): (typeof documents)["\n  query Formation($slug: ID!, $logo: ID!) {\n    formation(id: $slug, idType: SLUG) {\n      id\n      slug\n      title\n      content\n      excerpt\n      date\n      modified\n      featuredImage { node { sourceUrl altText caption } }\n      formationFields { typeFormation ville departement diplome duree siteWeb }\n      seoFields { metaTitle metaDescription noindex }\n    }\n    logo: mediaItem(id: $logo, idType: SLUG) { sourceUrl altText }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;