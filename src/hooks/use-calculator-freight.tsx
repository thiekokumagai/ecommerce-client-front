import { useCallback, useState } from "react";

const ORIGIN_ADDRESS =
    "Rua Glauce Rocha, 539, Campo Grande, MS, Brasil";

const PRICING_TIERS = [
    { maxKm: 4, price: 10 },
    { maxKm: 6, price: 12 },
    { maxKm: 8, price: 15 },
    { maxKm: 12, price: 20 },
    { maxKm: 15, price: 22 },
    { maxKm: 17, price: 25 },
    { maxKm: 20, price: 30 },
    { maxKm: 32, price: 35 },
];

type FreightResult = {
    distanceKm: number;
    duration: string;
    freightPrice: number | null;
    error: string | null;
};

type FreightError = {
    error: string;
    distanceKm?: number;
};

function getFreightPrice(distanceKm: number): number | null {
    for (const tier of PRICING_TIERS) {
        if (distanceKm <= tier.maxKm) return tier.price;
    }
    return null;
}

function validateDistance(distanceKm: number): FreightError | null {

    const km = Math.round(distanceKm * 10) / 10;

    if (km > 32) {
        return {
            error: "Endereço fora da área de entrega (máximo 32km).",
            distanceKm: km,
        };
    }

    return null;
}

async function fetchRoute(destination: string) {
    const response = await fetch(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": import.meta.env.VITE_GOOGLE_MAPS_KEY,
                "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
            },
            body: JSON.stringify({
                origin: { address: ORIGIN_ADDRESS },
                destination: { address: destination },
                travelMode: "DRIVE",
            }),
        }
    );

    const data = await response.json();

    if (!response.ok || !data.routes?.length) {
        throw new Error("Não foi possível calcular a rota");
    }

    return data.routes[0];
}

export function useFreight() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [distanceKm, setDistanceKm] = useState<number | null>(null);
    const [price, setPrice] = useState<number | null>(null);

    const calculate = useCallback(async (destination: string) => {
        try {
            setLoading(true);
            setError(null);

            if (!destination) {
                setError("Endereço de destino é obrigatório");
                return null;
            }

            const route = await fetchRoute(destination);

            const km = route.distanceMeters / 1000;
            const duration = route.duration;

            const validationError = validateDistance(km);
            if (validationError) return validationError;
            const freightPrice = getFreightPrice(km);

            const result: FreightResult = {
                distanceKm: Math.round(km * 10) / 10,
                duration,
                freightPrice,
                error: null,
            };

            setDistanceKm(result.distanceKm);
            setPrice(result.freightPrice);
            setError(null);

            return result;
        } catch (err) {
            setError("Erro ao calcular frete");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        calculate,
        loading,
        error,
        distanceKm,
        price,
    };
}