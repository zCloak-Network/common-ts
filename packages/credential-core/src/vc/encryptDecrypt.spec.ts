// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ICredential as KiltVC } from '@kiltprotocol/types';
import type { VerifiableCredential as ZkidVC } from '@zcloak/vc/types';

import { vcDecrypt } from './decrypt';
import { vcEncrypt } from './encrypt';

describe('encrypt and decrypt', () => {
  it('encrypt kilt vc and descrypt', () => {
    const kiltVC: KiltVC = {
      attestation: {
        claimHash: '0x0ac2094c0aaba0543f441193dbf1907bfe356f2176124ada9841c6d38542fb67',
        cTypeHash: '0x0de3c21a1e6a3341aad2c05662221ca54a65ce8db01b1384a4627d2c86ce30a3',
        delegationId: null,
        owner: 'did:kilt:4oce7v2ZHzY5GnVY8fRusKdBcUPvx3xCGfVaTH7UzCMGyxzG',
        revoked: false
      },
      request: {
        claim: {
          cTypeHash: '0x0de3c21a1e6a3341aad2c05662221ca54a65ce8db01b1384a4627d2c86ce30a3',
          contents: { name: 'aaa', trueOrFalse: true },
          owner: 'did:kilt:4pjiK187p47faEAVVXW4xLNTfNuA3HWsMPaK9keX7FZMmKP6'
        },
        claimHashes: [
          '0x3dfa85b4eb31e6610952803c7a5d5be7430b854b0e8b22536697499a2dca6770',
          '0x6dbd5017489d1d9b0f15e8c1e300de2d33e7a4b52ebc6a7dea9b0ea880099851',
          '0x887a133dfbc4741d71fcb882443f7260c3405f5a46c62a24ec3327ab1b72fad1'
        ],
        claimNonceMap: {
          '0xa7c77ad182242fb339b5c2298a5261b0a422689bb6114b2450c21b0d01e41ce8':
            '8d583499-4dd0-4438-ad0e-91427f2c6213',
          '0x73cf049941ed8805d3d1bf8a553f9004b91f28bfb45dd00ba22a9b8869fe2e67':
            '4b270eb2-7b62-4173-b46d-c95af345d704',
          '0x42db520aad41fb03d1aebd0afe4828e52c147000f93c1aa3331ccf8ff567cdbb':
            'c87ac94c-5be7-4b60-8973-9b9849807f63'
        },
        legitimations: [],
        delegationId: null,
        rootHash: '0x0ac2094c0aaba0543f441193dbf1907bfe356f2176124ada9841c6d38542fb67',
        claimerSignature: {
          signature:
            '0xc6ab430fb609a85a5f9046b44b4414bea09a5d1e0e6021a3cb18d5985f06bc54e7773b08caea10c886aed6db5e99f29f29dc47f4f11ada8b46deafb29204de80',
          keyUri:
            'did:kilt:4pjiK187p47faEAVVXW4xLNTfNuA3HWsMPaK9keX7FZMmKP6#0xf8a8c6641ebe41720be4dabc9861e41c4aedd8f6338e0260989004eb53ab369b'
        }
      }
    };

    const encrypted = vcEncrypt(kiltVC, '1234');

    const decrypted = vcDecrypt(encrypted, '1234');

    expect(decrypted).toEqual(kiltVC);
    expect(() => vcDecrypt(encrypted, '123')).toThrow(
      'Unable to decrypt using the supplied passphrase'
    );
  });

  it('encrypt zkid vc and descrypt', () => {
    const zkidVC: ZkidVC<false> = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      version: '0',
      ctype: '0x4394e5a3f6d7e18957d02095d46e37558e2502bce59aacd407b074781d7d6b5b',
      issuanceDate: 1669915042601,
      credentialSubject: {
        'Discord Username': '123',
        'Discord Verification Code': '1234567890',
        'Champion Team': 'Portugal'
      },
      credentialSubjectNonceMap: {
        '0xb38f7e221a8b552e4a8a1bef8637e0f9d8c7658380428cb7a149c2de37f91e31':
          '0x757a1e94281e04649739711acbe57914f8c282091c949bbb83eef34ecfe14e8e',
        '0xade510ea95e1df4adb0a2495351f3ab26b91630a63e3ffe573524ec09f322a2a':
          '0xded5386b30ca9495d95c0791a7de4eb84ce4e03dd1874539e7e81eb84c6e8cf1',
        '0xffc7c35a8b8ab919fc73964de3e1acf106c08f4bb16f111a89b8d0f22b919ad1':
          '0xc0f433a072a5be0db2f00c15b08877e0669b8dee172919d9de5b6ea9ebb788a3'
      },
      credentialSubjectHashes: [
        '0xcdd3a429ee2e8bfd471528b23dcf59249720950616a319550bc0e4e1b2be7931',
        '0xebb5581c0ca9bc48f24232c558416a3553d36d44ef3f4c53e38d4814b8064f3c',
        '0xd1586120ae2323d8f04788629172d5f1e8998add5641e3638561ba15bb2a9d05'
      ],
      issuer: 'did:zk:0xdC6BF231a4f18074288C07C3f31f2eD170E368aD',
      holder: 'did:zk:0xdC6BF231a4f18074288C07C3f31f2eD170E368aD',
      hasher: ['RescuePrime', 'Keccak256'],
      digest: '0xc7f6cd4543f7d047a6663d1eb9abaeb8dcf5c0b0d7b8e489487cdaf4643575b3',
      proof: [
        {
          type: 'EcdsaSecp256k1Signature2019',
          created: 1669915042670,
          verificationMethod: 'did:zk:0xdC6BF231a4f18074288C07C3f31f2eD170E368aD#key-0',
          proofPurpose: 'assertionMethod',
          proofValue:
            'zHghh8GGTZpQsMfbkaotA2XyKFT8QFY87sBbGGrQPtuyeBj86rMZK95LJ3WF9J7BHiffabpHsDbd64xoXc5AmLMskk'
        }
      ]
    };

    const encrypted = vcEncrypt(zkidVC, '1234');

    const decrypted = vcDecrypt(encrypted, '1234');

    expect(decrypted).toEqual(zkidVC);
    expect(() => vcDecrypt(encrypted, '123')).toThrow(
      'Unable to decrypt using the supplied passphrase'
    );
  });
});
