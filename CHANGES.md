# Changes Summary

## 1. Added File Upload (Image / PDF)

Added the ability to attach an image or PDF file alongside a text prompt. The file is converted to base64 on the client and sent as a multimodal content part to the C1 API.

### Files changed

- **`src/app/page.tsx`** -- Added a paperclip button that opens a file picker (`image/*` and `.pdf`). When a file is selected, a chip with the file name appears below the input bar. The chip has a close button to remove the attachment.

- **`src/app/hooks/useUIState.ts`** -- Added `attachedFile` state (`{ base64, mimeType, fileName } | null`) and a `setAttachedFile` action. The attachment is automatically cleared after submission.

- **`src/app/helpers/api.ts`** -- Extended `ApiCallParams` with an optional `attachedFile` field. When present, it is included in the JSON body sent to `/api/ask`.

- **`src/app/api/ask/route.ts`** -- Added a `buildUserContent` helper that constructs the appropriate OpenAI-compatible multimodal content array:
  - **Images** are sent as `image_url` content parts with a `data:<mimeType>;base64,...` URL.
  - **PDFs** are sent as `file` content parts with the raw base64 data and filename.
  - When no file is attached, the prompt is sent as a plain string (unchanged behavior).

### Limitations

- **Audio files are not supported.** The Thesys C1 API explicitly does not support audio content in messages for either OpenAI or Anthropic model families.
- Large files will increase request payload size. Consider adding a client-side file size limit for production use.
