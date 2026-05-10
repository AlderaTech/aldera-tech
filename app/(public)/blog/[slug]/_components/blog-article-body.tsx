type BlogArticleBodyProps = {
  html: string;
};

export function BlogArticleBody({ html }: BlogArticleBodyProps) {
  return (
    <div
      id="blog-content"
      className="prose prose-neutral max-w-none prose-headings:scroll-mt-24"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
