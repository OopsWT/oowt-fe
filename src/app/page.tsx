import Image from "next/image";
import { formatDate, getStrapiURL } from "@/lib/utils";
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
    homePageQuery
  );
  const articles = await fetchData<Article[]>("/api/articles?populate=*");

  return (
    <main>
      {/* <h1 className="text-4xl font-bold mb-8">{homePageData?.title}</h1>
      <h5 className="mb-5">{homePageData?.description}</h5> */}
      {homePageData && <HeroSection data={homePageData.blocks[0]} />}

      <div className="max-w-4xl mx-auto my-5">
        <h2 className="text-2xl font-semibold mb-6">Articles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles?.map((article: Article) => (
            <Link href={`articles/${article.slug}`} key={article.id}>
              <article className="bg-white shadow-md rounded-lg overflow-hidden">
                <Image
                  className="w-full h-48 object-cover"
                  src={getStrapiURL() + article.cover.url}
                  alt={article.title}
                  width={150}
                  height={38}
                  priority
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">{article.title}</h3>
                  <p className="text-gray-600 mb-4">{article.description}</p>
                  <p className="text-sm text-gray-500">
                    Published: {formatDate(article.publishedAt)}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
