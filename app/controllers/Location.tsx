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


export async function insertLocation(location: Location) {
  try{
    const res = await fetch(`/api/locations`,  {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify(location),
    });

    if (res.ok){
      const {id} = await res.json();
      return id;
    }
    else return false;
  } catch (err) {
    console.error('Failed to add new location.', err);
    return false;
  }
}


export async function deleteLocation(location_id: string) {
  try{
    const res = await fetch(`/api/locations`,  {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({id: location_id}),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to delete location details.', err);
    return false;
  }
}

export async function updateLocation(location: Location) {
  try{
    const res = await fetch(`/api/locations`,  {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(location),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to update location details.', err);
    return false;
  }
}
