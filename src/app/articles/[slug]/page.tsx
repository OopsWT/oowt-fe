// import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import { getArticleBySlug } from "@/lib/api";
import { Article } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { MapWrapper } from "@/components/custom/mapWrapper";
import rehypeRaw from "rehype-raw";
import Image from "next/image";
import { TableOfContents } from "@/components/custom/tableOfContent";
import { Gallery } from "@/components/custom/gallery";
import { ArrowLeftCircleIcon } from "lucide-react";
import { translateLocationLabel } from "@/lib/location-translations";

async function getLocationBreadcrumb(
  pointers?: number[][] | { pointers: number[][] } | null,
) {
  const normalizedPointers = Array.isArray(pointers)
    ? pointers
    : Array.isArray(pointers?.pointers)
      ? pointers.pointers
      : [];

  if (normalizedPointers.length === 0) {
    return null;
  }

  const center = normalizedPointers.reduce(
    (acc, [lng, lat]) => {
      acc[0] += lng;
      acc[1] += lat;
      return acc;
    },
    [0, 0] as [number, number],
  );

  const longitude = center[0] / normalizedPointers.length;
  const latitude = center[1] / normalizedPointers.length;

  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return null;
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?types=country,region,place,locality,district&access_token=${process.env.NEXT_PUBLIC_MAPS_TOKEN}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const features = Array.isArray(data.features) ? data.features : [];

    const countryFeature = features.find((feature: { place_type?: string[] }) =>
      feature.place_type?.includes("country"),
    );
    const regionFeature =
      features.find((feature: { place_type?: string[] }) =>
        feature.place_type?.includes("region"),
      ) ??
      features.find((feature: { place_type?: string[] }) =>
        feature.place_type?.includes("place"),
      );

    const country =
      countryFeature?.text ??
      countryFeature?.context?.find(
        (contextItem: { id?: string; text?: string }) =>
          contextItem.id?.startsWith("country."),
      )?.text ??
      null;

    const region =
      regionFeature?.text ??
      regionFeature?.context?.find(
        (contextItem: { id?: string; text?: string }) =>
          contextItem.id?.startsWith("region."),
      )?.text ??
      null;

    const continent =
      countryFeature?.context?.find(
        (contextItem: { id?: string; text?: string }) =>
          contextItem.id?.startsWith("continent."),
      )?.text ?? "Europe";

    return [continent, country, region]
      .map((item) => translateLocationLabel(item))
      .filter(Boolean) as string[];
  } catch (error) {
    console.error("Error fetching location breadcrumb:", error);
    return null;
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug<Article>(slug);

  const images = article.blocks && article.blocks[0].files;
  const breadcrumbs = await getLocationBreadcrumb(article.pointers?.pointers);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-28 space-y-6 relative mt-26 lg:mt-40 flex flex-col md:grid md:grid-cols-12">
      <section className="col-span-8 col-start-1">
        <div className="relative mb-3">
          {/* Cover Image */}
          {/* {article.cover && (
            <div className="w-full overflow-hidden relative -z-0 h-96">
              <Image
                src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${article.cover.url}`}
                alt={article.title}
                className="w-full h-auto object-fill -mt-50"
                width={800}
                height={450}
                priority // Load image sooner
              />
            </div>
          )} */}
          {/* BreadCrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-sm font-light text-neutral-600"
            >
              {breadcrumbs.map((crumb, index) => (
                <span
                  key={`${crumb}-${index}`}
                  className="flex items-center gap-2"
                >
                  <span className="text-neutral-900/80">{crumb}</span>
                  {index < breadcrumbs.length - 1 && (
                    <span className="text-neutral-400">/</span>
                  )}
                </span>
              ))}
            </nav>
          ) : (
            <p className="text-sm font-light text-neutral-500">
              Lokalizacja nie została określona
            </p>
          )}
          {/* Title and Meta */}
          <div className="w-full mt-4">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 font-jet-brains">
              {article.title}
            </h1>
            <div className="text-sm text-gray-600 mt-3">
              Opublikowano: {formatDate(article.publishedAt)}
            </div>
          </div>
          {/* Categories Section */}
          {article.categories && article.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 my-4 w-full">
              {article.categories.map(({ name, documentId }) => (
                <span
                  key={documentId}
                  className="bg-black/10 border border-white/20 text-black px-3 py-1 rounded-full text-xs hover:bg-white/20 transition"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-700 leading-relaxed">{article.description}</p>

        {/* Map */}
        <MapWrapper
          className="mt-6"
          pointers={article.pointers?.pointers}
          isDisplayOnly
        />

        {/* Gallery */}
        <Gallery images={images || []} />

        {/* Content */}
        <div className="prose max-w-none mt-6">
          {/* Use prose defaults, remove max-w-screen-lg and leading */}
          <Markdown
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ children }) => {
                const text = String(children);
                const id = text
                  .toLowerCase()
                  .replace(/[^\w\s-]/g, "")
                  .replace(/\s+/g, "-")
                  .replace(/-+/g, "-");
                return <h1 id={id}>{children}</h1>;
              },
            }}
          >
            {article.content}
          </Markdown>
        </div>

        {/* Back Link */}
        <Link
          className="flex items-center gap-2 underlin hover:text-neutral-600 my-6 bg-gradient-gold p-4 rounded-md"
          href="/"
        >
          <ArrowLeftCircleIcon /> Wróć do Listy Artykułów
        </Link>
      </section>
      <section className="col-span-3 col-start-10">
        {article.author && (
          <div className="my-10 flex flex-col justify-center items-center">
            <div className="size-32 rounded-full border border-black overflow-hidden">
              {article.author.avatar?.url && (
                <Image
                  src={article.author.avatar.url}
                  width={200}
                  height={200}
                  alt="author avatar"
                />
              )}
            </div>
            <p className="mt-4 text-xs">Author: {article.author.name}</p>
            <div className="text-sm mt-4 text-justify">
              <Markdown rehypePlugins={[rehypeRaw]}>
                {article.author.description}
              </Markdown>
            </div>
          </div>
        )}
        <TableOfContents
          markdown={article.content}
          className="hidden md:block"
        />
      </section>
    </div>
  );
}
