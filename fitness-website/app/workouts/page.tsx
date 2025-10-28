// // "use client";

// // import { useState } from "react";
// // import { Filter, Search } from "lucide-react";

// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// // import WorkoutsList from "@/components/workouts-list";

// // export default function WorkoutsPage() {
// //   // 1. States for partial search and filters
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
// //   const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
// //   const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

// //   // 2. Handlers for filter clicks
// //   const handleDifficultyClick = (difficulty: string) => {
// //     setSelectedDifficulty((prev) => (prev === difficulty ? null : difficulty));
// //   };

// //   const handleDurationClick = (duration: string) => {
// //     setSelectedDuration((prev) => (prev === duration ? null : duration));
// //   };

// //   const handleEquipmentClick = (equipment: string) => {
// //     setSelectedEquipment((prev) => (prev === equipment ? null : equipment));
// //   };

// //   return (
// //     <main className="container mx-auto py-8 px-4 md:px-6">
// //       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
// //         <div>
// //           <h1 className="text-3xl font-bold mb-2">Workouts Library</h1>
// //           <p className="text-muted-foreground">Find the perfect workout for your fitness goals</p>
// //         </div>

// //         {/* Search input */}
// //         <div className="flex w-full md:w-auto gap-2">
// //           <div className="relative w-full md:w-64">
// //             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
// //             <Input
// //               type="search"
// //               placeholder="Search workouts..."
// //               className="pl-8 w-full"
// //               value={searchTerm}
// //               onChange={(e) => setSearchTerm(e.target.value)}
// //             />
// //           </div>
// //           <Button variant="outline" size="icon">
// //             <Filter className="h-4 w-4" />
// //             <span className="sr-only">Filter</span>
// //           </Button>
// //         </div>
// //       </div>

// //       <Tabs defaultValue="all" className="mb-8">
// //         <TabsList className="grid grid-cols-5 md:w-auto w-full">
// //           <TabsTrigger value="all">All</TabsTrigger>
// //           <TabsTrigger value="strength">Strength</TabsTrigger>
// //           <TabsTrigger value="cardio">Cardio</TabsTrigger>
// //           <TabsTrigger value="flexibility">Flexibility</TabsTrigger>
// //           <TabsTrigger value="hiit">HIIT</TabsTrigger>
// //         </TabsList>

// //         <TabsContent value="all">
// //           {/* Filter Cards */}
// //           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
// //             {/* Difficulty */}
// //             <Card>
// //               <CardHeader className="pb-2">
// //                 <CardTitle>Difficulty Level</CardTitle>
// //                 <CardDescription>Filter workouts by difficulty</CardDescription>
// //               </CardHeader>
// //               <CardContent className="grid grid-cols-3 gap-2">
// //                 {["Beginner", "Intermediate", "Advanced"].map((diff) => (
// //                   <Button
// //                     key={diff}
// //                     variant={selectedDifficulty === diff ? "default" : "outline"}
// //                     size="sm"
// //                     onClick={() => handleDifficultyClick(diff)}
// //                   >
// //                     {diff}
// //                   </Button>
// //                 ))}
// //               </CardContent>
// //             </Card>

// //             {/* Duration */}
// //             <Card>
// //               <CardHeader className="pb-2">
// //                 <CardTitle>Duration</CardTitle>
// //                 <CardDescription>Filter by workout length</CardDescription>
// //               </CardHeader>
// //               <CardContent className="grid grid-cols-3 gap-2">
// //                 {["< 15 min", "15-30 min", "30+ min"].map((dur) => (
// //                   <Button
// //                     key={dur}
// //                     variant={selectedDuration === dur ? "default" : "outline"}
// //                     size="sm"
// //                     onClick={() => handleDurationClick(dur)}
// //                   >
// //                     {dur}
// //                   </Button>
// //                 ))}
// //               </CardContent>
// //             </Card>

// //             {/* Equipment */}
// //             <Card>
// //               <CardHeader className="pb-2">
// //                 <CardTitle>Equipment</CardTitle>
// //                 <CardDescription>Filter by available equipment</CardDescription>
// //               </CardHeader>
// //               <CardContent className="grid grid-cols-3 gap-2">
// //                 {["No Equipment", "Minimal", "Full Gym"].map((eq) => (
// //                   <Button
// //                     key={eq}
// //                     variant={selectedEquipment === eq ? "default" : "outline"}
// //                     size="sm"
// //                     onClick={() => handleEquipmentClick(eq)}
// //                   >
// //                     {eq}
// //                   </Button>
// //                 ))}
// //               </CardContent>
// //             </Card>
// //           </div>

// //           {/* Pass filters to WorkoutsList */}
// //           <WorkoutsList
// //             searchTerm={searchTerm}
// //             difficulty={selectedDifficulty}
// //             duration={selectedDuration}
// //             equipment={selectedEquipment}
// //           />
// //         </TabsContent>

