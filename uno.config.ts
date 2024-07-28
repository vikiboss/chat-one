import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  content: {
    pipeline: {
      include: ['src/**/*.{tsx,ts}'],
    },
  },
  presets: [
    presetUno({
      dark: {
        dark: '[arco-theme="dark"]',
      },
    }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/',
      extraProperties: {
        display: 'inline-block',
      },
    }),
  ],
  rules: [],
  shortcuts: [
    {
      'grid-center': 'grid place-items-center',
      'flex-center': 'flex items-center justify-center',
      'flex-col-center': 'flex flex-col items-center justify-center',
      'flex-between': 'flex items-center justify-between',
    },
  ],
})
