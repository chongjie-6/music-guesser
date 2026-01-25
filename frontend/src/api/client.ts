import axios from "axios";
import constructQueryString from "./utils";

const API_URL = import.meta.env.VITE_API_URL;

export async function apiGet(
  endpoint: string,
  queryParams?: Record<string, string>,
) {
  try {
    const finalEndpoint =
      API_URL + endpoint + constructQueryString(queryParams);

    const response = await axios.get(finalEndpoint, {
      method: "GET",
    });

    if (response.status !== 200) {
      throw new Error(`API GET request failed ${response.statusText}`);
    }

    return response.data;
  } catch (e) {
    console.log("API GET request error: ", e);
  }
}

export async function apiPost(
  endpoint: string,
  body?: Record<string, unknown>,
) {
  try {
    const finalEndpoint = API_URL + endpoint;

    const response = await axios.post(finalEndpoint, body, {
      method: "POST",
    });
    console.log(response);

    return response.data;
  } catch (e) {
    console.log("API POST request error: ", e);
  }
}
