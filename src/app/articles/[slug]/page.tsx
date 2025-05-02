// import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import { getArticleBySlug } from "@/lib/api";
import { Article } from "@/lib/types";
import { formatDate, getStrapiURL } from "@/lib/utils";
import { MapWrapper } from "@/components/custom/mapWrapper";
import rehypeRaw from "rehype-raw";
import Image from "next/image";
import { TableOfContents } from "@/components/custom/tableOfContent";

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const article = await getArticleBySlug<Article>(slug);

  return (
    <div className="max-w-screen-2xl mx-auto px-24 space-y-6 relative mt-40 grid grid-cols-12">
      <section className="col-span-8 col-start-1">
        <div className="relative mb-3">
          {/* Cover Image */}
          {/* {article.cover && (
          <div className="w-full overflow-hidden relative -z-0 h-96">
            <Image
              src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${article.cover.url}`}
              alt={article.title}
              className="w-full h-auto object-fill -mt-50"
              width={800}
              height={450}
              priority // Load image sooner
            />
          </div>
        )} */}
          {/* BreadCrumbs */}
          <p className="font-light">Europe / Poland / Kujawsko - pomorskie</p>

          {/* Title and Meta */}
          <div className="w-full mt-4">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 font-jet-brains">
              {article.title}
            </h1>
            <div className="text-sm text-gray-600 mt-3">
              Published: {formatDate(article.publishedAt)}
            </div>
          </div>

          {/* Categories Section */}
          {article.categories && article.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 my-4 w-full">
              {article.categories.map(({ name, documentId }) => (
                <span
                  key={documentId}
                  className="bg-black/10 border border-white/20 text-black px-3 py-1 rounded-full text-xs hover:bg-white/20 transition"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-700 leading-relaxed">{article.description}</p>

        {/* Map */}
        <MapWrapper
          className="mt-6"
          pointers={article.pointers.pointers}
          isDisplayOnly
        />

        {/* Content */}
        <div className="prose max-w-none mt-6">
          {/* Use prose defaults, remove max-w-screen-lg and leading */}
          <Markdown
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ children }) => {
                const text = String(children);
                const id = text
                  .toLowerCase()
                  .replace(/[^\w\s-]/g, "")
                  .replace(/\s+/g, "-")
                  .replace(/-+/g, "-");
                return <h1 id={id}>{children}</h1>;
              },
            }}
          >
            {article.content}
          </Markdown>
        </div>

        {/* Back Link */}
        <Link
          className="flex items-center gap-2 underlin hover:text-purple-800 my-6"
          href="/"
        >
          {"<"} Back to Articles
        </Link>
      </section>
      <section className="col-span-3 col-start-10">
        <div className="my-10 flex flex-col justify-center items-center">
          <div className="size-32 rounded-full border border-black overflow-hidden">
            <Image
              src={getStrapiURL() + article.author.avatar.url}
              width={200}
              height={200}
              alt="author avatar"
            />
          </div>
          <p className="mt-4 text-xs">Author: {article.author.name}</p>
          <p className="text-sm mt-4 text-center">
            {article.author.description}
          </p>
        </div>
        <TableOfContents markdown={article.content} />
      </section>
    </div>
  );
}
