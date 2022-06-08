import type { KeyringPair$Json } from '@polkadot/keyring/types';

import { jest } from '@jest/globals';
import { connect, disconnect, IEncryptedMessage, init, Message } from '@kiltprotocol/sdk-js';
import { assert } from '@polkadot/util';

import { Attester } from './Attester';
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

const endpoint = 'wss://peregrine.kilt.io/parachain-public-ws/';

describe('Claimer', (): void => {
  let jsonKeystoreClaimer: JsonKeystore;
  let jsonKeystoreAttester: JsonKeystore;
  let encryptMessage: IEncryptedMessage;

  beforeEach(() => {
    jest.setTimeout(60000);
    process.env.NODE_ENV = 'test';
  });

  beforeAll(async () => {
    await init({ address: endpoint });
    await connect();
    const jsonClaimer = JSON.parse(
      '{"encoded":"VctjI8zwu8sYn0tOklPJq+tWsrjwaQ+GmC5Pe6f3wgoAgAAAAQAAAAgAAACISXxQRGJjnb0jcgtxGRHN6/MpAigft9zTpQvPkDV5PZKHZhFcP4vkURitwwiHtA9Bm7ONlJzYEZtsNcMRYo6xEi5WeYCPAh/a8cXwDIp02tOMz+tOvKC3l9lypB3dNRpTmmprF+0qCZDr7sLKnl15tp9N91Wo8odv9sVfcAZvMZ9MLdZHcnqqxUJkZohBdkxdIpOPjGJtqS0m+kLI","encoding":{"content":["pkcs8","sr25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"4rxBYczVcUWgmMWbFsGw7nQd6NaWXZDQLXcL1mYBzR9EpEsn","meta":{"genesisHash":"0xa0c6e3bac382b316a68bca7141af1fba507207594c761076847ce358aeedcc21","isHardware":false,"name":"aaa","tags":[],"whenCreated":1654611301280}}'
    ) as KeyringPair$Json;
    const jsonAttester = JSON.parse(
      '{"encoded":"ukd7EnbnYtSmfScBxZT70+DjTu6YQ7xgey/wCqe+OsQAgAAAAQAAAAgAAAD2WB4C7epnxeNoEWUTCrED+Aes7Ij76v1tXc9L4Bcr2rQmyD/meWk2Nl8w+LDN0uxmznYQTwQckIApuc1DOXgifEtr11QMuaHuT1/wby4jsKXULsFmIQ6WaW/yt8vibtr6IgRxwFv3EwaGWsu1A4jtWkrrb9BxMAWkmw6yYWuXo0n6VTCget3xx8aW4Fipw6/ePr2lIwfLpFHwo92/","encoding":{"content":["pkcs8","sr25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"4swUiXZHJ4PiNL5E6VzzErrxyhzBSU52Tt77fp8NYznFq2is","meta":{"genesisHash":"0xa0c6e3bac382b316a68bca7141af1fba507207594c761076847ce358aeedcc21","isHardware":false,"name":"bbb","tags":[],"whenCreated":1654611523920}}'
    ) as KeyringPair$Json;

    jsonKeystoreClaimer = new JsonKeystore(jsonClaimer);
    jsonKeystoreAttester = new JsonKeystore(jsonAttester);
  });

  afterAll(async () => {
    await disconnect();
  });

  it('requestForAttestation flow', async () => {
    const claimer = new Claimer(jsonKeystoreClaimer, endpoint);
    const attester = new Attester(jsonKeystoreAttester, endpoint);

    await claimer.isReady;
    await attester.isReady;

    claimer.unlock('1');
    attester.unlock('1');

    const attesterFullDid = await attester.getFullDidDetails();

    assert(attesterFullDid, 'no full did');
    assert(attesterFullDid.encryptionKey, 'attester not has encryption key');
    const claim = claimer.generateClaim(CTYPE as any, {
      name: 'zzc',
      class: 1,
      age: 23,
      helmet_rarity: 1,
      chest_rarity: 2,
      weapon_rarity: 3
    });
    const requestForAttestation = await claimer.requestForAttestation(claim);

    const credential = claimer.generateCredential(requestForAttestation, attesterFullDid.did);

    const message = new Message(
      {
        content: {
          requestForAttestation
        },
        type: Message.BodyType.REQUEST_ATTESTATION
      },
      claimer.didDetails.did,
      attesterFullDid.did
    );

    encryptMessage = await claimer.encryptMessage(
      message,
      attesterFullDid.assembleKeyId(attesterFullDid.encryptionKey.id)
    );
  });

  it('attest flow', async () => {
    const claimer = new Claimer(jsonKeystoreClaimer, endpoint);
    const attester = new Attester(jsonKeystoreAttester, endpoint);

    await claimer.isReady;
    await attester.isReady;

    claimer.unlock('1');
    attester.unlock('1');

    console.log(await attester.decryptMessage(encryptMessage));
  });
});
