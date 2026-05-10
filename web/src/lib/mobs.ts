import type { Mob } from "./types";

export const MOBS: Mob[] = [
  {
    slug: "kitchen",
    name: "Kitchen Mob",
    description: "Chaotic counter-tops, cereal-bowl bravado, choreographed pours.",
    vibeTags: ["pour-over", "cereal-bowl", "morning-light"],
    memberCount: 412,
    gradientClass: "grad-kitchen",
    accentHex: "#e98c5e",
  },
  {
    slug: "skate",
    name: "Skate Mob",
    description: "Ollies into milk crates, sunlit parks, slow-mo pours mid-grind.",
    vibeTags: ["concrete", "kickflip", "golden-hour"],
    memberCount: 289,
    gradientClass: "grad-skate",
    accentHex: "#5b6cff",
  },
  {
    slug: "beach",
    name: "Beach Mob",
    description: "Boardwalk sips, salt-air laughs, bottles cracked over surfboards.",
    vibeTags: ["coastline", "post-swim", "sunset"],
    memberCount: 198,
    gradientClass: "grad-beach",
    accentHex: "#ec8b5e",
  },
  {
    slug: "gym",
    name: "Gym Mob",
    description: "Post-set chuggs, locker-room toasts, recovery rituals.",
    vibeTags: ["chalked-hands", "barbell", "after-rep"],
    memberCount: 167,
    gradientClass: "grad-gym",
    accentHex: "#d6452f",
  },
  {
    slug: "dance",
    name: "Dance Mob",
    description: "Chassé into the fridge, choreography that ends in a sip.",
    vibeTags: ["studio-floor", "neon", "in-sync"],
    memberCount: 354,
    gradientClass: "grad-dance",
    accentHex: "#ff7ab8",
  },
  {
    slug: "pet",
    name: "Pet & Family Mob",
    description: "Toddlers with mustaches, golden retrievers with their own bowls.",
    vibeTags: ["porch-light", "spilled-and-laughing", "nap-after"],
    memberCount: 521,
    gradientClass: "grad-pet",
    accentHex: "#c39a64",
  },
  {
    slug: "art",
    name: "Art & Craft Mob",
    description: "Latte foam canvases, edible film studios, thirsty makers.",
    vibeTags: ["studio-window", "process-shot", "messy-table"],
    memberCount: 142,
    gradientClass: "grad-art",
    accentHex: "#e8b84b",
  },
  {
    slug: "outdoors",
    name: "Outdoors Mob",
    description: "Trail-side cartons, summit toasts, rain-pour rituals.",
    vibeTags: ["alpine", "from-the-thermos", "tail-wind"],
    memberCount: 233,
    gradientClass: "grad-outdoors",
    accentHex: "#4f7c4a",
  },
];

export function mobBySlug(slug: string): Mob | undefined {
  return MOBS.find((m) => m.slug === slug);
}
