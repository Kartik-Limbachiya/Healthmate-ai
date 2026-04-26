import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin } from "lucide-react";

const jobs = [
  { role: "Senior Frontend Engineer", location: "Remote", type: "Full-time", desc: "Help us build blazing fast, highly interactive UI components using Next.js and Tailwind." },
  { role: "Machine Learning Researcher", location: "New York, NY", type: "Full-time", desc: "Train and fine-tune LLMs to provide more accurate nutritional advice and workout plans." },
  { role: "Community Manager", location: "Remote", type: "Part-time", desc: "Engage with our user base, moderate the community feed, and gather feature feedback." },
];

export default function CareersPage() {
  return (
    <div className="container py-12 max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Careers</h1>
        <p className="text-xl text-muted-foreground">Join our mission to revolutionize health tech. Open positions listed below.</p>
      </div>
      <div className="space-y-6">
        {jobs.map((job, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  {job.role}
                </h3>
                <div className="flex gap-4 text-sm text-muted-foreground font-medium">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                  <span>•</span>
                  <span>{job.type}</span>
                </div>
                <p className="text-muted-foreground mt-2">{job.desc}</p>
              </div>
              <Button size="lg" className="shrink-0 w-full md:w-auto">Apply Now</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-muted/50 border-dashed border-2 text-center p-8">
        <p className="text-muted-foreground">Don't see a role that fits? Send your resume to <strong className="text-foreground">careers@healthmate.ai</strong></p>
      </Card>
    </div>
  );
}
