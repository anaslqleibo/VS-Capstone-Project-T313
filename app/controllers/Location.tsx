export type Location = {
  id: string;
  name: string;
  address: string;
  notes?: string;
};

// Fetches the full list of locations from the API
export async function fetchLocations(): Promise<Location[]> {
  const res = await fetch('/api/locations');

  if (!res.ok) {
    throw new Error('Failed to fetch locations');
  }

  const data = await res.json();
  return data as Location[];
}

// Optional: returns a hardcoded static list (can be removed if unused)
export function getLocationsStatic(): string[] {
  return [
    'Alberta Park',
    'Bald Hills Boat Ramp',
    'Bellara - Pirate Park',
    'Boat Ramp Cribb Park',
    'Chambers Island',
  ];
}
