// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

export class NoZkidExtension extends Error {
  constructor() {
    super('Zkid Extension not install');
  }
}
