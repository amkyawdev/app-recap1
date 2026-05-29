/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'red-custom': '#DC2626',
        'gray-custom': '#374151',
        'black-custom': '#111827',
        'gray-light': '#9CA3AF',
        'gray-dark': '#1F2937',
      },
    },
  },
  plugins: [],
}
