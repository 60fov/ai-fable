import React, { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { api } from "@/utils/api"
import { PaperPlaneIcon } from "@radix-ui/react-icons"
import { cn } from "@/utils/fns"

const DEFAULT_SYSTEM_MESSAGE = `you are a text based fantasy game, designed to generate short narrative where the user is presented with a situation and then choices given the circumstance.
the narrative is generated in 4-5 sentences in the second person.
the users goal is to survive the enemies. after an enemy is defeated they may drop armour or weapons.
all responses should be in the json format below.
{
    "narrative": <string>,
    "choices": [<string>, <string>, <string>, <string>],
    "dies": <boolean>,
    "loot": <null or {"name": <string>, "power": <integer between 1-10>, "defense": <integer between 1-10>}>
}`

const MESSAGE_1 = JSON.stringify({
    "narrative": "you are an adventurer exploring the fallen city of Tome. you see ruins in the distance.",
    "choices": ["take the shortest path to the ruins", "scout the area around the entrance"],
    "dies": false,
    "loot": null,
})

const USER_1 = "scout the area around the entrance"

const MESSAGE_2 = JSON.stringify({
    "narrative": "While scouting the surroudning area you spot serveral undead roaming the entrance",
    "choices": ["attack them to clear the entrance", "wait to see if they wander from the area", "attempt to sneak past them", "find another way in"],
    "dies": false,
    "loot": null,
})

const USER_2 = "attempt to sneak past them"

const ChatTest = () => {

    const chatRef = useRef<ChatHandle>(null)

    const [systemMessage, setSystemMessage] = useState(DEFAULT_SYSTEM_MESSAGE)

    const [messages, setMessages] = useState<Message[]>([
        { "role": "system", "content": systemMessage },
        { "role": "assistant", "content": MESSAGE_1 },
        { "role": "user", "content": USER_1 },
        { "role": "assistant", "content": MESSAGE_2 },
        { "role": "user", "content": USER_2 },
    ])


    const chatMutation = api.openai.chatCompletion.useMutation()
    // const chatData = chatMutation.data

    const textareaDisabled = chatMutation.isLoading

    function resetMessages() {
        setMessages([
            { role: "system", content: systemMessage },
        ])
        chatRef.current?.clearInput()
    }

    function handleMessageSubmit(msg: string) {
        const userMsg = { role: "user", content: msg }
        const newMessages = [...messages, userMsg]
        // console.log('sending\n', newMessages)
        setMessages(newMessages)
        chatMutation.mutate({
            model: "gpt-3.5-turbo",
            messages: newMessages,
            // top_p: 0.1,
            temperature: 0.9
        }, {
            onSuccess: (data) => {
                console.log('success\n', data)
                const newMessage = data.choices[0]?.message
                if (!newMessage) {
                    console.log("??? no new message")
                    return
                }
                setMessages([...newMessages, newMessage])
                chatRef.current?.clearInput()
                console.log(newMessage)
            },
            onError: () => {
                setMessages(messages.slice(-1))
            }
        })
    }

    function start() {
        console.log("starting")
        chatMutation.mutate({
            model: "gpt-3.5-turbo",
            messages
        }, {
            onSuccess: (data) => {
                console.log('success\n', data)
                const newMessage = data.choices[0]?.message
                if (!newMessage) {
                    console.log("??? no new message")
                    return
                }
                setMessages([...messages, newMessage])
            }
        })
    }

    return (
        <main className={cn(
            "flex gap-8 h-screen p-4",
            chatMutation.isLoading && "cursor-wait"
        )}>
            <div className={cn(
                "relative flex justify-center mx-auto lg:basis-[500px]",
            )}>
                <div className={cn(
                    "flex flex-col items-start gap-2",
                    "lg:absolute lg:top-0 lg:right-full"
                )}>
                    {/* <textarea className="w-[300px] h-[200px] outline-none p-2 rounded border bg-neutral-400/10 border-neutral-300 focus:border-neutral-400" placeholder={DEFAULT_SYSTEM_MESSAGE} onChange={handleSystemMessageChange} /> */}
                    <button className="p-2 leading-none border border-neutral-300 hover:border-neutral-400 rounded" onClick={start}>start</button>
                    <button className="p-2 leading-none border border-neutral-300 hover:border-neutral-400 rounded" onClick={resetMessages}>reset</button>
                </div>
                <div className="basis-[500px]">
                    <Chat ref={chatRef} messages={messages} onMessageSubmit={handleMessageSubmit} disabled={textareaDisabled} />
                </div>
            </div>
        </main>
    )
}

type Message = {
    role: string
    content: string
}

interface ChatProps {
    messages: Message[]
    disabled?: boolean
    onMessageSubmit: (msg: string) => void
}

interface ChatHandle {
    clearInput: () => void
}

const Chat = forwardRef<ChatHandle, ChatProps>(function Chat(props, ref) {
    const {
        messages,
        disabled = false,
        onMessageSubmit
    } = props

    const textareaRef = useRef<HTMLTextAreaElement>(null)

    function handleKeyDown(e: React.KeyboardEvent) {

        if (e.key === "Enter") {
            submitMessage()
        }
    }

    function submitMessage() {
        if (!textareaRef.current || disabled) return
        const msg = textareaRef.current.value
        onMessageSubmit(msg)
    }

    useImperativeHandle(ref, () => {
        return {
            clearInput() {
                if (!textareaRef.current) return
                textareaRef.current.value = ""
            }
        }
    })

    return (
        <div className={"flex flex-col justify-end gap-8 h-full"}>
            <div className="flex flex-col-reverse gap-8 overflow-x-visible overflow-y-scroll font-serif p-4">
                {
                    messages.slice().reverse().map((msg, i) => {
                        if (msg.role === "system") {
                            return (
                                <div className="whitespace-pre-wrap text-neutral-600" key={i}>
                                    {msg.content}
                                </div>
                            )
                        } else if (msg.role === "assistant") {
                            const { narrative, choices } = JSON.parse(msg.content) as { narrative: string, choices: string[] }

                            return (
                                <div className="flex flex-col gap-3" key={i}>
                                    <p>
                                        {narrative ? narrative : msg.content}
                                    </p>
                                    {choices.map((choice, i) => (
                                        <button
                                            className="appearance-none p-3 rounded border border-neutral-400 hover:border-neutral-600"
                                            key={i}
                                            onClick={() => onMessageSubmit(choice)}
                                        >
                                            {choice}
                                        </button>
                                    ))}
                                </div>
                            )
                        } else {
                            <div className="text-neutral-600" key={i}>
                                {msg.content}
                            </div>
                        }
                    })
                }
            </div>
            <div className="flex flex-col">
                <textarea
                    disabled={disabled}
                    ref={textareaRef}
                    onKeyUp={handleKeyDown}
                    placeholder="response..."
                    className={cn(
                        "appearance-none outline-none text-neutral-700 p-4 rounded-lg h-fit resize-none",
                        "bg-neutral-300/50 border border-neutral-400/10 focus:border-neutral-400/50"
                    )}></textarea>
                <button onClick={submitMessage} className="flex gap-2 items-center appearance-none self-end top-full right-0 opacity-25 hover:opacity-100 transition-opacity p-3"><PaperPlaneIcon /></button>
            </div>
        </div>
    )
})

export default ChatTest