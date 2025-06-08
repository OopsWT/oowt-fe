import qs from "qs";
import { getAuthToken } from "./get-token";
import { getStrapiURL } from "@/lib/utils";

export async function getAuthorLoader(authorId: string) {
  const baseUrl = getStrapiURL();

  const url = new URL(`/api/authors/${authorId}`, baseUrl);

  url.search = qs.stringify({
    populate: {
      avatar: {
        fields: ["url", "alternativeText"],
      },
    },
  });

  const authToken = await getAuthToken();
  if (!authToken) return { ok: false, data: null, error: null };

  try {
    const response = await fetch(url.href, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    if (data.error) return { ok: false, data: null, error: data.error };
    return { ok: true, data: data.data, error: null };
  } catch (error) {
    console.log(error);
    return { ok: false, data: null, error: error };
  }
}
