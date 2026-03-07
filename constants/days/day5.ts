export type Apartment = {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  price: number;
  rooms: number;
  stars: number;
  rating: number;
  images: string[];
};

export const apartments: Apartment[] = [
  {
    id: "1",
    title: "Luxury Waterfront Apartment",
    description:
      "Stunning apartment with panoramic views of Lagos Lagoon. Modern furnishings, fully equipped kitchen, and a private balcony perfect for sunset watching.",
    latitude: 6.4541,
    longitude: 3.3947,
    price: 85000,
    rooms: 3,
    stars: 5,
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
    ],
  },
  {
    id: "2",
    title: "Modern Studio on Eko Atlantic",
    description:
      "Sleek and stylish studio apartment in the heart of Eko Atlantic. Walking distance to top restaurants, bars, and the beach.",
    latitude: 6.419,
    longitude: 3.41,
    price: 45000,
    rooms: 1,
    stars: 4,
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
    ],
  },
  {
    id: "3",
    title: "Cozy 2-Bedroom on Ahmadu Bello Way",
    description:
      "Charming apartment in Victoria Island's business district. Perfect for business travelers, with fast WiFi and a dedicated workspace.",
    latitude: 6.4281,
    longitude: 3.4219,
    price: 62000,
    rooms: 2,
    stars: 4,
    rating: 4.7,
    images: [
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    ],
  },
  {
    id: "4",
    title: "Penthouse Suite in Onikan",
    description:
      "Exquisite penthouse with 360-degree views of Lagos Island. Features a rooftop terrace, home theater, and concierge service.",
    latitude: 6.455,
    longitude: 3.387,
    price: 150000,
    rooms: 4,
    stars: 5,
    rating: 5.0,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6d349947?w=800",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
    ],
  },
  {
    id: "5",
    title: "Budget Studio in CMS",
    description:
      "Affordable and clean studio near CMS bus stop. Great transport links, close to the marina and local markets.",
    latitude: 6.451,
    longitude: 3.396,
    price: 18000,
    rooms: 1,
    stars: 3,
    rating: 4.1,
    images: [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
      "https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=800",
    ],
  },
  {
    id: "6",
    title: "Elegant Flat near Tafawa Balewa Square",
    description:
      "Beautifully decorated 2-bedroom flat steps away from Lagos Island's historic landmarks. Ideal for culture enthusiasts.",
    latitude: 6.453,
    longitude: 3.392,
    price: 55000,
    rooms: 2,
    stars: 4,
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
    ],
  },
  {
    id: "7",
    title: "Beachfront Apartment, Bar Beach",
    description:
      "Wake up to the sound of waves in this stunning beachfront apartment. Direct beach access, outdoor shower, and hammock terrace.",
    latitude: 6.433,
    longitude: 3.405,
    price: 95000,
    rooms: 3,
    stars: 5,
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
    ],
  },
  {
    id: "8",
    title: "Compact Studio near Five Cowries Creek",
    description:
      "Minimalist studio with serene creek views. Quiet neighborhood, perfect for a peaceful stay away from the city buzz.",
    latitude: 6.439,
    longitude: 3.418,
    price: 32000,
    rooms: 1,
    stars: 3,
    rating: 4.3,
    images: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
      "https://images.unsplash.com/photo-1533044309907-0fa3413da946?w=800",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
    ],
  },
  {
    id: "9",
    title: "Spacious Family Home in Ikoyi",
    description:
      "Gorgeous 4-bedroom home in leafy Ikoyi. Private pool, fully staffed, and surrounded by lush tropical gardens.",
    latitude: 6.449,
    longitude: 3.435,
    price: 200000,
    rooms: 4,
    stars: 5,
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800",
    ],
  },
  {
    id: "10",
    title: "Modern 3-Bedroom in Falomo",
    description:
      "Contemporary apartment near Falomo Shopping Centre. Gym access, 24/7 security, and underground parking included.",
    latitude: 6.444,
    longitude: 3.429,
    price: 78000,
    rooms: 3,
    stars: 4,
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1630699375938-c1b72a3f12ad?w=800",
      "https://images.unsplash.com/photo-1594484208280-efa00f96fc21?w=800",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800",
    ],
  },
  {
    id: "11",
    title: "Heritage Loft in Lagos Island Core",
    description:
      "Unique loft inside a converted colonial building. High ceilings, exposed brick walls, and original hardwood floors.",
    latitude: 6.456,
    longitude: 3.39,
    price: 42000,
    rooms: 2,
    stars: 4,
    rating: 4.4,
    images: [
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?w=800",
      "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=800",
      "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800",
    ],
  },
  {
    id: "12",
    title: "Quiet Retreat near National Museum",
    description:
      "Peaceful 1-bedroom near the National Museum. Surrounded by art galleries and cultural centers, ideal for creative professionals.",
    latitude: 6.452,
    longitude: 3.3855,
    price: 28000,
    rooms: 1,
    stars: 3,
    rating: 4.2,
    images: [
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800",
    ],
  },
];

