# LOCO•MOTION

Albuquerque's local influencer marketplace. A streamlined platform connecting local businesses with trusted creators for authentic social media promotions.

## Core Concept

LOCO•MOTION is a local-only influencer marketplace that removes friction from influencer marketing:
- **No negotiations** - Fixed prices set by creators
- **No messaging back-and-forth** - Book instantly like Airbnb
- **No manual verification** - Posts are auto-verified
- **City-by-city expansion** - Starting with Albuquerque

## User Flows

### Creator Flow (Refined)
1. Tap "Earn as a Local Creator" on home screen
2. Connect Instagram → Profile auto-generated (photo, handle, followers, engagement)
3. Set prices using slider controls with suggested ranges based on follower count
4. Go live immediately and become bookable

### Business Flow (Refined)
1. Tap "Promote My Business" on home screen
2. Browse local creators (no signup required) with clear prices
3. Select creator → Choose ad slot & date
4. Checkout with account creation at payment
5. Receive Local Post Helper tips for ABQ-specific optimization

### Money & Trust
- Businesses pay at booking
- Platform holds funds (10% fee)
- Creators post within agreed window
- Posts are automatically verified
- Creators paid out after verification

## Features

### Home Screen
- Two clear CTAs: "Earn as a Local Creator" and "Promote My Business"
- Trust badges showing verified posts and fixed pricing

### Creator Onboarding
- Instagram connect flow (simulated)
- Auto-generated profile from IG data
- Slider-based pricing with suggested ranges
- Estimated earnings calculator

### Business Browse
- Browse creators before signup
- See follower counts, prices, and availability
- Checkout-first experience (Airbnb style)
- Local Post Helper tips after booking

### Local Post Helper
City-specific posting tips shared with creators:
- Best posting times for Albuquerque
- Local hashtags (#ABQ, #505, #Albuquerque, #BurqueFood)
- Geotag recommendations (Nob Hill, Old Town, UNM)

### Auto-Verification UI
- Visual indicator showing post verification in progress
- Automatic payout trigger on verification

## Tech Stack

- Expo SDK 53 / React Native 0.76.7
- Expo Router (file-based routing)
- Zustand (state management with AsyncStorage persistence)
- NativeWind / TailwindCSS (styling)
- React Native Reanimated (animations)
- Lucide React Native (icons)
- Expo Haptics (tactile feedback)

## Project Structure

```
src/
├── app/
│   ├── index.tsx              # Splash screen
│   ├── home.tsx               # Landing with two CTAs
│   ├── creator-onboard.tsx    # Instagram connect & pricing setup
│   ├── browse-creators.tsx    # Business browse (no signup)
│   ├── role-select.tsx        # Admin role selection
│   ├── business/
│   │   ├── index.tsx          # Business dashboard
│   │   ├── creator/[id].tsx   # Creator profile & slots
│   │   ├── booking/[slotId].tsx # Booking & payment
│   │   ├── confirmation.tsx   # Confirmation with Local Post Helper
│   │   └── my-bookings.tsx    # Business's bookings
│   ├── creator/
│   │   ├── index.tsx          # Creator dashboard
│   │   ├── slots.tsx          # Manage ad slots
│   │   ├── bookings.tsx       # View bookings with tips
│   │   └── upload-proof/[id].tsx # Upload proof of post
│   └── admin/
│       ├── index.tsx          # Admin dashboard
│       ├── creators.tsx       # Approve creators
│       └── bookings.tsx       # Manage all bookings
├── components/
│   ├── PillButton.tsx         # Animated button with haptics
│   ├── CreatorCard.tsx        # Creator display cards
│   └── SlotCard.tsx           # Ad slot display cards
└── lib/
    └── state/
        └── app-store.ts       # Zustand store
```

## Design System

- **Colors:** Black, white, with red accents (#ef4444)
- **Buttons:** Pill-shaped with subtle depth, red beam animation
- **Cards:** Clean with subtle shadows, rounded corners
- **Typography:** Bold headings, gray secondary text

## Data Models

### Creator
- name, photo, platform, followerCount, bio, city, approved

### AdSlot
- creatorId, type (story/reel/post), price, date, available

### Booking
- businessId, creatorId, slotId, slotType, date, price, status, proofUrl

## Mock Data

Pre-populated with Albuquerque creators:
- Sofia Martinez (38K followers) - Lifestyle & food
- Diego Romero (52K followers) - Outdoor adventure
- Mia Chavez (28K followers) - Fashion & beauty
- Carlos Sanchez (21K followers) - Food critic
- 1 pending creator for admin testing
- 10 available ad slots
