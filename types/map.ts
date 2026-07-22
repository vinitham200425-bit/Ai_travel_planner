export type MapDestination = {
  id: string;
  name: string;
  countryName?: string;
  stateOrRegion?: string;
  latitude: number;
  longitude: number;
  categories?: string[];
};

export type RouteLeg = {
  from: string;
  to: string;
  distanceMeters: number;
  durationSeconds: number;
};

export type RouteData = {
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  distanceMeters: number;
  durationSeconds: number;
  legs: RouteLeg[];
  source: "osrm" | "straight-line";
};
