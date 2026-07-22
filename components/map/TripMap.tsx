"use client";

import dynamic from "next/dynamic";
import type { MapDestination } from "@/types/map";

const TripMapClient = dynamic(
  () => import("./TripMapClient"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[460px] items-center justify-center rounded-3xl border border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        Loading interactive map...
      </div>
    ),
  }
);

type Props = {
  destinations: MapDestination[];
};

export default function TripMap({
  destinations,
}: Props) {
  if (destinations.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Select destinations to display them on the map.
      </div>
    );
  }

  return <TripMapClient destinations={destinations} />;
}
