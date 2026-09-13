import {
  HeroSection,
  HeroSectionProps,
} from "@/components/custom/hero-section";
import qs from "qs";
import { fetchData } from "@/data/loaders";
import { Article, Author } from "@/lib/types";
import { AuthorArticleFilter } from "@/components/custom/author-article-filter";

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

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ author?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const rawAuthorId = params.author;
  const selectedAuthorId =
    rawAuthorId && !Number.isNaN(Number(rawAuthorId))
      ? Number(rawAuthorId)
      : null;

  const homePageData = await fetchData<HomePageData>(
    "/api/home-page",
    homePageQuery,
  );
  const articles = await fetchData<Article[]>(
    "/api/articles?populate=*&sort[0]=createdAt:desc&pagination[limit]=50",
  );
  const authors = await fetchData<Author[]>(
    "/api/authors?populate[avatar][fields][0]=url&populate[articles][fields][0]=id&sort[0]=name:asc&pagination[limit]=100",
  );

  const authorsWithArticles = (authors || []).filter(
    (author) => (author.articles?.length ?? 0) > 0,
  );

  const visibleArticles = selectedAuthorId
    ? (articles || []).filter(
        (article) => article.author?.id === selectedAuthorId,
      )
    : articles || [];

  return (
    <main>
      {/* <h1 className="text-4xl font-bold mb-8">{homePageData?.title}</h1>
      <h5 className="mb-5">{homePageData?.description}</h5> */}
      {homePageData && <HeroSection data={homePageData.blocks[0]} />}

      <div className="max-w-4xl mx-auto my-5 py-4 px-3">
        <h2 className="text-2xl font-semibold mb-6">Artykuły i Autorzy</h2>
        <AuthorArticleFilter
          articles={visibleArticles}
          authors={authorsWithArticles}
          selectedAuthorId={selectedAuthorId}
        />
      </div>
    </main>
  );
}
