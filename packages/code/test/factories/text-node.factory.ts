class TextNodeFactory {
  private characters: string = ''

  public setCharacters(characters: string) {
    this.characters = characters
    return this
  }

  public create() {
    return {
      type: 'TEXT',
      characters: this.characters,
      getSharedPluginData: () => '',
    } as unknown as TextNode
  }
}

export default TextNodeFactory
