const API =
  import.meta.env.VITE_API_URL ||
  "https://cadatro-de-visitantes-e-gest-o-de.onrender.com";

if (!import.meta.env.VITE_API_URL) {
  console.warn("⚠️ VITE_API_URL não definida. Usando URL de fallback.");
}

export const API_URL = `${API}/api`;
export default API;