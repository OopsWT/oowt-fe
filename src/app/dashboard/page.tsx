import { fetchData } from "@/data/loaders";
import { Article } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import qs from "qs";
import Image from "next/image";
import Link from "next/link";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import { MapPlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function DashboardRoute() {
  const { ok, data: userData } = await getUserMeLoader();

  const dashboardQuery = qs.stringify(
    {
      sort: ["publishedAt:desc"],
      filters: {
        author: {
          id: {
            $eq: ok ? userData?.author?.id : 0,
          },
        },
      },
      populate: [
        "cover",
        "author.avatar",
        "categories",
        "blocks.shared.slider",
      ],
    },
    {
      encodeValuesOnly: true,
    }
  );

  const articles = await fetchData<Article[]>(
    "/api/articles?populate=*&",
    dashboardQuery
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 pt-8">
      {articles.length > 1 && (
        <Link
          className="flex items-center gap-2 font-semibold mb-4"
          href="/dashboard/create"
        >
          <Button>
            <MapPlusIcon className="h-6 w-6" />

            <span className="">Nowy artykuł</span>
          </Button>
        </Link>
      )}
      <h1>Moje artykuły:</h1>
      <div className="px-4 md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-3">
        {articles?.map((article: Article) => (
          <Link href={`dashboard/articles/${article.slug}`} key={article.id}>
            <article className="bg-white shadow-md rounded-lg mb-4 md:mb-0">
              {article.cover?.url && (
                <Image
                  className="w-full h-48 object-cover rounded-t-lg"
                  src={article.cover.url}
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
                  Obublikowano: {formatDate(article.publishedAt)}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
