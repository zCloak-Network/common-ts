export class UnsupportedChainIdError extends Error {
  constructor(chainId: number) {
    super(`Not support chainId: ${chainId}`);
  }
}
