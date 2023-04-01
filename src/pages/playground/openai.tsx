import { useState } from "react"
import { z } from "zod"
import { api } from "@/utils/api"
import zhema, { type OpenAICompletionRequest } from "@/utils/zhema"

const OpenAITest = () => {

    const [data, setData] = useState<OpenAICompletionRequest>({
        model: "text-davinci-003",
        max_tokens: 16,
        temperature: 1,
        n: 1,
        prompt: "",
    } as OpenAICompletionRequest)

    const mutation = api.openai.test.useMutation()
    const result = JSON.stringify(mutation.data, null, 4)
    const output = mutation.data?.choices[0]?.text

    function query() {
        mutation.mutate(data)
    }

    return (
        <main className="flex flex-col gap-8 max-w-5xl mx-auto">
            <div className="h-8" />
            <div className="flex gap-6 justify-center">
                <div className="flex flex-col gap-3 rounded">
                    <Container label={`model=${data.model}`}>
                        <select
                            className="border bg-neutral-50 rounded-sm"
                            value={data.model}
                            onChange={(e) => {
                                setData({
                                    ...data,
                                    model: e.currentTarget.value
                                })
                            }}>
                            <option value={"text-davinci-003"}>davinci</option>
                            <option value={"text-curie-001"}>curie</option>
                            <option value={"text-babbage-001"}>babbage</option>
                            <option value={"text-ada-001"}>ada</option>
                        </select>
                    </Container>
                    <Container label={`max_tokens=${data.max_tokens ?? 16}`}>
                        <input
                            className="border bg-neutral-50 rounded-sm" type="number"
                            onInput={(e) => {
                                const value = e.currentTarget.value || 16
                                try {
                                    const max_tokens = zhema.openAICompletionRequest
                                        .pick({ max_tokens: true })
                                        .parse({ max_tokens: value })
                                        .max_tokens
                                    setData({
                                        ...data,
                                        max_tokens
                                    })
                                } catch (e) {
                                    console.error("failed to parse max_tokens")
                                }
                            }} />
                    </Container>
                    <Container label={`temp=${data.temperature ?? 1}`}>
                        <div className="flex border bg-neutral-50 rounded-sm p-2">
                            <input
                                className="w-full"
                                type="range"
                                min="0" max="2" step={0.1}
                                onChange={(e) => {
                                    const value = e.currentTarget.value
                                    try {
                                        const temperature = zhema.openAICompletionRequest
                                            .pick({ temperature: true })
                                            .parse({ temperature: value })
                                            .temperature
                                        setData({
                                            ...data,
                                            temperature
                                        })
                                    } catch (e) {
                                        console.error(`failed to parse temperature, ${value} \n`, e)
                                    }
                                }} />
                        </div>
                    </Container>
                    <Container label={`responses (n)=${data.n ?? 1}`}>
                        <input
                            className="border bg-neutral-50 rounded-sm"
                            type="number"
                            onChange={(e) => {
                                const value = e.currentTarget.value || 1
                                try {
                                    const n = zhema.openAICompletionRequest
                                        .pick({ n: true })
                                        .parse({ n: value })
                                        .n
                                    setData({
                                        ...data,
                                        n
                                    })
                                } catch (e) {
                                    console.error("failed to parse n")
                                }
                            }} />
                    </Container>
                    {/* <Container label={`stop=${data.stop?.toString() ?? "null"}`}>
                    <input
                        className="border bg-neutral-50 rounded-sm"
                        type="text"
                        onChange={(e) => {
                            const value = e.currentTarget.value
                            try {
                                const stop = zhema.openAICompletionRequest
                                    .pick({ stop: true })
                                    .parse({ stop: value })
                                    .stop
                                setData({
                                    ...data,
                                    stop
                                })
                            } catch (e) {
                                console.error("failed to parse stop")
                            }
                        }} />
                </Container> */}
                    <Container label={`query status=${mutation.status}`}>
                        <button
                            className="border bg-neutral-50 rounded-sm py-1 font-serif text-black/75 hover:bg-white hover:text-black active:translate-y-[1px] active:bg-neutral-50 transition-colors"
                            disabled={mutation.isLoading}
                            onClick={() => query()}>
                            {
                                mutation.isLoading ? <span className="animate-spin">|</span> : <>query</>
                            }
                        </button>
                    </Container>
                </div>
                <Container label={`prompt`}>
                    <textarea
                        className="border bg-neutral-50 rounded-sm h-96 w-96"
                        value={data.prompt}
                        onChange={(e) => {
                            const value = e.currentTarget.value
                            const prompt = zhema.openAICompletionRequest
                                .pick({ prompt: true })
                                .parse({ prompt: value })
                                .prompt
                            setData({
                                ...data,
                                prompt
                            })

                        }} />
                </Container>
                <Container label={`output`}>
                    <textarea disabled className="border bg-neutral-50 rounded-sm h-96 w-96" value={output} />
                </Container>
            </div>
            <div className="opacity-50 font-serif">
                <p>
                    query
                </p>
                <div className="h-4"/>
                <code className="whitespace-pre-wrap">
                    {result}
                </code>
            </div>

        </main >
    )
}


interface ContainerProps {
    label: string
    children?: React.ReactNode
}

function Container(props: ContainerProps) {
    const { label, children } = props
    return (
        <div className="flex flex-col gap-1">
            <label className="opacity-50 pl-2 font-serif text-sm">{label}</label>
            <div className="bg-neutral-100 p-2 flex flex-col gap-2 rounded shadow-md shadow-black/5 h-fit">
                {children}
            </div>
        </div>
    )
}

export default OpenAITest