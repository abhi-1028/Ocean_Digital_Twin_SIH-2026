import { useEffect, useState } from "react";

import { getOceanData } from "../api/oceanApi";
import { mockOceanPoints } from "../data/mockData";

import type { OceanPoint, OceanVariable } from "../types/ocean";

interface UseOceanDataResult {
  points: OceanPoint[];
  loading: boolean;
  error: string | null;
  source: "model" | "mock";
}

export function useOceanData(
  regionId: string,
  variable: OceanVariable,
  depth: number
): UseOceanDataResult {
  const [points, setPoints] = useState<OceanPoint[]>(mockOceanPoints);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"model" | "mock">("mock");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const data = await getOceanData(regionId, variable, depth);

        if (cancelled) return;

        if (data.points && data.points.length > 0) {
          setPoints(data.points);
          setSource(data.source || "model");
        } else {
          setPoints(mockOceanPoints);
          setSource("mock");
        }
      } catch (err) {
        if (cancelled) return;

        console.warn(
          "Ocean backend unavailable. Using mock ocean data."
        );

        setPoints(mockOceanPoints);
        setSource("mock");

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load ocean data."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [regionId, variable, depth]);

  return {
    points,
    loading,
    error,
    source,
  };
}