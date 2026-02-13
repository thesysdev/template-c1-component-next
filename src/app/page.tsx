"use client";

import "@crayonai/react-ui/styles/index.css";
import { useRef } from "react";
import { Button } from "@crayonai/react-ui";
import { ThemeProvider, C1Component } from "@thesysai/genui-sdk";
import { useUIState } from "./hooks/useUIState";
import { Loader } from "./components/Loader";

const PaperclipIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Page = () => {
  const { state, actions } = useUIState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // dataUrl format: "data:<mimeType>;base64,<base64data>"
      const base64 = dataUrl.split(",")[1];
      const mimeType = file.type;

      actions.setAttachedFile({
        base64,
        mimeType,
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);

    // Reset the input so the same file can be selected again
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-[750px] mx-auto space-y-6">
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Attach file button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={state.isLoading}
              className="flex items-center justify-center w-[45px] h-[45px] rounded-lg border border-gray-300
                bg-white text-gray-500 hover:text-gray-700 hover:border-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors"
              title="Attach image or PDF"
            >
              <PaperclipIcon />
            </button>

            {/* Prompt input */}
            <input
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300
                bg-white text-gray-900 h-[45px]
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                placeholder-gray-500"
              value={state.query}
              placeholder="Enter a prompt"
              onChange={({ target: { value } }) => actions.setQuery(value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !state.isLoading) {
                  actions.makeApiCall(state.query);
                }
              }}
            />

            {/* Submit button */}
            <Button
              onClick={() => actions.makeApiCall(state.query)}
              disabled={state.query.length === 0 || state.isLoading}
              className="flex items-center justify-center min-w-[100px] h-[45px]"
              size="large"
              variant="primary"
            >
              {state.isLoading ? <Loader /> : "Submit"}
            </Button>
          </div>

          {/* Attached file indicator */}
          {state.attachedFile && (
            <div className="flex items-center gap-2 pl-[53px]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                bg-blue-50 text-blue-700 text-sm border border-blue-200">
                <span className="max-w-[200px] truncate">
                  {state.attachedFile.fileName}
                </span>
                <button
                  type="button"
                  onClick={() => actions.setAttachedFile(null)}
                  className="flex items-center justify-center w-4 h-4 rounded-full
                    hover:bg-blue-200 transition-colors"
                  title="Remove attachment"
                >
                  <CloseIcon />
                </button>
              </span>
            </div>
          )}
        </div>

        <div className="max-w-[750px] mx-auto">
          <ThemeProvider>
            <C1Component
              c1Response={state.c1Response}
              isStreaming={state.isLoading}
              updateMessage={(message) => actions.setC1Response(message)}
              onAction={({ llmFriendlyMessage }) => {
                if (!state.isLoading) {
                  actions.makeApiCall(llmFriendlyMessage, state.c1Response);
                }
              }}
            />
          </ThemeProvider>
        </div>
      </div>
    </div>
  );
};

export default Page;
