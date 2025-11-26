/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2563eb', // Blue-600
                'background-light': '#f8fafc', // Slate-50
            },
        },
    },
    plugins: [],
}
