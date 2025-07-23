const API_KEY = 'sk-2wCj6880513decaa911520';

export async function fetchPlants(searchTerm: string) {
  try {
    const response = await fetch(`https://perenual.com/api/species-list?key=${API_KEY}&q=${searchTerm}`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching plant data:', error);
    return [];
  }
}
