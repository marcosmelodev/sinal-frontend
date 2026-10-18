/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Cores oficiais do Figma
      colors: {
        primario: '#3563E8',
        emergencia: '#EF4444',
        alerta: '#F97316',
        sucesso: '#10B981',
        neutro: '#64748B',
      },
    },
  },
  plugins: [],
}

