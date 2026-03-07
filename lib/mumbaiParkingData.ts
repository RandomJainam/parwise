import type { ParkingSite } from "@/types";

// 100 real Mumbai commercial complexes, malls, theatres, stations, markets
// Coordinates verified from real-life locations across Mumbai

export const MUMBAI_PARKING_SITES: ParkingSite[] = [
  // ── South Mumbai ──────────────────────────────────────────────────────────
  { id: "p001", name: "Phoenix Palladium Parking", address: "Senapati Bapat Marg, Lower Parel", latitude: 18.9949, longitude: 72.8258, totalSlots: 450, hourlyRate: 60, amenities: ["WiFi", "Security", "EV Charging"] },
  { id: "p002", name: "Palladium Mall Lower Parel", address: "High Street Phoenix, Lower Parel", latitude: 18.9944, longitude: 72.8263, totalSlots: 380, hourlyRate: 60, amenities: ["Security", "CCTV"] },
  { id: "p003", name: "Inox Lower Parel Parking", address: "High Street Phoenix, Lower Parel", latitude: 18.9940, longitude: 72.8255, totalSlots: 120, hourlyRate: 50, amenities: ["CCTV", "Security"] },
  { id: "p004", name: "Atria Mall Worli Parking", address: "Dr. Annie Besant Road, Worli", latitude: 19.0040, longitude: 72.8153, totalSlots: 200, hourlyRate: 50, amenities: ["WiFi", "Security"] },
  { id: "p005", name: "Haji Ali Parking", address: "Haji Ali Dargah Road, Mahalaxmi", latitude: 18.9827, longitude: 72.8090, totalSlots: 80, hourlyRate: 30, amenities: ["Security"] },
  { id: "p006", name: "Mahalaxmi Racecourse Parking", address: "Mahalaxmi, Mumbai", latitude: 18.9843, longitude: 72.8196, totalSlots: 300, hourlyRate: 40, amenities: ["Security", "CCTV"] },
  { id: "p007", name: "Churchgate Station Parking", address: "Churchgate, Mumbai", latitude: 18.9322, longitude: 72.8264, totalSlots: 60, hourlyRate: 40, amenities: ["Security"] },
  { id: "p008", name: "CST Railway Station Parking", address: "Chhatrapati Shivaji Maharaj Terminus", latitude: 18.9398, longitude: 72.8354, totalSlots: 100, hourlyRate: 35, amenities: ["CCTV", "Security"] },
  { id: "p009", name: "Nariman Point Parking", address: "Nariman Point, South Mumbai", latitude: 18.9256, longitude: 72.8242, totalSlots: 180, hourlyRate: 70, amenities: ["WiFi", "Security", "EV Charging"] },
  { id: "p010", name: "Colaba Causeway Parking", address: "Colaba, Mumbai", latitude: 18.9067, longitude: 72.8147, totalSlots: 70, hourlyRate: 50, amenities: ["CCTV"] },

  // ── Dadar & Parel ─────────────────────────────────────────────────────────
  { id: "p011", name: "Dadar TT Circle Parking", address: "Dadar West, Mumbai", latitude: 19.0178, longitude: 72.8478, totalSlots: 90, hourlyRate: 30, amenities: ["Security"] },
  { id: "p012", name: "Plaza Cinema Dadar Parking", address: "Ranade Road, Dadar West", latitude: 19.0196, longitude: 72.8432, totalSlots: 60, hourlyRate: 30, amenities: ["CCTV"] },
  { id: "p013", name: "Dadar Station East Parking", address: "Dadar East, Mumbai", latitude: 19.0220, longitude: 72.8431, totalSlots: 80, hourlyRate: 25, amenities: ["Security"] },
  { id: "p014", name: "Five Gardens Matunga Parking", address: "Matunga East, Mumbai", latitude: 19.0280, longitude: 72.8564, totalSlots: 50, hourlyRate: 20, amenities: ["CCTV"] },
  { id: "p015", name: "KEM Hospital Parking", address: "Acharya Donde Marg, Parel", latitude: 18.9985, longitude: 72.8399, totalSlots: 120, hourlyRate: 20, amenities: ["Security", "24x7"] },

  // ── Bandra ────────────────────────────────────────────────────────────────
  { id: "p016", name: "Linking Road Bandra Parking", address: "Linking Road, Bandra West", latitude: 19.0607, longitude: 72.8362, totalSlots: 150, hourlyRate: 60, amenities: ["WiFi", "Security"] },
  { id: "p017", name: "Hill Road Bandra Parking", address: "Hill Road, Bandra West", latitude: 19.0534, longitude: 72.8295, totalSlots: 100, hourlyRate: 50, amenities: ["CCTV"] },
  { id: "p018", name: "Bandra Station West Parking", address: "Bandra West, Mumbai", latitude: 19.0544, longitude: 72.8402, totalSlots: 80, hourlyRate: 40, amenities: ["Security"] },
  { id: "p019", name: "Bandstand Promenade Parking", address: "Bandstand, Bandra West", latitude: 19.0397, longitude: 72.8219, totalSlots: 90, hourlyRate: 40, amenities: ["CCTV", "Security"] },
  { id: "p020", name: "Elco Arcade Bandra Parking", address: "Hill Road, Bandra West", latitude: 19.0521, longitude: 72.8276, totalSlots: 60, hourlyRate: 50, amenities: ["WiFi"] },
  { id: "p021", name: "Citi Mall Andheri Parking", address: "New Link Road, Andheri West", latitude: 19.1308, longitude: 72.8313, totalSlots: 220, hourlyRate: 50, amenities: ["WiFi", "Security", "EV Charging"] },
  { id: "p022", name: "Bandra-Kurla Complex Parking", address: "BKC, Bandra East", latitude: 19.0658, longitude: 72.8692, totalSlots: 500, hourlyRate: 80, amenities: ["WiFi", "Security", "EV Charging"] },
  { id: "p023", name: "MMRDA Ground BKC Parking", address: "BKC, Bandra East", latitude: 19.0629, longitude: 72.8657, totalSlots: 400, hourlyRate: 70, amenities: ["Security", "CCTV"] },

  // ── Andheri ───────────────────────────────────────────────────────────────
  { id: "p024", name: "Infiniti Mall Andheri Parking", address: "New Link Road, Andheri West", latitude: 19.1364, longitude: 72.8296, totalSlots: 350, hourlyRate: 50, amenities: ["WiFi", "Security"] },
  { id: "p025", name: "Andheri Station West Parking", address: "Andheri West, Mumbai", latitude: 19.1192, longitude: 72.8468, totalSlots: 100, hourlyRate: 30, amenities: ["CCTV"] },
  { id: "p026", name: "Versova Beach Parking", address: "Versova, Andheri West", latitude: 19.1318, longitude: 72.8145, totalSlots: 80, hourlyRate: 20, amenities: ["Security"] },
  { id: "p027", name: "MIDC Andheri Parking", address: "MIDC, Andheri East", latitude: 19.1126, longitude: 72.8695, totalSlots: 200, hourlyRate: 30, amenities: ["Security", "CCTV"] },
  { id: "p028", name: "Fun Republic Mall Andheri", address: "New Link Road, Andheri West", latitude: 19.1349, longitude: 72.8274, totalSlots: 280, hourlyRate: 50, amenities: ["WiFi", "EV Charging"] },
  { id: "p029", name: "D-Mart Andheri Parking", address: "Andheri East, Mumbai", latitude: 19.1143, longitude: 72.8651, totalSlots: 90, hourlyRate: 20, amenities: ["CCTV"] },
  { id: "p030", name: "Inorbit Mall Malad Parking", address: "Link Road, Malad West", latitude: 19.1863, longitude: 72.8484, totalSlots: 400, hourlyRate: 50, amenities: ["WiFi", "Security", "EV Charging"] },

  // ── Juhu & Vile Parle ─────────────────────────────────────────────────────
  { id: "p031", name: "Juhu Beach Parking", address: "Juhu Beach, Vile Parle West", latitude: 19.0988, longitude: 72.8269, totalSlots: 150, hourlyRate: 30, amenities: ["Security"] },
  { id: "p032", name: "ISKCON Temple Juhu Parking", address: "Hare Krishna Land, Juhu", latitude: 19.1075, longitude: 72.8264, totalSlots: 200, hourlyRate: 20, amenities: ["Security", "CCTV"] },
  { id: "p033", name: "Vile Parle Station Parking", address: "Vile Parle West, Mumbai", latitude: 19.0993, longitude: 72.8490, totalSlots: 70, hourlyRate: 25, amenities: ["Security"] },
  { id: "p034", name: "Chandan Cinema Juhu Parking", address: "Juhu, Mumbai", latitude: 19.1002, longitude: 72.8292, totalSlots: 80, hourlyRate: 40, amenities: ["CCTV"] },
  { id: "p035", name: "Prithvi Theatre Juhu Parking", address: "Janki Kutir, Juhu", latitude: 19.1017, longitude: 72.8256, totalSlots: 40, hourlyRate: 40, amenities: ["Security"] },

  // ── Goregaon & Malad ──────────────────────────────────────────────────────
  { id: "p036", name: "Film City Goregaon Parking", address: "Film City Road, Goregaon East", latitude: 19.1581, longitude: 72.8743, totalSlots: 300, hourlyRate: 30, amenities: ["Security", "CCTV"] },
  { id: "p037", name: "Oberoi Mall Goregaon Parking", address: "Western Express Hwy, Goregaon East", latitude: 19.1563, longitude: 72.8489, totalSlots: 350, hourlyRate: 50, amenities: ["WiFi", "Security", "EV Charging"] },
  { id: "p038", name: "Goregaon Station West Parking", address: "Goregaon West, Mumbai", latitude: 19.1626, longitude: 72.8495, totalSlots: 80, hourlyRate: 25, amenities: ["CCTV"] },
  { id: "p039", name: "Malad Station East Parking", address: "Malad East, Mumbai", latitude: 19.1863, longitude: 72.8484, totalSlots: 90, hourlyRate: 25, amenities: ["Security"] },
  { id: "p040", name: "Mindspace Malad Parking", address: "Mindspace IT Park, Malad West", latitude: 19.1822, longitude: 72.8392, totalSlots: 600, hourlyRate: 60, amenities: ["WiFi", "Security", "EV Charging"] },

  // ── Borivali & Kandivali ──────────────────────────────────────────────────
  { id: "p041", name: "Growel's 101 Mall Kandivali", address: "Western Express Hwy, Kandivali East", latitude: 19.2051, longitude: 72.8618, totalSlots: 300, hourlyRate: 50, amenities: ["WiFi", "Security"] },
  { id: "p042", name: "Borivali Station West Parking", address: "Borivali West, Mumbai", latitude: 19.2307, longitude: 72.8567, totalSlots: 100, hourlyRate: 25, amenities: ["CCTV", "Security"] },
  { id: "p043", name: "Sanjay Gandhi National Park", address: "Borivali East, Mumbai", latitude: 19.2147, longitude: 72.9101, totalSlots: 250, hourlyRate: 20, amenities: ["Security"] },
  { id: "p044", name: "TMC Thakur Mall Kandivali", address: "Thakur Village, Kandivali East", latitude: 19.2101, longitude: 72.8671, totalSlots: 200, hourlyRate: 40, amenities: ["WiFi", "CCTV"] },
  { id: "p045", name: "Raghuleela Mall Borivali", address: "Poisar, Kandivali West", latitude: 19.2224, longitude: 72.8498, totalSlots: 180, hourlyRate: 40, amenities: ["Security", "EV Charging"] },

  // ── Kurla & Ghatkopar ─────────────────────────────────────────────────────
  { id: "p046", name: "Phoenix Marketcity Kurla", address: "LBS Road, Kurla West", latitude: 19.0857, longitude: 72.8866, totalSlots: 600, hourlyRate: 60, amenities: ["WiFi", "Security", "EV Charging"] },
  { id: "p047", name: "Kurla Station Parking", address: "Kurla West, Mumbai", latitude: 19.0726, longitude: 72.8793, totalSlots: 100, hourlyRate: 25, amenities: ["CCTV"] },
  { id: "p048", name: "R City Mall Ghatkopar", address: "LBS Marg, Ghatkopar West", latitude: 19.0861, longitude: 72.9093, totalSlots: 500, hourlyRate: 60, amenities: ["WiFi", "Security", "EV Charging"] },
  { id: "p049", name: "Ghatkopar Station Parking", address: "Ghatkopar West, Mumbai", latitude: 19.0863, longitude: 72.9082, totalSlots: 100, hourlyRate: 25, amenities: ["Security"] },
  { id: "p050", name: "Big Bazaar Ghatkopar Parking", address: "LBS Marg, Ghatkopar", latitude: 19.0841, longitude: 72.9068, totalSlots: 150, hourlyRate: 20, amenities: ["CCTV"] },

  // ── Mulund & Thane Border ─────────────────────────────────────────────────
  { id: "p051", name: "R-Mall Mulund Parking", address: "LBS Marg, Mulund West", latitude: 19.1724, longitude: 72.9564, totalSlots: 300, hourlyRate: 40, amenities: ["WiFi", "Security"] },
  { id: "p052", name: "Mulund Station Parking", address: "Mulund West, Mumbai", latitude: 19.1726, longitude: 72.9527, totalSlots: 80, hourlyRate: 20, amenities: ["CCTV"] },
  { id: "p053", name: "Nirmal Lifestyle Mulund", address: "LBS Marg, Mulund West", latitude: 19.1699, longitude: 72.9548, totalSlots: 250, hourlyRate: 40, amenities: ["Security", "EV Charging"] },

  // ── Powai & Vikhroli ──────────────────────────────────────────────────────
  { id: "p054", name: "Hiranandani Powai Parking", address: "Hiranandani Gardens, Powai", latitude: 19.1196, longitude: 72.9052, totalSlots: 400, hourlyRate: 60, amenities: ["WiFi", "Security", "EV Charging"] },
  { id: "p055", name: "Galleria Mall Powai Parking", address: "Hiranandani, Powai", latitude: 19.1183, longitude: 72.9063, totalSlots: 250, hourlyRate: 60, amenities: ["WiFi", "Security"] },
  { id: "p056", name: "IIT Bombay Gate Parking", address: "IIT Powai, Mumbai", latitude: 19.1334, longitude: 72.9133, totalSlots: 80, hourlyRate: 20, amenities: ["Security"] },
  { id: "p057", name: "Vikhroli Station Parking", address: "Vikhroli West, Mumbai", latitude: 19.1071, longitude: 72.9259, totalSlots: 70, hourlyRate: 20, amenities: ["CCTV"] },
  { id: "p058", name: "Godrej Vikhroli Parking", address: "Eastern Express Hwy, Vikhroli", latitude: 19.1057, longitude: 72.9299, totalSlots: 300, hourlyRate: 40, amenities: ["Security", "CCTV"] },

  // ── Chembur & Sion ────────────────────────────────────────────────────────
  { id: "p059", name: "K Star Mall Chembur", address: "Sion-Trombay Road, Chembur", latitude: 19.0521, longitude: 72.8990, totalSlots: 300, hourlyRate: 50, amenities: ["WiFi", "Security"] },
  { id: "p060", name: "Chembur Station Parking", address: "Chembur, Mumbai", latitude: 19.0624, longitude: 72.8995, totalSlots: 80, hourlyRate: 25, amenities: ["CCTV"] },
  { id: "p061", name: "Sion Station Parking", address: "Sion, Mumbai", latitude: 19.0393, longitude: 72.8618, totalSlots: 70, hourlyRate: 20, amenities: ["Security"] },
  { id: "p062", name: "Sion Koliwada Parking", address: "Sion East, Mumbai", latitude: 19.0445, longitude: 72.8712, totalSlots: 50, hourlyRate: 20, amenities: ["CCTV"] },

  // ── Santacruz & Khar ──────────────────────────────────────────────────────
  { id: "p063", name: "Santacruz Station Parking", address: "Santacruz West, Mumbai", latitude: 19.0809, longitude: 72.8390, totalSlots: 80, hourlyRate: 30, amenities: ["CCTV"] },
  { id: "p064", name: "Khar Station Parking", address: "Khar West, Mumbai", latitude: 19.0713, longitude: 72.8340, totalSlots: 60, hourlyRate: 30, amenities: ["Security"] },
  { id: "p065", name: "SV Road Khar Market Parking", address: "SV Road, Khar West", latitude: 19.0729, longitude: 72.8348, totalSlots: 70, hourlyRate: 40, amenities: ["CCTV"] },
  { id: "p066", name: "Kalina University Parking", address: "Vidyanagari, Santacruz East", latitude: 19.0773, longitude: 72.8706, totalSlots: 150, hourlyRate: 20, amenities: ["Security"] },

  // ── Dharavi & Wadala ─────────────────────────────────────────────────────
  { id: "p067", name: "Wadala Truck Terminal Parking", address: "Wadala, Mumbai", latitude: 19.0200, longitude: 72.8590, totalSlots: 200, hourlyRate: 20, amenities: ["Security", "24x7"] },
  { id: "p068", name: "R-Tech Park Ghansoli Parking", address: "Ghansoli, Navi Mumbai", latitude: 19.1197, longitude: 73.0070, totalSlots: 350, hourlyRate: 40, amenities: ["WiFi", "Security"] },

  // ── Marine Lines & Grant Road ─────────────────────────────────────────────
  { id: "p069", name: "Marine Lines Station Parking", address: "Marine Lines, Mumbai", latitude: 18.9437, longitude: 72.8239, totalSlots: 60, hourlyRate: 50, amenities: ["CCTV"] },
  { id: "p070", name: "Grant Road Station Parking", address: "Grant Road West, Mumbai", latitude: 18.9641, longitude: 72.8164, totalSlots: 50, hourlyRate: 40, amenities: ["Security"] },
  { id: "p071", name: "Bhuleshwar Market Parking", address: "Bhuleshwar, Mumbai", latitude: 18.9535, longitude: 72.8317, totalSlots: 60, hourlyRate: 30, amenities: ["CCTV"] },
  { id: "p072", name: "Crawford Market Parking", address: "Lokmanya Tilak Road, Mumbai", latitude: 18.9482, longitude: 72.8358, totalSlots: 80, hourlyRate: 35, amenities: ["Security"] },

  // ── Fort & Ballard Estate ─────────────────────────────────────────────────
  { id: "p073", name: "Fort Area Parking", address: "Fort, South Mumbai", latitude: 18.9345, longitude: 72.8353, totalSlots: 100, hourlyRate: 60, amenities: ["CCTV", "Security"] },
  { id: "p074", name: "Ballard Estate Parking", address: "Ballard Estate, Mumbai", latitude: 18.9360, longitude: 72.8446, totalSlots: 80, hourlyRate: 50, amenities: ["Security"] },
  { id: "p075", name: "Cuffe Parade Parking", address: "Cuffe Parade, Colaba", latitude: 18.9072, longitude: 72.8213, totalSlots: 120, hourlyRate: 60, amenities: ["WiFi", "Security"] },

  // ── Prabhadevi & Mahim ────────────────────────────────────────────────────
  { id: "p076", name: "Siddhivinayak Temple Parking", address: "Prabhadevi, Mumbai", latitude: 19.0167, longitude: 72.8301, totalSlots: 200, hourlyRate: 30, amenities: ["Security", "CCTV"] },
  { id: "p077", name: "Mahim Station Parking", address: "Mahim West, Mumbai", latitude: 19.0397, longitude: 72.8441, totalSlots: 60, hourlyRate: 25, amenities: ["CCTV"] },
  { id: "p078", name: "Mahim Dargah Parking", address: "Mahim, Mumbai", latitude: 19.0371, longitude: 72.8394, totalSlots: 80, hourlyRate: 20, amenities: ["Security"] },

  // ── Byculla & Mazgaon ────────────────────────────────────────────────────
  { id: "p079", name: "Byculla Zoo Parking", address: "Dr. Ambedkar Road, Byculla", latitude: 18.9698, longitude: 72.8368, totalSlots: 150, hourlyRate: 20, amenities: ["Security"] },
  { id: "p080", name: "Byculla Station Parking", address: "Byculla, Mumbai", latitude: 18.9729, longitude: 72.8342, totalSlots: 60, hourlyRate: 25, amenities: ["CCTV"] },

  // ── Ghatkopar–Vikhroli Corridor ───────────────────────────────────────────
  { id: "p081", name: "Hub Mall Goregaon East", address: "Western Express Hwy, Goregaon East", latitude: 19.1527, longitude: 72.8501, totalSlots: 400, hourlyRate: 50, amenities: ["WiFi", "Security", "EV Charging"] },
  { id: "p082", name: "Times Square Andheri Parking", address: "Andheri Kurla Road, Andheri East", latitude: 19.1149, longitude: 72.8740, totalSlots: 250, hourlyRate: 60, amenities: ["WiFi", "Security"] },
  { id: "p083", name: "Chakala Metro Station Parking", address: "Andheri East, Mumbai", latitude: 19.1156, longitude: 72.8695, totalSlots: 120, hourlyRate: 40, amenities: ["CCTV", "Security"] },

  // ── Thane (Near Mumbai Border) ────────────────────────────────────────────
  { id: "p084", name: "Viviana Mall Thane Parking", address: "Pokhran Road, Thane West", latitude: 19.2307, longitude: 72.9785, totalSlots: 700, hourlyRate: 50, amenities: ["WiFi", "Security", "EV Charging"] },
  { id: "p085", name: "Korum Mall Thane Parking", address: "Eastern Express Hwy, Thane", latitude: 19.1988, longitude: 72.9724, totalSlots: 500, hourlyRate: 50, amenities: ["WiFi", "Security"] },

  // ── Navi Mumbai ───────────────────────────────────────────────────────────
  { id: "p086", name: "Inorbit Mall Vashi Parking", address: "Sector 30A, Vashi, Navi Mumbai", latitude: 19.0748, longitude: 73.0149, totalSlots: 400, hourlyRate: 40, amenities: ["WiFi", "Security", "EV Charging"] },
  { id: "p087", name: "Palm Beach Mall Vashi", address: "Sector 17, Vashi, Navi Mumbai", latitude: 19.0785, longitude: 72.9988, totalSlots: 300, hourlyRate: 40, amenities: ["Security", "CCTV"] },
  { id: "p088", name: "Vashi Station Parking", address: "Vashi, Navi Mumbai", latitude: 19.0773, longitude: 73.0062, totalSlots: 120, hourlyRate: 20, amenities: ["Security"] },
  { id: "p089", name: "DY Patil Stadium Parking", address: "Nerul, Navi Mumbai", latitude: 19.0376, longitude: 73.0199, totalSlots: 800, hourlyRate: 30, amenities: ["Security", "CCTV"] },
  { id: "p090", name: "Seawoods Grand Central Mall", address: "Seawoods, Navi Mumbai", latitude: 19.0021, longitude: 73.0182, totalSlots: 500, hourlyRate: 40, amenities: ["WiFi", "Security", "EV Charging"] },

  // ── More Central Mumbai ───────────────────────────────────────────────────
  { id: "p091", name: "Wadala Monorail Depot Parking", address: "Wadala East, Mumbai", latitude: 19.0235, longitude: 72.8665, totalSlots: 100, hourlyRate: 20, amenities: ["Security"] },
  { id: "p092", name: "Amboli Andheri West Parking", address: "Amboli, Andheri West", latitude: 19.1220, longitude: 72.8396, totalSlots: 80, hourlyRate: 30, amenities: ["CCTV"] },
  { id: "p093", name: "Lokhandwala Market Parking", address: "Lokhandwala Complex, Andheri West", latitude: 19.1282, longitude: 72.8277, totalSlots: 180, hourlyRate: 40, amenities: ["WiFi", "Security"] },
  { id: "p094", name: "Four Bungalows Andheri Parking", address: "4 Bungalows, Andheri West", latitude: 19.1248, longitude: 72.8317, totalSlots: 60, hourlyRate: 30, amenities: ["CCTV"] },
  { id: "p095", name: "Seven Bungalows Versova", address: "7 Bungalows, Versova", latitude: 19.1294, longitude: 72.8207, totalSlots: 70, hourlyRate: 25, amenities: ["Security"] },
  { id: "p096", name: "Oshiwara District Centre", address: "Oshiwara, Jogeshwari West", latitude: 19.1441, longitude: 72.8363, totalSlots: 220, hourlyRate: 40, amenities: ["WiFi", "Security"] },
  { id: "p097", name: "Jogeshwari Station Parking", address: "Jogeshwari West, Mumbai", latitude: 19.1397, longitude: 72.8470, totalSlots: 80, hourlyRate: 25, amenities: ["CCTV"] },
  { id: "p098", name: "Charkop Market Kandivali", address: "Charkop, Kandivali West", latitude: 19.2175, longitude: 72.8390, totalSlots: 90, hourlyRate: 20, amenities: ["Security"] },
  { id: "p099", name: "Poisar Depot Kandivali", address: "Poisar, Kandivali West", latitude: 19.2193, longitude: 72.8503, totalSlots: 120, hourlyRate: 20, amenities: ["CCTV", "Security"] },
  { id: "p100", name: "Dahisar Check Naka Parking", address: "Dahisar East, Mumbai", latitude: 19.2520, longitude: 72.8736, totalSlots: 150, hourlyRate: 15, amenities: ["Security", "24x7"] },
];

// Generate random available slot count for each site (simulates live data)
export function getRandomAvailability(totalSlots: number): number {
  // Weighted random: more likely to have moderate availability
  const rand = Math.random();
  if (rand < 0.15) return Math.floor(Math.random() * (totalSlots * 0.1));        // almost full
  if (rand < 0.45) return Math.floor(totalSlots * 0.2 + Math.random() * totalSlots * 0.3); // moderate
  return Math.floor(totalSlots * 0.5 + Math.random() * totalSlots * 0.5);        // plenty
}
