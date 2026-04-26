import { Card, CardContent } from "@/components/ui/card";

export default function FAQPage() {
  return (
    <div className="container py-12 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground">Everything you need to know about HealthMate.</p>
      </div>
      <Card>
        <CardContent className="pt-6 min-h-[400px] flex items-center justify-center text-muted-foreground flex-col gap-4">
          <p>We are currently updating our FAQ section.</p>
          <p>Check back soon for more content!</p>
        </CardContent>
      </Card>
    </div>
  );
}
