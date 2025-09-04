# CertifyYT - Get Certified on YouTube Content

This is a Next.js application built in Firebase Studio that allows users to generate quizzes from YouTube videos or playlists and earn certificates upon passing.

## Getting Started

To run this project locally, you'll need to set up your environment variables.

1.  Create a new file named `.env.local` in the root of the project.
2.  Add the following environment variables to the file, replacing the placeholder values with your actual credentials:

    ```bash
    # YouTube Data API Key
    # https://developers.google.com/youtube/v3/getting-started
    YOUTUBE_API_KEY="YOUR_YOUTUBE_API_KEY"

    # Gemini API Key for AI features
    # https://ai.google.dev/
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

    # Firebase Project Configuration
    # You can find these in your Firebase project settings
    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
    ```

3.  Install the dependencies:

    ```bash
    npm install
    ```

4.  Run the development server:

    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:9002`.
