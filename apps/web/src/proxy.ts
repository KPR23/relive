import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { authClient } from "@/src/lib/auth-client";

export async function proxy(request: NextRequest) {
	const session = await authClient.getSession({
		fetchOptions: {
			headers: await headers(),
		},
	});

	if (!session) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/home, /f/:folderId"],
};
