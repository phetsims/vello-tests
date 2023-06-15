vello-tests
=======

Rough proof-of-concept testing to explore integrating [Vello](https://github.com/linebender/vello)

## Setup

1. Install Rust (https://www.rust-lang.org/tools/install)
2. Install wasm-pack (https://rustwasm.github.io/wasm-pack/installer/)
3. Install rust wasm32 target: `rustup target add wasm32-unknown-unknown`
4. Build with `wasm-pack build --target web`
5. View the index.html in a browser.
