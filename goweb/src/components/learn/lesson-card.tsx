import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen } from "lucide-react";
import { Lesson } from "@/lib/types/learn";

interface LessonCardProps {
  lesson: Lesson;
  onClick: () => void;
}

export function LessonCard({ lesson, onClick }: LessonCardProps) {
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      {lesson.thumbnail && (
        <div 
          className="aspect-video bg-cover bg-center"
          style={{ backgroundImage: `url(${lesson.thumbnail})` }}
        />
      )}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold line-clamp-2">{lesson.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {lesson.description}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {lesson.duration}
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {lesson.difficulty}
          </div>
        </div>
        <Badge variant="secondary">{lesson.category}</Badge>
      </div>
    </Card>
  );
}