export type TouristPlace = {
  id: string;
  name: string;
  countryCode: string;
  countryName: string;
  stateOrRegion: string;
  latitude: number;
  longitude: number;
  categories: string[];
  description: string;
  imageUrl?: string;
  wikipediaUrl?: string;
  distanceKm?: number;
  source: "wikidata" | "opentripmap";
};

export type CountryOption = {
  code: string;
  name: string;
};

export function uniqueTouristPlaces(
  places: TouristPlace[]
): TouristPlace[] {
  const seen = new Set<string>();

  return places.filter((place) => {
    const key = `${place.name.toLowerCase()}-${place.latitude.toFixed(3)}-${place.longitude.toFixed(3)}`;

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
