// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

export function documentReadyPromise<T>(creator: () => Promise<T>): Promise<T> {
  return new Promise((resolve): void => {
    if (document.readyState === 'complete') {
      resolve(creator());
    } else {
      window.addEventListener('load', () => resolve(creator()));
    }
  });
}
