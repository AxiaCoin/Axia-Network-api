# @axia-js/api-contract

Interfaces to allow for the encoding and decoding of Axlib contract ABIs.

```js
import {ApiPromise, WsProvider } from '@axia-js/api';
import { Abi } from '@axia-js/api-contract';

const wsProvider = new WsProvider(<...Node Url...>);
const api = await ApiPromise.create({ provider: wsProvider });
const abi = new Abi(<...JSON ABI...>, api.registry.getChainProperties());

api.tx.contracts
  .call(<contract addr>, <value>, <max gas>, abi.messages.<method name>(<...params...>))
  .signAndSend(<keyring pair>, (result: SubmittableResult) => { ... });
```
