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
    const json = JSON.parse(
      '{"encoded":"VctjI8zwu8sYn0tOklPJq+tWsrjwaQ+GmC5Pe6f3wgoAgAAAAQAAAAgAAACISXxQRGJjnb0jcgtxGRHN6/MpAigft9zTpQvPkDV5PZKHZhFcP4vkURitwwiHtA9Bm7ONlJzYEZtsNcMRYo6xEi5WeYCPAh/a8cXwDIp02tOMz+tOvKC3l9lypB3dNRpTmmprF+0qCZDr7sLKnl15tp9N91Wo8odv9sVfcAZvMZ9MLdZHcnqqxUJkZohBdkxdIpOPjGJtqS0m+kLI","encoding":{"content":["pkcs8","sr25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"4rxBYczVcUWgmMWbFsGw7nQd6NaWXZDQLXcL1mYBzR9EpEsn","meta":{"genesisHash":"0xa0c6e3bac382b316a68bca7141af1fba507207594c761076847ce358aeedcc21","isHardware":false,"name":"aaa","tags":[],"whenCreated":1654611301280}}'
    ) as KeyringPair$Json;

    jsonKeystore = new JsonKeystore(json);
  });

  afterAll(async () => {
    await disconnect();
  });

  it('get did', () => {
    const claimer = new Claimer(jsonKeystore, 'wss://peregrine.kilt.io/parachain-public-ws/');

    expect(claimer.didDetails.did).toEqual(`did:kilt:light:00${jsonKeystore.address}`);
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

  it('requestForAttestation with unlock', async () => {
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

    jsonKeystore.unlock('1');
    const requestForAttestation = await claimer.requestForAttestation(claim);

    expect(requestForAttestation.verifyData()).toEqual(true);
    expect(requestForAttestation.verifyRootHash()).toEqual(true);
    expect(await requestForAttestation.verifySignature()).toEqual(true);
    jsonKeystore.lock();
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
