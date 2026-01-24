# LocalPromote

An Airbnb-style marketplace for local influencer ad slots. Businesses can book fixed social media post slots from trusted local creators.

## Core Features

### Roles
1. **Business** - Browse creators, book ad slots, pay for promotions
2. **Creator** - Offer ad slots (Story/Reel/Post), manage availability, upload proof of posts
3. **Admin** - Approve creators, review proof submissions, mark bookings complete

### User Flows

**Business Flow:**
1. Select city → View creators → Select creator → View available slots
2. Select slot → Review booking details → Pay (Stripe Checkout)
3. Receive confirmation → View booking in "My Bookings"

**Creator Flow:**
1. Register → Await admin approval
2. Once approved: Add ad slots (type, price, date)
3. When booked: Upload proof of post → Await admin completion

**Admin Flow:**
1. Review pending creator applications → Approve/Reject
2. Review bookings with proof → Mark as complete

## Tech Stack

- Expo SDK 53 / React Native 0.76.7
- Expo Router (file-based routing)
- Zustand (state management with AsyncStorage persistence)
- NativeWind / TailwindCSS (styling)
- React Native Reanimated (animations)
- Lucide React Native (icons)

## Project Structure

```
src/
├── app/
│   ├── index.tsx              # Landing page
│   ├── role-select.tsx        # Role selection & login
│   ├── business/
│   │   ├── index.tsx          # Business home (browse creators)
│   │   ├── creator/[id].tsx   # Creator profile & slots
│   │   ├── booking/[slotId].tsx # Booking & payment
│   │   ├── confirmation.tsx   # Booking confirmation
│   │   └── my-bookings.tsx    # Business's bookings
│   ├── creator/
│   │   ├── index.tsx          # Creator dashboard
│   │   ├── slots.tsx          # Manage ad slots
│   │   ├── bookings.tsx       # View bookings
│   │   └── upload-proof/[id].tsx # Upload proof of post
│   └── admin/
│       ├── index.tsx          # Admin dashboard
│       ├── creators.tsx       # Approve creators
│       └── bookings.tsx       # Manage all bookings
├── components/
│   ├── PillButton.tsx         # Custom button with red beam animation
│   ├── CreatorCard.tsx        # Creator display cards
│   └── SlotCard.tsx           # Ad slot display cards
└── lib/
    └── state/
        └── app-store.ts       # Zustand store with all app state
```

## Design System

- **Colors:** Black and white only (high contrast, minimal)
- **Buttons:** Pill-shaped with subtle 3D depth, red beam animation on press
- **Cards:** Clean acrylic/glass effect with subtle shadows
- **Layout:** Mobile-first, horizontal scrolling sections

## Data Models

### Creator
- name, photo, platform (instagram/tiktok/facebook), followerCount, bio, city, approved

### AdSlot
- creatorId, type (story/reel/post), price, date, available

### Booking
- businessId, creatorId, slotId, slotType, date, price, status (pending/completed), proofUrl

## Mock Data

The app includes pre-populated mock data:
- 4 approved creators in Austin
- 1 pending creator for admin testing
- 10 available ad slots across creators
