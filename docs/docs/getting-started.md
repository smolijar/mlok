---
sidebar_position: 2
---

# Getting started

1. Install

```bash
npm i -D mlok
```

2. Use in tests (create mock for `Thing`)

```ts
import mlok from 'mlok'

const mockedThing = mlok<Thing>()
```