// constants/days/day5.ts  — add this at the bottom

export const day5Content = `# Day 5 — Maps, Markers & Animated Bottom Sheet

Today we built an **Airbnb-style map screen** for Lagos Island using React Native Maps and a dynamic bottom sheet.

---

## What We Built

A full map experience with:

- Custom price markers on the map
- Tap a marker to select an apartment
- Animated bottom sheet listing all apartments
- Map height and zoom driven by the sheet position in real time

---

## Libraries Used

| Library | Purpose |
|---|---|
| \`react-native-maps\` | Map and markers |
| \`@gorhom/bottom-sheet\` | Animated bottom sheet |
| \`react-native-reanimated\` | UI thread animations |

---

## Key Concepts

### 1. Custom Markers with State Lifting

Each marker needs to know which one is selected — but since markers are siblings, the state must live in the parent:

\`\`\`tsx
// ❌ wrong — each marker has isolated state
const [selected, setSelected] = useState("");

// ✅ correct — state lives in AirbnbScreen
const [selectedApartment, setSelectedApartment] = useState
  Apartment | undefined
>(undefined);
\`\`\`

### 2. tracksViewChanges Fix for Android

Android clips custom marker views on first render. The fix is to enable tracking briefly then disable it:

\`\`\`tsx
const [tracksViewChanges, setTracksViewChanges] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => setTracksViewChanges(false), 500);
  return () => clearTimeout(timer);
}, [isSelected]);

<Marker tracksViewChanges={tracksViewChanges}>
  <View>...</View>
</Marker>
\`\`\`

### 3. animatedPosition — the Core of Everything

\`\`\`tsx
const animatedPosition = useSharedValue(SCREEN_HEIGHT);

// pass to BottomSheet — it writes real-time Y position into this value
<BottomSheet animatedPosition={animatedPosition} />
\`\`\`

\`animatedPosition\` holds the Y coordinate of the sheet's top edge from the screen top. When sheet is closed it equals ~91% of screen height. When open it equals ~50%.

### 4. Map Height Snapped to Sheet

\`\`\`tsx
const animatedMapStyle = useAnimatedStyle(() => ({
  height: animatedPosition.value,  // map bottom = sheet top
}));
\`\`\`

Map height equals the sheet's Y position — so the map's bottom edge always touches the sheet's top. No overlap, no gap.

### 5. Zoom Driven by Sheet Position

\`\`\`tsx
const animatedProps = useAnimatedProps(() => {
  const latitudeDelta = interpolate(
    animatedPosition.value,
    [SNAP_OPEN, SNAP_CLOSED],  // sheet position range
    [0.09, 0.05],              // zoom out → zoom in
    Extrapolation.CLAMP,
  );
  return { region: { ...INITIAL_REGION, latitudeDelta } };
});

// AnimatedMapView needed to accept animatedProps
const AnimatedMapView = Animated.createAnimatedComponent(MapView);
<AnimatedMapView animatedProps={animatedProps} />
\`\`\`

### 6. BottomSheetFlatList for Scrollable Content

Regular \`FlatList\` conflicts with bottom sheet gestures. Always use the built-in version:

\`\`\`tsx
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";

<BottomSheetFlatList<Apartment>
  data={apartments}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ApartmentListItem apartment={item} />}
/>
\`\`\`

---

## The Animation Flow

\`\`\`
User drags sheet up
      ↓
animatedPosition decreases (Y moves toward screen top)
      ↓
      ├── animatedMapStyle  → height shrinks   (map bottom tracks sheet)
      └── animatedProps     → latitudeDelta++  (map zooms out)

User drags sheet down
      ↓
animatedPosition increases
      ↓
      ├── animatedMapStyle  → height grows     (map expands)
      └── animatedProps     → latitudeDelta--  (map zooms in)
\`\`\`

---

## Key Takeaways

- \`animatedPosition\` from \`@gorhom/bottom-sheet\` is a SharedValue — runs on the UI thread
- Map height = sheet Y position = bottom of map always touches top of sheet
- \`interpolate\` maps one range to another — sheet position → zoom level
- \`Extrapolation.CLAMP\` prevents values going beyond your defined range
- \`Animated.createAnimatedComponent()\` is needed to pass \`animatedProps\` to any component
- \`BottomSheetFlatList\` is mandatory for scrolling inside a bottom sheet
- Always lift selection state to the parent when siblings need to share it

> "Don't fight the UI thread. Join it." — Reanimated philosophy
`;
