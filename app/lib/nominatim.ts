// utils/nominatim.ts
export async function searchAddress(query: string) {
  if (!query || query.length < 3) return [];

  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=au&limit=5&q=${encodeURIComponent(query)}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'rostering-app' 
    }
  });

  if (!res.ok) {
    console.error("Failed to fetch address suggestions");
    return [];
  }

  return await res.json();
}
