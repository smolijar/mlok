<div align="center">
<img src="https://raw.githubusercontent.com/smolijar/mlok/master/assets/logo.png" width="300" />

# Mlok

TypeScript mocking library focused on simplicity and testing DX

</div>

## Getting started

```sh
npm i -D mlok
```

```ts
import mlok from 'mlok'

const catRepositoryMock = mlok<CatRepository>()
```

This package is native [ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) and does not provide a CommonJS export. If your project uses CommonJS, you will have to convert to ESM or use the [dynamic import()](https://v8.dev/features/dynamic-import) function.

## Motivation

See [motivation](./docs/docs/motivation.md)

## Goals

- 💪 Allow developers to unit tests any contract-designed API with zero mocking effort
- ✅ Require developers to define only what they need to test, never what they need to create a valid mock
- 🔁 Integrate easily with existing toolchain (testing & assertion frameworks)

## TODO

- [x] npm + GitHub metadata, keywords etc
- [ ] docs pages?
- [ ] Examples and DX comparison
- [x] function override
- [x] scalar override
- [ ] Strict override API
- [ ] collision API
- [x] README
- [ ] Sinon API / comparison
- [x] Jest + Vitest battery test
- [ ] Fix test suites for Vitest<=0.20 & Jest <= 24 (probably not issue of functionality)
