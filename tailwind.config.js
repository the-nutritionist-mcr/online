/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        
      },
      fontFamily: {
        AcuminPro: ['acumin-pro', 'Arial', 'sans-serif'],
        AcuminProSemiCondensed: ['acumin-pro-semi-condensed', 'Arial', 'sans-serif'],
        IBMPlexSerif: ['ibm-plex-serif', 'Arial', 'sans-serif'],
      }
    },
  },
  future: {
    hoverOnlyWhenSupported: true
  },
  plugins: [],
}

