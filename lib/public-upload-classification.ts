import { prisma } from "@/lib/prisma";

/** Only explicit public references are eligible. Never infer privacy from a missing project ID. */
export async function isPublicUploadReference(url: string) {
  const [blog, portfolio, testimonial, avatar] = await Promise.all([
    prisma.blogPost.count({
      where: {
        published: true,
        OR: [{ featuredImage: url }, { content: { contains: url } }],
      },
    }),
    prisma.caseStudy.count({ where: { published: true, featuredImage: url } }),
    prisma.testimonial.count({ where: { published: true, avatar: url } }),
    prisma.user.count({ where: { avatar: url } }),
  ]);
  return blog + portfolio + testimonial + avatar > 0;
}
