type BlogArticleBodyProps = {
  html: string;
};

export function BlogArticleBody({ html }: BlogArticleBodyProps) {
  return (
    <div
      id="blog-content"
      className="prose max-w-none prose-neutral prose-headings:scroll-mt-24"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
