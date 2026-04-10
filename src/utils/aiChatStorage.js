export const AI_CHAT_STORAGE_KEY = "securelaw_ai_chat_state";

export const getDefaultAiChatState = () => ({
  selectedTemplate: null,
  prompt: "",
  maskedPreview: "",
  messages: [],
});

export const getStoredAiChatState = () => {
  if (typeof window === "undefined") {
    return getDefaultAiChatState();
  }

  try {
    const rawState = window.sessionStorage.getItem(AI_CHAT_STORAGE_KEY);
    if (!rawState) {
      return getDefaultAiChatState();
    }

    const parsedState = JSON.parse(rawState);
    return {
      selectedTemplate: parsedState.selectedTemplate ?? null,
      prompt: typeof parsedState.prompt === "string" ? parsedState.prompt : "",
      maskedPreview:
        typeof parsedState.maskedPreview === "string" ? parsedState.maskedPreview : "",
      messages: Array.isArray(parsedState.messages) ? parsedState.messages : [],
    };
  } catch (error) {
    console.error("Error restoring AI chat state:", error);
    return getDefaultAiChatState();
  }
};

export const saveAiChatState = (state) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(AI_CHAT_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error saving AI chat state:", error);
  }
};
