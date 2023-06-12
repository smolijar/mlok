import { expect, describe, it, beforeEach } from 'vitest'
import { run } from './jest-api-suite.test.js'
run({ expect, describe, it, beforeEach } as any)