// //         <TabsContent value="strength">
// //           <WorkoutsList category="strength" />
// //         </TabsContent>
// //         <TabsContent value="cardio">
// //           <WorkoutsList category="cardio" />
// //         </TabsContent>
// //         <TabsContent value="flexibility">
// //           <WorkoutsList category="flexibility" />
// //         </TabsContent>
// //         <TabsContent value="hiit">
// //           <WorkoutsList category="hiit" />
// //         </TabsContent>
// //       </Tabs>
// //     </main>
// //   );
// // }



// //app\workouts\page.tsx
// "use client";

// import { useState } from "react";
// import Link from "next/link"; // Make sure Link is imported
// import { Filter, Search } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import WorkoutsList from "@/components/workouts-list";

// export default function WorkoutsPage() {
//   // 1. States for partial search and filters
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
//     null
//   );
//   const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
//   const [selectedEquipment, setSelectedEquipment] = useState<string | null>(
//     null
//   );

//   // 2. Handlers for filter clicks
//   const handleDifficultyClick = (difficulty: string) => {
//     setSelectedDifficulty((prev) => (prev === difficulty ? null : difficulty));
//   };

//   const handleDurationClick = (duration: string) => {
//     setSelectedDuration((prev) => (prev === duration ? null : duration));
//   };

//   const handleEquipmentClick = (equipment: string) => {
//     setSelectedEquipment((prev) => (prev === equipment ? null : equipment));
//   };

//   return (
//     <main className="container mx-auto py-8 px-4 md:px-6">
//       {/* --- AI ANALYZER SECTION --- */}
//       <div className="mb-12">
//         <h2 className="text-3xl font-bold mb-4 text-center">AI Analyzers</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
//             <CardHeader>
//               <CardTitle>Live Squat Analyzer</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="mb-4">
//                 Get real-time feedback on your squat form using our AI.
//               </p>
//               <Link href="/workouts/LiveWorkout">
//                 <Button variant="secondary">Start Live Squat</Button>
//               </Link>
//             </CardContent>
//           </Card>

//           <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
//             <CardHeader>
//               <CardTitle>Live Pushup Counter</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="mb-4">
//                 Count your reps and check your form with our AI pushup analyzer.
//               </p>
//               {/* --- THIS IS THE CORRECTED LINK --- */}
//               <Link href="/workouts/LivePushup">
//                 <Button variant="secondary">Start Live Pushup</Button>
//               </Link>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//       {/* --- END OF AI SECTION --- */}

//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//         <div>
//           <h1 className="text-3xl font-bold mb-2">Workouts Library</h1>
//           <p className="text-muted-foreground">
//             Find the perfect workout for your fitness goals
//           </p>
//         </div>

//         {/* Search input */}
//         <div className="flex w-full md:w-auto gap-2">
//           <div className="relative w-full md:w-64">
//             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               type="search"
//               placeholder="Search workouts..."
//               className="pl-8 w-full"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//           <Button variant="outline" size="icon">
//             <Filter className="h-4 w-4" />
//             <span className="sr-only">Filter</span>
//           </Button>
//         </div>
//       </div>

//       <Tabs defaultValue="all" className="mb-8">
//         <TabsList className="grid grid-cols-5 md:w-auto w-full">
//           <TabsTrigger value="all">All</TabsTrigger>
//           <TabsTrigger value="strength">Strength</TabsTrigger>
//           <TabsTrigger value="cardio">Cardio</TabsTrigger>
//           <TabsTrigger value="flexibility">Flexibility</TabsTrigger>
//           <TabsTrigger value="hiit">HIIT</TabsTrigger>
//         </TabsList>

//         <TabsContent value="all">
//           {/* Filter Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
//             {/* Difficulty */}
//             <Card>
//               <CardHeader className="pb-2">
//                 <CardTitle>Difficulty Level</CardTitle>
//                 <CardDescription>Filter workouts by difficulty</CardDescription>
//               </CardHeader>
//               <CardContent className="grid grid-cols-3 gap-2">
//                 {["Beginner", "Intermediate", "Advanced"].map((diff) => (
//                   <Button
//                     key={diff}
//                     variant={
//                       selectedDifficulty === diff ? "default" : "outline"
//                     }
//                     size="sm"
//                     onClick={() => handleDifficultyClick(diff)}
//                   >
//                     {diff}
//                   </Button>
//                 ))}
//               </CardContent>
//             </Card>

//             {/* Duration */}
//             <Card>
//               <CardHeader className="pb-2">
//                 <CardTitle>Duration</CardTitle>
//                 <CardDescription>Filter by workout length</CardDescription>
//               </CardHeader>
//               <CardContent className="grid grid-cols-3 gap-2">
//                 {["< 15 min", "15-30 min", "30+ min"].map((dur) => (
//                   <Button
//                     key={dur}
//                     variant={selectedDuration === dur ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => handleDurationClick(dur)}
//                   >
//                     {dur}
//                   </Button>
//                 ))}
//               </CardContent>
//             </Card>

