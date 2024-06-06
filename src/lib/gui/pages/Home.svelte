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

    const Settings = z.object({
        lowResources: z.boolean(),
        selectedModel: z.string(),
        systemMessageContent: z.string(),
        streamResponses: z.boolean(),
        animationsEnabled: z.boolean(),
        useIndexedDBCache: z.boolean(),
    });

    type Settings = z.infer<typeof Settings>;

    const keySetings: string = "maichat.settings";

    const defaultModel: string = "TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC";

    const defaultSystemMessageContent: string =
        "You are a helpful AI assistant.";

    const defaultSettings: Settings = {
        selectedModel: defaultModel,
        systemMessageContent: defaultSystemMessageContent,
        lowResources: true,
        animationsEnabled: true,
        streamResponses: true,
        useIndexedDBCache: false,
    };

    let settings: Settings = {
        lowResources: true,
        selectedModel: "",
        streamResponses: true,
        systemMessageContent: "",
        animationsEnabled: true,
        useIndexedDBCache: false,
    };

    let settingsVisible: boolean = false;
    let loadedModel: string = "";
    let inputPromt: HTMLTextAreaElement;
    let pivot: HTMLElement;
    let engine: webllm.MLCEngine;
    let loadingModel: boolean = false;
    let infoMessage: string = "";
    let errorMessage: string = "";
    let promt: string = "";
    let writtingResponse: boolean = false;
    let thinking: boolean = false;
    let thinkingMessage: string = "";
    let thinkingMessageDots: number = 3;
    let messages: webllm.ChatCompletionMessageParam[] = [];

    $: filteredModels = settings.lowResources
        ? models.filter((x) => x.lowResourcesRequired)
        : models;

    function applyDefaultSettings(): void {
        settings = structuredClone(defaultSettings);
    }

    function sizeToString(sizeInMB: number): string {
        if (sizeInMB < 1000) {
            return `${sizeInMB.toFixed(1)} MB`;
        }

        const sizeInGB = sizeInMB / 1024;
        return `${sizeInGB.toFixed(1)} GB`;
    }

    function handleSelectedModelUpdated(): void {
        console.log(`Model: ${settings.selectedModel}`);
        errorMessage = "";
        infoMessage =
            "The next message will trigger the model to be downloaded. The message history will be maintained.";
    }

    async function loadModel(): Promise<void> {
        try {
            console.log(`Model: ${settings.selectedModel}`);
            if (settings.selectedModel === loadedModel) {
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

            infoMessage = `Load LLM model: ${settings.selectedModel}`;
            const mlConfig = webllm.prebuiltAppConfig;
            mlConfig.useIndexedDBCache = settings.useIndexedDBCache;
            engine = await webllm.CreateMLCEngine(settings.selectedModel, {
                appConfig: mlConfig,
                initProgressCallback,
            });

            infoMessage = "";
            loadingModel = false;
            loadedModel = settings.selectedModel;
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

    function formatRole(role: string): string {
        if (role.length === 0) {
            return "";
        }

        if (role.length == 1) {
            return role.toUpperCase();
        }

        return role[0].toUpperCase() + role.substring(1);
    }

    function handlePromtKeyDown(key: string): void {
        if (key === "Enter") {
            processPromt();
        }
    }

    async function handleFullResponse(
        messagesToProcess: webllm.ChatCompletionMessageParam[],
    ): Promise<string> {
        const reply = await engine.chat.completions.create({
            stream: false,
            messages: messagesToProcess,
        });

        if (reply.choices.length === 0) {
            return "";
        }

        return reply.choices[0].message.content ?? "";
    }

    async function handleChunksResponse(
        messagesToProcess: webllm.ChatCompletionMessageParam[],
    ): Promise<string> {
        const chunks = await engine.chat.completions.create({
            messages: messagesToProcess,
            temperature: 1,
            stream: true,
        });

        writtingResponse = true;
        let fullReplyContent = "";
        for await (const chunk of chunks) {
            const text = chunk.choices[0].delta.content ?? "";
            messages[messages.length - 1].content += text;
            fullReplyContent += text;
            await tick();
        }

        return fullReplyContent;
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
                content: settings.systemMessageContent,
            };

            const messagesToProcess: webllm.ChatCompletionMessageParam[] = [
                systemMessage,
                ...messages,
                userMessage,
            ];

            promt = "";

            messages = [
                ...messages,
                userMessage,
                {
                    role: "assistant",
                    content: "",
                },
            ];

            const handler = settings.streamResponses
                ? handleChunksResponse
                : handleFullResponse;

            const fullReplyContent = await handler(messagesToProcess);
            const parsedReplyContent = await marked.parse(fullReplyContent);
            console.log(parsedReplyContent);

            messages[messages.length - 1].content = parsedReplyContent;
            promt = "";
            writtingResponse = false;
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

    function saveSettings(): void {
        localStorage.setItem(keySetings, JSON.stringify(settings));
        settingsVisible = !settingsVisible;
    }

    function loadSettings(): void {
        try {
            const rawSettings = localStorage.getItem(keySetings) ?? "{}";
            const maybeSettings = JSON.parse(rawSettings);
            const parseResult = Settings.safeParse(maybeSettings);
            if (parseResult.success) {
                settings = parseResult.data;
                console.log("settings loaded", settings);
                return;
            }
        } catch (error) {
            console.error("failed to load settings", error);
        }

        applyDefaultSettings();
    }

    onMount(() => {
        loadSettings();
        settings.selectedModel = defaultModel;
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
        on:click={() => saveSettings()}
        disabled={settings.systemMessageContent.length === 0}
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
        <label class="checkbox mb-1">
            <input type="checkbox" bind:checked={settings.lowResources} />
            Low resources ({filteredModels.length} models)
        </label>

        <div class="select">
            <select
                bind:value={settings.selectedModel}
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
                bind:value={settings.systemMessageContent}
                placeholder={defaultSystemMessageContent}
            />
        </div>
    </div>

    <div class="field">
        <label class="checkbox">
            <input type="checkbox" bind:checked={settings.useIndexedDBCache} />
            Use IndexedDB Cache (instead of Cache API)
        </label>
    </div>

    <div class="field">
        <label class="checkbox">
            <input type="checkbox" bind:checked={settings.streamResponses} />
            Stream responses
        </label>
    </div>

    <div class="field">
        <label class="checkbox">
            <input type="checkbox" bind:checked={settings.animationsEnabled} />
            Show animations
        </label>
    </div>
{:else}
    <p class="mb-2">
        <b>
            Model:
            <span class="has-text-success">
                {settings.selectedModel}
            </span>
        </b>
    </p>

    <button
        class="button is-fullwidth"
        on:click={() => (settingsVisible = !settingsVisible)}
    >
        Settings
    </button>

    {#if errorMessage.length > 0}
        <p class="has-text-danger"><b>ERROR: </b> {errorMessage}</p>

        {#if settings.animationsEnabled}
            <img src="img/gif2.gif" alt="Error!" />
        {/if}
    {:else if infoMessage.length > 0}
        <p class="mt-2"><b>{infoMessage}</b></p>
    {/if}

    {#if settings.animationsEnabled && loadingModel && errorMessage.length === 0}
        <img src="img/gif0.gif" alt="Loading!" />
    {/if}

    {#if settings.selectedModel.length > 0}
        <div class="messages">
            {#each messages as msg}
                <p class="message">
                    <b>{formatRole(msg.role)}:</b>
                </p>

                <div>{@html msg.content}</div>
            {/each}
        </div>

        {#if settings.animationsEnabled && thinking && !writtingResponse}
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

    .message {
        margin-bottom: 0;
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
