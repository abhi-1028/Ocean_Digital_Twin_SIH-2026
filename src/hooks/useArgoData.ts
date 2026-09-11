import { useEffect, useState } from "react";

import { getArgoData } from "../api/oceanApi";
import { mockArgoObservations } from "../data/mockData";

import type { ArgoObservation } from "../types/ocean";

interface UseArgoDataResult {
  observations: ArgoObservation[];
  loading: boolean;
  error: string | null;
  source: "observation" | "mock";
}

export function useArgoData(
  regionId: string
): UseArgoDataResult {
  const [observations, setObservations] =
    useState<ArgoObservation[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [source, setSource] =
    useState<"observation" | "mock">("mock");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const data = await getArgoData(regionId);

        if (cancelled) return;

        if (
          data.observations &&
          data.observations.length > 0
        ) {
          setObservations(data.observations);
          setSource(data.source || "observation");
        } else {
          const filteredMock =
            mockArgoObservations.filter(
              (observation) =>
                observation.regionId === regionId
            );

          setObservations(filteredMock);
          setSource("mock");
        }
      } catch (err) {
        if (cancelled) return;

        const filteredMock =
          mockArgoObservations.filter(
            (observation) =>
              observation.regionId === regionId
          );

        setObservations(filteredMock);
        setSource("mock");

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Argo observations."
        );

        console.warn(
          `Argo backend unavailable for ${regionId}. Using mock data.`
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
  }, [regionId]);

  return {
    observations,
    loading,
    error,
    source,
  };
}