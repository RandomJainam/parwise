# 🚗 Smart Parking App

A real-time parking discovery and booking application built with **Next.js 14**, **Firebase Firestore**, and **React Leaflet**. ESP32 IoT sensors push live slot availability to the UI instantly.

![Tech Stack](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green?logo=leaflet)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)

---

## ✨ Features

- 🗺️ **Interactive Map** – OpenStreetMap with color-coded parking markers
- ⚡ **Real-time Updates** – ESP32 sensors → Firebase → UI with `onSnapshot`
- 🅿️ **Visual Slot Grid** – See exact slot layout with live occupancy
- 📅 **Park Now & Pre-book** – Immediate or scheduled parking
- 📋 **Booking History** – With expandable detail cards
- 👤 **Profile Management** – Editable user & vehicle info
- 📱 **Mobile-first** – Google Maps / Uber-style bottom sheets

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ → https://nodejs.org
- pnpm → `npm install -g pnpm`
- Firebase project → https://console.firebase.google.com

### 2. Clone & Install

```bash
git clone https://github.com/your-username/smart-parking-app.git
cd smart-parking-app

pnpm install
```

### 3. Firebase Setup

**a) Create Firebase Project**
1. Go to https://console.firebase.google.com
2. Create project → Enable Firestore Database
3. Go to Project Settings → General → Your Apps → Add Web App
4. Copy the config values

**b) Set Firestore Rules (Dev mode)**

In Firebase Console → Firestore → Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 4. Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="000000000000"
NEXT_PUBLIC_FIREBASE_APP_ID="1:000:web:xxx"
```

### 5. Initialize Sample Data

```bash
# Install firebase-admin for the script
pnpm add -D firebase-admin

# Download your service account key from Firebase Console
# Project Settings → Service Accounts → Generate new private key
# Save as scripts/serviceAccountKey.json

node scripts/initFirebaseData.js
```

This creates:
- 3 parking sites in Mumbai
- 18-30 slots per site with random initial occupancy

### 6. Run

```bash
pnpm dev
# → http://localhost:3000
```

---

## 📁 Project Structure

```
smart-parking-app/
├── app/
│   ├── layout.tsx          # Root layout + Leaflet CSS
│   ├── page.tsx            # Map home page
│   ├── globals.css         # Global styles
│   ├── history/
│   │   └── page.tsx        # Booking history
│   └── profile/
│       └── page.tsx        # User profile
├── components/
│   ├── ParkingMap.tsx      # Leaflet map + markers
│   ├── SearchBar.tsx       # Floating search + locate me
│   ├── ParkingBottomSheet.tsx  # Slide-up parking card
│   ├── SlotGrid.tsx        # Interactive slot layout
│   ├── BookingModal.tsx    # 3-step booking flow
│   └── Navbar.tsx          # Bottom navigation
├── hooks/
│   └── useFirestore.ts     # All Firebase queries & real-time hooks
├── lib/
│   ├── firebase.ts         # Firebase initialization
│   └── utils.ts            # Helper functions
├── types/
│   └── index.ts            # TypeScript types
├── scripts/
│   ├── initFirebaseData.js # Seed Firebase with sample data
│   └── esp32_sensor.ino    # Arduino firmware for ESP32
├── .env.local.example      # Environment template
├── firestore.rules         # Firebase security rules
└── package.json
```

---

## 🔌 ESP32 Integration

1. Open `scripts/esp32_sensor.ino` in Arduino IDE
2. Install libraries: `ArduinoJson` via Library Manager
3. Fill in your WiFi credentials and Firebase API key
4. Wire HC-SR04 sensor: TRIG → GPIO5, ECHO → GPIO18
5. Flash to ESP32 → it auto-pushes slot status every 3 seconds

**Data flow:**
```
HC-SR04 Sensor
     ↓
  ESP32 (WiFi)
     ↓ HTTPS PATCH
Firebase Firestore
     ↓ onSnapshot
  Next.js Web App
     ↓
  UI updates live
```

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `node scripts/initFirebaseData.js` | Seed Firebase |

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
pnpm add -g vercel
vercel
# Follow prompts, add env vars in Vercel dashboard
```

### Self-hosted

```bash
pnpm build
pnpm start
# Runs on port 3000
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install && pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

---

## 🗃️ Firestore Collections

| Collection | Description |
|-----------|-------------|
| `parkingSites` | Parking locations with coordinates |
| `parkingSlots` | Per-slot occupancy (updated by ESP32) |
| `bookings` | User booking records |

---

## 🔧 Troubleshooting

**Map not loading?**
- Ensure `leaflet/dist/leaflet.css` is imported in `layout.tsx`
- Check browser console for CSP errors

**Firebase permission denied?**
- Set Firestore rules to allow read/write (dev mode)
- Verify `.env.local` has correct values with `NEXT_PUBLIC_` prefix

**Markers not showing?**
- Run `node scripts/initFirebaseData.js` to seed parking sites
- Check Firestore console to confirm data exists

**ESP32 not sending data?**
- Verify WiFi credentials in `.ino` file
- Check Serial Monitor at 115200 baud for error messages
- Ensure Firebase API key is correct

---

## 📄 License

MIT
