import type { MapDestination, RouteData, RouteLeg } from "@/types/map";

const EARTH_RADIUS_KM = 6371;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function calculateStraightLineDistanceKm(
  first: MapDestination,
  second: MapDestination
): number {
  const latitudeDifference = toRadians(second.latitude - first.latitude);
  const longitudeDifference = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  return EARTH_RADIUS_KM *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function createStraightLineRoute(
  destinations: MapDestination[]
): RouteData {
  const legs: RouteLeg[] = [];
  let totalDistanceMeters = 0;
  let totalDurationSeconds = 0;

  for (let index = 0; index < destinations.length - 1; index += 1) {
    const from = destinations[index];
    const to = destinations[index + 1];
    const distanceMeters =
      calculateStraightLineDistanceKm(from, to) * 1000;
    const durationSeconds =
      (distanceMeters / 1000 / 55) * 3600;

    legs.push({
      from: from.name,
      to: to.name,
      distanceMeters,
      durationSeconds,
    });

    totalDistanceMeters += distanceMeters;
    totalDurationSeconds += durationSeconds;
  }

  return {
    geometry: {
      type: "LineString",
      coordinates: destinations.map((destination) => [
        destination.longitude,
        destination.latitude,
      ]),
    },
    distanceMeters: totalDistanceMeters,
    durationSeconds: totalDurationSeconds,
    legs,
    source: "straight-line",
  };
}

export function formatDistance(distanceMeters: number): string {
  const kilometres = distanceMeters / 1000;

  if (kilometres < 1) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${kilometres.toFixed(kilometres >= 100 ? 0 : 1)} km`;
}

export function formatDuration(durationSeconds: number): string {
  const totalMinutes = Math.max(1, Math.round(durationSeconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;

  return `${hours} hr ${minutes} min`;
}
