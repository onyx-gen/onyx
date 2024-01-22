// This plugin will generate a sample codegen plugin
// that appears in the Element tab of the Inspect panel.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This provides the callback to generate the code.

import { getUnoCSSAutoLayoutProps } from './builder/auto-layout'
import { UnocssBuilder } from './builder/unocss-builder'

figma.codegen.on('generate', async (event) => {
  const node: SceneNode = event.node

  let css = ''

  switch (node.type) {
    case 'COMPONENT':
      console.log('a component', node.type)
      css += handleFrame(node)
      break
  }

  return [
    {
      language: 'JSON',
      code: css,
      title: 'UnoCSS & Tokens Studio for Figma',
    },
  ]
})

function handleFrame(node: ComponentNode) {
  console.log('node', node)

  // User has explicitly set auto-layout
  if (node.layoutMode !== 'NONE') {
    console.log('node.layoutMode')
    const rowColumn = getUnoCSSAutoLayoutProps(node, node)
    return handleContainer(node, '', rowColumn)
  }

  // User has not explicitly set auto-layout, but Figma has inferred auto-layout
  // https://www.figma.com/plugin-docs/api/ComponentNode/#inferredautolayout
  else if (node.inferredAutoLayout !== null) {
    console.log('node.inferredAutoLayout')
  }

  // No explicitly set or automatically inferred auto-layout
  else {
    // Auto-layout is disabled
    console.log('node.layoutMode NONE')
  }

  return 'px-6'
}

type ContainerNode =
  & SceneNode
  & SceneNodeMixin
  & BlendMixin
  & LayoutMixin
  & GeometryMixin
  & MinimalBlendMixin

function handleContainer(
  node: ContainerNode,
  children: string,
  additionalAttr: string,
): string {
  const builder = new UnocssBuilder(node)
  builder.commonShapeStyles(node)
  return builder.build(additionalAttr)
}
