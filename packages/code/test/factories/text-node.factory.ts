class TextNodeFactory {
  private characters: string = ''

  private fontName: FontName = {
    family: '',
    style: '',
  }

  private fontSize: number = 0

  private letterSpacing: LetterSpacing = {
    value: 0,
    unit: 'PIXELS',
  }

  private lineHeight: LineHeight = {
    value: 0,
    unit: 'PIXELS',
  }

  public setCharacters(characters: string) {
    this.characters = characters
    return this
  }

  public setFontName(fontName: FontName) {
    this.fontName = fontName
    return this
  }

  public setLetterSpacing(letterSpacing: LetterSpacing) {
    this.letterSpacing = letterSpacing
    return this
  }

  public setLineHeight(lineHeight: LineHeight) {
    this.lineHeight = lineHeight
    return this
  }

  public create() {
    return {
      type: 'TEXT',
      characters: this.characters,
      fontName: this.fontName,
      fontSize: this.fontSize,
      letterSpacing: this.letterSpacing,
      lineHeight: this.lineHeight,
      getSharedPluginData: () => '',
    } as unknown as TextNode
  }
}

export default TextNodeFactory
