import HumanModel3D from "@/components/HumanModel3D";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-background flex items-center justify-center px-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <HumanModel3D />

        <div className="space-y-3">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground">
              built.
            </span>
          </h1>
          <p className="max-w-xl text-base md:text-lg text-muted-foreground">
            A modern fitness companion to track, visualize, and understand your body
            composition as you build your strongest self.
          </p>
        </div>
      </div>
    </main>
  );
}
