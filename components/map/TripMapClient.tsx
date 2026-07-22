"use client";

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import type {
  MapDestination,
  RouteData,
} from "@/types/map";
import RouteSummary from "./RouteSummary";

type Props = {
  destinations: MapDestination[];
};

type UserPosition = {
  latitude: number;
  longitude: number;
};

function createNumberedIcon(index: number): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 9999px;
        background: #2563eb;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,.35);
        font-weight: 700;
        font-size: 14px;
      ">
        ${index + 1}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
  });
}

const userIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 22px;
      height: 22px;
      border-radius: 9999px;
      background: #16a34a;
      border: 4px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,.35);
    "></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -15],
});

function FitMapToRoute({
  destinations,
  route,
  userPosition,
}: {
  destinations: MapDestination[];
  route: RouteData | null;
  userPosition: UserPosition | null;
}) {
  const map = useMap();

  useEffect(() => {
    const points: L.LatLngExpression[] = route
      ? route.geometry.coordinates.map(
          ([longitude, latitude]) =>
            [latitude, longitude] as [number, number]
        )
      : destinations.map(
          (destination) =>
            [
              destination.latitude,
              destination.longitude,
            ] as [number, number]
        );

    if (userPosition) {
      points.push([
        userPosition.latitude,
        userPosition.longitude,
      ]);
    }

    if (points.length === 1) {
      map.setView(points[0], 9, { animate: true });
      return;
    }

    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), {
        padding: [40, 40],
        maxZoom: 10,
        animate: true,
      });
    }
  }, [destinations, map, route, userPosition]);

  return null;
}

export default function TripMapClient({
  destinations,
}: Props) {
  const [route, setRoute] = useState<RouteData | null>(
    null
  );
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeWarning, setRouteWarning] = useState("");
  const [userPosition, setUserPosition] =
    useState<UserPosition | null>(null);
  const [locationLoading, setLocationLoading] =
    useState(false);

  const destinationKey = useMemo(
    () =>
      destinations
        .map(
          (destination) =>
            `${destination.id}:${destination.latitude}:${destination.longitude}`
        )
        .join("|"),
    [destinations]
  );

  const routePositions = useMemo(
    () =>
      route?.geometry.coordinates.map(
        ([longitude, latitude]) =>
          [latitude, longitude] as [number, number]
      ) ?? [],
    [route]
  );

  useEffect(() => {
    setRoute(null);
    setRouteWarning("");

    if (destinations.length < 2) return;

    const controller = new AbortController();

    async function loadRoute() {
      try {
        setRouteLoading(true);

        const response = await fetch("/api/maps/route", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ destinations }),
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to calculate the route."
          );
        }

        setRoute(data.route);
        setRouteWarning(data.warning ?? "");
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to calculate the route."
        );
      } finally {
        setRouteLoading(false);
      }
    }

    void loadRoute();

    return () => controller.abort();
    // destinationKey intentionally refreshes when coordinates change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationKey]);

  function showCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error(
        "Location access is not supported by this browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLoading(false);
        toast.success("Your current location is shown.");
      },
      (error) => {
        setLocationLoading(false);

        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied."
            : "Unable to get your current location.";

        toast.error(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }

  const firstDestination = destinations[0];

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col justify-between gap-3 border-b border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              🗺️ Interactive route map
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Click a numbered marker to view destination details.
            </p>
          </div>

          <button
            type="button"
            onClick={showCurrentLocation}
            disabled={locationLoading}
            className="rounded-xl border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-blue-950/40"
          >
            {locationLoading
              ? "Finding location..."
              : "📍 Show my location"}
          </button>
        </div>

        <MapContainer
          center={[
            firstDestination.latitude,
            firstDestination.longitude,
          ]}
          zoom={6}
          scrollWheelZoom
          className="h-[460px] w-full"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {destinations.map((destination, index) => (
            <Marker
              key={destination.id}
              position={[
                destination.latitude,
                destination.longitude,
              ]}
              icon={createNumberedIcon(index)}
            >
              <Popup>
                <div className="min-w-[190px]">
                  <p className="text-base font-bold">
                    {index + 1}. {destination.name}
                  </p>

                  {(destination.stateOrRegion ||
                    destination.countryName) && (
                    <p className="mt-1 text-sm">
                      {[
                        destination.stateOrRegion,
                        destination.countryName,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}

                  {destination.categories &&
                    destination.categories.length > 0 && (
                      <p className="mt-2 text-sm">
                        {destination.categories
                          .slice(0, 3)
                          .join(" · ")}
                      </p>
                    )}

                  <p className="mt-2 text-xs text-gray-500">
                    {destination.latitude.toFixed(5)},{" "}
                    {destination.longitude.toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {routePositions.length > 1 && (
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: "#2563eb",
                weight: 5,
                opacity: 0.85,
              }}
            />
          )}

          {!route &&
            destinations.length > 1 && (
              <Polyline
                positions={destinations.map(
                  (destination) => [
                    destination.latitude,
                    destination.longitude,
                  ]
                )}
                pathOptions={{
                  color: "#64748b",
                  weight: 3,
                  opacity: 0.65,
                  dashArray: "8 8",
                }}
              />
            )}

          {userPosition && (
            <Marker
              position={[
                userPosition.latitude,
                userPosition.longitude,
              ]}
              icon={userIcon}
            >
              <Popup>Your current location</Popup>
            </Marker>
          )}

          <FitMapToRoute
            destinations={destinations}
            route={route}
            userPosition={userPosition}
          />
        </MapContainer>
      </div>

      {destinations.length === 1 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Select at least two destinations to calculate a road
          route, distance and estimated driving time.
        </div>
      )}

      <RouteSummary
        route={route}
        loading={routeLoading}
        warning={routeWarning}
      />
    </div>
  );
}
