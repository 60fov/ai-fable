import React, { useReducer, useState } from "react"
import { api } from "@/utils/api"
import { cn, createCtx } from "@/utils/fns"
import prompts, { SEED_CHAT_LOG_V001 } from "@/utils/prompts"
import { nanoid } from "nanoid"


/*
TODO:
    better loading display
    abstract the chat mutation
    user info 
        description (token limit)
        inventory
*/


const systemPrompt = prompts.system[0] || ""
const openingPrompt = prompts.opening[0] || ""

const systemMessage = { role: "system", content: systemPrompt }

type StoryPrompt = {
    id: string
    narrative: string
    choices: string[]
    choice?: string
    dies: boolean
    loot: null | {
        name: string,
        power: number,
        defense: number,
    },
}

type StoryAction =
    | { type: "prompt"; prompt: StoryPrompt; }
    | { type: "response"; response: string; }
    | { type: "remove"; count: number }
    | { type: "reset"; }

function storyReducer(state: StoryPrompt[], action: StoryAction) {
    // console.log("storyReducer", action, state)
    switch (action.type) {
        case "prompt": {
            const prompt = action.prompt
            prompt.id = nanoid()
            return [...state, prompt]
        }
        case "response": {
            const prompt = state.slice(-1)[0]
            if (!prompt) {
                console.log("empty prompt state on response ???")
                return state
            }
            prompt.choice = action.response
            return [...state.slice(0, -1), prompt]
        }
        case "reset": {
            return [] as StoryPrompt[]
        }
        case "remove": {
            return state.slice(0, -1)
        }
    }
}

interface NarrativeContextInterface {
    handleResponse: (response: string) => void
    isLoading: boolean
}

const [useNarrativeContext, NarrativeContextProvider] = createCtx<NarrativeContextInterface>()

export default function Narrative() {
    const [chatLog, pushToChatLog] = useFIFOBuffer(3, [
        { role: "assistant", content: prompts.opening[0] || "??" },
    ])
    const [tokens, setTokens] = useState(0)
    const [story, dispatchStoryEvent] = useReducer(storyReducer, [] as StoryPrompt[])

    const chatCompletionMutation = api.openai.chatCompletion.useMutation({
        onSuccess: (data) => {
            console.log("global onsuccess")
            setTokens(tokens + data.usage.total_tokens)
            const msg = data.choices[0]?.message
            if (!msg) throw new Error("openai chat completion message error")

            try {
                const prompt = JSON.parse(msg.content) as StoryPrompt
                dispatchStoryEvent({ type: "prompt", prompt })
                pushToChatLog(msg)
            } catch (err) {
                console.log(err)
            }
        }
    })

    function start() {
        const prompt = JSON.parse(prompts.opening[0] || "") as StoryPrompt
        dispatchStoryEvent({ type: "prompt", prompt })

    }

    function handleResponse(response: string) {
        dispatchStoryEvent({ type: "response", response })
        const chatResponse = { role: "user", content: response }
        chatCompletionMutation.mutate({
            model: "gpt-3.5-turbo",
            messages: [systemMessage, ...chatLog, chatResponse],
        }, {
            onSuccess: (data) => {
                console.log("local onsuccess response")
                // pushToChatLog(chatResponse)
            },
            onError: (err) => {
                console.log(err)
                dispatchStoryEvent({ type: "remove", count: 1 })
            }
        })
    }

    const showStartButton = story.length === 0 || story[story.length - 1]?.choices.length === 0

    return (
        <NarrativeContextProvider value={{ handleResponse, isLoading: chatCompletionMutation.isLoading }}>
            <main className={cn(
                "relative h-screen max-h-screen flex justify-center",
                chatCompletionMutation.isLoading && "cursor-wait"
            )}>
                <div className="relative h-full max-w-lg w-full flex flex-col justify-end">
                    <NarrativeView prompts={story} />
                    <p className="fixed top-8 font-serif text-neutral-400 -translate-x-[200%]">{tokens}</p>
                </div>
                {
                    showStartButton &&
                    <div className="absolute">
                        <Button onClick={start}>start</Button>
                    </div>
                }
            </main>
        </NarrativeContextProvider>
    )
}


interface NarrativeViewProps {
    prompts: StoryPrompt[]
}

function NarrativeView(props: NarrativeViewProps) {
    const {
        prompts
    } = props

    const { handleResponse, isLoading } = useNarrativeContext()

    return (
        <div className={cn(
            "overflow-y-auto p-8",
            "flex flex-col-reverse gap-8",
            "font-serif text-neutral-600",
        )}>
            {prompts.slice().reverse().map((prompt, i) => (
                <PromptView
                    key={prompt.id}
                    prompt={prompt}
                    isLoading={isLoading && i === 0}
                    onResponse={handleResponse}
                />
            ))}
        </div>
    )
}

interface PromptViewProps {
    prompt: StoryPrompt
    isLoading?: boolean
    onResponse?: (response: string) => void
}

function PromptView(props: PromptViewProps) {
    const {
        prompt,
        isLoading = false,
        onResponse,
    } = props

    return (
        <div className="flex flex-col gap-4">
            <p className="">
                {prompt.narrative}
            </p>
            <ul className="flex flex-col gap-2">
                {prompt.choices.map(choice => {
                    const nothingSelected = !prompt.choice
                    const thisSelected = choice === prompt.choice
                    return (
                        <li
                            key={choice}
                            className={cn(
                                "flex overflow-clip",
                                "p-[1px] rounded-lg",
                                "bg-neutral-300",
                                nothingSelected ? (
                                    "hover:text-neutral-900 hover:bg-neutral-400 cursor-pointer"
                                ) : !thisSelected ? (
                                    "pointer-events-none"
                                ) : isLoading ? (
                                    "conic-bg pointer-events-none"
                                ) : (
                                    "bg-neutral-900 pointer-events-none"
                                )
                                // !prompt.choice ? [
                                //     "hover:text-neutral-900 hover:bg-neutral-400",
                                //     "cursor-pointer"
                                // ] :
                                //     isLoading && choice === prompt.choice ? "conic-bg" : "bg-neutral-900",
                                // "transition-colors duration-75",
                                // isLoading && "pointer-events-none",
                            )}
                            onClick={() => onResponse && onResponse(choice)}
                        >
                            <span className={cn(
                                "grow leading-normal p-3 bg-neutral-200 rounded-[7px]"
                            )}>
                                {choice}
                            </span>
                        </li>
                    )
                }
                )}
            </ul>
        </div >
    )
}


type ButtonProps = React.HTMLAttributes<HTMLButtonElement>

function Button(props: ButtonProps) {
    const {
        className,
        children,
        ...restProps
    } = props
    return (
        <button
            {...restProps}
            className={cn(
                "transition-all duration-75",
                "p-2 rounded-lg bg-neutral-400/10",
                "text-left",
                "border border-neutral-400/10 hover:border-neutral-400/50",
                className
            )}
        >
            {children}
        </button>
    )
}

function useFIFOBuffer<T>(n: number, initial: T[]) {
    const [buffer, setBuffer] = useState<T[]>(initial)

    const pushToBuffer = (item: T) => {
        if (buffer.length < n) {
            setBuffer([...buffer, item])
        } else {
            setBuffer([...buffer.slice(buffer.length - n + 1), item])
        }
    }

    return [buffer, pushToBuffer] as const
}