/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2563eb', // Blue-600
                'background-light': '#f8fafc', // Slate-50
                'background-dark': '#0f172a', // Slate-900
            },
        },
    },
    plugins: [],
}
