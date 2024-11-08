import { useCurrentMember } from "@/features/members/api/use-current-member";
import { GetMessagesReturnType } from "@/features/messages/api/use-get-messages";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import { Loader } from "lucide-react";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import ChannelHero from "./ChannelHero";
import ConversationHero from "./conversation-hero";
import Message from "./Message";

const TIME_THRESHOLD = 5;

interface MessageListProps {
  memberName?: string;
  memberImage?: string;
  channelName?: string;
  channelCreationTime?: number;
  variant?: "channel" | "thread" | "conversation";
  data: GetMessagesReturnType | undefined;
  loadMore: () => void;
  isLoadingMore: boolean;
  canLoadMore: boolean;
}

const formatDateLabel = (dataStr: string) => {
  const date = new Date(dataStr);
  if (isToday(date)) {
    return "Today";
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  return format(date, "EEEE, MMMM d");
};

const MessageList = ({
  memberName,
  memberImage,
  channelName,
  channelCreationTime,
  variant = "channel",
  data,
  loadMore,
  isLoadingMore,
  canLoadMore,
}: MessageListProps) => {
  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

  const groupedMessages = data?.reduce(
    (groups, message: any) => {
      const date = new Date(message._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].unshift(message);
      return groups;
    },
    {} as Record<string, (typeof data)[0][]>
  );

  const workspaceId = useWorkspaceId();
  const { data: currentMember } = useCurrentMember({ workspaceId });

  return (
    <div className="flex-1 bg-neutral-900 text-white flex flex-col-reverse pb-4 overflow-y-auto  messages-scrollbar">
      {Object.entries(groupedMessages || {}).map(([dateKey, messages]: any) => (
        <div key={dateKey}>
          <div className="text-center text-white my-2 relative">
            <div className="absolute text-white top-1/2 left-0 right-0 border-t border-[#A64D79]" />
            <span className="relative text-white inline-block bg-neutral-900 px-4 py-1 rounded-full text-sm border border-[#A64D79] shadow-sm">
              {formatDateLabel(dateKey)}
            </span>
          </div>
          <div className="text-white">
            {messages.map((message: any, index: any) => {
              const prevMessage = messages[index - 1];
              const isCompact =
                prevMessage &&
                prevMessage.user?._id === message.user?._id &&
                differenceInMinutes(
                  new Date(message._creationTime),
                  new Date(prevMessage._creationTime)
                ) < TIME_THRESHOLD;

              return (
                <Message
                  key={message._id}
                  id={message._id}
                  memberId={message.memberId}
                  authorImage={message.user?.image}
                  authorName={message.user.name}
                  isAuthor={message.memberId === currentMember?._id}
                  reactions={message.reactions}
                  body={message.body}
                  image={message.image}
                  updatedAt={message.updatedAt}
                  createdAt={message._creationTime}
                  isEditing={editingId === message._id}
                  setEditingId={setEditingId}
                  isCompact={isCompact}
                  hideThreadButton={variant === "thread"}
                  threadCount={message.threadCount}
                  threadImage={message.threadImage}
                  threadName={message.threadName}
                  threadTimestamp={message.threadTimestamp}
                />
              );
            })}
          </div>
        </div>
      ))}
      <div
        className="h-1 "
        ref={(el) => {
          if (el) {
            const observer = new IntersectionObserver(
              ([entry]) => {
                if (entry.isIntersecting && canLoadMore) {
                  loadMore();
                }
              },
              { threshold: 1.0 }
            );
            observer.observe(el);
            return () => observer.disconnect();
          }
        }}
      />

      {isLoadingMore && (
        <div className="text-center my-2 relative">
          <div className="absolute top-1/2 left-0 right-0 border-t border-black" />
          <span className="relative inline-block bg-neutral-900 px-4 py-1 rounded-full text-sm border border-neutral-900 shadow-sm">
            <Loader className="size-4 animate-spin" />
          </span>
        </div>
      )}
      {variant === "channel" && channelName && channelCreationTime && (
        <ChannelHero name={channelName} creationTime={channelCreationTime} />
      )}
      {variant === "conversation" && (
        <ConversationHero name={memberName} image={memberImage} />
      )}
    </div>
  );
};

export default MessageList;
