// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { jest } from '@jest/globals';
import { BlockchainUtils, connect, disconnect, init } from '@kiltprotocol/sdk-js';

import { Attester } from './Attester';
import { JsonKeystore } from './JsonKeystore';
import { KeyringPair$JsonExtra } from './types';

describe('Attester', (): void => {
  let jsonKeystore: JsonKeystore;

  beforeEach(() => {
    jest.setTimeout(30000);
    process.env.NODE_ENV = 'test';
  });

  beforeAll(async () => {
    await init({ address: 'wss://peregrine.kilt.io/parachain-public-ws/' });
    await connect();
    jsonKeystore = new JsonKeystore(
      JSON.parse(
        '{"encoded":"zenhnYgJoetts+eMNKEowWrXtoUOnJzVnMsV6nSHvYgAgAAAAQAAAAgAAAA6E/aoq5T7hed0aJp1v6b/ayxCmHiypI62dErl02IIT7eI2QIt23+UtwpsRYaQvq26f+R2EavXg3CgJTwDRrJnsoLPewJqC+JcUD5qtihAhpZfkGsEs6PjOQenF43uBA0RV9CVsaQKCQjFjp+MdN53qWEwSSbBW6K0xp50XUfv2BqSK5qEFDhgJHDrzKPwOBxeIPM7jswkrA3Rcil5","encoding":{"content":["pkcs8","sr25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"4t5WoEr1Cc6RDr829RvsVea1svQ6GfvrotrJWYaabuK7tr33","meta":{"genesisHash":"0xa0c6e3bac382b316a68bca7141af1fba507207594c761076847ce358aeedcc21","isHardware":false,"name":"c","tags":[],"whenCreated":1655811993553},"extra":{"encoded":"HpXwOpobgx5MO8Ci4XMdiVUQaJ6ZeiCTNy0Xmb94bZkAgAAAAQAAAAgAAADqqdFcOcYfb8Dcek5e7ScoCgMKLuIM9B9zASkNlZfAWoqxnkRkcmg2DvIDMvvJ8FrK+cTGM6i0AXSNE5Bi3nOwz1C6M2iNHZz/7POcj5GiuVdZuj6JnusAJkj9iFl5C6L0YfJOXS9dYBrzttifxCeSLB8BZkYAs+m2+jD5iym1M2K7HeLmfhTRdXoq1HQZhv67xvJcSePqxxQPJDeR","encoding":{"content":["pkcs8","ed25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"4q5PgwPdg8owKhbLiAZJ26zhEA8BpqPZezWqyeKhwtKYHJCM","meta":{"genesisHash":"0xa0c6e3bac382b316a68bca7141af1fba507207594c761076847ce358aeedcc21","isHardware":false,"name":"C1","tags":[],"whenCreated":1655813084542}}}'
      ) as KeyringPair$JsonExtra
    );
    jsonKeystore.unlock('1');
  });

  afterAll(async () => {
    await disconnect();
  });

  it('get full did', async () => {
    const attester = new Attester(jsonKeystore, 'wss://peregrine.kilt.io/parachain-public-ws/');

    await attester.isReady;

    console.log(attester.didDetails);

    expect(attester.isFullDid).toEqual(true);
  });

  it.skip('createFullDid', async () => {
    const attester = new Attester(jsonKeystore, 'wss://peregrine.kilt.io/parachain-public-ws/');

    await attester.isReady;
    const fullDid = await attester.createFullDid((didCreationBuilder, keystore) => {
      return (
        didCreationBuilder
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .setAttestationKey(attester.didDetails.authenticationKey)
          .setDelegationKey(attester.didDetails.authenticationKey)
          .buildAndSubmit(keystore, keystore.siningPair.address, async (creationTx) => {
            await BlockchainUtils.signAndSubmitTx(creationTx, keystore.siningPair, {
              reSign: true,
              resolveOn: BlockchainUtils.IS_FINALIZED
            });
          })
      );
    });

    console.log(fullDid);
  });

  it.skip('removeAllEncryptionKeys', async () => {
    const attester = new Attester(jsonKeystore, 'wss://peregrine.kilt.io/parachain-public-ws/');

    await attester.isReady;
    const fullDid = await attester.updateFullDid((didUpdateBuilder, keystore) => {
      return didUpdateBuilder
        .removeAllEncryptionKeys()
        .buildAndSubmit(keystore, keystore.siningPair.address, async (updateTx) => {
          await BlockchainUtils.signAndSubmitTx(updateTx, keystore.siningPair, {
            reSign: true,
            resolveOn: BlockchainUtils.IS_FINALIZED
          });
        });
    });

    console.log(fullDid);
  });

  it.skip('addEncryptionKey', async () => {
    const attester = new Attester(jsonKeystore, 'wss://peregrine.kilt.io/parachain-public-ws/');

    await attester.isReady;
    const fullDid = await attester.updateFullDid((didUpdateBuilder, keystore) => {
      return didUpdateBuilder
        .addEncryptionKey({
          type: 'x25519' as any,
          publicKey: jsonKeystore.encryptPair.publicKey
        })
        .buildAndSubmit(keystore, keystore.siningPair.address, async (updateTx) => {
          await BlockchainUtils.signAndSubmitTx(updateTx, keystore.siningPair, {
            reSign: true,
            resolveOn: BlockchainUtils.IS_FINALIZED
          });
        });
    });

    console.log(fullDid);
  });

  it.skip('attestClaim', async () => {
    const attester = new Attester(jsonKeystore, 'wss://peregrine.kilt.io/parachain-public-ws/');

    await attester.isReady;
    await attester.attestClaim({
      claim: {
        cTypeHash: '0xe21c5f437332f33db0e6f9cef958f2ff3fedfbcdeb60d4ff24db978b487aad1a',
        contents: {
          name: 'zzc',
          class: 1,
          age: 23,
          helmet_rarity: 1,
          chest_rarity: 2,
          weapon_rarity: 3
        },
        owner: 'did:kilt:light:004rxBYczVcUWgmMWbFsGw7nQd6NaWXZDQLXcL1mYBzR9EpEsn'
      },
      claimHashes: [
        '0x0b3e379f64e057aef6f019384098f695394584b6c027b9e2231b3af406797085',
        '0x3e4fb4dbb55376af7d4bac8311dbaae5995441c3544115b1b5f7536b2d6b4f8b',
        '0x6483ac0e5f86c38e95d3486b7f9d915d199ad93c5c60d743652af8dd847d8e75',
        '0x6763018849454ecc0a36a4e78a9571b62dd316c5611d3cddb86118c2630e63bf',
        '0x695257d38b92258d55ca844ca039444a3d4b06ec9b0d88d2527063dd50d0103b',
        '0x857a5c9fdbece63f26f6013ac0ddcd6104af9a106608b6a026145cc1dd300a03',
        '0xd8e442e99840dea2cf14dbc2a28494d4998ff188657b0f2dc1d6aa2329ae2583'
      ],
      claimNonceMap: {
        '0x5fcc442af386669f360841b9eaa41ff565fd8343cda1f9446d09882c74094065':
          '76b295af-f405-4449-a82e-8e7a68198b28',
        '0xa0b9c6f23784b6d1f2d31bd08e92d8576203fcf4f3737ef07ce7e2d5754c2086':
          '4aa4bcf6-c026-4aa6-926d-0251f6ac49c9',
        '0x3485496584ccbaa7b459714e3ea8adac5c2743d24c56cea7083b449e5ab26086':
          '826bf534-3f87-472e-be45-7ed1cc97e988',
        '0x358103d0acb08fd74951c6cb22947335f1ccc5f70f586452bae68bb7b07c93a7':
          '0e7d109c-83c4-433f-bf91-5c490836629d',
        '0xebb3cee5d594f19542a8298fa1b804b9299692cef6213ed2f23eaf4d574a6f8f':
          'db796d99-d730-4d38-ae41-9227804c8423',
        '0xe64a2030b3a8490641c73f81b5c83774dc0ea07acfc6956e1ffe76ceb9143bf4':
          '956a59c3-575e-459b-a527-732d008e693e',
        '0xc7a6669fc53c91b7c7542eb9bb731c644a8660e2ea9dbe148c55349c930b61e0':
          'c448a055-5f74-418c-9db2-37c07d3e6443'
      },
      legitimations: [],
      delegationId: null,
      rootHash: '0x35b4fddb3ca84147bb5e4b304d04c71579844d37777da9035add34aed39ceeb1',
      claimerSignature: undefined
    });
  });
});
