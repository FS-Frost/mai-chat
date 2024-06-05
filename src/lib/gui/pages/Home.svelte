<script lang="ts">
    import { models } from "$lib/models";
    import * as webllm from "@mlc-ai/web-llm";
    import { marked } from "marked";
    import { onMount, tick } from "svelte";
    import { z } from "zod";

    const InitProgress = z.object({
        progress: z.number().default(0),
        timeElapsed: z.number().default(0),
        text: z.string().default(""),
    });

    type InitProgress = z.infer<typeof InitProgress>;

    const defaultModel: string = "TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC";

    const defaultSystemMessageContent: string =
        "You are a helpful AI assistant.";

    let systemMessageContent: string = defaultSystemMessageContent;
    let settingsVisible: boolean = false;
    let lowResources: boolean = true;
    let selectedModel: string = "";
    let loadedModel: string = "";
    let inputPromt: HTMLTextAreaElement;
    let pivot: HTMLElement;
    let engine: webllm.MLCEngine;
    let loadingModel: boolean = false;
    let infoMessage: string = "";
    let errorMessage: string = "";
    let promt: string = "";
    let thinking: boolean = false;
    let thinkingMessage: string = "";
    let thinkingMessageDots: number = 3;
    let messages: webllm.ChatCompletionMessageParam[] = [];

    $: filteredModels = lowResources
        ? models.filter((x) => x.lowResourcesRequired)
        : models;

    function applyDefaultSettings(): void {
        lowResources = true;
        selectedModel = defaultModel;
        systemMessageContent = defaultSystemMessageContent;
    }

    function sizeToString(sizeInMB: number): string {
        if (sizeInMB < 1000) {
            return `${sizeInMB.toFixed(1)} MB`;
        }

        const sizeInGB = sizeInMB / 1024;
        return `${sizeInGB.toFixed(1)} GB`;
    }

    function handleSelectedModelUpdated(): void {
        console.log(`Model: ${selectedModel}`);
        errorMessage = "";
        infoMessage =
            "The next message will trigger the model to be downloaded. The message history will be maintained.";
    }

    async function loadModel(): Promise<void> {
        try {
            console.log(`Model: ${selectedModel}`);
            if (selectedModel === loadedModel) {
                console.log("Model already loaded");
                return;
            }

            loadingModel = true;

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
            loadingModel = false;
            loadedModel = selectedModel;
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
    }

    function handlePromtKeyDown(key: string): void {
        if (key === "Enter") {
            processPromt();
        }
    }

    async function processPromt(): Promise<void> {
        await loadModel();
        thinking = true;

        try {
            const userMessage: webllm.ChatCompletionMessageParam = {
                role: "user",
                content: promt,
            };

            const systemMessage: webllm.ChatCompletionMessageParam = {
                role: "system",
                content: systemMessageContent,
            };

            const messagesToProcess: webllm.ChatCompletionMessageParam[] = [
                systemMessage,
                ...messages,
                userMessage,
            ];

            const reply = await engine.chat.completions.create({
                stream: false,
                messages: messagesToProcess,
            });

            reply.choices[0].message.content = await marked.parse(
                reply.choices[0].message.content ?? "",
            );

            console.log(reply.choices[0].message.content);

            messages = [...messages, userMessage, reply.choices[0].message];
            promt = "";
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

    onMount(() => {
        selectedModel = defaultModel;
        handleSelectedModelUpdated();
    });
</script>

<svelte:head>
    <title>MAI Chat</title>
</svelte:head>

<h1 title="My-AI Chat">MAI Chat</h1>

{#if settingsVisible}
    <button
        class="button is-success is-fullwidth"
        on:click={() => (settingsVisible = !settingsVisible)}
        disabled={systemMessageContent.length === 0}
    >
        Save settings
    </button>

    <button
        class="button is-link is-fullwidth mt-2"
        on:click={() => applyDefaultSettings()}
    >
        Reset to default
    </button>

    <div class="model-selector mt-2">
        <label class="checkbox">
            <input type="checkbox" bind:checked={lowResources} />
            Low resources ({filteredModels.length} models)
        </label>

        <div class="select">
            <select
                bind:value={selectedModel}
                on:change={() => handleSelectedModelUpdated()}
                disabled={loadingModel || thinking}
            >
                {#each filteredModels as model}
                    <option value={model.id}
                        >{model.id} ({sizeToString(
                            model.vramRequiredInMB,
                        )})</option
                    >
                {/each}
            </select>
        </div>
    </div>

    <div class="field">
        <label class="label" for="">System message</label>
        <div class="control">
            <input
                class="input"
                type="text"
                bind:value={systemMessageContent}
                placeholder={defaultSystemMessageContent}
            />
        </div>
    </div>
{:else}
    <button
        class="button is-fullwidth"
        on:click={() => (settingsVisible = !settingsVisible)}
    >
        Settings
    </button>

    {#if errorMessage.length > 0}
        <p class="has-text-danger"><b>ERROR: </b> {errorMessage}</p>

        <img src="img/gif2.gif" alt="Error!" />
    {:else if infoMessage.length > 0}
        <p><b>{infoMessage}</b></p>
    {/if}

    {#if loadingModel && errorMessage.length === 0}
        <img src="img/gif0.gif" alt="Loading!" />
    {/if}

    {#if selectedModel.length > 0}
        <div class="messages">
            {#each messages as msg, i}
                <p class="message">
                    <b>{i + 1}. [{msg.role}]:</b>
                </p>
                <div>{@html msg.content}</div>
            {/each}
        </div>

        {#if thinking}
            <p class="thinking">{thinkingMessage}</p>
            <img src="img/gif1.webp" alt="Thinking!" />
        {/if}

        <div class="field mt-2">
            <div class="control">
                <textarea
                    bind:this={inputPromt}
                    class="input"
                    placeholder="Ask me anything"
                    bind:value={promt}
                    on:keydown={(e) => handlePromtKeyDown(e.key)}
                    disabled={loadingModel || thinking}
                />
            </div>
        </div>

        <button
            class="button is-link is-fullwidth mt-2"
            disabled={loadingModel || thinking}
            bind:this={pivot}
            on:click={() => processPromt()}>Send</button
        >
    {/if}
{/if}

<style>
    .messages {
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    .field {
        width: 100%;
    }

    textarea {
        min-height: 10rem;
    }

    .thinking {
        width: 100%;
        text-align: center;
        font-weight: bold;
    }

    .model-selector {
        width: 100%;
        display: flex;
        flex-direction: column;
        margin-bottom: 1rem;
    }

    select {
        width: 100%;
    }
</style>
