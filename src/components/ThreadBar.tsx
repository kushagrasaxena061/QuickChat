import { formatDistanceToNow } from "date-fns";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface ThreadBarProps {
  count?: number;
  image?: string;
  timestamp?: number;
  name?: string;
  onClick?: () => void;
}

export const ThreadBar = ({
  count,
  image,
  timestamp,
  name = "Member",
  onClick,
}: ThreadBarProps) => {
  if (!count || !timestamp) {
    return null;
  }

  const avatarFallback = name.charAt(0).toLowerCase();

  return (
    <button
      onClick={onClick}
      className="p-1 rounded-md hover:bg-[#A64D79] border border-transparent hover:border-border flex items-center justify-start group/thread-bar transition max-w-[600px]">
      <div className="flex text-white items-center gap-2 overflow-hidden">
        <Avatar className="size-6 shrink-0">
          <AvatarImage src={image} />
          <AvatarFallback className="text-white rounded-md bg-[#A64D79]">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs text-white hover:underline font-bold truncate">
          {count} {count > 1 ? "replies" : "reply"}
        </span>
        <span className="text-xs text-white truncate group-hover/thread-bar:hidden block">
          Last reply {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>
        <span className="text-xs text-white truncate group-hover/thread:block hidden">
          View Thread
        </span>
      </div>
      <ChevronRight className="size-4 text-white ml-auto opacity-0 group-hover/thread-bar:opacity-100 transition shrink-0" />
    </button>
  );
};
