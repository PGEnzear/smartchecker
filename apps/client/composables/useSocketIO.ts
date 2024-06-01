import { io } from "socket.io-client";

export function useSocketIO(url?: string) {
  const config = useRuntimeConfig();
  const accessToken = useAccessToken();
  if (!url) url = config.public.apiBaseurl;

  return io(url!, {
    reconnectionAttempts: Infinity,
    extraHeaders: {
      ...(accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined),
    },
  });
}
