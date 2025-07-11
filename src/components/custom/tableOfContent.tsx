"use client";

import clsx from "clsx";

export function extractH1Headings(markdown: string) {
  const lines = markdown.split("\n");
  const headings = [];

  for (const line of lines) {
    const match = line.match(/^# (.+)/);
    if (match) {
      const text = match[1].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      headings.push({ id, text });
    }
  }

  return headings;
}

export const TableOfContents = ({
  markdown,
  className,
}: {
  markdown: string;
  className?: string;
}) => {
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);

    if (element) {
      const yOffset = -100;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });

      element.classList.add("highlighted");
      setTimeout(() => {
        element.classList.add("fade-out");
      }, 1000);
      setTimeout(() => {
        element.classList.remove("highlighted", "fade-out");
      }, 2000);
    }
  };

  const headings = extractH1Headings(markdown);
  if (!headings.length) return;

  return (
    <div className={clsx(className, "sticky top-32")}>
      <p className="font-barlow-condensed mb-4">Table of contents</p>
      <div className="border-l-amber-500 border-l pl-2 text-xs flex flex-col items-start">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => scrollToHeading(heading.id)}
            className="hover:underline transition-all duration-300 my-1 cursor-pointer"
          >
            {heading.text}
          </button>
        ))}
      </div>
    </div>
  );
};
