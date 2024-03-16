import { vi } from 'vitest'

// Mock the figma global variable
vi.stubGlobal('figma', {
  mixed: Symbol.for('mixed'),
})
