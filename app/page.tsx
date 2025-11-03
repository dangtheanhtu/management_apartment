import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import Navigation from "@/components/homepage/navigation";
import HeroSection from "@/components/homepage/hero-section";
import AvailableUnitsSection from "@/components/homepage/available-units-section";
import AmenitiesSection from "@/components/homepage/amenities-section";
import CommunityNewsSection from "@/components/homepage/community-news-section";
import AboutSection from "@/components/homepage/about-section";
import CtaSection from "@/components/homepage/cta-section";
import { Skeleton } from "@/components/ui/skeleton";

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

async function getHomeData() {
  try {
    // Use relative URL for internal API calls (works regardless of port)
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/home`, {
      next: { revalidate: 60 },
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch home data");
    }
    
    return res.json();
  } catch (error) {
    console.error("Error fetching home data:", error);
    return {
      apartments: [],
      amenities: [],
      posts: [],
      stats: null,
    };
  }
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="relative h-[600px] bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 h-full flex items-center">
          <div className="space-y-6 max-w-2xl">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-12 w-96" />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-16 space-y-24">
        <div className="space-y-8">
          <Skeleton className="h-12 w-64 mx-auto" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const data = await getHomeData();

  return (
    <div className="min-h-screen bg-white">
      <Navigation session={session} />
      
      <Suspense fallback={<LoadingSkeleton />}>
        <HeroSection session={session} />
      </Suspense>

      <Suspense fallback={<div className="py-16"><LoadingSkeleton /></div>}>
        <AvailableUnitsSection apartments={data.apartments} />
      </Suspense>

      <Suspense fallback={<div className="py-16"><LoadingSkeleton /></div>}>
        <AmenitiesSection amenities={data.amenities} />
      </Suspense>

      <Suspense fallback={<div className="py-16"><LoadingSkeleton /></div>}>
        <CommunityNewsSection posts={data.posts} />
      </Suspense>

      <Suspense fallback={<div className="py-16"><LoadingSkeleton /></div>}>
        <AboutSection stats={data.stats} />
      </Suspense>

      <Suspense fallback={<div className="py-16"><LoadingSkeleton /></div>}>
        <CtaSection session={session} />
      </Suspense>
    </div>
  );
}
