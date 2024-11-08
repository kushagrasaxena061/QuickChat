import { useDeleteMessage } from "@/features/messages/api/use-delete-message";
import { useUpdateMessage } from "@/features/messages/api/use-update-message";
import { useToggleReaction } from "@/features/reactions/api/use-toggle-reaction";
import { UseConfirm } from "@/hooks/use-confirm";
import { usePanel } from "@/hooks/use-panel";
import { cn } from "@/lib/utils";
import { format, formatDate, isToday, isYesterday } from "date-fns";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { Hint } from "./hint";
import { Reactions } from "./Reactions";
import { ThreadBar } from "./ThreadBar";
import Thumbnail from "./thumbnail";
import { Toolbar } from "./Toolbar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Renderer = dynamic(() => import("@/components/Renderer"), { ssr: false });
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface MessageProps {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
    }
  >;
  body: Doc<"messages">["body"];
  image: string | null | undefined;
  createdAt: Doc<"messages">["_creationTime"];
  updatedAt: Doc<"messages">["updatedAt"];
  isEditing: boolean;
  isCompact?: boolean;
  setEditingId: (id: Id<"messages"> | null) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadName?: string;
  threadTimestamp?: number;
}

const formatFullTime = (date: Date) => {
  return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "h:mm:ss a")}`;
};

const Message = ({
  id,
  memberId,
  authorImage,
  authorName = "Member",
  isAuthor,
  reactions,
  body,
  image,
  createdAt,
  updatedAt,
  isEditing,
  isCompact,
  setEditingId,
  hideThreadButton,
  threadCount,
  threadImage,
  threadName,
  threadTimestamp,
}: MessageProps) => {
  const { mutate: updateMessage, isPending: isUpdatingMessage } =
    useUpdateMessage();
  const { mutate: removeMessage, isPending: isRemovingMessage } =
    useDeleteMessage();
  const { mutate: toggleReaction, isPending: isTogglingReaction } =
    useToggleReaction();

  const [ConfirmDialog, confirm] = UseConfirm(
    "Are you sure ?",
    "This is irreversible message."
  );
  const { parentMessageId, onOpenMessage, onOpenProfile, onClose } = usePanel();

  const isPending = isUpdatingMessage || isTogglingReaction;

  const handleReaction = (value: string) => {
    toggleReaction({ messageId: id, value }),
      {
        onError: () => {
          toast.error("Failed to add reaction");
        },
      };
  };

  const handleUpdate = ({ body }: { body: string }) => {
    updateMessage(
      { id, body },
      {
        onSuccess: () => {
          toast.success("Message Updated");
          setEditingId(null);
        },
        onError: () => {
          toast.error("Failed to Update the message");
        },
      }
    );
  };

  const handleRemove = async () => {
    const ok = await confirm();

    if (!ok) {
      return;
    }

    removeMessage(
      { id },
      {
        onSuccess: () => {
          toast.success("Deleted Successfully");
          if (parentMessageId === id) {
            onClose();
          }
        },
        onError: () => {
          toast.error("Couldn't Delete message");
        },
      }
    );
  };

  if (isCompact) {
    return (
      <>
        <ConfirmDialog />
        <div
          className={cn(
            "flex flex-col gapy-2 p-1.5 px-5 hover:bg-neutral-700 text-white group relative",
            isEditing && "bg-neutral-500 hover:bg-neutral-700 ",
            isRemovingMessage &&
              "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
          )}>
          <div className="flex items-start gap-2">
            <Hint label={formatFullTime(new Date(createdAt))}>
              <button className="text-xs  opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
                {format(new Date(createdAt), "hh:mm")}
              </button>
            </Hint>
            {!isEditing && (
              <div className="flex flex-col w-full">
                <Thumbnail url={image} />
                <Renderer value={body} />
                {updatedAt ? (
                  <span className="text-xs text-muted-foreground">
                    (edited)
                  </span>
                ) : null}
                <Reactions data={reactions} onChange={handleReaction} />
                <ThreadBar
                  count={threadCount}
                  image={threadImage}
                  name={threadName}
                  timestamp={threadTimestamp}
                  onClick={() => onOpenMessage(id)}
                />
              </div>
            )}
            {!isEditing && (
              <Toolbar
                isAuthor={isAuthor}
                isPending={isPending}
                handleEdit={() => setEditingId(id)}
                handleThread={() => onOpenMessage(id)}
                handleReaction={handleReaction}
                handleDelete={handleRemove}
                hideThreadButton={hideThreadButton}
              />
            )}
          </div>
        </div>
      </>
    );
  }

  const avatarFallback = authorName.charAt(0).toUpperCase();

  return (
    <>
      <ConfirmDialog />
      <div
        className={cn(
          "flex flex-col text-white gapy-2 p-1.5 px-5 hover:bg-neutral-700 group relative",
          isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433] text-white",
          isRemovingMessage &&
            "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
        )}>
        <div className="flex  items-start gap-2">
          <button onClick={() => onOpenProfile(memberId)}>
            <Avatar>
              <AvatarImage src={authorImage} />
              <AvatarFallback className="text-white rounded-md bg-sky-500">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </button>
          {isEditing ? (
            <div className="text-white w-full h-full">
              <Editor
                onSubmit={handleUpdate}
                disabled={isPending}
                defaultValue={JSON.parse(body)}
                onCancel={() => setEditingId(null)}
                variant="update"
              />
            </div>
          ) : (
            <div className="flex  flex-col w-full overflow-hidden">
              <div className="text-sm">
                <button
                  onClick={() => onOpenProfile(memberId)}
                  className="font-bold text-[#A64D79]  hover:underline">
                  {authorName}
                </button>
                <span className="">&nbsp;&nbsp;</span>
                <Hint label={formatFullTime(new Date(createdAt))}>
                  <button className="text-xs text-muted-foreground hover:underline">
                    {formatDate(new Date(createdAt), "h:mm a")}
                  </button>
                </Hint>
              </div>
              <Thumbnail url={image} />
              <Renderer value={body} />
              {updatedAt ? (
                <span className="text-xs text-muted-foreground">(edited)</span>
              ) : null}
              <Reactions data={reactions} onChange={handleReaction} />
              <ThreadBar
                count={threadCount}
                image={threadImage}
                name={threadName}
                timestamp={threadTimestamp}
                onClick={() => onOpenMessage(id)}
              />
            </div>
          )}
        </div>
        {!isEditing && (
          <Toolbar
            isAuthor={isAuthor}
            isPending={isPending}
            handleEdit={() => setEditingId(id)}
            handleThread={() => onOpenMessage(id)}
            handleReaction={handleReaction}
            handleDelete={handleRemove}
            hideThreadButton={hideThreadButton}
          />
        )}
      </div>
    </>
  );
};

export default Message;
