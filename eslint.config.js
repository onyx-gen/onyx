// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  rules: { 'no-console': 'off' },
  typescript: true,
  vue: true,
})
