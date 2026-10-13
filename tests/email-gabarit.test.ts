import { describe, expect, it } from 'vitest'
import { composer } from '@/lib/email-gabarit'

describe('gabarit des emails', () => {
  const { html, text } = composer(
    {
      titre: 'Confirmez votre adresse',
      blocs: [
        { type: 'texte', texte: 'Voici votre code <b>' },
        { type: 'code', code: '418273' },
        { type: 'bouton', libelle: 'Ouvrir', url: 'https://dentalmap.fr/espace-pro/' },
      ],
      raison: 'Vous recevez cet email parce que…',
    },
    'https://dentalmap.fr',
  )
  it('échappe le contenu et pose le logo avec un texte de repli', () => {
    expect(html).toContain('Voici votre code &lt;b&gt;')
    expect(html).toContain('src="https://dentalmap.fr/images/marque/logo-dentalmap.png"')
    expect(html).toContain('alt="DentalMap"')
    expect(html).toContain('href="https://dentalmap.fr/espace-pro/"')
  })
  it('produit une version texte complète', () => {
    expect(text).toBe('Bonjour,\n\nVoici votre code <b>\n\n418273\n\nOuvrir : https://dentalmap.fr/espace-pro/\n\nVous recevez cet email parce que…\n\nDentalMap · dentalmap.fr')
  })
  it('omet la salutation des emails internes', () => {
    expect(composer({ titre: 'x', salutation: null, interne: true, blocs: [], raison: 'r' }, 'https://dentalmap.fr').text.startsWith('Bonjour')).toBe(false)
  })
})
