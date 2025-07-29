"""import { Agent, DidDocumentRole, DidRepository } from '@credo-ts/core'
import { Wallet } from 'zksync-ethers'

import { ZkSyncDidRegistrar, ZkSyncDidResolver } from '../'

describe('ZkSyncDidDelegation', () => {
  let registrar: ZkSyncDidRegistrar
  let resolver: ZkSyncDidResolver
  let wallet: Wallet
  let did: string

  beforeAll(() => {
    const privateKey = '0x274d079a445b994f05943c757955b236b755a444543855344121414028342341'
    wallet = new Wallet(privateKey)
    did = `did:zksync:${wallet.address}`

    registrar = new ZkSyncDidRegistrar()
    resolver = new ZkSyncDidResolver()
  })

  it('should add and resolve a delegate', async () => {
    const agent = new Agent({
      modules: {
        didResolver: resolver,
        didRegistrar: registrar,
      },
    })

    const delegateOptions = {
      did,
      delegate: {
        type: 'veriKey',
        address: '0x1234567890123456789012345678901234567890',
        validTo: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      },
      secret: {
        privateKey: wallet.privateKey,
      },
    }

    await registrar.addDelegate(agent.context, delegateOptions)

    const resolvedDelegate = await resolver.resolveDelegate(agent.context, did, 'veriKey')
    expect(resolvedDelegate).toBe(delegateOptions.delegate.address)
  })

  it('should revoke a delegate', async () => {
    const agent = new Agent({
      modules: {
        didResolver: resolver,
        didRegistrar: registrar,
      },
    })

    const delegateOptions = {
      did,
      delegate: {
        type: 'veriKey',
        address: '0x1234567890123456789012345678901234567890',
      },
      secret: {
        privateKey: wallet.privateKey,
      },
    }

    await registrar.revokeDelegate(agent.context, delegateOptions)

    const resolvedDelegate = await resolver.resolveDelegate(agent.context, did, 'veriKey')
    expect(resolvedDelegate).toBeNull()
  })
})

""