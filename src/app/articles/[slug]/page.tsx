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
    <div className="max-w-screen-lg mx-auto px-4 space-y-6 relative mt-14">
      <div className="relative mb-3">
        {/* Cover Image */}
        {article.cover && (
          <div className="w-full overflow-hidden relative -z-0 h-96">
            <Image
              src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${article.cover.url}`}
              alt={article.title}
              className="w-full h-auto object-fill -mt-50" // Adjusted for better responsiveness
              width={800}
              height={450} // Assuming a 16:9 aspect ratio, adjust if needed
              priority // Load image sooner
            />
          </div>
        )}
        {/* Title and Meta */}
        <div className="text-center w-full space-y-2 absolute top-0 flex flex-col items-center justify-center h-full margin-auto backdrop-blur-xs">
          <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg capitalize text-white font-jet-brains text-shadow-black">
            {article.title}
          </h1>
          <div className="text-sm text-gray-50">
            Published: {formatDate(article.publishedAt)}
          </div>
        </div>
        {/* Categories Section */}
        {article.categories && article.categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 my-4 absolute bottom-3 w-full">
            {article.categories.map(({ name, documentId }) => (
              <span
                key={documentId}
                className="bg-white/10 border border-white/20 text-white px-3 py-1 rounded-full text-xs hover:bg-white/20 transition"
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
      {/* Description */}
      <p className="text-gray-700 leading-relaxed italic text-center">
        {article.description}
      </p>
      {/* Content */}
      <div className="prose max-w-none">
        {" "}
        {/* Use prose defaults, remove max-w-screen-lg and leading */}
        <Markdown>{article.content}</Markdown>
      </div>
      {/* Map */}
      <MapWrapper className="mt-6" />{" "}
      {/* Added className back with margin-top */}
      {/* Back Link */}
      <Link
        className="flex items-center gap-2 underline text-purple-600 hover:text-purple-800 my-3"
        href="/"
      >
        {"<-"} Back to Articles
      </Link>
    </div>
  );
}
