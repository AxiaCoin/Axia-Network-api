[![axiajs](https://img.shields.io/badge/axia-js-orange?style=flat-square)](https://axia.js.org)
![license](https://img.shields.io/badge/License-Apache%202.0-blue?logo=apache&style=flat-square)
[![npm](https://img.shields.io/npm/v/@axia-js/api?logo=npm&style=flat-square)](https://www.npmjs.com/package/@axia-js/api)
[![beta](https://img.shields.io/npm/v/@axia-js/api/beta?label=beta&logo=npm&&style=flat-square)](https://www.npmjs.com/package/@axia-js/api)
[![maintainability](https://img.shields.io/codeclimate/maintainability-percentage/axia-js/api?logo=code-climate&style=flat-square)](https://codeclimate.com/github/axia-js/api)
[![coverage](https://img.shields.io/codeclimate/coverage/axia-js/api?logo=code-climate&style=flat-square)](https://codeclimate.com/github/axia-js/api)

# @axia-js/api

This library provides a clean wrapper around all the methods exposed by a AXIA/Axlib network client and defines all the types exposed by a node. For complete documentation around the classes, interfaces and their use, visit the [documentation portal](https://axia.js.org/docs/api/).

If you are an existing user, please be sure to track the [CHANGELOG](CHANGELOG.md) and [UPGRADING](UPGRADING.md) guides when changing versions.

## tutorials

Looking for tutorials to get started? Look at [examples](https://axia.js.org/docs/api/examples/promise/) for guides on how to use the API to make queries and submit transactions.

## overview

The API is split up into a number of internal packages -

- [@axia-js/api](packages/api/) The API library, providing both Promise and RxJS Observable-based interfaces. This is the main user-facing entry point.
- [@axia-js/api-derive](packages/api-derive/) Derived results that are injected into the API, allowing for combinations of various query results (only used internally and exposed on the Api instances via `api.derive.*`)
- [@axia-js/metadata](packages/metadata/) Base extrinsic, storage and constant injectors for injection
- [@axia-js/rpc-core](packages/rpc-core/) Wrapper around all [JSON-RPC methods](https://axia.js.org/docs/axlib/rpc) exposed by a AXIA network client
- [@axia-js/rpc-provider](packages/rpc-provider/) Providers for connecting to nodes, including WebSockets and Http

Type definitions for interfaces as exposed by AXIA & Axlib clients -

- [@axia-js/types](packages/types/) Codecs for all AXIA and Axlib primitives
