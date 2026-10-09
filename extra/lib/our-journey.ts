/**
 * OUR JOURNEY CONTENT
 * Add photos and coverage links here.
 *
 * Photos: put files in /public/our-journey/ and add paths like:
 *   images: ["/our-journey/championship-2026-1.jpg"]
 *
 * Links: paste the full URL into the relevant url field.
 * You can add multiple links to each event. Leave images or links as []
 * when that type of media is not available.
 */

export type JourneyLink = {
  label: string;
  url: string;
  platform?: "YouTube" | "Instagram" | "Other";
};

export type JourneyItem = {
  id: string;
  title: string;
  description: string;
  images: string[];
  links: JourneyLink[];
};

export type JourneyCategory = {
  id: string;
  title: string;
  intro: string;
  items: JourneyItem[];
};

export const OUR_JOURNEY: JourneyCategory[] = [
  {
    id: "tournament-2025",
    title: "Mainstream Basketball Tournament 2025",
    intro: "A look back at the tournament through event coverage, photos, and standout moments.",
    items: [
      {
        id: "mbt-2025",
        title: "Mainstream Basketball Tournament 2025",
        description: "Add a short recap of the tournament here when ready.",
        images: [],
        links: [
          // Example: { label: "Instagram Reel — Tournament Recap", url: "https://www.instagram.com/reel/PASTE_LINK_HERE/", platform: "Instagram" },
        ],
      },
    ],
  },
  {
    id: "championship-2026",
    title: "Mainstream Basketball Championship 2026",
    intro: "Championship coverage, highlights, and photographs from the club’s major event.",
    items: [
      {
        id: "mbc-2026",
        title: "Mainstream Basketball Championship 2026",
        description: "Add the Championship recap and any verified stats here.",
        images: [],
        links: [
          // Add YouTube, Instagram Reel, and other coverage links here.
        ],
      },
    ],
  },
  {
    id: "featured-tournaments",
    title: "Tournaments Mainstream Featured In",
    intro: "Coverage of tournaments and basketball events where Mainstream has participated or been featured.",
    items: [
      {
        id: "educational-basketball",
        title: "Educational Basketball",
        description: "Add a short note about Mainstream’s feature or participation here.",
        images: [],
        links: [
          // Example: { label: "Instagram Reel — Educational Basketball", url: "https://www.instagram.com/reel/PASTE_LINK_HERE/", platform: "Instagram" },
        ],
      },
      {
        id: "other-featured-tournaments",
        title: "More featured tournaments",
        description: "Add more tournaments by copying this item structure.",
        images: [],
        links: [],
      },
    ],
  },
  {
    id: "friendlies",
    title: "Friendlies",
    intro: "Friendly games, training matchups, and basketball connections with other teams and programmes.",
    items: [
      {
        id: "vgc-friendlies",
        title: "VGC Friendlies",
        description: "Add a short recap of friendly games with VGC here.",
        images: [],
        links: [],
      },
      {
        id: "educational-basketball-friendlies",
        title: "Educational Basketball Friendlies",
        description: "Add a short recap of friendly games with Educational Basketball here.",
        images: [],
        links: [],
      },
    ],
  },
];
