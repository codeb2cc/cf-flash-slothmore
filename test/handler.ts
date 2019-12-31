import { expect } from 'chai'
import { handleRequest } from '../src/handler'

describe('handler returns response with request method', () => {
  const methods = [
    'GET',
  ]
  methods.forEach(method => {
    it(method, async () => {
      const result = await handleRequest(new Request('/', { method }))
      const text = await result.text()
      expect(text).to.include(method)
    })
  })
})
