// module.exports = {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,jsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         primary: 'var(--color-primary)',
//         secondary: 'var(--color-secondary)',
//         text: 'var(--color-text)',
//         background: 'var(--color-background)',
//         navy: '#1a237e',
//       },
//       gridTemplateColumns: {
//         '16': 'repeat(16, minmax(0, 1fr))',
//       },
//     },
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '16': 'repeat(16, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
}