export interface IdCategory {
  slug: string;
  name: string;
  description: string;
  image: string;
  // Second image shown on hover (slides in next to `image`). Falls back to
  // `image` if not set, so this is safe to leave out temporarily.
  image2?: string;
}

export const idCardCategories: IdCategory[] = [
  {
    slug: "corporate",
    name: "Corporate Identity Cards",
    description: "Employee ID cards for offices and businesses.",
    image: "/id-cards/display/office_1.webp",
    image2: "/id-cards/display/office_2.webp",
  },
  {
    slug: "school",
    name: "School ID's",
    description: "Student and staff ID cards for schools & colleges.",
    image: "/id-cards/display/school_1.webp",
    image2: "/id-cards/display/school_2.webp",
  },
  {
    slug: "event",
    name: "Event ID's",
    description: "Access badges and passes for events & conferences.",
    image: "/id-cards/display/event_1.webp",
    image2: "/id-cards/display/event_2.webp",
  },
  // add more here
];

export function getCategoryBySlug(slug: string) {
  return idCardCategories.find((c) => c.slug === slug);
}