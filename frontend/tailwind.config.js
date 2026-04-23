/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F172A', // Deep dark slate
        surface: '#1E293B',
        primary: '#3B82F6', // Trustworthy blue
        success: '#10B981', // Verified green
        danger: '#EF4444', // Fake red
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
