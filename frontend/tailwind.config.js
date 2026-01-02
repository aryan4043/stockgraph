/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0a0a0a",
                surface: "#1a1a1a",
                primary: "#3b82f6",
                secondary: "#8b5cf6",
                accent: "#f59e0b",
                success: "#22c55e",
                danger: "#ef4444",
            },
        },
    },
    plugins: [],
}
