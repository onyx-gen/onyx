import type { ContainerNodeData, IconNodeData, InstanceNodeData, TextNodeData, TreeNode, TreeNodeData } from '../interfaces'

class TreeMerger {
  public merge(tree1: TreeNode, tree2: TreeNode): TreeNode {
    return this.mergeNodes(tree1, tree2)
  }

  private mergeNodes(node1: TreeNode, node2: TreeNode): TreeNode {
    // Handle the case where either of the nodes is missing
    if (!node1)
      return node2
    if (!node2)
      return node1

    // Assuming similar structure, merge TreeNodeData
    const mergedData = this.mergeData(node1.data, node2.data)

    // Merge children
    const children = this.mergeChildren(node1.children, node2.children)

    return { data: mergedData, children }
  }

  private mergeData(data1: TreeNodeData, data2: TreeNodeData): TreeNodeData {
    // Merge based on the type of TreeNodeData
    switch (data1.type) {
      case 'container':
        return this.mergeContainerData(data1, data2 as ContainerNodeData)
      case 'text':
        return this.mergeTextData(data1, data2 as TextNodeData)
      case 'instance':
        return this.mergeInstanceData(data1, data2 as InstanceNodeData)
      case 'icon':
        return this.mergeIconData(data1, data2 as IconNodeData)
      default:
        throw new Error('Unsupported data type')
    }
  }

  private mergeChildren(children1: TreeNode[], children2: TreeNode[]): TreeNode[] {
    // Merge children arrays by corresponding positions
    const maxLength = Math.max(children1.length, children2.length)
    const mergedChildren: TreeNode[] = []
    for (let i = 0; i < maxLength; i++)
      mergedChildren.push(this.mergeNodes(children1[i], children2[i]))

    return mergedChildren
  }

  // Implement specific merging strategies for each TreeNodeData subtype
  private mergeContainerData(data1: ContainerNodeData, data2: ContainerNodeData): ContainerNodeData {
    // Example: Merge CSS strings
    return {
      type: 'container',
      css: `css1(${data1.css}) css2(${data2.css})`,
    }
  }

  private mergeTextData(data1: TextNodeData, data2: TextNodeData): TextNodeData {
    // Example: Concatenate text
    return {
      type: 'text',
      text: `text1(${data1.text}) text2(${data2.text})`,
    }
  }

  private mergeInstanceData(data1: InstanceNodeData, data2: InstanceNodeData): InstanceNodeData {
    // TODO MF
    return data1
  }

  private mergeIconData(data1: IconNodeData, data2: IconNodeData): IconNodeData {
    // TODO MF
    return data1
  }
}

export default TreeMerger
