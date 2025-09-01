export type Location = {
    id: string;
    name: string;
    address: string;
}

export async function fetchLocations(){
    const res = await fetch('/api/locations');

    if (!res.ok) {
    throw new Error('Failed to fetch locations');
    }
    const data = await res.json();
    return data as Location[];
}

export function getLocationsStatic(){
    return ['Alberta Park', 'Bald Hills Boat Ramp', 'Bellara - Pirate Park', 'Boat Ramp Cribb Park', 'Chambers Island'];
}