const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Esempio di chiamata API
export const fetchAttractions = async () => {
  const response = await fetch(`${API_BASE_URL}/attractions`);
  return response.json();
};