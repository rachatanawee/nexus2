export const themes = {
  tangerine: 'Tangerine',
  claude: 'Claude',
  'clean-slate': 'Clean Slate',
  'ocean-breeze': 'Ocean Breeze',
  twitter: 'Twitter',
} as const

export type ThemeName = keyof typeof themes
