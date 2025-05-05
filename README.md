
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d102c7a9-ba25-4fe6-b46c-9619f4a1d1d8

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d102c7a9-ba25-4fe6-b46c-9619f4a1d1d8) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Running as a Desktop Application

You can run CloudGlide S3 Manager as a desktop application using Electron:

### Prerequisites

Before packaging the application, make sure you have the following installed:
- Node.js (v16 or newer)
- npm (included with Node.js)
- For macOS builds: macOS operating system
- For Windows builds: Windows operating system or Wine on macOS/Linux
- For Linux builds: Linux operating system

### Development Mode

```sh
# Install dependencies first
npm install

# Run in development mode
npm run electron:dev
```

### Building for Desktop

```sh
# Build for your current platform
npm run electron:build

# Build specifically for macOS
npm run electron:build:mac

# Build specifically for Windows
npm run electron:build:win

# Build specifically for Linux
npm run electron:build:linux
```

The packaged application will be available in the `release` directory.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Electron (for desktop builds)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d102c7a9-ba25-4fe6-b46c-9619f4a1d1d8) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
