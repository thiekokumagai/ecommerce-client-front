import { useState, useEffect, useRef } from "react";

export interface AddressPrediction {
    placeId: string;
    mainText: string;
    secondaryText: string;
    fullText: string;
}

interface Props {
    value: string;
    onChange: (value: string) => void;
    onSelect: (prediction: AddressPrediction) => void;
}

const useAddressAutocomplete = ({ value, onChange, onSelect }: Props) => {
    const [predictions, setPredictions] = useState<AddressPrediction[]>([]);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        if (!value || value.trim().length < 3) {
            setPredictions([]);
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            setLoading(true);

            try {
                const res = await fetch(
                    "https://places.googleapis.com/v1/places:autocomplete",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Goog-Api-Key": import.meta.env.VITE_GOOGLE_MAPS_KEY,
                        },
                        body: JSON.stringify({
                            input: value.trim() + ", Campo Grande MS",
                            includedRegionCodes: ["br"],
                            languageCode: "pt-BR",
                            locationRestriction: {
                                circle: {
                                    center: {
                                        latitude: -20.4697, // Campo Grande
                                        longitude: -54.6201,
                                    },
                                    radius: 30000, // 30km (ajuste se quiser)
                                },
                            },
                        }),
                    }
                );

                if (!res.ok) {
                    console.error(await res.text());
                    setPredictions([]);
                    return;
                }

                const data = await res.json();

                const formatted = (data.suggestions || [])
                    .filter((s: any) => {
                        const text = s.placePrediction?.text?.text || "";
                        return text.toLowerCase().includes("campo grande");
                    })
                    .map((s: any) => ({
                        placeId: s.placePrediction.placeId,
                        mainText: s.placePrediction.structuredFormat?.mainText?.text || "",
                        secondaryText: s.placePrediction.structuredFormat?.secondaryText?.text || "",
                        fullText: s.placePrediction.text?.text || "",
                    }));

                setPredictions(formatted);
            } catch (err) {
                console.error(err);
                setPredictions([]);
            } finally {
                setLoading(false);
            }
        }, 350);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [value]);

    return {
        predictions,
        loading,
        handleSelect: (p: AddressPrediction) => {
            setPredictions([]);
            onSelect(p);
        },
    };
};

export default useAddressAutocomplete;