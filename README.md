<p align='center'>
<img src='./.readme/logo.svg' height='300'/>
</p>

<h1 align="center">Onyx</h1>
<p align="center">A Figma plugin that helps to transform Figma Design Systems to Code</p>
<p align="center">Generate Vue components with UnoCSS utility classes</p>
<p align="center">https://www.figma.com/community/plugin/1363542562381428983/onyx-design-system-to-code</p>
<br />

## Features

- Translate Figma design system to Vue with UnoCSS utility classes
- Multi-component variant selection support
  - Select multiple component variants and generate a single Vue component with all the selected variants (.e.g., `default`, `hover` & `focused`)
- Preview the generated code right in the Figma plugin

## Development

### Prerequisites

- [Node Version Manager (NVM)](https://github.com/nvm-sh/nvm)

<details>
<summary>Verify</summary>

To ensure correct installation, execute the `nvm -v` bash command and expect no errors.
</details>

### Install Node & PNPM

```bash
# Install Node
$ nvm install

# Install PNPM
$ corepack enable

# Prepare PNPM cache
$ pnpm setup
$ source ~/.zshrc

# Prepare .env files
$ sh setup.sh

# Install project dependencies
$ pnpm install

# Build the project
$ pnpm dev
```

## License

MIT License © 2024 [Miguel Franken](https://github.com/miguelfranken)
