/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0A1412",
        surface: "#101B19",
        'surface-raised': "#16231F",
        hairline: "#24332F",
        'text-primary': "#EAF3EF",
        'text-secondary': "#8FA39C",
        pulse: "#4FD8C4",
        safe: "#34D399",
        caution: "#F2B84B",
        danger: "#FF6B57",
        'danger-strong': "#E8432C"
      },
      fontFamily: {
        sans: ['"General Sans"', 'Manrope', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        primary: '20px',
        nested: '12px',
        pill: '999px',
      }
    },
  },
  plugins: [],
}
