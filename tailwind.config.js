/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'], // Standard Shadcn setting
  content: [
    // Ensure these paths cover all files using Tailwind classes
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    // Add other directories if needed
  ],
  theme: {
    container: { // Optional: If you use container queries or centered containers
       center: true,
       padding: "2rem",
       screens: {
         "2xl": "1400px",
       },
    },
    extend: {
      // --- Your Custom Theme Extensions ---
      fontSize: {
        'xs': '0.85rem',
        'sm': '0.95rem',
        'base': '1.05rem', // Be mindful this overrides Tailwind's default base
        'lg': '1.15rem',
        'xl': '1.3rem',
        '2xl': '1.563rem',
        '3xl': '1.953rem',
        '4xl': '2.441rem',
        '5xl': '3.052rem',
      },
      fontFamily: {
        // Ensure --font-open-sans and --font-source-sans are correctly set up
        // (e.g., via next/font or CSS @font-face)
        heading: ['var(--font-open-sans)', 'system-ui', 'sans-serif'],
        body: ['var(--font-source-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Your custom theme colors (can coexist with Shadcn variables)
        'theme-red': '#e01717',
        'theme-navy': '#011e31',
        'theme-teal': '#26788f',
        'theme': {
          'red': { light: '#ff6b6b', DEFAULT: '#e01717', dark: '#b01111', },
          'navy': { light: '#1a3a53', DEFAULT: '#011e31', dark: '#001525', },
          'teal': { light: '#4698ad', DEFAULT: '#26788f', dark: '#1d5f73', },
          'gold': { light: '#e6ce81', DEFAULT: '#d4af37', dark: '#aa8a2a', },
          'sand': { light: '#f7f1e3', DEFAULT: '#f0e6d2', dark: '#e5d7b9', },
          'slate': { light: '#94a3b8', DEFAULT: '#64748b', dark: '#475569', },
          'coral': { light: '#ff9f80', DEFAULT: '#ff7f50', dark: '#e56438', },
          'sage': { light: '#a6c095', DEFAULT: '#87a878', dark: '#6c8b5f', },
          'cream': { light: '#fefcf7', DEFAULT: '#faf5eb', dark: '#f0e6d2', },
          'charcoal': { light: '#4b5563', DEFAULT: '#36454f', dark: '#1f2937', },
        },

        // --- Shadcn UI Color Variables Mappings (Crucial) ---
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        // --- Shadcn UI Border Radius Variables Mappings (Crucial) ---
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        // Your custom background images
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'dot-pattern': 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
      },
       keyframes: { // Required by tailwindcss-animate
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: { // Required by tailwindcss-animate
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
      require('@tailwindcss/typography'),
      require("tailwindcss-animate") // <-- CRUCIAL for Shadcn animations
  ],
}