//             {/* Equipment */}
//             <Card>
//               <CardHeader className="pb-2">
//                 <CardTitle>Equipment</CardTitle>
//                 <CardDescription>Filter by available equipment</CardDescription>
//               </CardHeader>
//               <CardContent className="grid grid-cols-3 gap-2">
//                 {["No Equipment", "Minimal", "Full Gym"].map((eq) => (
//                   <Button
//                     key={eq}
//                     variant={selectedEquipment === eq ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => handleEquipmentClick(eq)}
//                   >
//                     {eq}
//                   </Button>
//                 ))}
//               </CardContent>
//             </Card>
//           </div>

//           {/* Pass filters to WorkoutsList */}
//           <WorkoutsList
//             searchTerm={searchTerm}
//             difficulty={selectedDifficulty}
//             duration={selectedDuration}
//             equipment={selectedEquipment}
//           />
//         </TabsContent>

//         <TabsContent value="strength">
//           <WorkoutsList category="strength" />
//         </TabsContent>
//         <TabsContent value="cardio">
//           <WorkoutsList category="cardio" />
//         </TabsContent>
//         <TabsContent value="flexibility">
//           <WorkoutsList category="flexibility" />
//         </TabsContent>
//         <TabsContent value="hiit">
//           <WorkoutsList category="hiit" />
//         </TabsContent>
//       </Tabs>
//     </main>
//   );
// }


"use client";

import { useState } from "react";
import Link from "next/link";
import { Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WorkoutsList from "@/components/workouts-list";

export default function WorkoutsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

  const handleDifficultyClick = (difficulty: string) => {
    setSelectedDifficulty((prev) => (prev === difficulty ? null : difficulty));
  };

  const handleDurationClick = (duration: string) => {
    setSelectedDuration((prev) => (prev === duration ? null : duration));
  };

  const handleEquipmentClick = (equipment: string) => {
    setSelectedEquipment((prev) => (prev === equipment ? null : equipment));
  };

  return (
    <main className="container mx-auto py-8 px-4 md:px-6">
      {/* AI ANALYZER SECTION */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-4 text-center">AI Analyzers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <CardHeader>
              <CardTitle>Live Squat Analyzer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Get real-time feedback on your squat form using our AI.
              </p>
              <Link href="/workouts/LiveWorkout">
                <Button variant="secondary">Start Live Squat</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardHeader>
              <CardTitle>Live Pushup Counter</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Count your reps and check your form with our AI pushup analyzer.
              </p>
              {/* FIXED: Correct path to LivePushup */}
              <Link href="/workouts/LiveWorkout/LivePushup">
                <Button variant="secondary">Start Live Pushup</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Workouts Library</h1>
          <p className="text-muted-foreground">
            Find the perfect workout for your fitness goals
          </p>
        </div>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search workouts..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="grid grid-cols-5 md:w-auto w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="strength">Strength</TabsTrigger>
          <TabsTrigger value="cardio">Cardio</TabsTrigger>
          <TabsTrigger value="flexibility">Flexibility</TabsTrigger>
          <TabsTrigger value="hiit">HIIT</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Difficulty Level</CardTitle>
                <CardDescription>Filter workouts by difficulty</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2">
                {["Beginner", "Intermediate", "Advanced"].map((diff) => (
                  <Button
                    key={diff}
                    variant={selectedDifficulty === diff ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDifficultyClick(diff)}
                  >
                    {diff}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Duration</CardTitle>
                <CardDescription>Filter by workout length</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2">
                {["< 15 min", "15-30 min", "30+ min"].map((dur) => (
                  <Button
                    key={dur}
                    variant={selectedDuration === dur ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDurationClick(dur)}
                  >
                    {dur}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Equipment</CardTitle>
                <CardDescription>Filter by available equipment</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2">
                {["No Equipment", "Minimal", "Full Gym"].map((eq) => (
                  <Button
                    key={eq}
                    variant={selectedEquipment === eq ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleEquipmentClick(eq)}
                  >
                    {eq}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          <WorkoutsList
            searchTerm={searchTerm}
            difficulty={selectedDifficulty}
            duration={selectedDuration}
            equipment={selectedEquipment}
          />
        </TabsContent>

        <TabsContent value="strength">
          <WorkoutsList category="strength" />
        </TabsContent>
        <TabsContent value="cardio">
          <WorkoutsList category="cardio" />
        </TabsContent>
        <TabsContent value="flexibility">
          <WorkoutsList category="flexibility" />
        </TabsContent>
        <TabsContent value="hiit">
          <WorkoutsList category="hiit" />
        </TabsContent>
      </Tabs>
    </main>
  );
}