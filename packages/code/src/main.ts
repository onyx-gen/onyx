import { consola } from 'consola'
import env from 'virtual:env'
import generate from './generate'
import { PluginMessages, sendConfigurationMessage } from './messages'
import ConfigurationManager from './config/config-manager'
import CustomReporter from './consola-reporter'

// Skip over invisible nodes and their descendants inside instances for faster performance.
figma.skipInvisibleInstanceChildren = true

console.log('Loaded environment', env)

console.log('log level', env.CODE_LOG_LEVEL)

// Set the log level and reporters for the consola logger
consola.level = env.CODE_LOG_LEVEL
consola.setReporters([
  new CustomReporter({}),
])

/**
 * Show the UI of the plugin.
 *
 * Notes:
 * __html__ is a global variable that is injected by the build process.
 * The global variable shows the UI that can be found
 * in the `packages/ui?  package of this repository.
 */
figma.showUI(__html__, { themeColors: true })

const configurationManager = new ConfigurationManager()

configurationManager.loadConfig()
  .then(async (config) => {
    console.log('[Code] Config loaded from figma client storage', config)

    sendConfigurationMessage(config)

    // Generate HTML code when the plugin is opened
    await generate(config)

    // Generate HTML code when the selection changes
    figma.on('selectionchange', () => generate(configurationManager.config))
  })
  .catch((error) => {
    console.error('error loading config', error)
  })

PluginMessages.on('mode-changed', async ({ mode }) => {
  configurationManager.updateConfig({ mode }).then((generate))
})

PluginMessages.on('nearest-changed', async ({ nearestColor }) => {
  configurationManager.updateConfig({ nearestInference: nearestColor }).then(generate)
})

PluginMessages.on('variant-group-changed', async ({ variantGroup }) => {
  configurationManager.updateConfig({ variantGroup }).then(generate)
})

PluginMessages.on('variable-name-transformations-changed', async ({ variableNameTransformations }) => {
  configurationManager.updateConfig({ variableNameTransformations }).then(generate)
})

PluginMessages.on('ignored-component-instances-changed', async ({ ignoredComponentInstances }) => {
  configurationManager.updateConfig({ ignoredComponentInstances }).then(generate)
})

PluginMessages.on('unit-changed', async ({ unit }) => {
  configurationManager.updateConfig({ unit }).then(generate)
})

PluginMessages.on('notification', ({ message }) => {
  figma.notify(message)
})
