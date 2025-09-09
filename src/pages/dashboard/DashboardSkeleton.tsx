import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton: React.FC = () => {
  return (
    <AppLayout>
      <header className="mb-6 animate-fade-in">
        <div className="h-8 w-64"><Skeleton className="h-8 w-64" /></div>
        <div className="mt-2 h-4 w-80"><Skeleton className="h-4 w-80" /></div>
      </header>

      <main className="space-y-6">
        {/* KPIs Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="hover:shadow-kerigma transition-shadow">
              <CardHeader className="pb-2">
                <div className="h-3 w-24"><Skeleton className="h-3 w-24" /></div>
              </CardHeader>
              <CardContent>
                <div className="h-7 w-20"><Skeleton className="h-7 w-20" /></div>
                <div className="mt-2 h-3 w-32"><Skeleton className="h-3 w-32" /></div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Charts & Side widgets */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <article className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="h-5 w-64"><Skeleton className="h-5 w-64" /></div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[260px] w-full"><Skeleton className="h-[260px] w-full" /></div>
              </CardContent>
            </Card>
          </article>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <div className="h-5 w-48"><Skeleton className="h-5 w-48" /></div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-56 w-full"><Skeleton className="h-56 w-full" /></div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-4 w-full"><Skeleton className="h-4 w-full" /></div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-5 w-40"><Skeleton className="h-5 w-40" /></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-5 w-56"><Skeleton className="h-5 w-56" /></div>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </section>

        <section>
          <Card>
            <CardHeader>
              <div className="h-5 w-40"><Skeleton className="h-5 w-40" /></div>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </AppLayout>
  );
};

export default DashboardSkeleton;
