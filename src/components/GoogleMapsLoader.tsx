import { useEffect } from "react";

declare global {
  interface Window {
    google?: {
      maps?: unknown;
    };
  }
}

const GOOGLE_MAPS_SCRIPT_ID = "google-maps-script";

const GoogleMapsLoader = () => {
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey || window.google?.maps) {
      return;
    }

    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=pt-BR&region=BR`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  return null;
};

export default GoogleMapsLoader;