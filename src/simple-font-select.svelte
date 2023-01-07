<!-- eslint-disable-next-line svelte/valid-compile -->
<svelte:options tag='simple-font-select' />

<script context='module'>
  import { writable } from 'svelte/store'

  const supports = 'queryLocalFonts' in self

  const fonts = writable({})
  let availableFonts = null
  // @license © 2020 Google LLC. Licensed under the Apache License, Version 2.0.
  export async function loadFonts () {
    if (!supports) return
    const _fonts = {}
    if (availableFonts) return
    const styleSheet = new CSSStyleSheet()
    try {
      availableFonts = await queryLocalFonts()
      for (const metadata of availableFonts) {
        if (!_fonts[metadata.family]) {
          _fonts[metadata.family] = []
        }
        _fonts[metadata.family].push(metadata)
      }
    } catch (err) {
      console.warn(err.name, err.message)
    }
    for (const fontFamily of Object.keys(_fonts)) {
      _fonts[fontFamily] = _fonts[fontFamily]
        .map(font => {
          // Replace font variation name "Arial" with "Arial Regular".
          const variationName = font.fullName
            .replace(fontFamily, '')
            .replaceAll('-', '')
            .trim()
          font.variationName = variationName || 'Regular'
          return font
        })
        .sort((a, b) => {
          // "Regular" always comes first, else use alphabetic order.
          if (a.variationName === 'Regular') {
            return -1
          } else if (b.variationName === 'Regular') {
            return 1
          } else if (a.variationName < b.variationName) {
            return -1
          } else if (a.variationName > b.variationName) {
            return 1
          }
          return 0
        })
      for (const font of _fonts[fontFamily]) {
        styleSheet.insertRule(`@font-face { font-family: 'lfa-${font.fullName}'; src: local('${font.fullName}'), local('${font.fullName}'); }`)
      }
    }

    document.adoptedStyleSheets = [
      styleSheet,
      ...document.adoptedStyleSheets
    ]
    fonts.set(_fonts)
  }
</script>

<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  function fontChange ({ target }) {
    const value = target.value
    const font = availableFonts.find(({ fullName }) => fullName === value)
    dispatch('change', font)
  }
  export let value
  if (supports) loadFonts()
</script>

<select on:click|once={loadFonts} on:change={fontChange} {...$$restProps} style={value && `font-family: lfa-${value}`} bind:value disabled={!supports}>
  {#if !supports}
    <option value="" disabled selected>Local Font Access isn't supported by this browser.</option>
  {/if}
  {#each Object.entries($fonts) as [fontName, fonts]}
    <optgroup label={fontName} style='font-family: lfa-{fontName}'>
      {#each fonts as { fullName }}
        <option style='font-family: lfa-{fullName}'>{fullName}</option>
      {/each}
    </optgroup>
  {/each}
</select>
