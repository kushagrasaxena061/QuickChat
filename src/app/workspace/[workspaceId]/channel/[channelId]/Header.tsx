"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRemoveChannel } from "@/features/channels/api/use-remove-channel";
import { useUpdateChannel } from "@/features/channels/api/use-update-channel copy";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useChannelId } from "@/hooks/use-channel-id";
import { UseConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { toast } from "sonner";

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [value, setValue] = useState(title);

  const [ConfirmDialog, confirm] = UseConfirm(
    "Are you sure ?",
    "This doing is irreversible"
  );

  const { mutate: updateChannel, isPending: updatingChannel } =
    useUpdateChannel();
  const { mutate: removeChannel, isPending: removingChannel } =
    useRemoveChannel();

  const { data: member } = useCurrentMember({ workspaceId });

  const handleEditOpen = (value: boolean) => {
    if (member?.role !== "admin") {
      return;
    }

    setEditOpen(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
    setValue(value);
  };

  const handleDelete = async () => {
    const ok = await confirm();

    if (!ok) {
      return;
    }

    removeChannel(
      { id: channelId },
      {
        onSuccess: () => {
          toast.success("Channel deleted");
          router.replace(`/workspace/${workspaceId}`);
        },
        onError: () => {
          toast.error("Failed to delete channel");
        },
      }
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateChannel(
      { id: channelId, name: value },
      {
        onSuccess: () => {
          toast.success("Channel name updated");
        },
        onError: () => {
          toast.error("Failed to update channel name");
        },
      }
    );
  };

  return (
    <div className="bg-black/90 text-white  border-black h-[49px] flex  items-center px-4 overflow-hidden">
      <ConfirmDialog />
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="text-lg font-semibold px-2 overflow-hidden w-auto hover:text-black"
            size="sm">
            <span className="truncate text-white hover:text-black ">
           # {title}
            </span>
            <FaChevronDown className="size-2.5 ml-2" />
          </Button>
        </DialogTrigger>
        <DialogContent className="p-0 bg-[#171717] overflow-hidden">
          <DialogHeader className="p-4 border-b bg-[#171717]">
            <DialogTitle className="text-white"># {title}</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4 flex flex-col gap-y-2">
            <Dialog open={editOpen} onOpenChange={handleEditOpen}>
              <DialogTrigger asChild>
                <div className="px-5 py-4 bg-bg-[#A64D79] rounded-lg border cursor-pointer hover:bg-[#171717]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">
                      Channel name
                    </p>
                    {member?.role === "admin" && (
                      <p className="text-sm text-gray-100 hover:underline font-semibold">
                        Edit
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-white"># {title}</p>
                </div>
              </DialogTrigger>
              <DialogContent className="bg-[#171717]">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Rename this channel
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    value={value}
                    disabled={updatingChannel}
                    onChange={handleChange}
                    required
                    autoFocus
                    minLength={3}
                    maxLength={80}
                    placeholder="e.g plan-budget"
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="default"
                        disabled={updatingChannel}
                        className="bg-black text-white">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button disabled={updatingChannel} className="bg-black">
                      Save
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            {member?.role === "admin" && (
              <button
                onClick={handleDelete}
                disabled={removingChannel}
                className="flex -items-center hover:text-black space-x-2 gap-y-2 px-5 py-4 bg-[#171717] rounded-lg cursor-pointer border hover:bg-gray-50 text-black">
                <TrashIcon className="size-4 text-white" />
                <p className="text-sm font-semibold text-white hover:text-black">
                  Delete Channel
                </p>
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
