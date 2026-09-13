import Image from "next/image";
import { formatDate } from "@/lib/utils";
import {
  HeroSection,
  HeroSectionProps,
} from "@/components/custom/hero-section";
import qs from "qs";
import { fetchData } from "@/data/loaders";
import Link from "next/link";
import { Article } from "@/lib/types";

const homePageQuery = qs.stringify({
  populate: {
    blocks: {
      on: {
        "layout.hero-section": {
          populate: {
            image: {
              fields: ["url", "alternativeText"],
            },
            link: {
              populate: true,
            },
          },
        },
      },
    },
  },
});

export interface HomePageData {
  title: string;
  description: string;
  blocks: HeroSectionProps[];
}

export default async function Home() {
  const homePageData = await fetchData<HomePageData>(
    "/api/home-page",
    homePageQuery,
  );
  const articles = await fetchData<Article[]>(
    "/api/articles?populate=*&sort[0]=createdAt:desc&pagination[limit]=50",
  );

  return (
    <main>
      {/* <h1 className="text-4xl font-bold mb-8">{homePageData?.title}</h1>
      <h5 className="mb-5">{homePageData?.description}</h5> */}
      {homePageData && <HeroSection data={homePageData.blocks[0]} />}

      <div className="max-w-4xl mx-auto my-5 py-4 px-3">
        <h2 className="text-2xl font-semibold mb-6">Artykuły</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles?.map((article: Article) => (
            <Link href={`articles/${article.slug}`} key={article.id}>
              <article
                className="relative group h-90
                bg-white/20
                backdrop-blur-md
                border border-white/30
                rounded-sm
                overflow-hidden
                shadow-lg 
                transition-transform
                hover:scale-[1.03]
                hover:border-4
                hover:shadow-2xl"
              >
                {article.distance && (
                  <div className="flex lg:hidden group-hover:flex absolute top-0 left-0 right-0 z-30 backdrop-blur-sm bg-amber-500/60 h-10 px-3 py-2 justify-between -mt-px">
                    <p className="text-white text-sm font-bold">
                      {article.distance} km
                    </p>
                    {/* <p className="text-white text-sm font-bold">2300 likes</p>
                  <p className="text-white text-sm font-bold">13036 views</p> */}
                  </div>
                )}
                {article.cover?.url && (
                  <Image
                    className="w-full h-90 object-cover object-center"
                    src={article.cover?.url}
                    alt={article.title}
                    width={1200}
                    height={900}
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                )}
                <div className="p-4 bg-white/60 z-30 absolute bottom-0 left-0 right-0 backdrop-blur-sm h-35 -mt-px">
                  <h3 className="text-lg font-bold mb-2 text-neutral-900 drop-shadow">
                    {article.title}
                  </h3>
                  <p className="text-sm mb-4 text-neutral-800 drop-shadow">
                    {article.description}
                  </p>
                  <p className="text-xs text-neutral-800 drop-shadow">
                    Opublikowano: {formatDate(article.publishedAt)}
                  </p>
                </div>
                <div
                  className="
                    pointer-events-none
                    absolute inset-0
                    bg-gradient-to-br from-white/10 to-transparent
                    opacity-0 group-hover:opacity-30
                    transition-opacity
                  "
                />
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
