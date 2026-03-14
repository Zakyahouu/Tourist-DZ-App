# TouristDZ Mobile

TouristDZ Mobile is the Expo and React Native client for the TouristDZ platform. It is built for tourists exploring Biskra, Algeria, with a mobile-first experience for discovering tourist sites, events, audio guides, gallery content, QR-based navigation, and authenticated user actions such as favorites and reviews.

## Tech Stack

- Expo 54
- React Native 0.81
- Expo Router
- Supabase
- i18next
- TypeScript

## Main Features

- Home screen with featured places and upcoming events
- Explore tourist sites by category
- Site details with images, reviews, and audio guide support
- Event browsing and event details
- QR scanner flow for quick site access
- User authentication with Supabase
- Favorites support
- Gallery integration
- Multi-language support
- Safe-area aware mobile UI

## Project Structure

- `app/`
   - Expo Router screens and routes
   - `(auth)/` authentication screens
   - `(tabs)/` main tab navigation
   - `site/`, `event/`, and `accommodation/` detail pages
   - `scanner.tsx` QR scanner screen
- `src/context/`
   - authentication state management
- `src/lib/`
   - Supabase client setup
- `src/i18n/`
   - translations and language configuration
- `components/`
   - reusable UI building blocks
- `assets/`
   - app images and icons

## Requirements

- Node.js 18 or newer
- npm
- Android Studio emulator, a physical Android device, or iOS simulator on macOS

## Environment Variables

Create a `.env` file in the `mobile` folder:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The mobile app reads these values through Expo public environment variables.

## Installation

```bash
npm install
```

## Available Scripts

```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
npm run reset-project
```

## Running the App

Start the Expo development server:

```bash
npm run start
```

Run on Android:

```bash
npm run android
```

Run on iOS:

```bash
npm run ios
```

Run Expo web mode:

```bash
npm run web
```

Lint the project:

```bash
npm run lint
```

## Supabase Usage

The app uses Supabase for:

- authentication
- profile loading
- tourist sites
- events
- favorites
- reviews
- gallery data

The client is configured in `src/lib/supabase.ts` and persists sessions using AsyncStorage.

## Permissions and Native Notes

- Android audio recording permission is declared
- Image picker access is configured for gallery uploads
- Expo build properties are configured to avoid Android packaging conflicts for `libworklets.so`

## Notes

- The app uses Expo Router file-based navigation
- Supabase auth sessions are persisted locally on the device
- The QR scanner flow is part of the mobile visitor experience
- The project is configured for EAS through Expo app metadata

## License

Private project.
