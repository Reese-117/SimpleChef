# SimpleChef frontend (Expo)

This is an [Expo](https://expo.dev) app using file-based routing ([Expo Router](https://docs.expo.dev/router/introduction/)).

## API and auth

- Set `EXPO_PUBLIC_API_URL` to your backend base URL including `/api/v1` (e.g. `http://localhost:8000/api/v1`). If unset, dev builds infer the host from Metro.
- The Axios client attaches `Authorization: Bearer <token>` when logged in.
- **401 handling:** Invalid or expired JWT responses clear the stored token via `logout()`. `AuthSessionSync` then redirects from protected routes to `/login`. **403** responses (e.g. not allowed to edit another user’s recipe) are **not** treated as session expiry and do not log the user out.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
