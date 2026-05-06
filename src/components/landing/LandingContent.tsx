"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/use-translations";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Trophy,
} from "lucide-react";

export function LandingContent() {
  const { t } = useTranslations();

  const featureItems = [
    {
      icon: Timer,
      title: t.landing.features.timer.title,
      description: t.landing.features.timer.description,
    },
    {
      icon: BarChart3,
      title: t.landing.features.analytics.title,
      description: t.landing.features.analytics.description,
    },
    {
      icon: Target,
      title: t.landing.features.goals.title,
      description: t.landing.features.goals.description,
    },
    {
      icon: Trophy,
      title: t.landing.features.badges.title,
      description: t.landing.features.badges.description,
    },
  ];

  const workflowItems = [
    {
      icon: Clock3,
      title: t.landing.workflow.timer.title,
      description: t.landing.workflow.timer.description,
    },
    {
      icon: CalendarCheck,
      title: t.landing.workflow.review.title,
      description: t.landing.workflow.review.description,
    },
    {
      icon: Sparkles,
      title: t.landing.workflow.keepGoing.title,
      description: t.landing.workflow.keepGoing.description,
    },
  ];

  return (
    <div className="bg-background flex flex-col">
      <section className="relative flex min-h-[calc(100svh-6rem)] overflow-hidden">
        <Image
          src="/landing/studytracker-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,19,18,0.95)_0%,rgba(8,19,18,0.82)_34%,rgba(8,19,18,0.38)_62%,rgba(8,19,18,0.16)_100%)]" />
        <div className="relative z-10 container mx-auto flex items-center px-4 py-16 sm:py-20">
          <div className="max-w-3xl text-white">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/85 backdrop-blur">
              <CheckCircle2 className="h-4 w-4 text-emerald-200" />
              <span>{t.landing.hero.badge}</span>
            </div>
            <h1 className="max-w-3xl text-4xl leading-tight font-bold tracking-normal sm:text-5xl md:text-6xl">
              {t.landing.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
              {t.landing.hero.subtitle}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link href="/register">
                  {t.common.getStarted}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href="/login">{t.common.login}</Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/15 pt-6">
              <div>
                <p className="text-2xl font-bold">
                  {t.landing.hero.metrics.focus.value}
                </p>
                <p className="mt-1 text-sm text-white/68">
                  {t.landing.hero.metrics.focus.label}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {t.landing.hero.metrics.goals.value}
                </p>
                <p className="mt-1 text-sm text-white/68">
                  {t.landing.hero.metrics.goals.label}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {t.landing.hero.metrics.badges.value}
                </p>
                <p className="mt-1 text-sm text-white/68">
                  {t.landing.hero.metrics.badges.label}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background border-b py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-primary text-sm font-semibold">
              {t.landing.workflow.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
              {t.landing.workflow.title}
            </h2>
            <p className="text-muted-foreground mt-4">
              {t.landing.workflow.description}
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {workflowItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-md">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-muted-foreground text-sm font-semibold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground mt-3 leading-7">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-primary text-sm font-semibold">
                {t.landing.features.eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
                {t.landing.features.title}
              </h2>
            </div>
            <p className="text-muted-foreground max-w-2xl lg:justify-self-end">
              {t.landing.features.description}
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featureItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-card rounded-lg border p-5 shadow-sm"
                >
                  <div className="bg-primary/10 text-primary mb-5 flex h-12 w-12 items-center justify-center rounded-md">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-7">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="text-primary text-sm font-semibold">
                {t.landing.outcome.eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
                {t.landing.outcome.title}
              </h2>
              <p className="text-muted-foreground mt-4 leading-7">
                {t.landing.outcome.description}
              </p>
            </div>

            <div className="grid gap-3">
              <div className="bg-card rounded-lg border p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {t.landing.outcome.today.title}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {t.landing.outcome.today.description}
                    </p>
                  </div>
                  <ShieldCheck className="text-primary h-8 w-8 shrink-0" />
                </div>
              </div>
              <div className="bg-card rounded-lg border p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {t.landing.outcome.week.title}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {t.landing.outcome.week.description}
                    </p>
                  </div>
                  <BarChart3 className="text-primary h-8 w-8 shrink-0" />
                </div>
              </div>
              <div className="bg-card rounded-lg border p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {t.landing.outcome.next.title}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {t.landing.outcome.next.description}
                    </p>
                  </div>
                  <Target className="text-primary h-8 w-8 shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground border-y py-12">
        <div className="container mx-auto flex flex-col items-start justify-between gap-6 px-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              {t.landing.cta.title}
            </h2>
            <p className="text-primary-foreground/80 mt-3 max-w-2xl">
              {t.landing.cta.description}
            </p>
          </div>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="shrink-0 gap-2"
          >
            <Link href="/register">
              {t.common.getStarted}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
