import { FooterProps } from "@/components/custom/footer";
import { HeaderProps } from "@/components/custom/header";
import { getStrapiURL } from "@/lib/utils";
import qs from "qs";

export async function fetchData<T>(path: string, search?: string): Promise<T> {
  const url = new URL(path, getStrapiURL());
  if (search) {
    url.search = search;
  }

  try {
    const response = await fetch(url, {});
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export async function getGlobalData() {
  const url = new URL("/api/global", getStrapiURL());

  url.search = qs.stringify({
    populate: [
      "header.logoText",
      "header.ctaButton",
      "footer.logoText",
      "footer.socialLink",
    ],
  });

  return await fetchData<{ header: HeaderProps; footer: FooterProps }>(
    url.href
  );
}
