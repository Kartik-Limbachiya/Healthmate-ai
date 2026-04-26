import { Card, CardContent } from "@/components/ui/card";
import { Activity, ShieldCheck, Users } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="container py-12 max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">About Us</h1>
        <p className="text-xl text-muted-foreground">Our mission is to make health and fitness accessible to everyone through AI.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="text-center border-none shadow-none bg-transparent">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">Smart Tracking</h3>
            <p className="text-muted-foreground">We believe tracking your fitness shouldn't feel like a chore. Our AI does the heavy lifting for you.</p>
          </CardContent>
        </Card>
        <Card className="text-center border-none shadow-none bg-transparent">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">Community First</h3>
            <p className="text-muted-foreground">Fitness is a journey best traveled with others. We connect you with a supportive network of peers.</p>
          </CardContent>
        </Card>
        <Card className="text-center border-none shadow-none bg-transparent">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">Privacy Centric</h3>
            <p className="text-muted-foreground">Your health data is highly sensitive. We employ state-of-the-art encryption to keep it safe.</p>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-primary text-primary-foreground border-none">
        <CardContent className="p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-3xl font-bold">The HealthMate Story</h2>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
            Founded by a team of fitness enthusiasts and AI engineers, HealthMate was built out of frustration with clunky, manual calorie counters. We envisioned a world where you could simply tell an AI what you ate, and let it handle the math. Today, HealthMate serves thousands of users on their journey to a healthier lifestyle.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
