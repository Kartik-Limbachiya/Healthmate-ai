import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const faqs = [
  { q: "Is HealthMate free to use?", a: "Yes, the core features of HealthMate including the AI Chatbot and Community Feed are completely free." },
  { q: "How accurate is the AI Coach?", a: "Our AI is powered by state-of-the-art LLMs trained on extensive fitness and nutritional databases, but you should always consult a real doctor before starting extreme diets." },
  { q: "Can I delete my data?", a: "Yes. You have full control over your data. You can delete individual logs or completely wipe your account from the Profile settings." },
  { q: "How do I upload multiple images to a blog?", a: "When creating a blog, simply click 'Upload Images' and select multiple files from your device. Our system will format them into a neat grid automatically." },
];

export default function FAQPage() {
  return (
    <div className="container py-12 max-w-3xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground">Everything you need to know about HealthMate.</p>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <Card key={i} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                {faq.q}
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-14 text-muted-foreground">
              {faq.a}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
