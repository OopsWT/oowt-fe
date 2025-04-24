import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import { getArticleBySlug } from "@/lib/api";
import { Article } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { MapWrapper } from "@/components/custom/mapWrapper";

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const article = await getArticleBySlug<Article>(slug);

  return (
    <div className="max-w-screen-md mx-auto p-4 relative">
      {article.cover && (
        <div className="absolute top-0 h-72 w-full my-4 -z-10">
          <Image
            src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${article.cover.url}`}
            alt={article.title}
            className="w-full h-full object-cover"
            width={800}
            height={600}
          />
        </div>
      )}
      <div className="releative z-10">
        <h1 className="text-4xl leading-[60px] capitalize text-center font-bold text-purple-800 font-jet-brains">
          {article.title}
        </h1>
        <div className="w-full flex items-center justify-center font-light">
          Published: {formatDate(article.publishedAt)}
        </div>
      </div>

      {/* Categories Section */}
      {article.categories && article.categories.length > 0 && (
        <div className="flex flex-wrap space-x-2 my-4">
          {article.categories.map(({ name, documentId }) => (
            <span
              key={documentId}
              className="border rounded border-purple-900 font-medium px-2 py-2 text-sm"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      <p className="text-gray-600 leading-[32px] tracking-wide italic mt-2 mb-6">
        {article.description}
      </p>
      <div className="leading-[40px] max-w-screen-lg prose prose-invert">
        <Markdown>{article.content}</Markdown>
      </div>
      <MapWrapper className="mt-4" />
      <Link className="flex items-center gap-2 mt-5 underline" href="/">
        {"<-"} Back to Blogs
      </Link>
    </div>
  );
}
