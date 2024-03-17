import { expect, vi } from 'vitest'

export function createUncallableMock() {
  const mock = vi.fn().mockImplementation(async () => {})
  expect(mock).toHaveBeenCalledTimes(0)
  return mock
}
