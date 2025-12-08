export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "var(--primary)",
                    foreground: "var(--primary-foreground)",
                },
                secondary: {
                    DEFAULT: "var(--secondary)",
                    foreground: "var(--secondary-foreground)",
                },
                destructive: {
                    DEFAULT: "var(--destructive)",
                    foreground: "var(--destructive-foreground)",
                },
                muted: {
                    DEFAULT: "var(--muted)",
                    foreground: "var(--muted-foreground)",
                },
                accent: {
                    DEFAULT: "var(--accent)",
                    foreground: "var(--accent-foreground)",
                },
                popover: {
                    DEFAULT: "var(--popover)",
                    foreground: "var(--popover-foreground)",
                },
                card: {
                    DEFAULT: "var(--card)",
                    foreground: "var(--card-foreground)",
                },
                sidebar: {
                    DEFAULT: "var(--sidebar)",
                    foreground: "var(--sidebar-foreground)",
                    primary: "var(--sidebar-primary)",
                    "primary-foreground": "var(--sidebar-primary-foreground)",
                    accent: "var(--sidebar-accent)",
                    "accent-foreground": "var(--sidebar-accent-foreground)",
                    border: "var(--sidebar-border)",
                    ring: "var(--sidebar-ring)",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                sans: ["var(--font-sans)"],
                display: ["var(--font-display)"],
            },
            rotate: {
                'y-12': '12deg',
                'y-25': '25deg',
                '-y-12': '-12deg',
                '-y-25': '-25deg',
                'x-60': '60deg',
            }
        },
    },
    plugins: [
        function ({ addUtilities }) {
            addUtilities({
                '.perspective-1000': {
                    'perspective': '1000px',
                },
                '.perspective-2000': {
                    'perspective': '2000px',
                },
                '.perspective-3000': {
                    'perspective': '3000px',
                },
                '.rotate-y-12': {
                    'transform': 'rotateY(12deg)',
                },
                '.rotate-y-25': {
                    'transform': 'rotateY(25deg)',
                },
                '.-rotate-y-12': {
                    'transform': 'rotateY(-12deg)',
                },
                '.-rotate-y-25': {
                    'transform': 'rotateY(-25deg)',
                },
                '.rotate-y-0': {
                    'transform': 'rotateY(0deg)',
                },
                '.rotate-x-60': {
                    'transform': 'rotateX(60deg)',
                },
                '.transform-style-3d': {
                    'transform-style': 'preserve-3d',
                }
            })
        }
    ],
}
