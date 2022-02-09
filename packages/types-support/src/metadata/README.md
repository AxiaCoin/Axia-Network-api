## extraction

For Axlib & AXIA (dev chains) -

`cargo run --release -- purge-chain -y --dev && cargo run --release -- --dev`

For AXIALunar -

`cargo run --release -- purge-chain -y --chain axialunar-dev && cargo run --release -- --chain axialunar-dev`

To retrieve the metadata -

`curl -H "Content-Type: application/json" -d '{"id":"1", "jsonrpc":"2.0", "method": "state_getMetadata", "params":[]}' http://localhost:9933`
