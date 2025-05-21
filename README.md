# Solara: A Cosmic Age Calculator

**Solara** visually represents your age in solar rotations (days) and celebrates your journey around the sun. Built for a beautiful, accessible, and mobile-friendly experience.

---

## Project History

Solara began as an experiment on [vibes.engineering](https://warpcast.com/vibes.engineering) to create a Farcaster Mini App. While it started from the vibes.engineering mini app template, Solara is not a direct fork or base build. Over time, it has evolved into a robust, standalone project with a unique design, features, and architecture.

---

## Features

- **Solar Age Calculation:** Enter your birth date to see your age in days (solar rotations).
- **Milestone Tracking:** Discover and bookmark your next solar milestone.
- **Animated Solar System:** See your journey visualized as an orbit around the sun.
- **Farcaster Integration:** Pin Solara to your Farcaster profile and receive milestone notifications.
- **Modern UI:** Responsive, accessible, and visually polished for all devices.
- **Privacy-First:** Your data is not stored or shared.

## Tech Stack

- Next.js, React, TypeScript
- Tailwind CSS for styling
- shadcn/ui for UI components
- Supabase for optional storage
- Radix UI for accessible dialogs
- Mini Apps SDK for Farcaster integration

## Getting Started

```bash
pnpm install
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Set these in your `.env.local` for full functionality:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_VIBES_ENGINEERING_PROJECT_ID`
- (Optional) `NEXT_PUBLIC_URL` for canonical URLs

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

MIT
