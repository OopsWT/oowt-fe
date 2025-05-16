import { ArticleForm } from "@/components/forms/article-form";

export default async function ArticleEditRoute() {
  return (
    <div className="md:flex justify-center w-full md:min-h-screen">
      <div className="md:grid md:grid-cols-1 lg:grid-cols-8 gap-4 p-4">
        <ArticleForm className="md:col-span-8 min-w-xs md:min-w-5xl" />
      </div>
    </div>
  );
}
