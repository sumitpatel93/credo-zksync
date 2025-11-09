import { ZkSyncDidRegistrar } from '../ZkSyncDidRegistrar'

describe('ZkSyncDidRegistrar', () => {
  it('should correctly create a did:zksync did', async () => {
    const registrar = new ZkSyncDidRegistrar('0x4Ce8a725c63048bB42c95b064Ce3262790F1b80D')

    const agentContext: any = {
      dependencyManager: {
        resolve: jest.fn(() => ({
          save: jest.fn(),
        })),
      },
    }

    // Create a test private key for the wallet
    const testPrivateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'

    const result = await registrar.create(agentContext, { 
      method: 'zksync',
      secret: {
        privateKey: testPrivateKey
      }
    })
    
    console.log('Test result:', JSON.stringify(result, null, 2))

    expect(result.didState.state).toBe('finished')
    expect(result.didState.did).toMatch(/^did:zksync:0x[0-9a-fA-F]{40}$/)
    expect(result.didState.didDocument).toBeDefined()
    console.log('Created DID:', result.didState.did) 
  })
})
