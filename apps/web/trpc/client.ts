import { createTRPCReact, CreateTRPCReact } from "@trpc/react-query";
import { AppRouter } from "@repo/trpc/router";

export const trpc: CreateTRPCReact<AppRouter, any> = createTRPCReact<
	AppRouter,
	any
>();
