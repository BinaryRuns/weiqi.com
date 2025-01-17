"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LessonCard } from "@/components/learn/lesson-card";
import { Lesson } from "@/lib/types/learn";

// TODO: Temporary mock data - replace with API call
const mockLessons: Lesson[] = [
  {
    id: "1",
    title: "Introduction to Go",
    description: "Learn the basic rules and concepts of the game",
    category: "basics",
    duration: "15 min",
    difficulty: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800",
  },
  
];

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState("basics");

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Learn</h1>
        <p className="text-muted-foreground">
          Master the game of Go with our comprehensive lessons
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="mt-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockLessons
              .filter(lesson => lesson.category === "basics")
              .map(lesson => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onClick={() => console.log('Open lesson:', lesson.id)}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="fundamentals" className="mt-6">
          {/* Similar grid for fundamentals lessons */}
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          {/* Similar grid for advanced lessons */}
        </TabsContent>
      </Tabs>
    </div>
  );
}