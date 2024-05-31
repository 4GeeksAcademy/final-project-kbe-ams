module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        w:"#FAFAFA",
        b:"#030303",
        dark:"#0e090f",
        primary: {
          n:"#40104C",
          l:"#e6e1e7",
          d:"#131014"
        },
        accent:{
          n:"#ffd500",
          l:"#fff5c2"
        },
        secondary:{
          n:"#db9eff",
          l:""
        }
      },
      fontFamily: {
        'tittle': ['Poppins', 'sans-serif'],
        'body': ['Radio Canada Big', 'sans-serif']
        
      }
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.f-tittle': {
          'font-family': 'Poppins, sans-serif',
          'font-style': 'italic',
          'font-weight': '700',
        },
        '.f-body': {
          'font-family': 'Radio Canada Big, sans-serif',
          'font-weight': '600',
        },
        '.f-body-sm': {
          'font-family': 'Radio Canada Big, sans-serif',
          'font-weight': '500',
        },
      });
    },
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-stroke': {
          '-webkit-text-stroke': '1px black',
          'text-stroke': '1px black',
        },
        '.text-stroke-2': {
          '-webkit-text-stroke': '2px black',
          'text-stroke': '2px black',
        },
        '.text-stroke-white': {
          '-webkit-text-stroke': '1px white',
          'text-stroke': '1px white',
        },
      };

      addUtilities(newUtilities, ['responsive', 'hover']);
},
],
}
