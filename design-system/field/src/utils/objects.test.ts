import { obfuscatePassword } from './objects'

describe('obfuscatePassword', () => {
  it('should obfuscate password at the root level', () => {
    const input = { password: 'secret' }
    const expected = { password: '***' }
    expect(obfuscatePassword(input)).toEqual(expected)
  })

  it('should obfuscate password at the first nested level', () => {
    const input = { user: { password: 'secret' } }
    const expected = { user: { password: '***' } }
    expect(obfuscatePassword(input)).toEqual(expected)
  })

  it('should obfuscate password at the second nested level', () => {
    const input = { user: { credentials: { password: 'secret' } } }
    const expected = { user: { credentials: { password: '***' } } }
    expect(obfuscatePassword(input)).toEqual(expected)
  })

  it('should not change other properties', () => {
    const input = {
      user: { credentials: { password: 'secret', username: 'user' } },
    }
    const expected = {
      user: { credentials: { password: '***', username: 'user' } },
    }
    expect(obfuscatePassword(input)).toEqual(expected)
  })

  it('should handle objects without password property', () => {
    const input = { user: { credentials: { username: 'user' } } }
    const expected = { user: { credentials: { username: 'user' } } }
    expect(obfuscatePassword(input)).toEqual(expected)
  })
})
