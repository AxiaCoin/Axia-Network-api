A breaking change was introduced by axlib runtime spec_version 97. https://github.com/axia-tech/axlib/pull/2911/files

The change had to be implemented in ink! which changed the structure of the Wasm files.

The AXIA JS API is only supporting srml-contract and ink! versions after than spec_version 97.

**Compatibility**
If the axlib version is older than this https://github.com/axia-tech/axlib/pull/2911 it will only work
with contracts generated by an ink! version prior to https://github.com/axia-tech/ink/pull/129 and vice versa.
