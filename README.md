# C1 App Template

Template repository for a generative UI app, powered by [C1 by Thesys](https://thesys.dev), and bootstrapped with `create-next-app`

[![Built with Thesys](https://thesys.dev/built-with-thesys-badge.svg)](https://thesys.dev)

## Getting Started

First, generate a new API key from [Thesys Console](https://chat.thesys.dev/console/keys) and then set it your environment variable.

```bash
export THESYS_API_KEY=<your-api-key>
```

Install dependencies:

```bash
npm i
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing your responses by modifying the system prompt in `src/app/api/chat/route.ts`.

## Model Verification

This template includes a GitHub Action that automatically verifies the C1 model used in `src/app/api/ask/route.ts` is valid according to the Thesys API. This workflow runs on every pull request to ensure you're using a supported model.

### Setting up the GitHub Action

To enable this workflow in your repository:

1. Go to your repository's **Settings** → **Secrets and variables** → **Actions**
2. Add a new repository secret named `THESYS_API_KEY` with your Thesys API key value
3. The workflow will now run automatically on all pull requests

The workflow will:
- Extract the model name from `src/app/api/ask/route.ts`
- Fetch the list of valid models from the Thesys API
- Verify that your model is in the list of supported models
- Block the PR from merging if an invalid model is detected

You can view available models by running the verification script locally:

```bash
THESYS_API_KEY=<your-api-key> .github/scripts/verify-model.sh
```

### Making Model Verification Required (Recommended)

To require this check to pass before merging PRs:

1. Go to your repository's **Settings** → **Branches**
2. Add or edit a branch protection rule for your main branch (e.g., `main` or `master`)
3. Enable **Require status checks to pass before merging**
4. Search for and select **Verify C1 Model** in the status checks list
5. Save the protection rule

This ensures that only valid C1 models can be merged into your main branch.

## Learn More

To learn more about Thesys C1, take a look at the [C1 Documentation](https://docs.thesys.dev) - learn about Thesys C1.

## One-Click Deploy with Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fthesysdev%2Ftemplate-c1-component-next&env=THESYS_API_KEY&envDescription=Thesys%20Generative%20UI%20API%20key%20can%20be%20found%20in%20the%20Thesys%20console&envLink=https%3A%2F%2Fchat.thesys.dev%2Fconsole%2Fkeys&demo-title=C1%20Generative%20UI%20API&demo-description=C1%20Generative%20UI%20API%20by%20Thesys%20is%20designed%20to%20create%20dynamic%20and%20intelligent%20user%20interfaces.%20It%20leverages%20large%20language%20models%20(LLMs)%20to%20generate%20UI%20components%20in%20real-time%2C%20adapting%20to%20user%20input%20and%20context.%20Developers%20can%20integrate%20C1%20into%20their%20applications%20to%20enhance%20user%20engagement%20with%20visually%20rich%20and%20responsive%20interfaces.&demo-url=https%3A%2F%2Fchat.thesys.dev&demo-image=https%3A%2F%2Fgithub.com%2FCharlesCreativeContent%2FmyImages%2Fblob%2Fmain%2Fimages%2FC1Hero.png%3Fraw%3Dtrue)
