import { describe, it, expect } from 'vitest'
import { sendMessage } from '../utils/sendMessage'

describe('Envio de mensagens', () => {
  it('permite mensagens com até 500 caracteres', () => {
    expect(() => sendMessage('mensagem válida')).not.toThrow()
  })

  it('rejeita mensagens com mais de 500 caracteres', () => {
    const longa = 'x'.repeat(501)
    expect(() => sendMessage(longa)).toThrow()
  })
})