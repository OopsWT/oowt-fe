import Image from "next/image";
import Link from "next/link";
import { Article, Author } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { AuthorFilterControls } from "@/components/custom/author-filter-controls";

interface AuthorArticleFilterProps {
  articles: Article[];
  authors: Author[];
  selectedAuthorId: number | null;
}

export function AuthorArticleFilter({
  articles,
  authors,
  selectedAuthorId,
}: AuthorArticleFilterProps) {
  const authorsForFilter = Array.from(
    new Map(
      authors
        .filter((author) => author.id)
        .map((author) => [author.id, author]),
    ).values(),
  );

  const visibleArticles = selectedAuthorId
    ? articles.filter((article) => article.author?.id === selectedAuthorId)
    : articles;

  return (
    <div className="space-y-6">
      <AuthorFilterControls
        authors={authorsForFilter}
        selectedAuthorId={selectedAuthorId}
      />

      {visibleArticles.length === 0 ? (
        <p className="text-sm text-neutral-600">
          Brak artykułów dla wybranego autora.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleArticles.map((article: Article) => (
            <Link href={`articles/${article.slug}`} key={article.id}>
              <article
                className="relative group h-90
                bg-white/20
                backdrop-blur-md
                border border-white/30
                rounded-sm
                overflow-hidden
                shadow-lg
                transition-transform
                hover:scale-[1.03]
                hover:border-4
                hover:shadow-2xl"
              >
                {article.distance && (
                  <div className="flex lg:hidden group-hover:flex absolute top-0 left-0 right-0 z-30 backdrop-blur-sm bg-amber-500/60 h-10 px-3 py-2 justify-between -mt-px">
                    <p className="text-white text-sm font-bold">
                      {article.distance} km
                    </p>
                  </div>
                )}
                {article.cover?.url && (
                  <Image
                    className="w-full h-90 object-cover object-center"
                    src={article.cover?.url}
                    alt={article.title}
                    width={1200}
                    height={900}
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                )}
                <div className="p-4 bg-white/60 z-30 absolute bottom-0 left-0 right-0 backdrop-blur-sm h-35 -mt-px">
                  <h3 className="text-lg font-bold mb-2 text-neutral-900 drop-shadow">
                    {article.title}
                  </h3>
                  <p className="text-sm mb-4 text-neutral-800 drop-shadow">
                    {article.description}
                  </p>
                  <p className="text-xs text-neutral-800 drop-shadow">
                    Opublikowano: {formatDate(article.publishedAt)}
                  </p>
                </div>
                <div
                  className="
                    pointer-events-none
                    absolute inset-0
                    bg-gradient-to-br from-white/10 to-transparent
                    opacity-0 group-hover:opacity-30
                    transition-opacity
                  "
                />
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
