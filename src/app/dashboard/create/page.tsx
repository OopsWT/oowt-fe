import { ArticleForm } from "@/components/forms/article-form";

export default async function ArticleEditRoute() {
  return (
    <div className="flex justify-center w-full min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 p-4">
        <ArticleForm className="col-span-8 min-w-5xl" />
      </div>
    </div>
  );
}
