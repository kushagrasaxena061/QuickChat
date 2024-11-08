import React, { useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface EmojiPopoverProps {
    children: React.ReactNode;
    hint?: string;
    onEmojiSelect: (value: string) => void;
}

export const EmojiPopover = ({ children, hint = "Emoji", onEmojiSelect }: EmojiPopoverProps) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const onSelect = (value: EmojiClickData) => {
        onEmojiSelect(value.emoji);
        setPopoverOpen(false)

        setTimeout(() => {
            setTooltipOpen(false)
        }, 500)
    }

    return (
        <TooltipProvider>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen} delayDuration={50}>
                    <PopoverTrigger asChild>
                        <TooltipTrigger asChild>
                            {children}
                        </TooltipTrigger>
                    </PopoverTrigger>
                    <TooltipContent className='bg-black textwhite border border-white/5'>
                        <p className='font-medium text-sm'>{hint}</p>
                    </TooltipContent>
                </Tooltip>
                <PopoverContent className='p-0 w-full border-none shadow-none'>
                    <EmojiPicker onEmojiClick={onSelect} />
                </PopoverContent>
            </Popover>
        </TooltipProvider>
    )
}