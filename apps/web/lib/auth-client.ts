import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
	fetchOptions: {
		credentials: "include",
	},
});

export const gitHubSignIn = async () => {
	await authClient.signIn.social({
		provider: "github",
		callbackURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/",
	});
};

export const { signIn, signUp, signOut, useSession } = authClient;
