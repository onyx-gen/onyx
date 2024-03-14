import type { LogObject } from 'consola'
import { createIndent } from './utils'

interface ColorShade {
  [shade: string]: string
}

interface ColorPalette {
  [color: string]: ColorShade
}

const colors: ColorPalette = {
  rose: {
    400: '#fb7185',
    600: '#e11d48',
    800: '#9f1239',
  },
  pink: {
    400: '#f472b6',
    600: '#db2777',
    800: '#9d174d',
  },
  fuchsia: {
    400: '#e879f9',
    600: '#c026d3',
    800: '#86198f',
  },
  purple: {
    400: '#c084fc',
    600: '#9333ea',
    800: '#6b21a8',
  },
  violet: {
    400: '#a78bfa',
    600: '#7c3aed',
    800: '#5b21b6',
  },
  indigo: {
    400: '#818cf8',
    600: '#4f46e5',
    800: '#3730a3',
  },
  blue: {
    400: '#60a5fa',
    600: '#2563eb',
    800: '#1e40af',
  },
  sky: {
    400: '#38bdf8',
    600: '#0284c7',
    800: '#075985',
  },
  cyan: {
    400: '#22d3ee',
    600: '#0891b2',
    800: '#155e75',
  },
  teal: {
    400: '#2dd4bf',
    600: '#0d9488',
    800: '#115e59',
  },
  emerald: {
    400: '#34d399',
    600: '#059669',
    800: '#065f46',
  },
  green: {
    400: '#4ade80',
    600: '#16a34a',
    800: '#166534',
  },
  lime: {
    400: '#a3e635',
    600: '#65a30d',
    800: '#3f6212',
  },
  yellow: {
    400: '#facc15',
    600: '#ca8a04',
    800: '#854d0e',
  },
  amber: {
    400: '#fbbf24',
    600: '#d97706',
    800: '#92400e',
  },
  orange: {
    400: '#fb923c',
    600: '#ea580c',
    800: '#9a3412',
  },
  red: {
    400: '#f87171',
    600: '#dc2626',
    800: '#991b1b',
  },
}

/**
 * Hashes an input string to a color from a predefined color palette.
 *
 * This method takes an arbitrary string and deterministically maps it to one
 * of the colors from a fixed set of colors based on a simple hashing mechanism.
 * The same input string will always map to the same color.
 *
 * @param {string} input - The input string to hash to a color.
 * @returns {string} - The hex code of the color determined by the hash.
 */
function stringToColor(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++)
    hash = input.charCodeAt(i) + ((hash << 5) - hash)

  const colorKeys = Object.keys(colors)
  const selectedColorKey = colorKeys[Math.abs(hash) % colorKeys.length]
  const shadeKeys = Object.keys(colors[selectedColorKey])
  const selectedShadeKey = shadeKeys[Math.abs(hash) % shadeKeys.length]

  return colors[selectedColorKey][selectedShadeKey]
}

class CustomReporter {
  options: any

  constructor(options: any) {
    this.options = { ...options }
  }

  _getLogFn(level: number) {
    if (level < 1)
      return (console as any).__error || console.error

    if (level === 1)
      return (console as any).__warn || console.warn

    return (console as any).__log || console.log
  }

  log(logObj: LogObject) {
    const consoleLogFn = this._getLogFn(logObj.level)

    // Tag
    const { className, methodName, level, type } = JSON.parse(logObj.tag)

    const style1 = `
      background: ${stringToColor(className)};
      border-radius: 0.5em;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      color: white;
      font-weight: bold;
      padding: 2px 0.5em;
    `

    const style2 = `
      background: ${stringToColor(methodName)};
      color: white;
      font-weight: bold;
      padding: 2px 0.5em;
    `

    const style3 = `
      background: lightgray;
      border-radius: 0.5em;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      color: black;
      font-weight: bold;
      padding: 2px 0.5em;
    `

    consoleLogFn(
      `${createIndent(level - 1)}%c${className}%c${methodName}%c${type}`,
      style1,
      style2,
      style3,
      // Empty string as style resets to default console style
      '',
      ...logObj.args,
    )
  }
}

export default CustomReporter
