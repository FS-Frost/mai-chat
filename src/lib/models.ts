// https://github.com/mlc-ai/web-llm/blob/22f0d37c5e68515059ba63ff5ba56f54324bc820/src/config.ts#L310
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

export const models = [
    // Llama-3
    {
        id: "Llama-3-8B-Instruct-q4f32_1-MLC-1k",
        vramRequiredInMB: 5295.7,
        lowResourcesRequired: true,
    },
    {
        id: "Llama-3-8B-Instruct-q4f16_1-MLC-1k",
        vramRequiredInMB: 4598.34,
        lowResourcesRequired: true,
    },
    {
        id: "Llama-3-8B-Instruct-q4f32_1-MLC",
        vramRequiredInMB: 6101.01,
        lowResourcesRequired: false,
    },
    {
        id: "Llama-3-8B-Instruct-q4f16_1-MLC",
        vramRequiredInMB: 5001.0,
        lowResourcesRequired: false,
    },
    {
        id: "Llama-3-70B-Instruct-q3f16_1-MLC",
        vramRequiredInMB: 31153.13,
        lowResourcesRequired: false,
    },
    // Phi3-mini-instruct
    {
        id: "Phi-3-mini-4k-instruct-q4f16_1-MLC",
        vramRequiredInMB: 3672.07,
        lowResourcesRequired: false,
    },
    {
        id: "Phi-3-mini-4k-instruct-q4f32_1-MLC",
        vramRequiredInMB: 5483.12,
        lowResourcesRequired: false,
    },
    {
        id: "Phi-3-mini-4k-instruct-q4f16_1-MLC-1k",
        vramRequiredInMB: 2520.07,
        lowResourcesRequired: true,
    },
    {
        id: "Phi-3-mini-4k-instruct-q4f32_1-MLC-1k",
        vramRequiredInMB: 3179.12,
        lowResourcesRequired: true,
    },
    // Llama-2
    {
        id: "Llama-2-7b-chat-hf-q4f32_1-MLC-1k",
        vramRequiredInMB: 5284.01,
        lowResourcesRequired: false,
    },
    {
        id: "Llama-2-7b-chat-hf-q4f16_1-MLC-1k",
        vramRequiredInMB: 4618.52,
        lowResourcesRequired: false,
        required_features: ["shader-f16"],
    },
    {
        id: "Llama-2-7b-chat-hf-q4f32_1-MLC",
        vramRequiredInMB: 9109.03,
        lowResourcesRequired: false,
    },
    {
        id: "Llama-2-7b-chat-hf-q4f16_1-MLC",
        vramRequiredInMB: 6749.02,
        lowResourcesRequired: false,
        required_features: ["shader-f16"],
    },
    {
        id: "Llama-2-13b-chat-hf-q4f16_1-MLC",
        vramRequiredInMB: 11814.09,
        lowResourcesRequired: false,
        required_features: ["shader-f16"],
    },
    // Mistral variants
    {
        id: "WizardMath-7B-V1.1-q4f16_1-MLC",
        vramRequiredInMB: 6079.02,
        lowResourcesRequired: false,
        required_features: ["shader-f16"],
    },
    {
        id: "Mistral-7B-Instruct-v0.2-q4f16_1-MLC",
        vramRequiredInMB: 6079.02,
        lowResourcesRequired: false,
        required_features: ["shader-f16"],
    },
    {
        id: "OpenHermes-2.5-Mistral-7B-q4f16_1-MLC",
        vramRequiredInMB: 6079.02,
        lowResourcesRequired: false,
        required_features: ["shader-f16"],
    },
    {
        id: "NeuralHermes-2.5-Mistral-7B-q4f16_1-MLC",
        vramRequiredInMB: 6079.02,
        lowResourcesRequired: false,
        required_features: ["shader-f16"],
    },
    // Hermes-2 Pro
    {
        id: "Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC",
        vramRequiredInMB: 4976.13,
        lowResourcesRequired: false,
    },
    {
        id: "Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC",
        vramRequiredInMB: 6051.27,
        lowResourcesRequired: false,
    },
    {
        id: "Hermes-2-Pro-Mistral-7B-q4f16_1-MLC",
        vramRequiredInMB: 4033.28,
        lowResourcesRequired: false,
        required_features: ["shader-f16"],
    },
    // Gemma-2B
    {
        id: "gemma-2b-it-q4f16_1-MLC",
        vramRequiredInMB: 1476.52,
        lowResourcesRequired: false,
        buffer_size_required_bytes: 262144000,
        required_features: ["shader-f16"],
    },
    {
        id: "gemma-2b-it-q4f32_1-MLC",
        vramRequiredInMB: 1750.66,
        lowResourcesRequired: false,
        buffer_size_required_bytes: 262144000,
    },
    {
        id: "gemma-2b-it-q4f16_1-MLC-1k",
        vramRequiredInMB: 1476.52,
        lowResourcesRequired: true,
        buffer_size_required_bytes: 262144000,
        required_features: ["shader-f16"],
    },
    {
        id: "gemma-2b-it-q4f32_1-MLC-1k",
        vramRequiredInMB: 1750.66,
        lowResourcesRequired: true,
        buffer_size_required_bytes: 262144000,
    },
    // Qwen-1.5-1.8B
    {
        id: "Qwen1.5-1.8B-Chat-q4f16_1-MLC",
        vramRequiredInMB: 2404.94,
        lowResourcesRequired: false,
    },
    {
        id: "Qwen1.5-1.8B-Chat-q4f32_1-MLC",
        vramRequiredInMB: 3313.63,
        lowResourcesRequired: false,
    },
    {
        id: "Qwen1.5-1.8B-Chat-q4f16_1-MLC-1k",
        vramRequiredInMB: 1828.94,
        lowResourcesRequired: true,
    },
    {
        id: "Qwen1.5-1.8B-Chat-q4f32_1-MLC-1k",
        vramRequiredInMB: 2161.63,
        lowResourcesRequired: true,
    },
    // StableLM-zephyr-1.6B
    {
        id: "stablelm-2-zephyr-1_6b-q4f16_1-MLC",
        vramRequiredInMB: 2087.66,
        lowResourcesRequired: false,
    },
    {
        id: "stablelm-2-zephyr-1_6b-q4f32_1-MLC",
        vramRequiredInMB: 2999.33,
        lowResourcesRequired: false,
    },
    {
        id: "stablelm-2-zephyr-1_6b-q4f16_1-MLC-1k",
        vramRequiredInMB: 1511.66,
        lowResourcesRequired: true,
    },
    {
        id: "stablelm-2-zephyr-1_6b-q4f32_1-MLC-1k",
        vramRequiredInMB: 1847.33,
        lowResourcesRequired: true,
    },
    // RedPajama
    {
        id: "RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC",
        vramRequiredInMB: 2972.09,
        lowResourcesRequired: false,
        required_features: ["shader-f16"],
    },
    {
        id: "RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC",
        vramRequiredInMB: 3928.09,
        lowResourcesRequired: false,
    },
    {
        id: "RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC-1k",
        vramRequiredInMB: 2041.09,
        lowResourcesRequired: true,
        required_features: ["shader-f16"],
    },
    {
        id: "RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC-1k",
        vramRequiredInMB: 2558.09,
        lowResourcesRequired: true,
    },
    // Phi-2
    {
        id: "phi-2-q4f16_1-MLC",
        vramRequiredInMB: 3053.97,
        lowResourcesRequired: false,
        required_features: ["shader-f16"],
    },
    {
        id: "phi-2-q4f32_1-MLC",
        vramRequiredInMB: 4032.48,
        lowResourcesRequired: false,
    },
    {
        id: "phi-2-q4f16_1-MLC-1k",
        vramRequiredInMB: 2131.97,
        lowResourcesRequired: true,
        required_features: ["shader-f16"],
    },
    {
        id: "phi-2-q4f32_1-MLC-1k",
        vramRequiredInMB: 2740.48,
        lowResourcesRequired: true,
    },
    // Phi-1.5
    {
        id: "phi-1_5-q4f16_1-MLC",
        vramRequiredInMB: 1210.09,
        lowResourcesRequired: true,
        required_features: ["shader-f16"],
    },
    {
        id: "phi-1_5-q4f32_1-MLC",
        vramRequiredInMB: 1682.09,
        lowResourcesRequired: true,
    },
    {
        id: "phi-1_5-q4f16_1-MLC-1k",
        vramRequiredInMB: 1210.09,
        lowResourcesRequired: true,
        required_features: ["shader-f16"],
    },
    {
        id: "phi-1_5-q4f32_1-MLC-1k",
        vramRequiredInMB: 1682.09,
        lowResourcesRequired: true,
    },
    // TinyLlama
    {
        id: "TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC",
        vramRequiredInMB: 697.24,
        lowResourcesRequired: true,
        required_features: ["shader-f16"],
    },
    {
        id: "TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC",
        vramRequiredInMB: 839.98,
        lowResourcesRequired: true,
    },
    {
        id: "TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC-1k",
        vramRequiredInMB: 675.24,
        lowResourcesRequired: true,
        required_features: ["shader-f16"],
    },
    {
        id: "TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC-1k",
        vramRequiredInMB: 795.98,
        lowResourcesRequired: true,
    },
];
