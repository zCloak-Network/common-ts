import type { KeyringPair$Json } from '@polkadot/keyring/types';

import { jest } from '@jest/globals';
import { stringToU8a, u8aEq } from '@polkadot/util';

import { JsonKeystore } from './JsonKeystore';

describe('JsonKeystore', (): void => {
  beforeEach(() => {
    jest.setTimeout(30000);
    process.env.NODE_ENV = 'test';
  });

  it('encrypt and decrypted', async () => {
    const jsonA = JSON.parse(
      '{"encoded":"VctjI8zwu8sYn0tOklPJq+tWsrjwaQ+GmC5Pe6f3wgoAgAAAAQAAAAgAAACISXxQRGJjnb0jcgtxGRHN6/MpAigft9zTpQvPkDV5PZKHZhFcP4vkURitwwiHtA9Bm7ONlJzYEZtsNcMRYo6xEi5WeYCPAh/a8cXwDIp02tOMz+tOvKC3l9lypB3dNRpTmmprF+0qCZDr7sLKnl15tp9N91Wo8odv9sVfcAZvMZ9MLdZHcnqqxUJkZohBdkxdIpOPjGJtqS0m+kLI","encoding":{"content":["pkcs8","sr25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"4rxBYczVcUWgmMWbFsGw7nQd6NaWXZDQLXcL1mYBzR9EpEsn","meta":{"genesisHash":"0xa0c6e3bac382b316a68bca7141af1fba507207594c761076847ce358aeedcc21","isHardware":false,"name":"aaa","tags":[],"whenCreated":1654611301280}}'
    ) as KeyringPair$Json;
    const jsonB = JSON.parse(
      '{"encoded":"ukd7EnbnYtSmfScBxZT70+DjTu6YQ7xgey/wCqe+OsQAgAAAAQAAAAgAAAD2WB4C7epnxeNoEWUTCrED+Aes7Ij76v1tXc9L4Bcr2rQmyD/meWk2Nl8w+LDN0uxmznYQTwQckIApuc1DOXgifEtr11QMuaHuT1/wby4jsKXULsFmIQ6WaW/yt8vibtr6IgRxwFv3EwaGWsu1A4jtWkrrb9BxMAWkmw6yYWuXo0n6VTCget3xx8aW4Fipw6/ePr2lIwfLpFHwo92/","encoding":{"content":["pkcs8","sr25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"4swUiXZHJ4PiNL5E6VzzErrxyhzBSU52Tt77fp8NYznFq2is","meta":{"genesisHash":"0xa0c6e3bac382b316a68bca7141af1fba507207594c761076847ce358aeedcc21","isHardware":false,"name":"bbb","tags":[],"whenCreated":1654611523920}}'
    ) as KeyringPair$Json;

    const jsonKeystoreA = new JsonKeystore(jsonA);
    const jsonKeystoreB = new JsonKeystore(jsonB);

    jsonKeystoreA.unlock('1');
    jsonKeystoreB.unlock('1');

    const encrypted = await jsonKeystoreA.encrypt({
      alg: 'x25519-xsalsa20-poly1305',
      data: stringToU8a('bbb'),
      publicKey: jsonKeystoreA.publicKey,
      peerPublicKey: jsonKeystoreB.encryptPublicKey
    });

    const decrypted = await jsonKeystoreB.decrypt({
      ...encrypted,
      publicKey: jsonKeystoreB.publicKey,
      peerPublicKey: jsonKeystoreA.encryptPublicKey
    });

    expect(u8aEq(decrypted.data, stringToU8a('bbb')));
  });
});
