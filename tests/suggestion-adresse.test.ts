import { describe, expect, it } from 'vitest'
import { suggererAdresse } from '../src/components/compte/suggestion'

describe('suggererAdresse', () => {
  it('corrige une faute légère dans un domaine courant', () => {
    expect(suggererAdresse('marie.dupont@gmial.com')).toBe('marie.dupont@gmail.com')
    expect(suggererAdresse('Marie@Hotmial.fr')).toBe('marie@hotmail.fr')
    expect(suggererAdresse('jean@orange.ft')).toBe('jean@orange.fr')
  })

  it('ne propose rien pour un domaine connu ou trop différent', () => {
    expect(suggererAdresse('marie@gmail.com')).toBeNull()
    expect(suggererAdresse('contact@cabinet-dupont.fr')).toBeNull()
    expect(suggererAdresse('marie')).toBeNull()
    expect(suggererAdresse('marie@')).toBeNull()
  })
})
