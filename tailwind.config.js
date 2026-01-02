/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./script.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        lightBg: '#F7F8FA',         // Main light background
        lightSurface: '#FFFFFF',     // Card and main element background
        lightTextPrimary: '#333333', // Dark primary text
        lightTextSecondary: '#666666',// Grey secondary text
        lightDivider: '#E0E0E0',    // Divider lines
        lightBorderNormal: '#CCCCCC',// Form element border

        pokemonPrimary: '#3B4CCA',   // Pokémon Blue (e.g., buttons, logo)
        pokemonSecondary: '#CC0000', // Pokémon Red (e.g., logo gradient)
        
        // Specific colors for each Pokémon type
        typeNormal: '#A8A77A',
        typeFire: '#FD7D24',
        typeWater: '#4592C4',
        typeGrass: '#9BCC50',
        typeElectric: '#F9D700',
        typeIce: '#51C4E7',
        typeFighting: '#D56723',
        typePoison: '#B97FC9',
        typeGround: '#F7DE3F',
        typeFlying: '#A1BBED',
        typePsychic: '#F366B9',
        typeBug: '#729F3F',
        typeRock: '#A38C21',
        typeGhost: '#7B62A4',
        typeDragon: '#53A4CF',
        typeSteel: '#9EB7B8',
        typeFairy: '#FDB9E9',
        typeDark: '#707070',

        // Text colors for contrast on type pills
        typeTextDark: '#333333', 
        typeTextLight: '#FFFFFF',

        // Vibrant colors for label text/border in detail cards
        effectivenessTextSuper: '#28A745', // Vibrant Green
        effectivenessTextResist: '#DC3545', // Vibrant Red
        effectivenessTextImmune: '#6C757D', // Dark Grey
      },
      boxShadow: {
        'light-card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.08)', 
        'light-hover': '0 4px 10px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.08)', 
        'light-inner': 'inset 0 1px 2px rgba(0,0,0,0.06)', 
        'light-focus': '0 0 0 3px rgba(59, 76, 202, 0.25)', 
        'bento': '0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)', 
        'fade-right': '5px 0 10px -5px rgba(0,0,0,0.2) inset', 
        'card-hover-effect': '0 6px 12px rgba(0,0,0,0.12), 0 3px 6px rgba(0,0,0,0.08)', 
        'title-text': '0 5px 20px rgba(0, 100, 200, 0.6), 0 0 30px rgba(37, 117, 252, 0.6)', /* Increased shadow for "cool" effect */
        'selector-card': '0 8px 16px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1)', 
        'bento-card-shadow': '0 4px 12px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)', 
      }
    }
  },
  plugins: [],
}