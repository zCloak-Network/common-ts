import type {
  AttestationStatus,
  AttestationStatusV2,
  Config,
  CTypeBody,
  FaucetStatus,
  MessageBody,
  ServerResponse
} from './types';

import { combineConfig, Request } from './request';

export class CredentialApi extends Request {
  constructor(endpoint: string, config: Config = {}) {
    super(
      endpoint,
      combineConfig(config, {
        mode: 'cors'
      })
    );
  }

  submitClaimV2(body: {
    receivedAt?: number;
    ciphertext: string;
    nonce: string;
    senderKeyId: string;
    receiverKeyId: string;
  }) {
    return this.post<ServerResponse<{}>>('/admin-attester/claim', {
      body
    });
  }

  getAttestationStatusV2(rootHash: string) {
    return this.get<ServerResponse<{ status: AttestationStatusV2; position: number }>>(
      `/admin-attester/claim/${rootHash}/attested-status`
    );
  }

  submitClaim(body: {
    receivedAt?: number;
    ciphertext: string;
    nonce: string;
    senderKeyId: string;
    receiverKeyId: string;
  }) {
    return this.post<ServerResponse<{}>>('/admin-attester/submit-claim', {
      body: { ...body }
    });
  }

  getAttestationStatus(params: { senderKeyId: string }) {
    return this.get<ServerResponse<{ attestationStatus: AttestationStatus }>>(
      '/admin-attester/attestation-status',
      {
        params
      }
    );
  }

  getAttestation(params: { senderKeyId: string; receiverKeyId: string }) {
    return this.get<
      ServerResponse<
        {
          ciphertext: string;
          nonce: string;
          receiverKeyId: string;
          senderKeyId: string;
          __v: number;
          _id: string;
        }[]
      >
    >('/attestation/one', { params });
  }

  faucet(params: { address: string }) {
    return this.get<ServerResponse<any>>('/user/faucet', { params });
  }

  faucetStatus(params: { address: string }) {
    return this.get<ServerResponse<{ status: FaucetStatus }>>('/user/faucet-status', { params });
  }

  addCType(body: CTypeBody) {
    return this.post<ServerResponse<null>>('/ctypes', { body });
  }

  getUserCType(address: string) {
    return this.get<ServerResponse<CTypeBody[]>>(`/ctypes/user/${address}`);
  }

  getCTypes() {
    return this.get<ServerResponse<CTypeBody[]>>('/ctypes');
  }

  getCType(hash: string) {
    return this.get<ServerResponse<CTypeBody>>(`/ctypes/${hash}`);
  }

  addMessage(body: MessageBody) {
    return this.post<ServerResponse<null>>('/message', { body });
  }

  getMessages(params: {
    receiverKeyId?: string;
    senderKeyId?: string;
    start_id?: string;
    size?: number;
  }) {
    return this.get<ServerResponse<(MessageBody & { id: string })[]>>('/message', { params });
  }
}
