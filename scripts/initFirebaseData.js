/**
 * Smart Parking – Firebase Data Initialization Script
 *
 * Run with:
 *   node scripts/initFirebaseData.js
 *
 * Requires firebase-admin:
 *   npm install firebase-admin --save-dev
 *
 * Set your service account path:
 *   export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"
 *
 * OR use the Firebase Admin SDK with project ID directly (emulator mode).
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const path = require("path");

// ── Init Firebase Admin ────────────────────────────────────────────────────────
let app;
try {
  const serviceAccount = require(
    process.env.FIREBASE_SERVICE_ACCOUNT ||
      path.join(__dirname, "serviceAccountKey.json")
  );
  app = initializeApp({ credential: cert(serviceAccount) });
} catch {
  // Fallback to emulator / default credentials
  app = initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "spark-6a409" });
}

const db = getFirestore(app);

// ── Sample Data ────────────────────────────────────────────────────────────────

const PARKING_SITES = [
  {
    id: "lot1",
    name: "Central Mall Parking",
    latitude: 19.076,
    longitude: 72.877,
    address: "Central Mall Road, Mumbai",
    totalSlots: 18,
    hourlyRate: 40,
    amenities: ["WiFi", "Security", "EV Charging"],
  },
  {
    id: "lot2",
    name: "Tech Park P2",
    latitude: 19.082,
    longitude: 72.869,
    address: "Tech Park Road, Andheri",
    totalSlots: 24,
    hourlyRate: 30,
    amenities: ["Security", "CCTV"],
  },
  {
    id: "lot3",
    name: "Metro Hub Parking",
    latitude: 19.071,
    longitude: 72.883,
    address: "Metro Station Lane, Goregaon",
    totalSlots: 30,
    hourlyRate: 25,
    amenities: ["WiFi", "Covered", "24x7"],
  },
];

function generateSlots(parkingId, totalSlots) {
  const rows = ["A", "B", "C", "D", "E", "F"];
  const slotsPerRow = Math.ceil(totalSlots / rows.length);
  const slots = [];

  let count = 0;
  for (const row of rows) {
    for (let i = 1; i <= slotsPerRow && count < totalSlots; i++) {
      const slotId = `${row}${i}`;
      slots.push({
        slotId,
        parkingId,
        occupied: Math.random() < 0.35,   // ~35% occupied randomly
        reserved: false,
        updatedAt: Date.now(),
      });
      count++;
    }
  }
  return slots;
}

// ── Write to Firestore ─────────────────────────────────────────────────────────

async function initData() {
  console.log("🚀 Initializing Smart Parking Firebase data…\n");

  const batch = db.batch();

  // Write parking sites
  for (const site of PARKING_SITES) {
    const ref = db.collection("parkingSites").doc(site.id);
    batch.set(ref, site, { merge: true });
    console.log(`✅ Site: ${site.name}`);

    // Write slots for this site
    const slots = generateSlots(site.id, site.totalSlots);
    for (const slot of slots) {
      const slotRef = db
        .collection("parkingSlots")
        .doc(`${site.id}_${slot.slotId}`);
      batch.set(slotRef, slot, { merge: true });
    }
    console.log(`   └─ ${slots.length} slots created`);
  }

  await batch.commit();
  console.log("\n🎉 Firebase data initialized successfully!");
  console.log("Visit your Firebase Console to verify the data.");
  process.exit(0);
}

initData().catch((err) => {
  console.error("❌ Error initializing data:", err.message);
  process.exit(1);
});
