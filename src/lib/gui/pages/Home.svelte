<script lang="ts">
    import * as webllm from "@mlc-ai/web-llm";
    import { onMount, tick } from "svelte";
    import { z } from "zod";

    const InitProgress = z.object({
        progress: z.number().default(0),
        timeElapsed: z.number().default(0),
        text: z.string().default(""),
    });

    type InitProgress = z.infer<typeof InitProgress>;

    // Models:
    // https://github.com/mlc-ai/web-llm/blob/22f0d37c5e68515059ba63ff5ba56f54324bc820/src/config.ts#L310
    const selectedModel = "TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC";

    // Low vram usage:
    // Phi-3-mini-4k-instruct-q4f16_1-MLC-1k
    // gemma-2b-it-q4f16_1-MLC
    // gemma-2b-it-q4f32_1-MLC
    // gemma-2b-it-q4f16_1-MLC-1k
    // gemma-2b-it-q4f32_1-MLC-1k
    // Qwen1.5-1.8B-Chat-q4f16_1-MLC-1k
    // stablelm-2-zephyr-1_6b-q4f16_1-MLC-1k
    // stablelm-2-zephyr-1_6b-q4f32_1-MLC-1k
    // RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC-1k
    // phi-1_5-q4f16_1-MLC
    // phi-1_5-q4f32_1-MLC
    // phi-1_5-q4f16_1-MLC-1k
    // phi-1_5-q4f32_1-MLC-1k
    // TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC
    // TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC
    // TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC-1k
    // TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC-1k

    let inputPromt: HTMLInputElement;
    let pivot: HTMLElement;
    let engine: webllm.MLCEngine;
    let modelLoaded: boolean = false;
    let infoMessage: string = "";
    let errorMessage: string = "";
    let promt: string = "";
    let thinking: boolean = false;
    let thinkingMessage: string = "";
    let thinkingMessageDots: number = 3;

    let messages: webllm.ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: "You are a helpful AI assistant.",
        },
        {
            role: "user",
            content:
                "A karaoke is composed of a number of syllables. A syllable has a text and a duration in centiseconds.",
        },
    ];

    function handlePromtKeyDown(key: string): void {
        if (key === "Enter") {
            processPromt();
        }
    }

    async function processPromt(): Promise<void> {
        thinking = true;

        try {
            messages = [
                ...messages,
                {
                    role: "user",
                    content: promt,
                },
            ];

            const reply = await engine.chat.completions.create({
                stream: false,
                messages,
            });

            promt = "";
            messages = [...messages, reply.choices[0].message];
        } catch (error) {
            const msg = `failed to process promt: <${promt}>`;
            console.error(msg, error);
            messages = [
                ...messages,
                {
                    role: "assistant",
                    content: msg,
                },
            ];
        }

        inputPromt.focus();
        thinking = false;
    }

    onMount(async () => {
        try {
            modelLoaded = false;

            const initProgressCallback = (maybeInitProgress: unknown) => {
                console.log(maybeInitProgress);
                const parseResult = InitProgress.safeParse(maybeInitProgress);
                if (parseResult.error) {
                    console.error("failed to parse init progress", {
                        initProgress: maybeInitProgress,
                        parseResult,
                    });
                    return;
                }

                infoMessage = parseResult.data.text.replace(
                    ": 0MB loaded. 0% completed, 0 secs elapsed.",
                    "",
                );
            };

            infoMessage = `Load LLM model: ${selectedModel}`;
            engine = await webllm.CreateMLCEngine(selectedModel, {
                initProgressCallback,
            });

            infoMessage = "";
            promt = "Based on what I just wrote, what is a karaoke?";
            modelLoaded = true;

            await tick();
            inputPromt.focus();

            setInterval(() => {
                if (!thinking) {
                    thinkingMessageDots = 0;
                    return;
                }

                pivot.scrollIntoView({
                    behavior: "smooth",
                });

                thinkingMessage = "Thinking";
                for (let i = 1; i <= thinkingMessageDots; i++) {
                    thinkingMessage += ".";
                }

                thinkingMessageDots++;
                if (thinkingMessageDots > 3) {
                    thinkingMessageDots = 1;
                }
            }, 500);
        } catch (error) {
            const msg = `failed to start engine: ${error}`;
            console.error(msg, error);
            errorMessage = msg;
        }
    });
</script>

<svelte:head>
    <title>MAI Chat</title>
</svelte:head>

<h1 title="My-AI Chat">MAI Chat</h1>

{#if infoMessage.length > 0}
    <p><b>{infoMessage}</b></p>
{/if}

{#if errorMessage.length > 0}
    <p class="has-text-danger"><b>ERROR: </b> {errorMessage}</p>
{/if}

{#if !modelLoaded}
    <img src="img/gif0.gif" alt="Loading!" />
{/if}

{#if modelLoaded}
    <p class="has-text-success">Model: <b>{selectedModel}</b></p>

    <div class="messages">
        {#each messages as msg, i}
            <p class="message"><b>{i + 1}. [{msg.role}]:</b> {msg.content}</p>
        {/each}
    </div>

    {#if thinking}
        <p class="thinking">{thinkingMessage}</p>
        <img src="img/gif1.webp" alt="Thinking!" />
    {/if}

    <div class="field">
        <div class="control">
            <input
                bind:this={inputPromt}
                type="text"
                class="input"
                placeholder="Ask me anything"
                bind:value={promt}
                on:keydown={(e) => handlePromtKeyDown(e.key)}
                disabled={thinking}
            />
        </div>
    </div>

    <button
        class="button is-link is-fullwidth mt-2"
        disabled={thinking}
        bind:this={pivot}
        on:click={() => processPromt()}>Send</button
    >
{/if}

<style>
    .messages {
        display: flex;
        flex-direction: column;
    }

    .field {
        width: 100%;
    }

    .thinking {
        width: 100%;
        text-align: center;
        font-weight: bold;
    }
</style>
