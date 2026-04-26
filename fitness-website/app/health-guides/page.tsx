import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Activity, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

const guides = [
  { title: "The Ultimate Guide to Hypertrophy", desc: "Learn the science behind building muscle mass effectively.", icon: Activity, tag: "Workout" },
  { title: "Mastering Your Metabolism", desc: "Understand how your body processes food and burns energy.", icon: Heart, tag: "Biology" },
  { title: "Recovery & Sleep Patterns", desc: "Why resting is just as important as your time in the gym.", icon: BookOpen, tag: "Wellness" },
  { title: "Cardio vs. Weightlifting", desc: "Which one should you prioritize for your specific goals?", icon: Activity, tag: "Workout" },
];

export default function HealthGuidesPage() {
  return (
    <div className="container py-12 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Health Guides</h1>
        <p className="text-xl text-muted-foreground">Comprehensive guides to help you understand your body and optimize your fitness.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow group cursor-pointer border-primary/10">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <guide.icon className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-primary mb-2">{guide.tag}</div>
              <CardTitle className="text-2xl">{guide.title}</CardTitle>
              <CardDescription className="text-base mt-2">{guide.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-primary font-medium group-hover:underline">
                Read Guide <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
