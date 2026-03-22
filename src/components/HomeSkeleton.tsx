"use client";

interface HomeSkeletonProps {
  hero?: boolean;
  rows?: number;
  cardsPerRow?: number;
  className?: string;
}

function SkeletonBlock({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <div 
      className={`netflix-skeleton ${className}`.trim()} 
      style={{ 
        animationDelay: `${delay}ms`,
        '--skeleton-delay': `${delay}ms`
      } as React.CSSProperties}
    />
  );
}

export default function HomeSkeleton({
  hero = true,
  rows = 5,
  cardsPerRow = 6,
  className = "",
}: HomeSkeletonProps) {
  const rowCards = Array.from({ length: cardsPerRow });
  const contentRows = Array.from({ length: rows });

  return (
    <div className={`min-h-screen bg-[#141414] ${className}`.trim()}>
      <div className="mx-auto max-w-[1600px] px-4 pb-10 pt-16 sm:px-6 md:px-8 lg:pt-20">
        {hero && (
          <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#1a1a1a] px-5 py-6 sm:px-8 sm:py-8 md:px-10 md:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(229,9,20,0.22),_transparent_40%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0))]" />
            <div className="animate-fade-in relative grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-end">
              <div className="space-y-4 sm:space-y-5">
                <SkeletonBlock className="h-4 w-28 rounded-full sm:h-5 sm:w-32" delay={100} />
                <SkeletonBlock className="h-10 w-4/5 max-w-xl rounded-xl sm:h-14" delay={200} />
                <SkeletonBlock className="h-4 w-full max-w-2xl rounded-full sm:h-5" delay={300} />
                <SkeletonBlock className="h-4 w-11/12 max-w-xl rounded-full sm:h-5" delay={400} />
                <div className="flex flex-wrap gap-3 pt-2">
                  <SkeletonBlock className="h-11 w-36 rounded-md" delay={500} />
                  <SkeletonBlock className="h-11 w-28 rounded-md" delay={550} />
                </div>
              </div>
              <div className="hidden lg:block">
                <SkeletonBlock className="aspect-[16/9] w-full rounded-2xl" delay={300} />
              </div>
            </div>
          </section>
        )}

        <div className={`space-y-7 ${hero ? "mt-8" : "mt-0"}`}>
          {contentRows.map((_, rowIndex) => (
            <section 
              key={rowIndex} 
              className="space-y-3 animate-slide-up"
              style={{ animationDelay: `${600 + rowIndex * 150}ms` }}
            >
              <div className="flex items-center gap-3 px-1">
                <SkeletonBlock className="h-5 w-32 rounded-full sm:h-6 sm:w-40" delay={rowIndex * 100} />
                <SkeletonBlock className="hidden h-px flex-1 rounded-full sm:block" delay={rowIndex * 100 + 50} />
              </div>

              <div className="flex gap-2 overflow-hidden sm:gap-3">
                {rowCards.map((_, cardIndex) => (
                  <div
                    key={cardIndex}
                    className="min-w-[118px] flex-1 sm:min-w-[140px] md:min-w-[168px] lg:min-w-[185px] animate-fade-in"
                    style={{ animationDelay: `${800 + rowIndex * 150 + cardIndex * 80}ms` }}
                  >
                    <SkeletonBlock className="aspect-[2/3] w-full rounded-xl" delay={cardIndex * 50} />
                    <div className="space-y-2 px-1 pt-3">
                      <SkeletonBlock className="h-3.5 w-5/6 rounded-full" delay={cardIndex * 50 + 100} />
                      <SkeletonBlock className="h-3 w-2/5 rounded-full" delay={cardIndex * 50 + 150} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
