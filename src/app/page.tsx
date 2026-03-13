import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const featureCards = [
    {
      title: "AI Health Consultation",
      description:
        "Start a guided consultation and receive concise, context-aware responses through a streaming assistant.",
    },
    {
      title: "Prescription Structuring",
      description:
        "Convert complex medication plans into structured, machine-readable schedules for safer follow-through.",
    },
    {
      title: "Daily Routine Tracking",
      description:
        "View day-wise medication timing in a calendar-driven panel for better adherence and visibility.",
    },
  ];

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-background px-4 pb-10 md:px-8">
      <div className="pointer-events-none absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />

      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center pt-20 text-center">
        <Badge
          variant="outline"
          className="mb-4 border-primary/30 bg-primary/5 text-primary"
        >
          Theme 5 · AI for Accessibility, Healthcare &amp; Well-Being
        </Badge>

        <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          Accessible AI Healthcare Support,
          <br className="hidden md:block" />
          Built for Daily Well-Being.
        </h1>

        <p className="mt-5 max-w-3xl text-base text-muted-foreground md:text-lg">
          MediMitra helps users understand prescriptions, structure medication
          plans, and stay consistent with routines through a local-first AI
          consultation workflow.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            render={<Link href="/chat" />}
            size="lg"
            className="h-12 rounded-full px-8"
          >
            Start Consultation
          </Button>
          <Button
            render={<Link href="/prescriptions" />}
            size="lg"
            variant="outline"
            className="h-12 rounded-full px-8"
          >
            View Prescriptions
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground md:text-sm">
          <Badge variant="secondary">Local Ollama Inference</Badge>
          <Badge variant="secondary">Streaming Chat</Badge>
          <Badge variant="secondary">SQLite + Drizzle</Badge>
          <Badge variant="secondary">Calendar Scheduling</Badge>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-12 grid w-full max-w-6xl gap-4 md:grid-cols-3">
        {featureCards.map((feature) => (
          <Card
            key={feature.title}
            className="border border-border/70 bg-card/80 backdrop-blur-sm"
          >
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Designed to reduce cognitive load and make medication workflows
                easier to follow.
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
