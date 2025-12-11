# Germany Study Eligibility Checker

## 🔴 IMPORTANT: How to Fix "Login to Vercel" Issue

If users are asked to log in to Vercel when visiting your public link, it means **Deployment Protection** is active.

**To remove the login requirement:**

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Select this project (**german-eligibility-checker...**).
3. Click on the **Settings** tab.
4. On the left sidebar, click **Deployment Protection**.
5. Find the **Vercel Authentication** section.
6. **Disable** / Toggle off "Vercel Authentication".
7. Click **Save**.

Your app will now be publicly accessible without a login.

## Environment Variables

Ensure you have added the following Environment Variable in Vercel (**Settings** > **Environment Variables**):

- `VITE_API_KEY`: Your Gemini API Key.
