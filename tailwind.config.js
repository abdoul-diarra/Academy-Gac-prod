/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gac-primary': '#16a34a',      // Vert GAC principal
        'gac-dark': '#15803d',         // Vert foncé hover
        'blanc-casse': '#fafafa',      // Fond blanc cassé
        'gris-anthracite': '#2d3748',  // Texte gris foncé
        'turquoise-gac': '#14b8a6',    // Turquoise GAC pour outline
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],           // Texte courant
        heading: ['Poppins', 'Inter', 'sans-serif'],          // Titres, boutons, logo
      },
      letterSpacing: {
        tight: '-0.02em',  // Pour resserrer les gros titres
      }
    },
  },
  plugins: [],
}