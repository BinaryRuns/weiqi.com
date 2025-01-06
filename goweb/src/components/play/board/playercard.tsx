import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PlayerCardProps {
  position: "top" | "bottom";
  username?: string;
}

const PlayerCard = ({ position, username }: PlayerCardProps) => {
  return (
    <div className="w-full text-white mb-2 flex items-start gap-3">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-zinc-700">
          {position === "top" ? "O" : "P"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="mb-3 text-sm">{username}</div>
      </div>
    </div>
  );
};

export default PlayerCard;
