import process from 'node:process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { cleanupSVG } from '@iconify/tools/lib/svg/cleanup'
import type { DocumentNotModified } from '@iconify/tools/lib/download/types/modified'
import type { FigmaImportResult } from '@iconify/tools/lib/import/figma/types/result'
import { bool, cleanEnv, str } from 'envalid'
import type { IconSet } from '@iconify/tools'
import { deOptimisePaths, importFromFigma, isEmptyColor, parseColors, runSVGO } from '@iconify/tools'
import type { FigmaImportNodeData } from '@iconify/tools/lib/import/figma/types/nodes'
import { compareColors, stringToColor } from '@iconify/utils/lib/colors'
import 'dotenv/config'

// Validate and load environment variables
const env = cleanEnv(process.env, {
  // Determines whether to use the cache. The value should be either 'true' or 'false'.
  FIGMA_USE_CACHE: bool(),

  // A personal access token for the Figma API.
  // See https://iconify.design/docs/libraries/tools/import/figma/token.html
  FIGMA_PERSONAL_ACCESS_TOKEN: str(),

  // The Figma file to be processed. This should be a string specifying the file id.
  // See https://iconify.design/docs/libraries/tools/import/figma/file-id.html
  FIGMA_FILE: str(),
})

function optimizeIconSet(iconSet: IconSet): Promise<IconSet> {
  return new Promise((resolve, reject) => {
    iconSet
      .forEach(async (name) => {
        const svg = iconSet.toSVG(name)!

        // Change color to `currentColor`
        const blackColor = stringToColor('black')!
        const whiteColor = stringToColor('white')!

        cleanupSVG(svg)

        parseColors(svg, {
          defaultColor: 'currentColor',
          callback: (attr, colorStr, color) => {
            if (color && isEmptyColor(color)) {
              // Color is empty: 'none' or 'transparent'
              // Return color object to keep old value
              return color
            }

            switch (color?.type) {
              case 'none':
              case 'current':
                return color
            }

            // White color: belongs to white background rectangle: remove rectangle
            if (color && compareColors(color, whiteColor))
              return 'remove'

            // remove white background fill color
            if (attr === 'fill' && colorStr === 'white')
              return 'unset'

            if (color && compareColors(color, blackColor))
              return 'currentColor'

            throw new Error(
              `Unexpected color "${colorStr}" in attribute ${attr} for svg with name ${name}`,
            )
          },
        })

        // Optimise
        runSVGO(svg)

        // Update paths for compatibility with old software
        deOptimisePaths(svg)

        // Update icon in icon set
        iconSet.fromSVG(name, svg)
      })
      .then(() => {
        resolve(iconSet)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

async function loadIconSetFromFigma() {
  const result = await importFromFigma({
    file: env.FIGMA_FILE,

    // traverse document to collect icons
    iconNameForNode: (node: FigmaImportNodeData) => {
      if (node.type === 'COMPONENT') {
        return node.name
          .toLowerCase()
          .replaceAll(' ', '-')
          .replaceAll('/', '-')
      }

      return undefined
    },

    ifModifiedSince: env.FIGMA_USE_CACHE ? true : undefined,

    token: env.FIGMA_PERSONAL_ACCESS_TOKEN,

    // Icon set prefix, used for creating icon set instance.
    prefix: 'onyx-icon-library',

    cacheDir: '.cache',

    // The depth indicates how far into the Figma document structure to traverse.
    depth: 3,
  }) as DocumentNotModified | FigmaImportResult

  if (result === 'not_modified') {
    console.log('Figma document wasn\'t modified')
  }
  else {
    const iconSet = result.iconSet
    const optimizedIconSet = await optimizeIconSet(iconSet)
    const iconifyJSON = optimizedIconSet.export()

    const exported = `${JSON.stringify(iconifyJSON, null, '  ')}\n`

    const icons = Object.keys(iconifyJSON.icons)
    const iconSetTypescript = `const icons = [${icons.map(i => `'${i}'`).join(', ')}]\n\nexport default icons\n`

    const outputDirectory = './dist'
    mkdirSync(outputDirectory, { recursive: true })

    try {
      writeFileSync(`${outputDirectory}/${iconSet.prefix}.ts`, iconSetTypescript, 'utf8')
      writeFileSync(`${outputDirectory}/${iconSet.prefix}.json`, exported, 'utf8')
      console.log(`The file has been saved! Total icons: ${icons.length}`)
    }
    catch (err) {
      console.error(err)
    }
  }
}

await loadIconSetFromFigma()
