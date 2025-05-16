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
    <div className="md:flex justify-center w-full md:min-h-screen">
      <div className="md:grid md:grid-cols-1 lg:grid-cols-8 gap-4 p-4">
        <ArticleForm
          data={article}
          className="md:col-span-8 min-w-xs md:min-w-5xl"
        />
      </div>
    </div>
  );
}
