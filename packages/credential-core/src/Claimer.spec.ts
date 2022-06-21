import type { KeyringPair$Json } from '@polkadot/keyring/types';

import { jest } from '@jest/globals';
import { connect, disconnect, init } from '@kiltprotocol/sdk-js';

import { Claimer } from './Claimer';
import { JsonKeystore } from './JsonKeystore';

const CTYPE = {
  $schema: 'http://kilt-protocol.org/draft-01/ctype#',
  title: 'credential_test0412',
  properties: {
    name: { type: 'string' },
    class: { type: 'integer' },
    age: { type: 'integer' },
    helmet_rarity: { type: 'integer' },
    chest_rarity: { type: 'integer' },
    weapon_rarity: { type: 'integer' }
  },
  type: 'object',
  $id: 'kilt:ctype:0xe21c5f437332f33db0e6f9cef958f2ff3fedfbcdeb60d4ff24db978b487aad1a'
};

describe('Claimer', (): void => {
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
        '{"encoded":"5+ThZ1O2aJaotrSYQjLkpNK+eIw/Yu4LlHvSCDt7FlMAgAAAAQAAAAgAAAA+QgT6qXflT4/tGpSvlenxKCutAKC928dqCujby+Ed13hWJ/G/BAOQefLqaLe1FfpBl6Di+os24YIa0Si7OIlHwv6im3yhl2tRls+nKSqXMQxTZmMBgFoUQEan9WcsjK86/VW/rZpnOhvrwCPgJsfxfYZ7o/DsLkDDl2hhb5QZnYlzKZXCwn2fYkKzWAv4+Nis12lOKKmXvMezxfYM","encoding":{"content":["pkcs8","sr25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"4r8yoQsPneNCRMzn79WwDaNR69cRMxM2MQQ346quzqwNnBD7","meta":{"genesisHash":"0xa0c6e3bac382b316a68bca7141af1fba507207594c761076847ce358aeedcc21","isHardware":false,"name":"a","tags":[],"whenCreated":1655811964724}}'
      ) as KeyringPair$Json,
      JSON.parse(
        '{"encoded":"3IkvxsW6ZQkEhsHLg4+vPrLw9ABiUVRUe1XYov9CYUUAgAAAAQAAAAgAAABgvmfkJev7VlH+DFxemhAh3ukXnIB5e/bjheJs+Rmk2Nd4CxI7SBLTmFevxFwwD/emBHhjZ3sNDjdMclHvN27XojsuYs07EFAR5FB0P3rNGYjNIBeUi9Cd0RejCF2+H1vh4zrMfXgank+96cOlpxgIBWjawHS4D8UV1S1iK3HHGfICDCuaazjXtcJ0ebM1VVfJMW7w8mNOwpnt1OYo","encoding":{"content":["pkcs8","ed25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"4rgxQpHuk5c4LwQSWKKejrA3A6QfCCWkDLYas7YJtXn5YSda","meta":{"genesisHash":"0xa0c6e3bac382b316a68bca7141af1fba507207594c761076847ce358aeedcc21","isHardware":false,"name":"A1","tags":[],"whenCreated":1655813061290}}'
      ) as KeyringPair$Json
    );
  });

  afterAll(async () => {
    await disconnect();
  });

  it('get did', () => {
    const claimer = new Claimer(jsonKeystore, 'wss://peregrine.kilt.io/parachain-public-ws/');

    console.log(claimer.didDetails.uri);
  });

  it('generateClaim', () => {
    const claimer = new Claimer(jsonKeystore, 'wss://peregrine.kilt.io/parachain-public-ws/');

    console.log(
      claimer.generateClaim(CTYPE as any, {
        name: 'zzc',
        class: 1,
        age: 23,
        helmet_rarity: 1,
        chest_rarity: 2,
        weapon_rarity: 3
      })
    );
  });

  it('requestForAttestation with locked', async () => {
    const claimer = new Claimer(jsonKeystore, 'wss://peregrine.kilt.io/parachain-public-ws/');

    const claim = claimer.generateClaim(CTYPE as any, {
      name: 'zzc',
      class: 1,
      age: 23,
      helmet_rarity: 1,
      chest_rarity: 2,
      weapon_rarity: 3
    });

    const requestForAttestation = await claimer.requestForAttestation(claim);

    console.log(requestForAttestation);
    expect(requestForAttestation.verifyData()).toEqual(true);
    expect(requestForAttestation.verifyRootHash()).toEqual(true);
    expect(await requestForAttestation.verifySignature()).toEqual(false);
  });

  it('requestForAttestation with unlocked', async () => {
    const claimer = new Claimer(jsonKeystore, 'wss://peregrine.kilt.io/parachain-public-ws/');

    const claim = claimer.generateClaim(CTYPE as any, {
      name: 'zzc',
      class: 1,
      age: 23,
      helmet_rarity: 1,
      chest_rarity: 2,
      weapon_rarity: 3
    });

    jsonKeystore.siningPair.unlock('1');
    const requestForAttestation = await claimer.requestForAttestation(claim);

    expect(requestForAttestation.verifyData()).toEqual(true);
    expect(requestForAttestation.verifyRootHash()).toEqual(true);
    expect(await requestForAttestation.verifySignature()).toEqual(true);
    jsonKeystore.siningPair.lock();
  });
  it('generateCredential', async () => {
    const claimer = new Claimer(jsonKeystore, 'wss://peregrine.kilt.io/parachain-public-ws/');

    const claim = claimer.generateClaim(CTYPE as any, {
      name: 'zzc',
      class: 1,
      age: 23,
      helmet_rarity: 1,
      chest_rarity: 2,
      weapon_rarity: 3
    });

    const requestForAttestation = await claimer.requestForAttestation(claim);

    expect(
      claimer
        .generateCredential(
          requestForAttestation,
          'did:kilt:4rdUX21mgJYGPpU3PmmjSMDkthg9yD2eFeRXyh84tD6ssvS4'
        )
        .verifyData()
    ).toEqual(true);
  });
});
