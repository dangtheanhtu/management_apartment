"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  User, 
  ArrowRight, 
  Newspaper,
  Sparkles 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface Post {
  id: string;
  content: string;
  postType?: string;
  imageUrl?: string;
  createdAt: string | Date;
  isAnonymous?: boolean;
  user?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  } | null;
  likesCount?: number;
  commentsCount?: number;
}

interface CommunityNewsSectionProps {
  posts: Post[];
}

export default function CommunityNewsSection({ posts }: CommunityNewsSectionProps) {
  const recentPosts = posts.slice(0, 3);

  if (recentPosts.length === 0) {
    return (
      <section id="community" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4">
            <Newspaper className="h-16 w-16 text-slate-300 mx-auto" />
            <h3 className="text-2xl font-semibold text-slate-700">
              Tin tức sắp có
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Chúng tôi sẽ cập nhật tin tức và sự kiện mới nhất cho bạn
            </p>
          </div>
        </div>
      </section>
    );
  }

  const getTimeAgo = (date: string | Date) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true,
        locale: vi 
      });
    } catch {
      return "Gần đây";
    }
  };

  return (
    <section id="community" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-600">Cộng đồng & Tin tức</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
            Hoạt động & sự kiện
          </h2>
          <p className="text-xl text-slate-600">
            Cập nhật tin tức mới nhất từ cộng đồng cư dân
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {recentPosts.map((post) => (
            <Card 
              key={post.id}
              className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden bg-slate-100">
                {post.imageUrl ? (
                  <Image
                    src={post.imageUrl}
                    alt={post.content.substring(0, 50)}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
                    <Newspaper className="h-16 w-16 text-slate-300" />
                  </div>
                )}

                {/* Category Badge */}
                {post.postType && (
                  <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-700 border-0">
                    {post.postType === 'announcement' ? 'Thông báo' : 
                     post.postType === 'event' ? 'Sự kiện' : 'Tin tức'}
                  </Badge>
                )}
              </div>

              <CardHeader className="space-y-3">
                <CardTitle className="text-xl font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {post.content.replace(/<[^>]*>/g, '').substring(0, 80)}
                  {post.content.length > 80 && '...'}
                </CardTitle>
                <CardDescription className="line-clamp-3 text-slate-600">
                  {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-slate-500">
                  {post.user && !post.isAnonymous && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{post.user.fullName}</span>
                    </div>
                  )}
                  {post.isAnonymous && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Ẩn danh</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{getTimeAgo(post.createdAt)}</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                  asChild
                  variant="outline" 
                  className="w-full group/btn hover:bg-slate-50"
                >
                  <Link href={`/community?post=${post.id}`}>
                    Đọc thêm
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        {recentPosts.length > 0 && (
          <div className="text-center mt-16">
            <Button 
              asChild
              size="lg" 
              variant="outline"
              className="px-8 border-2 hover:bg-slate-50"
            >
              <Link href="/community">
                Xem tất cả bài viết
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
