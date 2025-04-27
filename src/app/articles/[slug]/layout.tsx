import ScrollProgress from "@/components/custom/scrollProgress";

export default function ArticleLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <>
      <ScrollProgress />
      {children}
    </>
  );
}
