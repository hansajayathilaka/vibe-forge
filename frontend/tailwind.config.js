/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'vf-primary': 'var(--vf-color-primary)',
        'vf-primary-hover': 'var(--vf-color-primary-hover)',
        'vf-primary-text': 'var(--vf-color-primary-text)',
        'vf-danger': 'var(--vf-color-danger)',
        'vf-danger-hover': 'var(--vf-color-danger-hover)',
        'vf-danger-text': 'var(--vf-color-danger-text)',
        'vf-surface': 'var(--vf-color-surface)',
        'vf-surface-border': 'var(--vf-color-surface-border)',
        'vf-input-border': 'var(--vf-color-input-border)',
        'vf-input-ring': 'var(--vf-color-input-ring)',
      },
      borderRadius: {
        vf: 'var(--vf-radius)',
        'vf-sm': 'var(--vf-radius-sm)',
      },
      fontFamily: {
        vf: ['var(--vf-font-sans)'],
      },
    },
  },
  plugins: [],
}
