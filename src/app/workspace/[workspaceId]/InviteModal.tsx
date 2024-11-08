import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNewJoinCode } from "@/features/workspaces/api/use-new-join-code";
import { UseConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { CopyIcon, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

interface InviteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  name: string;
  joinCode: string;
}

export const InviteModal = ({
  open,
  setOpen,
  name,
  joinCode,
}: InviteModalProps) => {
  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useNewJoinCode();

  const handleCopy = () => {
    const inviteLink = `${window.location.origin}/join/${workspaceId}`;
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => toast.success("Invite Link Copied"));
  };

  const [ConfirmDialog, confirm] = UseConfirm(
    "Are you Sure ?",
    "This will deactivate the current invite code and generate a new one."
  );

  const handleNewCode = async () => {
    const ok = await confirm();

    if (!ok) {
      return;
    }

    mutate(
      { workspaceId },
      {
        onSuccess: () => {
          toast.success("Invite Code regenerated");
        },
        onError: () => toast.error("Invite Code regeneration failed"),
      }
    );
  };

  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#171717]">
          <DialogHeader>
            <DialogTitle className="text-white">
              Invite People to your {name}
            </DialogTitle>
            <DialogDescription className="text-white">
              Use the code below to invite people to your workspace - {name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex bg-[#A64D79] flex-col gap-y-4 items-center justify-center py-10">
            <p className="text-4xl font-bold tracking-widest uppercase text-white">
              {joinCode}
            </p>
            <Button
              onClick={handleCopy}
              variant="ghost"
              size="sm"
              className="space-x-3 font-bold text-white">
              <CopyIcon className="size-4 ml-2  " />
              Copy Link
            </Button>
          </div>
          <div className="flex items-center justify-between w-full">
            <Button
              disabled={isPending}
              onClick={handleNewCode}
              variant="outline">
              New Code <RefreshCcw className="size-4 ml-2" />
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
