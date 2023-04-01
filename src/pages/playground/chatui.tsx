import { cn } from "@/utils/fns"
import { nanoid } from "nanoid"
import { useState } from "react"

type Message = {
    id: string
    index: number
    content: string
}

export default function Page() {
    const [messages, setMessages] = useState<Message[]>([])

    const buttonText = messages.length === 0 ? "start" : "send"

    const handleButtonClick: React.MouseEventHandler = (e) => {
        const newMessage = {
            id: nanoid(),
            index: messages.length,
            content: randomCharacters()
        }
        setMessages([...messages, newMessage])
    }

    return (
        <main className={cn(
            "font-serif h-screen max-h-screen",
        )}>
            <div className={cn(
                "h-full max-w-xl mx-auto p-8 pt-0",
                "flex flex-col gap-3 justify-end"
            )}>
                <div className={cn(
                    "overflow-y-auto pt-8",
                    "flex flex-col-reverse gap-3"
                )}>
                    {messages.slice().reverse().map((msg) => (
                        <MessageComponent
                            key={msg.id}
                            index={msg.index}
                            content={msg.content}
                        />
                    ))}
                </div>
                <button className={cn(
                    "bg-neutral-300 hover:bg-neutral-300/50 rounded",
                    "leading-none p-2 text-neutral-600",
                    "transition-all duration-75"
                )}
                    onClick={handleButtonClick}>
                    {buttonText}
                </button>
            </div>
        </main>
    )
}

type MessageComponentProps = {
    content: string
    index: number
}

function MessageComponent({ content, index }: MessageComponentProps) {
    return (
        <div className={cn(
            "flex items-start gap-3",
            "bg-neutral-100 rounded-lg p-4",
            "text-neutral-600"
        )}>
            <p className="leading-none w-4">{index}</p>
            {/* <p>{content}</p> */}
            <div className={cn(
                "flex flex-col gap-3 grow"
            )}>
                <div className={cn(
                    "animate-pulse rounded bg-neutral-200 h-4"
                )} />
                <div className={cn(
                    "animate-pulse rounded bg-neutral-200 h-4 w-11/12"
                )} />
                <div className={cn(
                    "animate-pulse rounded bg-neutral-200 h-4"
                )} />
                <div className={cn(
                    "animate-pulse rounded bg-neutral-200 h-4 w-3/5"
                )} />
            </div>

        </div>
    )
}

function randomCharacters() {
    const set = "abcdefghijklmnopqrstuvwxyz      "
    const count = Math.ceil(Math.random() * 400) + 100
    let result = ""
    for (let i = 0; i < count; i++) {
        result = result.concat(set[Math.floor(Math.random() * set.length)] || "")
    }
    return result
}