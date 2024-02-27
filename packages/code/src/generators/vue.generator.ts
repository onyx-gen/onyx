import type { VariantPermutation } from '../set/types'
import type { TreeNode } from '../interfaces'
import HTMLGenerator from './html.generator'
import ScriptSetupGenerator from './script-setup.generator'

/**
 * A class that generates Vue code for a given tree node.
 */
class VueGenerator {
  private readonly scriptSetupGenerator: ScriptSetupGenerator
  private readonly htmlGenerator: HTMLGenerator

  constructor(
    permutations: VariantPermutation[],
    private readonly treeNode: TreeNode | null,
  ) {
    this.scriptSetupGenerator = new ScriptSetupGenerator(permutations)
    this.htmlGenerator = new HTMLGenerator(permutations)
  }

  /**
   * Generates a string representation of the code.
   *
   * @returns {string} The generated code.
   */
  public generate(): string {
    const code: string[] = []

    code.push(this.scriptSetupGenerator.generate())

    if (this.treeNode)
      code.push(this.htmlGenerator.generate(this.treeNode))

    return code.join('\n\n')
  }
}

export default VueGenerator
