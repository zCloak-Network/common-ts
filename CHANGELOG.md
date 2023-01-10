# CHANGELOG

## [0.7.0](https://github.com/zCloak-Network/common-ts/compare/v0.6.0...v0.7.0) (2023-01-10)


### Features

* add browser and extension session ([#11](https://github.com/zCloak-Network/common-ts/issues/11)) ([7030584](https://github.com/zCloak-Network/common-ts/commit/7030584a1f09a940358fb0fb84cb72320716538b))
* add export session in index ([#12](https://github.com/zCloak-Network/common-ts/issues/12)) ([0de6feb](https://github.com/zCloak-Network/common-ts/commit/0de6feb0233a5c4b966ef807a67c5b7193f28972))
* add localStorage and sessionStorage with store_changed event ([#13](https://github.com/zCloak-Network/common-ts/issues/13)) ([856bcfc](https://github.com/zCloak-Network/common-ts/commit/856bcfc6f178ba745f0bdff4bbcc6b7ed93e4c9f))
* extension store use the async callback ([#14](https://github.com/zCloak-Network/common-ts/issues/14)) ([d4978c5](https://github.com/zCloak-Network/common-ts/commit/d4978c56aabca3c786f08638d6ee78fd211ce5ec))
* **ui-did-keyring:** make loadAll method return Promise ([372f516](https://github.com/zCloak-Network/common-ts/commit/372f516dfe35717c2d832afdc9a0a4bac28cc766))


## [0.6.0](https://github.com/zCloak-Network/common-ts/compare/v0.5.1...v0.6.0) (2022-12-21)


### Features

* addDid to public method ([7682640](https://github.com/zCloak-Network/common-ts/commit/768264060adc208cc5c9a3b9426fdea09dc7bac7))
* upgrade eventemitter3 and use any events type ([1a8226e](https://github.com/zCloak-Network/common-ts/commit/1a8226e456cce69d8e40953bfb0e76e3d7904aa2))
* upgrade sdk and fix error. ([6a50e19](https://github.com/zCloak-Network/common-ts/commit/6a50e190861f954cee00262164ad523562c09cf2))


## [0.5.1](https://github.com/zCloak-Network/common-ts/compare/v0.5.0...v0.5.1) (2022-12-07)


### Bug Fixes

* **ui-did-keyring:** The did uri is not saved when setDid is called. ([52e040c](https://github.com/zCloak-Network/common-ts/commit/52e040c1cc99aa1a9c05ce066cc1eb4108ad8c01))


## [0.5.0](https://github.com/zCloak-Network/common-ts/compare/v0.4.0...v0.5.0) (2022-12-07)


### Bug Fixes

* **ui-did-keyring:** kilt keypair save wrong ([65d3708](https://github.com/zCloak-Network/common-ts/commit/65d3708d5b49922dcc27190e18f86d2d50957b04))


### Features

* add encrypt and decrypt for credential ([#9](https://github.com/zCloak-Network/common-ts/issues/9)) ([1492c09](https://github.com/zCloak-Network/common-ts/commit/1492c09dc21fea7cf859ca75888b6bbff74e5d6d))
* **did-keyring, ui-did-keyring:** add zkid did keyring ([11beb2b](https://github.com/zCloak-Network/common-ts/commit/11beb2bd6982fd813d14ab162a6431a4c6d247d6))
* **did-keyring:** return didurl when call addDidFromMnemonic method. ([6b601ce](https://github.com/zCloak-Network/common-ts/commit/6b601ceb4b13753a61a963427b90c5a652d5a4c8))


# [0.4.0](https://github.com/zCloak-Network/common-ts/compare/v0.3.1...v0.4.0) (2022-12-02)


### Bug Fixes

* **build:** fix error when build tsc ([a203705](https://github.com/zCloak-Network/common-ts/commit/a2037052a59a361ed25e659fcb13c5670fc5dc89))


### Features

* update @zcloak/dev and fix lint ([6e0a901](https://github.com/zCloak-Network/common-ts/commit/6e0a9019d435a6a1e90febe16f4b52e4a8d1f4b8))


## 0.3.1 Sep 29, 2022

Changes:

- add did-keyring packages, [@zcloak/did-keyring](https://github.com/zCloak-Network/common-ts/tree/master/packages/did-keyring/), includes sign, encrypt, decrypt and did manager.
- add ui-did-keyring packages, [@zcloak/ui-did-keyring](https://github.com/zCloak-Network/common-ts/tree/master/packages/ui-did-keyring/), the did-keyring package for browser.

## 0.0.1 May 31, 2022

Changes:

import packages from [zkid-interface2.0](https://github.com/zCloak-Network/zkID-interface2.0/tree/d5e56a311bff38316ee065de8ff87a4361cc42bc)

- @zcloak/contracts-core from [packages/zkid-core](https://github.com/zCloak-Network/zkID-interface2.0/tree/d5e56a311bff38316ee065de8ff87a4361cc42bc/packages/zkid-core)
- @zcloak/react-wallet from [packages/react-wallet](https://github.com/zCloak-Network/zkID-interface2.0/tree/d5e56a311bff38316ee065de8ff87a4361cc42bc/packages/react-wallet)
- @zcloak/service from [packages/service](https://github.com/zCloak-Network/zkID-interface2.0/tree/d5e56a311bff38316ee065de8ff87a4361cc42bc/packages/service)
- @zcloak/web3-query from [packages/web3-query](https://github.com/zCloak-Network/zkID-interface2.0/tree/d5e56a311bff38316ee065de8ff87a4361cc42bc/packages/web3-query)
