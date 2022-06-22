import { jest } from '@jest/globals';
import { stringToU8a, u8aEq } from '@polkadot/util';

import { JsonKeystore } from './JsonKeystore';
import { KeyringPair$JsonExtra } from './types';

describe('JsonKeystore', (): void => {
  beforeEach(() => {
    jest.setTimeout(30000);
    process.env.NODE_ENV = 'test';
  });

  it('encrypt and decrypted', async () => {
    const jsonA = JSON.parse(
      '{"encoded":"5+ThZ1O2aJaotrSYQjLkpNK+eIw/Yu4LlHvSCDt7FlMAgAAAAQAAAAgAAAA+QgT6qXflT4/tGpSvlenxKCutAKC928dqCujby+Ed13hWJ/G/BAOQefLqaLe1FfpBl6Di+os24YIa0Si7OIlHwv6im3yhl2tRls+nKSqXMQxTZmMBgFoUQEan9WcsjK86/VW/rZpnOhvrwCPgJsfxfYZ7o/DsLkDDl2hhb5QZnYlzKZXCwn2fYkKzWAv4+Nis12lOKKmXvMezxfYM","encoding":{"content":["pkcs8","sr25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"4r8yoQsPneNCRMzn79WwDaNR69cRMxM2MQQ346quzqwNnBD7","meta":{"genesisHash":"0xa0c6e3bac382b316a68bca7141af1fba507207594c761076847ce358aeedcc21","isHardware":false,"name":"a","tags":[],"whenCreated":1655811964724},"extra":{"encoded":"3IkvxsW6ZQkEhsHLg4+vPrLw9ABiUVRUe1XYov9CYUUAgAAAAQAAAAgAAABgvmfkJev7VlH+DFxemhAh3ukXnIB5e/bjheJs+Rmk2Nd4CxI7SBLTmFevxFwwD/emBHhjZ3sNDjdMclHvN27XojsuYs07EFAR5FB0P3rNGYjNIBeUi9Cd0RejCF2+H1vh4zrMfXgank+96cOlpxgIBWjawHS4D8UV1S1iK3HHGfICDCuaazjXtcJ0ebM1VVfJMW7w8mNOwpnt1OYo","encoding":{"content":["pkcs8","ed25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"4rgxQpHuk5c4LwQSWKKejrA3A6QfCCWkDLYas7YJtXn5YSda","meta":{"genesisHash":"0xa0c6e3bac382b316a68bca7141af1fba507207594c761076847ce358aeedcc21","isHardware":false,"name":"A1","tags":[],"whenCreated":1655813061290}}}'
    ) as KeyringPair$JsonExtra;
    const jsonB = JSON.parse(
      '{"encoded":"zenhnYgJoetts+eMNKEowWrXtoUOnJzVnMsV6nSHvYgAgAAAAQAAAAgAAAA6E/aoq5T7hed0aJp1v6b/ayxCmHiypI62dErl02IIT7eI2QIt23+UtwpsRYaQvq26f+R2EavXg3CgJTwDRrJnsoLPewJqC+JcUD5qtihAhpZfkGsEs6PjOQenF43uBA0RV9CVsaQKCQjFjp+MdN53qWEwSSbBW6K0xp50XUfv2BqSK5qEFDhgJHDrzKPwOBxeIPM7jswkrA3Rcil5","encoding":{"content":["pkcs8","sr25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"4t5WoEr1Cc6RDr829RvsVea1svQ6GfvrotrJWYaabuK7tr33","meta":{"genesisHash":"0xa0c6e3bac382b316a68bca7141af1fba507207594c761076847ce358aeedcc21","isHardware":false,"name":"c","tags":[],"whenCreated":1655811993553},"extra":{"encoded":"HpXwOpobgx5MO8Ci4XMdiVUQaJ6ZeiCTNy0Xmb94bZkAgAAAAQAAAAgAAADqqdFcOcYfb8Dcek5e7ScoCgMKLuIM9B9zASkNlZfAWoqxnkRkcmg2DvIDMvvJ8FrK+cTGM6i0AXSNE5Bi3nOwz1C6M2iNHZz/7POcj5GiuVdZuj6JnusAJkj9iFl5C6L0YfJOXS9dYBrzttifxCeSLB8BZkYAs+m2+jD5iym1M2K7HeLmfhTRdXoq1HQZhv67xvJcSePqxxQPJDeR","encoding":{"content":["pkcs8","ed25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"4q5PgwPdg8owKhbLiAZJ26zhEA8BpqPZezWqyeKhwtKYHJCM","meta":{"genesisHash":"0xa0c6e3bac382b316a68bca7141af1fba507207594c761076847ce358aeedcc21","isHardware":false,"name":"C1","tags":[],"whenCreated":1655813084542}}}'
    ) as KeyringPair$JsonExtra;

    const jsonKeystoreA = new JsonKeystore(jsonA);
    const jsonKeystoreB = new JsonKeystore(jsonB);

    jsonKeystoreA.unlock('1');
    jsonKeystoreB.unlock('1');

    const encrypted = await jsonKeystoreA.encrypt({
      alg: 'x25519-xsalsa20-poly1305',
      data: stringToU8a('bbb'),
      publicKey: jsonKeystoreA.encryptPair.publicKey,
      peerPublicKey: jsonKeystoreB.encryptPair.publicKey
    });

    const decrypted = await jsonKeystoreB.decrypt({
      ...encrypted,
      publicKey: jsonKeystoreB.encryptPair.publicKey,
      peerPublicKey: jsonKeystoreA.encryptPair.publicKey
    });

    expect(u8aEq(decrypted.data, stringToU8a('bbb')));
  });
});
