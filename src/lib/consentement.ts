/**
 * Consentement aux traceurs : Axeptio, plateforme certifiée par Google, et le
 * Consent Mode v2 qui transmet le choix à Tag Manager.
 *
 * Tout est refusé par défaut, avant même le chargement de GTM : une balise qui
 * exige un accord ne part pas tant qu'il n'est pas donné. Axeptio affiche son
 * bandeau, retient le choix, puis appelle `gtag('consent', 'update')` et pousse
 * l'événement `axeptio_update` dans le dataLayer, à prendre comme déclencheur
 * pour les balises qui doivent partir dès l'accord.
 *
 * Le projet Axeptio (finalités, textes, apparence, Consent Mode v2) se règle
 * dans sa console. Sans identifiant, le bandeau ne se charge pas et tout reste
 * refusé.
 */
const CLIENT_ID = process.env.NEXT_PUBLIC_AXEPTIO_CLIENT_ID
const VERSION_COOKIES = process.env.NEXT_PUBLIC_AXEPTIO_COOKIES_VERSION

/**
 * Script posé dans le `<head>` avant celui de GTM. `gtag` doit rester une
 * déclaration de fonction globale : GTM et Axeptio l'attendent sous ce nom.
 */
export const SCRIPT_CONSENTEMENT = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
gtag('set','ads_data_redaction',true);`

/** Chargement du SDK Axeptio, ou rien tant que le projet n'est pas créé. */
export const SCRIPT_AXEPTIO = CLIENT_ID
  ? `window.axeptioSettings=${JSON.stringify({ clientId: CLIENT_ID, ...(VERSION_COOKIES ? { cookiesVersion: VERSION_COOKIES } : {}) })};
(function(d,s){var t=d.getElementsByTagName(s)[0],e=d.createElement(s);e.async=true;e.src='https://static.axept.io/sdk.js';t.parentNode.insertBefore(e,t)})(document,'script');`
  : null
