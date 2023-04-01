import { z } from "zod";
import { env } from "../../../env.mjs";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

import zhema, { OpenAIChatCompletionRequest, OpenAIChatCompletionResponse, type OpenAICompletionRequest, type OpenAICompletionResponse } from "@/utils/zhema";

// curl example
// curl https://api.openai.com/v1/completions \
// -H "Content-Type: application/json" \
// -H "Authorization: Bearer YOUR_API_KEY" \
// -d '{"model": "text-davinci-003", "prompt": "Say this is a test", "temperature": 0, "max_tokens": 7}'

async function fetchOpenAICompletions(input: OpenAICompletionRequest) {
    return await (await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(input)
    })).json() as OpenAICompletionResponse
}

async function fetchOpenAIChatCompletions(input: OpenAIChatCompletionRequest) {
    return await (await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(input)
    })).json() as OpenAIChatCompletionResponse
}

export const openaiRouter = createTRPCRouter({
    test: protectedProcedure
        .input(zhema.openAICompletionRequest)
        .mutation(async ({ input }) => {
            const result = await fetchOpenAICompletions(input)
            return result
        }),
    chatCompletion: publicProcedure
        .input(zhema.openAIChatCompletionRequest)
        .mutation(async ({ input }) => {
            const result = await fetchOpenAIChatCompletions(input)
            return result
        })
});