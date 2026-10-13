import { permanentRedirect } from 'next/navigation'
import { chemin } from '@/lib/navigation'
import { LISTE_CESSIONS } from '@/lib/cessions/routes'

/** Les annonces ne portent plus que les cessions de cabinet : `/annonces/` y mène, en redirection permanente. */
export default function Page(): never {
  permanentRedirect(chemin(LISTE_CESSIONS))
}
