"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/use-translations";
import { Timer, BarChart3, Target, Trophy } from "lucide-react";

export function LandingContent() {
  const { t } = useTranslations();

  return (
    <div className="flex flex-col">
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          {t.landing.hero.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          {t.landing.hero.subtitle}
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/register">{t.common.getStarted}</Link>
          </Button>
        </div>
      </section>

      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold">
            {t.landing.features.title}
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Timer className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">
                {t.landing.features.timer.title}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t.landing.features.timer.description}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">
                {t.landing.features.analytics.title}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t.landing.features.analytics.description}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">
                {t.landing.features.goals.title}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t.landing.features.goals.description}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">
                {t.landing.features.badges.title}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t.landing.features.badges.description}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
