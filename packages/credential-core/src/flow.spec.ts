// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { jest } from '@jest/globals';
import {
  connect,
  Credential,
  disconnect,
  IEncryptedMessage,
  init,
  Message,
  MessageBodyType
} from '@kiltprotocol/sdk-js';
import { assert } from '@polkadot/util';

import { Attester } from './Attester';
import { Claimer } from './Claimer';
import { JsonKeystore } from './JsonKeystore';
import { KeyringPair$JsonExtra } from './types';

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
  let credential: Credential;

  beforeEach(() => {
    jest.setTimeout(600);
    process.env.NODE_ENV = 'test';
  });

  beforeAll(async () => {
    await init({ address: endpoint });
    await connect();

    jsonKeystoreClaimer = new JsonKeystore(
      JSON.parse(
        '{"encoded":"5+ThZ1O2aJaotrSYQjLkpNK+eIw/Yu4LlHvSCDt7FlMAgAAAAQAAAAgAAAA+QgT6qXflT4/tGpSvlenxKCutAKC928dqCujby+Ed13hWJ/G/BAOQefLqaLe1FfpBl6Di+os24YIa0Si7OIlHwv6im3yhl2tRls+nKSqXMQxTZmMBgFoUQEan9WcsjK86/VW/rZpnOhvrwCPgJsfxfYZ7o/DsLkDDl2hhb5QZnYlzKZXCwn2fYkKzWAv4+Nis12lOKKmXvMezxfYM","encoding":{"content":["pkcs8","sr25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"4r8yoQsPneNCRMzn79WwDaNR69cRMxM2MQQ346quzqwNnBD7","meta":{"genesisHash":"0xa0c6e3bac382b316a68bca7141af1fba507207594c761076847ce358aeedcc21","isHardware":false,"name":"a","tags":[],"whenCreated":1655811964724},"extra":{"encoded":"3IkvxsW6ZQkEhsHLg4+vPrLw9ABiUVRUe1XYov9CYUUAgAAAAQAAAAgAAABgvmfkJev7VlH+DFxemhAh3ukXnIB5e/bjheJs+Rmk2Nd4CxI7SBLTmFevxFwwD/emBHhjZ3sNDjdMclHvN27XojsuYs07EFAR5FB0P3rNGYjNIBeUi9Cd0RejCF2+H1vh4zrMfXgank+96cOlpxgIBWjawHS4D8UV1S1iK3HHGfICDCuaazjXtcJ0ebM1VVfJMW7w8mNOwpnt1OYo","encoding":{"content":["pkcs8","ed25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"4rgxQpHuk5c4LwQSWKKejrA3A6QfCCWkDLYas7YJtXn5YSda","meta":{"genesisHash":"0xa0c6e3bac382b316a68bca7141af1fba507207594c761076847ce358aeedcc21","isHardware":false,"name":"A1","tags":[],"whenCreated":1655813061290}}}'
      ) as KeyringPair$JsonExtra
    );
    jsonKeystoreAttester = new JsonKeystore(
      JSON.parse(
        '{"encoded":"zenhnYgJoetts+eMNKEowWrXtoUOnJzVnMsV6nSHvYgAgAAAAQAAAAgAAAA6E/aoq5T7hed0aJp1v6b/ayxCmHiypI62dErl02IIT7eI2QIt23+UtwpsRYaQvq26f+R2EavXg3CgJTwDRrJnsoLPewJqC+JcUD5qtihAhpZfkGsEs6PjOQenF43uBA0RV9CVsaQKCQjFjp+MdN53qWEwSSbBW6K0xp50XUfv2BqSK5qEFDhgJHDrzKPwOBxeIPM7jswkrA3Rcil5","encoding":{"content":["pkcs8","sr25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"4t5WoEr1Cc6RDr829RvsVea1svQ6GfvrotrJWYaabuK7tr33","meta":{"genesisHash":"0xa0c6e3bac382b316a68bca7141af1fba507207594c761076847ce358aeedcc21","isHardware":false,"name":"c","tags":[],"whenCreated":1655811993553},"extra":{"encoded":"HpXwOpobgx5MO8Ci4XMdiVUQaJ6ZeiCTNy0Xmb94bZkAgAAAAQAAAAgAAADqqdFcOcYfb8Dcek5e7ScoCgMKLuIM9B9zASkNlZfAWoqxnkRkcmg2DvIDMvvJ8FrK+cTGM6i0AXSNE5Bi3nOwz1C6M2iNHZz/7POcj5GiuVdZuj6JnusAJkj9iFl5C6L0YfJOXS9dYBrzttifxCeSLB8BZkYAs+m2+jD5iym1M2K7HeLmfhTRdXoq1HQZhv67xvJcSePqxxQPJDeR","encoding":{"content":["pkcs8","ed25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"4q5PgwPdg8owKhbLiAZJ26zhEA8BpqPZezWqyeKhwtKYHJCM","meta":{"genesisHash":"0xa0c6e3bac382b316a68bca7141af1fba507207594c761076847ce358aeedcc21","isHardware":false,"name":"C1","tags":[],"whenCreated":1655813084542}}}'
      ) as KeyringPair$JsonExtra
    );
    jsonKeystoreClaimer.unlock('1');
    jsonKeystoreAttester.unlock('1');
  });

  afterAll(async () => {
    await disconnect();
  });

  it('requestForAttestation flow', async () => {
    const claimer = new Claimer(jsonKeystoreClaimer, endpoint);
    const attester = new Attester(jsonKeystoreAttester, endpoint);

    await claimer.isReady;
    await attester.isReady;

    const attesterFullDid = attester.didDetails;

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

    credential = claimer.generateCredential(requestForAttestation, attesterFullDid.uri);

    const message = new Message(
      {
        content: {
          requestForAttestation
        },
        type: Message.BodyType.REQUEST_ATTESTATION
      },
      claimer.didDetails.uri,
      attesterFullDid.uri
    );

    encryptMessage = await claimer.encryptMessage(message, attesterFullDid);
  });

  it.skip('attest flow', async () => {
    const claimer = new Claimer(jsonKeystoreClaimer, endpoint);
    const attester = new Attester(jsonKeystoreAttester, endpoint);

    await claimer.isReady;
    await attester.isReady;

    const message = await attester.decryptMessage(encryptMessage);

    if (message.body.type === MessageBodyType.REQUEST_ATTESTATION) {
      await attester.attestClaim(message.body.content.requestForAttestation);
    }
  });

  it.skip('check credential verify status', async () => {
    expect(await credential.verify()).toEqual(true);
  });
});
