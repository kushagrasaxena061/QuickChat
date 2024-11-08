"use client";

import React, { useState } from "react";
import { useCreateWorkspaceModal } from "../store/use-create-workspace-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateWorkspace } from "../api/use-create-workspaces";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const CreateWorkspaceModal = () => {
  const [open, setOpen] = useCreateWorkspaceModal();
  const [name, setName] = useState("");

  const { mutate, isPending, isError, isSuccess, isSettled, data, error } =
    useCreateWorkspace();
  const router = useRouter();

  const handleClose = () => {
    setOpen(false);
    setName("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    mutate(
      { name },
      {
        onSuccess(id) {
          toast.success("Workspace Created");
          router.push(`/workspace/${id}`);
          handleClose();
        },
      }
    );
    // try {
    //     const data = await mutate({
    //         name: "Workspace 1",
    //     }, {
    //         onSuccess(data) {
    //             router.push(`/workspaces/${data}`)
    //         },

    //         onError: () => { }, onSettled: () => { }
    //     })
    // } catch (error) {
    //     console.log("Error")
    // }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-neutral-900 text-white">
        <DialogHeader>
          <DialogTitle>Add a Workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            required
            autoFocus
            minLength={3}
            placeholder="Workspace name e.g. 'Work', 'Personal', 'Home'"
          />
          <div className="flex justify-end">
            <Button disabled={isPending} variant="outline" className="text-black">Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
