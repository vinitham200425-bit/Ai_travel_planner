export type TouristPlace = {
  id: string;
  name: string;
  countryCode: string;
  stateOrRegion: string;
  latitude: number;
  longitude: number;
  categories: string[];
  description: string;
  distanceKm?: number;
};

export const TOURISM_KINDS = [
  "interesting_places",
  "cultural",
  "historic",
  "natural",
  "religion",
  "architecture",
  "museums",
  "amusements",
  "sport",
  "beaches",
  "view_points",
  "water",
  "mountain_peaks",
  "national_parks",
].join(",");

export function humanizeKinds(kinds?: string): string[] {
  if (!kinds) return ["Tourist Place"];

  const ignored = new Set([
    "interesting_places",
    "other",
    "unclassified_objects",
    "tourist_facilities",
  ]);

  const labels = kinds
    .split(",")
    .map((kind) => kind.trim())
    .filter(Boolean)
    .filter((kind) => !ignored.has(kind))
    .map((kind) =>
      kind.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
    );

  return [...new Set(labels)].slice(0, 5).length
    ? [...new Set(labels)].slice(0, 5)
    : ["Tourist Place"];
}
