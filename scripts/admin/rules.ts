import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";

// Kept apart from commands.ts: the entry script needs this text before it has imported anything that reads the environment.
export const PASSWORD_RULE = `Password must be ${MIN_PASSWORD_LENGTH}–${MAX_PASSWORD_LENGTH} characters.`;
