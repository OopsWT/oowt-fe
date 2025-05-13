import { fetchData } from "@/data/loaders";
import { Article } from "@/lib/types";
import { formatDate, getStrapiURL } from "@/lib/utils";
import qs from "qs";
import Image from "next/image";
import Link from "next/link";

const dashboardQuery = qs.stringify(
  {
    filters: {
      author: {
        id: {
          $eq: 1, // TODO - add dynamic author ID based on user
        },
      },
    },
    populate: ["cover", "author.avatar", "categories", "blocks.shared.slider"],
  },
  {
    encodeValuesOnly: true,
  }
);

export default async function DashboardRoute() {
  const articles = await fetchData<Article[]>(
    "/api/articles?populate=*",
    dashboardQuery
  );
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1>Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-3">
        {articles?.map((article: Article) => (
          <Link href={`dashboard/articles/${article.slug}`} key={article.id}>
            <article className="bg-white shadow-md rounded-lg">
              {article.cover?.url && (
                <Image
                  className="w-full h-48 object-cover rounded-t-lg"
                  src={getStrapiURL() + article.cover.url}
                  alt={article.title}
                  width={150}
                  height={38}
                  priority
                />
              )}
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
  );
}
