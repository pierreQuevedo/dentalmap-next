import type { Metadata } from 'next'
import { demanderCreationFiche } from '@/lib/tunnel/actions'
import { exigerEtape } from '@/lib/tunnel/compte'

export const metadata: Metadata = { title: 'Demander la création de votre fiche', robots: { index: false, follow: false } }
export const instant = false

/**
 * Étape 5 bis : la fiche n'existe pas dans les registres.
 *
 * Le professionnel la décrit, la demande part en modération. Squelette sans
 * mise en page.
 */
export default async function Page(props: { searchParams: Promise<{ erreur?: string }> }) {
  const { erreur } = await props.searchParams
  const compte = await exigerEtape('fiche', '/espace-pro/fiche/creer/')
  const labo = compte.role === 'prothesiste'

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Demander la création de votre fiche</h1>
      <p className="mt-2 text-fg-2">
        Nous vérifions chaque demande auprès des registres avant de créer la fiche. Comptez 48 heures ouvrées.
      </p>
      {erreur && <p role="alert" className="mt-4 text-sm text-destructive">{erreur}</p>}
      <form action={demanderCreationFiche} className="mt-6 grid gap-4">
        {compte.role === 'medecin' ? (
          <label className="text-sm font-medium text-fg">
            Spécialité
            <select name="profession" required className="mt-1 w-full rounded-md border border-line px-3 py-2">
              <option value="maxillo_facial">Chirurgien maxillo-facial</option>
              <option value="stomatologue">Stomatologue</option>
              <option value="orl">ORL</option>
            </select>
          </label>
        ) : (
          <input type="hidden" name="profession" value={compte.role ?? ''} />
        )}
        {labo ? (
          <label className="text-sm font-medium text-fg">Raison sociale du laboratoire<input name="raisonSociale" required className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
        ) : (
          <label className="text-sm font-medium text-fg">Prénom<input name="prenom" required className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
        )}
        <label className="text-sm font-medium text-fg">{labo ? 'Nom du responsable' : 'Nom'}<input name="nom" required className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
        {labo ? (
          <label className="text-sm font-medium text-fg">SIRET<input name="siret" inputMode="numeric" pattern="\d{14}" className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
        ) : (
          <label className="text-sm font-medium text-fg">Numéro RPPS<input name="rpps" inputMode="numeric" pattern="\d{11}" className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
        )}
        <label className="text-sm font-medium text-fg">Adresse<input name="adresse" required className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
        <div className="grid grid-cols-[8rem_1fr] gap-2">
          <label className="text-sm font-medium text-fg">Code postal<input name="codePostal" required pattern="\d{5}" className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
          <label className="text-sm font-medium text-fg">Ville<input name="ville" required className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
        </div>
        <label className="text-sm font-medium text-fg">Téléphone<input name="telephone" type="tel" className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
        <label className="text-sm font-medium text-fg">Email professionnel<input name="email" type="email" className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
        <label className="text-sm font-medium text-fg">Précisions<textarea name="message" rows={4} className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
        <button type="submit" className="justify-self-start rounded-full bg-action px-5 py-2.5 font-medium text-action-foreground">Envoyer la demande</button>
      </form>
    </main>
  )
}
