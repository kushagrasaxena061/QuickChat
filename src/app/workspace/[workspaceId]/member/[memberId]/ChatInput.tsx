import React, { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Quill from 'quill'
import { useCreateMessage } from '@/features/messages/api/use-create-message';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { toast } from 'sonner';
import { Id } from '../../../../../../convex/\_generated/dataModel';
import { useGenerateUploadUrl } from '@/features/upload/api/use-generate-upload-url';

const Editor = dynamic(() => import("@/components/editor"), { ssr: false })

interface ChatInputProps {
    placeholder: string;
    conversationId: Id<"conversations">
}

type CreateMessageValues = {
    conversationId: Id<"conversations">;
    workspaceId: Id<"workspaces">;
    body: string;
    image: Id<"_storage"> | undefined;
}

export const ChatInput = ({ placeholder, conversationId }: ChatInputProps) => {
    const [editorKey, setEditorKey] = useState(0)
    const [isPending, setIsPending] = useState(false)

    const editorRef = useRef<Quill | null>(null)

    const workspaceId = useWorkspaceId()

    const { mutate: generateUploadUrl } = useGenerateUploadUrl()
    const { mutate: createMessage } = useCreateMessage()

    const handleSubmit = async ({ body, image }: { body: string, image: File | null }) => {
        setIsPending(true);
        editorRef?.current?.enable(false)

        const values: CreateMessageValues = {
            conversationId, workspaceId, body, image: undefined
        }

        if (image) {
            const url = await generateUploadUrl({})
            // const url = await generateUploadUrl({}, { throwError: true })

            if (!url) {
                throw new Error("Url not found")
            }

            const result = await fetch(url, {
                method: 'POST', headers: { "Content-Type": image.type }, body: image
            })

            if (!result.ok) {
                throw new Error("Failed to upload image");
            }

            const { storageId } = await result.json()

            values.image = storageId;
        }
        try {
            setIsPending(true);
            await createMessage(values);
            // await createMessage(values, { throwError: true });            toast.success("Message Sent")
            setEditorKey((prevKey) => prevKey + 1);
        } catch (error) {
            toast.error("Failed to Send message")
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="px-5 w-full ">
            <Editor key={editorKey} placeholder={placeholder} onSubmit={handleSubmit} disabled={isPending} innerRef={editorRef} variant="create" />
        </div>
    )

}
