import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Apple, Droplet, Flame, Coffee } from "lucide-react";

const tips = [
  { title: "Hydration is Key", desc: "Drink at least 3 liters of water daily. Hydration affects energy levels and brain function.", icon: Droplet },
  { title: "Prioritize Protein", desc: "Aim for 1.6g to 2.2g of protein per kg of body weight to support muscle recovery.", icon: Flame },
  { title: "Don't Fear Carbs", desc: "Carbohydrates are your body's primary energy source. Focus on complex carbs like oats and sweet potatoes.", icon: Apple },
  { title: "Timing Your Caffeine", desc: "Avoid caffeine 6 hours before bed to ensure deep, restorative sleep for muscle recovery.", icon: Coffee },
];

export default function NutritionTipsPage() {
  return (
    <div className="container py-12 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Nutrition Tips</h1>
        <p className="text-xl text-muted-foreground">Actionable advice on dieting, macros, and eating healthy.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tips.map((tip, i) => (
          <Card key={i} className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <tip.icon className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl">{tip.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{tip.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
