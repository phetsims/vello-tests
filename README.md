vello-tests
=======

Rough proof-of-concept testing to explore integrating [Vello](https://github.com/linebender/vello)

REQUIRES WebGPU.

## Demo

https://phetsims.github.io/vello-tests/

## Setup

1. Install Rust (https://www.rust-lang.org/tools/install)
2. Install wasm-pack (https://rustwasm.github.io/wasm-pack/installer/)
3. Install rust wasm32 target: `rustup target add wasm32-unknown-unknown`
4. Build the WASM encoder with `wasm-pack build --target web`
5. Build the WASM text shaper with `wasm-pack build --target web swash-tests`
6. View the index.html in a browser.

