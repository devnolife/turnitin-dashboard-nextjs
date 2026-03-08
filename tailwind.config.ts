import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Turnitin brand palette
        turnitin: {
          navy: "#0F2854",
          blue: "#1C4D8D",
          teal: "#4988C4",
          mint: "#BDE8F5",
        },
        // EduGen / ui-dashboard primary palette
        edugen: {
          DEFAULT: "#5AB2FF",
          light: "#A0DEFF",
          lighter: "#CAF4FF",
          dark: "#3A92DF",
        },
        // EduGen secondary & accent
        "edugen-secondary": {
          DEFAULT: "#FFF9D0",
          foreground: "#525B44",
        },
        "edugen-accent": {
          DEFAULT: "#85A98F",
          dark: "#525B44",
          foreground: "#FFFFFF",
        },
        // Component blues (ui-dashboard inline)
        "edu-blue": {
          DEFAULT: "#5fa2db",
          light: "#7ab8e6",
          lighter: "#a8d1f0",
          dark: "#4a8bc7",
          medium: "#6aa7d9",
          bg: "#e6f1fa",
          "bg-muted": "#d0e4f5",
          "dark-mode": "#2c4c6b",
          "dark-border": "#3a5d7d",
        },
        // Theme option palettes from ui-dashboard
        "theme-purple": {
          DEFAULT: "#8b5cf6",
          light: "#a78bfa",
          lighter: "#c4b5fd",
          bg: "#ede9fe",
        },
        "theme-green": {
          DEFAULT: "#10b981",
          light: "#34d399",
          lighter: "#6ee7b7",
          bg: "#d1fae5",
        },
        "theme-orange": {
          DEFAULT: "#f97316",
          light: "#fb923c",
          lighter: "#fdba74",
          bg: "#ffedd5",
        },
        "theme-pink": {
          DEFAULT: "#ec4899",
          light: "#f472b6",
          lighter: "#f9a8d4",
          bg: "#fce7f3",
        },
        // CSS variable-based tokens
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
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
        // Chart colors via CSS variables
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary, var(--primary)))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground, var(--primary-foreground)))",
          accent: "hsl(var(--sidebar-accent, var(--accent)))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground, var(--accent-foreground)))",
          border: "hsl(var(--sidebar-border, var(--border)))",
          ring: "hsl(var(--sidebar-ring, var(--ring)))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        ripple: {
          "0%": { width: "0px", height: "0px", opacity: "0.5" },
          "100%": { width: "500px", height: "500px", opacity: "0" },
        },
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-light": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translate(-50%, 20px)" },
          "100%": { opacity: "1", transform: "translate(-50%, 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        ripple: "ripple 0.6s linear forwards",
        blob: "blob 7s infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-light": "pulse-light 3s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

