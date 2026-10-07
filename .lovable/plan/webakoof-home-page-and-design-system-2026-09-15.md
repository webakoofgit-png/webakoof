# Webakoof Home Page and Design System

## Goal
Build a production-quality agency home page for Webakoof that clearly communicates website development, technology, and digital growth services in Pune. The visual system will stay predominantly white, use vibrant yellow as the signature action color, and reserve black for typography and focused contrast.

## What will be built
- A sticky, responsive header with Webakoof branding, desktop navigation, mobile menu, and consultation CTA.
- A premium split hero with strong positioning copy, generated agency-workspace imagery, browser-style presentation, and restrained capability callouts.
- Full home-page sections for trust metrics, editable client placeholders, about, services, featured work, differentiators, process, technologies, packages, industries, business impact, testimonials, conversion CTA, and project enquiry.
- A professional footer and configurable floating WhatsApp enquiry button.
- Form validation and an in-page success state without external data storage.
- Reusable shared components and centralized content data so future inner pages can use the same navigation, cards, buttons, form patterns, and visual language.
- A custom Webakoof favicon/mark derived from the new brand treatment.

## Visual direction
- Manrope for display and body typography, with bold but controlled headlines.
- Roughly 60% white/off-white, 25% yellow accents, and 15% black/dark contrast.
- Crisp grid composition, thin borders, restrained shadows, modest radii, generous spacing, and occasional dark contrast bands.
- Purposeful motion only: entrance reveals, gentle mockup float, marquee movement, card lift, image zoom, and timeline progress, all respecting reduced-motion preferences.
- Original composition informed by the references’ conversion flow and hierarchy, without copying their page designs.

## Content and trust handling
- Trust statistics and client/testimonial content will be clearly structured as editable placeholders rather than presented as verified claims.
- Portfolio examples will use generated concept mockups and be identified as representative work until real projects are supplied.
- Contact details and WhatsApp number will remain configurable placeholders with no invented phone number, email, or address.

## Technical details
- Extend the Tailwind v4 token system in `src/styles.css` using semantic OKLCH colors and centralized animation utilities.
- Use TanStack Router metadata on the home route for title, description, Open Graph, Twitter, canonical, and structured Organization/LocalBusiness data.
- Build the home page from focused React components and data modules, not one monolithic file.
- Use semantic HTML, one H1, descriptive image alt text, lazy loading below the fold, keyboard-accessible controls, and responsive layouts without horizontal overflow.
- Keep navigation links ready for the requested inner-page architecture while avoiding links to pages not yet built in this first phase.

## Verification
- Check desktop and mobile layouts in the running preview.
- Test the mobile menu, portfolio filters, testimonial controls, enquiry validation/success, and WhatsApp link.
- Confirm metadata, accessibility basics, image loading, and absence of visible overflow or runtime errors.
