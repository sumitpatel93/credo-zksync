import { ZkSyncDidRegistrar } from '../ZkSyncDidRegistrar'

describe('ZkSyncDidRegistrar', () => {
  it('should correctly create a did:zksync did', async () => {
    const registrar = new ZkSyncDidRegistrar()

    const agentContext: any = {
      dependencyManager: {
        resolve: jest.fn(() => ({
          save: jest.fn(),
        })),
      },
    }

    const result = await registrar.create(agentContext, { method: 'zksync' })

    expect(result.didState.state).toBe('finished')
    expect(result.didState.did).toMatch(/^did:zksync:0x[0-9a-fA-F]{40}$/)
    expect(result.didState.didDocument).toBeDefined()
    console.log('Created DID:', result.didState.did) 
  })
})
