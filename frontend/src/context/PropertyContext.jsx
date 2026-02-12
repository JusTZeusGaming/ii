import { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PropertyContext = createContext(null);

export function PropertyProvider({ children }) {
  const [searchParams] = useSearchParams();
  const [currentProperty, setCurrentProperty] = useState(null);
  const [propertySlug, setPropertySlug] = useState(() => {
    // Priority: URL param > localStorage > default
    const urlSlug = new URLSearchParams(window.location.search).get("struttura");
    const storedSlug = localStorage.getItem("current_property_slug");
    return urlSlug || storedSlug || "casa-brezza";
  });
  const [loading, setLoading] = useState(true);

  // Update slug from URL params
  useEffect(() => {
    const urlSlug = searchParams.get("struttura");
    if (urlSlug && urlSlug !== propertySlug) {
      setPropertySlug(urlSlug);
      localStorage.setItem("current_property_slug", urlSlug);
    }
  }, [searchParams]);

  // Fetch property data when slug changes
  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertySlug) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`${API}/properties/${propertySlug}`);
        setCurrentProperty(response.data);
        localStorage.setItem("current_property_slug", propertySlug);
        localStorage.setItem("current_property_data", JSON.stringify(response.data));
      } catch (error) {
        console.error("Error fetching property:", error);
        // Try to load from localStorage as fallback
        const cachedData = localStorage.getItem("current_property_data");
        if (cachedData) {
          setCurrentProperty(JSON.parse(cachedData));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertySlug]);

  const switchProperty = (slug) => {
    setPropertySlug(slug);
    localStorage.setItem("current_property_slug", slug);
  };

  const value = {
    currentProperty,
    propertySlug,
    switchProperty,
    loading,
    // Helper to build URLs with structure param
    buildUrl: (path) => {
      const separator = path.includes("?") ? "&" : "?";
      return `${path}${separator}struttura=${propertySlug}`;
    }
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error("useProperty must be used within PropertyProvider");
  }
  return context;
}

export default PropertyContext;
