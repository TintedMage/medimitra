import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-100 h-100 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 text-center space-y-6 max-w-3xl px-4">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
          ✨ MediMitra Orchestration Engine
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
          Intelligent Healthcare, <br className="hidden md:block" /> Simply
          Delivered.
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
          Analyze medical imagery, manage prescriptions, and track your health
          seamlessly with our sophisticated multimodal AI assistant.
        </p>

        <div className="pt-8">
          <Button
            render={<Link href="/chat" />}
            size="lg"
            className="rounded-full px-8 h-14 text-base shadow-lg hover:shadow-primary/25 transition-all duration-300"
          >
            Start Consultation
          </Button>
        </div>
      </div>
    </div>
  );
}
