"use client";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Info, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const Toolbar = () => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();

  const { data } = useGetWorkspace({ id: workspaceId });

  const [open, setOpen] = useState(false);

  const { data: channels } = useGetChannels({ workspaceId });
  const { data: members } = useGetMembers({ workspaceId });

  const onChannelClick = (channelId: string) => {
    setOpen(false);
    router.push(`/workspace/${workspaceId}/channel/${channelId}`);
  };

  const onMemberClick = (memberId: string) => {
    setOpen(false);
    router.push(`/workspace/${workspaceId}/member/${memberId}`);
  };

return (
    <nav className="bg-neutral-900  flex items-center justify-between h-10 p-1.5">
      <div className="text-white font-bold ml-2">QuickChat </div>
      {/* ADD LOGO */}
      <div className="flex-1 bg-black/90" />
      <div className="  min-w-[280px] max-[642px] grow-[2] shrink">
        <Button
          onClick={() => setOpen(true)}
          size="sm"
          className="bg-neutral-800 hover:bg-neutral-950 w-full justify-start h-7 px-2">
          <Search className="bg-black  size-4 text-white mr-2" />
          <span className="text-white text-xs">Search {data?.name}</span>
        </Button>

        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput className="bg-neutral-900" placeholder="Type a command or search..." />
          <CommandList className="bg-[#171717] ">
            <CommandEmpty className="text-white">No results found.</CommandEmpty>
            <CommandGroup className="text-white" heading="Channels">
              {channels?.map((channel) => (
                <CommandItem
                  key={channel._id}
                  onSelect={() => onChannelClick(channel._id)}>
                  {channel.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup className="text-white" heading="Members">
              {members?.map((member) => (
                <CommandItem
                  key={member._id}
                  onSelect={() => onMemberClick(member._id)}>
                  {member.user.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
      <div className="ml-auto flex-1 flex items-center justify-end">
        <Button variant="transparent" size="iconSm">
          <Hint label="Help" side="left" align="center">
          <Info className="size-5 text-white" />
          </Hint>
        </Button>
      </div>
    </nav>
  );
};

    
