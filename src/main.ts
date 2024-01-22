// This plugin will generate a sample codegen plugin
// that appears in the Element tab of the Inspect panel.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This provides the callback to generate the code.
import { getAppliedTokens } from './tokens'

figma.codegen.on('generate', async (event) => {
  const node: SceneNode = event.node

  const appliedTokens = getAppliedTokens(node)
  console.log('appliedTokens', appliedTokens)

  let textStrings: string[] = []

  if ('findAll' in node)
    textStrings = node.findAll(node => node.type === 'TEXT').map(node => (node as TextNode).characters)

  const jsonStringDictionary: {
    [key: string]: { string: string }
  } = {}

  for (const textString of textStrings) {
    const jsonKey = createJsonKey(textString)

    jsonStringDictionary[jsonKey] = { string: textString }
  }

  return [
    {
      language: 'JSON',
      code: JSON.stringify(jsonStringDictionary, null, 2),
      title: 'i18n-dict',
    },
  ]
})

// Function to create a JSON key from a string
function createJsonKey(inputString: string) {
  return inputString.toLowerCase().replace(/\s/g, '_')
}
