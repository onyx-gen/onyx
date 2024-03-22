import testHtmlString from '@onyx/renderer/dist/index.html?raw'

export default function useRenderer() {
  async function render(data: any = {}) {
    const template = `<div class="h-full flex justify-center items-center">${data.vue}</div>`

    return testHtmlString.replace('%template%', template)
    // return testHtmlString
  }

  return { render }
}
