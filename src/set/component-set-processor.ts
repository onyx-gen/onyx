import FigmaNodeParser from '../parsers/figma-node.parser'
import HTMLGenerator from '../generators/html.generator'
import type { ComponentCollection, ComponentPropsWithState } from './types'
import { getComponentProperties, groupComponentsByProp } from './utils'

class ComponentSetProcessor {
  public process(node: ComponentSetNode): string {
    const parser = new FigmaNodeParser()
    const generator = new HTMLGenerator()
    let html = ''

    const components: ComponentNode[] = node.children as ComponentNode[]

    // Map each component to an object containing the component and its parsed properties.
    const componentCollection: ComponentCollection = components.map(component => ({
      component,
      props: getComponentProperties(component),
    }))

    const componentCollectionWithState: ComponentCollection<ComponentPropsWithState> = componentCollection
      .filter(component => !!component.props.state) as ComponentCollection<ComponentPropsWithState>

    // Group components by their 'state' property.
    const componentCollectionGroupedByState = groupComponentsByProp(componentCollectionWithState, 'state')
    console.log(componentCollectionGroupedByState)

    const children = node.children as ComponentNode[]
    const trees = children
      .map(child => parser.parse(child))
      .filter(tree => tree !== null)

    html += trees.map(tree => generator.generate(tree!)).join('\n\n')

    return html
  }
}

export default ComponentSetProcessor
