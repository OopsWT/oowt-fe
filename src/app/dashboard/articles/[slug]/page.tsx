import { ArticleForm } from "@/components/forms/article-form";
import { getArticleBySlug } from "@/lib/api";
import { Article } from "@/lib/types";

export default async function ArticleEditRoute({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const article = await getArticleBySlug<Article>(slug);

  return (
    <div className="flex justify-center w-full">
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 p-4">
        <ArticleForm data={article} className="col-span-8 min-w-5xl" />
      </div>
    </div>
  );
}
