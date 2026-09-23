import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BlogPostClient } from "./BlogPostClient"

interface Props {
  params: { slug: string }
  searchParams: { ref?: string }
}

export const dynamic = "force-dynamic"
export const revalidate = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      excerpt: true,
      coverImage: true,
      metaTitle: true,
      metaDescription: true,
      category: true,
      publishedAt: true,
      author: {
        select: {
          profile: { select: { firstName: true, lastName: true } },
        },
      },
    },
  })

  if (!post) {
    return {
      title: "Article Not Found | GAS™",
    }
  }

  const title = post.metaTitle || post.title
  const description = post.metaDescription || post.excerpt
  const url = `https://singularityingolok.blog/blog/${params.slug}`
  const authorName =
    post.author?.profile?.firstName && post.author?.profile?.lastName
      ? `${post.author.profile.firstName} ${post.author.profile.lastName}`
      : "GAS™ Editorial Board"

  return {
    title: `${title} | GAS™ Blog`,
    description,
    authors: [{ name: authorName }],
    openGraph: {
      title,
      description,
      url,
      siteName: "GAS™ — Grand Affiliate System",
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      section: post.category,
      images: [
        {
          url: post.coverImage || "https://singularityingolok.blog/favicon.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [post.coverImage || "https://singularityingolok.blog/favicon.png"],
    },
  }
}

export default async function BlogPostPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions)

  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          role: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              bio: true,
            },
          },
        },
      },
      featuredProduct: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          category: true,
          commissionRules: {
            where: { isActive: true },
            take: 1,
            select: { value: true, type: true },
          },
        },
      },
    },
  })

  if (!post || !post.isPublished) {
    notFound()
  }

  // Increment view count asynchronously
  prisma.blogPost
    .update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {})

  // Fetch related articles
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      isPublished: true,
      category: post.category,
      id: { not: post.id },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      images: true,
      category: true,
      readTimeMinutes: true,
      clapCount: true,
      publishedAt: true,
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
  })

  // Determine active referral code for affiliate tracking
  let activeReferralCode = searchParams?.ref || null

  // If user is authenticated, use their own referral code
  if (session?.user?.id && !activeReferralCode) {
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true },
    })
    if (currentUser) {
      activeReferralCode = currentUser.referralCode
    }
  }

  return (
    <BlogPostClient
      post={{
        ...post,
        featuredProduct: post.featuredProduct
          ? {
              ...post.featuredProduct,
              price: Number(post.featuredProduct.price),
              commissionRules: post.featuredProduct.commissionRules.map((r) => ({
                value: Number(r.value),
                type: r.type,
              })),
            }
          : null,
      }}
      relatedPosts={relatedPosts}
      referralCode={activeReferralCode}
    />
  )
}
