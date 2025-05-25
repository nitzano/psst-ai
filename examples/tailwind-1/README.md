# Tailwind CSS Example 1

This is an example project demonstrating Tailwind CSS configuration patterns that the TailwindScanner can detect.

## Features Demonstrated

- Basic Tailwind CSS configuration with content paths
- Class-based dark mode configuration  
- Theme customization with extend property
- Custom colors and spacing
- Official plugins (@tailwindcss/forms, @tailwindcss/typography)
- Safelist configuration for CSS purging

## Testing the Scanner

Run `pnpm dev` in this directory to test the TailwindScanner against this configuration.

The scanner should detect:
- Tailwind CSS dependency
- Content path configuration
- Dark mode setup
- Theme customizations
- Plugin usage
- Safelist configuration
