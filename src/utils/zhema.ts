import { z } from "zod"

// request body example
// {
//   "model": "text-davinci-003",
//   "prompt": "Say this is a test",
//   "max_tokens": 7,
//   "temperature": 0,
//   "top_p": 1,
//   "n": 1,
//   "stream": false,
//   "logprobs": null,
//   "stop": "\n"
// }

const completionRequestSchema = z.object({
    model: z.string(),
    prompt: z.string().optional(),
    max_tokens: z.coerce.number().min(0).max(2048).optional(),
    temperature: z.coerce.number().min(0).max(2).optional(),
    n: z.coerce.number().min(1).optional(),
    stop: z.string().or(z.string().array().max(4)).optional(),
    echo: z.boolean().optional()
})


// response example
// {
//   "id": "cmpl-uqkvlQyYK7bGYrRHQ0eXlWi7",
//   "object": "text_completion",
//   "created": 1589478378,
//   "model": "text-davinci-003",
//   "choices": [
//     {
//       "text": "\n\nThis is indeed a test",
//       "index": 0,
//       "logprobs": null,
//       "finish_reason": "length"
//     }
//   ],
//   "usage": {
//     "prompt_tokens": 5,
//     "completion_tokens": 7,
//     "total_tokens": 12
//   }
// }

const completionResponseSchema = z.object({
    id: z.string(),
    object: z.string(),
    created: z.number(),
    model: z.string(),
    choices: z.array(
        z.object({
            text: z.string(),
            index: z.number(),
            logprobs: z.null(), // TODO
            finish_reason: z.string()
        })
    ),
    usage: z.object({
        prompt_tokens: z.number(),
        completion_tokens: z.number(),
        total_tokens: z.number()
    })
});

const chatCompletionResponseSchema = z.object({
    id: z.string(),
    object: z.string(),
    created: z.number(),
    choices: z.array(
        z.object({
            index: z.number(),
            message: z.object({
                role: z.string(),
                content: z.string()
            }),
            finish_reason: z.string()
        })
    ),
    usage: z.object({
        prompt_tokens: z.number(),
        completion_tokens: z.number(),
        total_tokens: z.number()
    })
})

const chatCompletionRequestSchema = z.object({
    model: z.string(),
    messages: z.array(
        z.object({
            role: z.string(),
            content: z.string()
        })
    ),
    temperature: z.number().min(0).max(2).optional(),
    top_p: z.number().min(0).max(1).optional(),
    n: z.number().int().min(1).optional(),
    stream: z.boolean().optional(),
    stop: z.union([z.string(), z.array(z.string()).max(4)]).optional(),
    max_tokens: z.number().int().min(1).optional(),
    presence_penalty: z.number().min(-2).max(2).optional(),
    frequency_penalty: z.number().min(-2).max(2).optional(),
    logit_bias: z.record(z.number().min(-100).max(100)).optional(),
    user: z.string().optional(),
});

export type OpenAICompletionRequest = z.infer<typeof completionRequestSchema>
export type OpenAICompletionResponse = z.infer<typeof completionResponseSchema>

export type OpenAIChatCompletionRequest = z.infer<typeof chatCompletionRequestSchema>
export type OpenAIChatCompletionResponse = z.infer<typeof chatCompletionResponseSchema>

const zhema = {
    openAICompletionRequest: completionRequestSchema,
    openAICompletionResponse: completionResponseSchema,
    openAIChatCompletionRequest: chatCompletionRequestSchema,
    openAIChatCompletionResponse: chatCompletionResponseSchema,
}

export default zhema
