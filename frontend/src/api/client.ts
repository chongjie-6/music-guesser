export async function apiGet(endpoint: string) {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + endpoint, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`API GET request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (e) {
    console.log("API GET request error: ", e);
  }
}
