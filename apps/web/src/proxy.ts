import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { authClient } from "./lib/auth-client";

export async function proxy(request: NextRequest) {
	let session = null;

	try {
		const response = await authClient.getSession({
			fetchOptions: {
				headers: await headers(),
			},
		});
		session = response;
	} catch (error) {
		console.warn(
			"⚠️ Backend connection failed in proxy:",
			error instanceof Error ? error.message : error
		);
	}

	if (!session) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/home", "/f/:folderId"],
};
