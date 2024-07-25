import { useCreation, useEventListener, useUnmount } from "@shined/react-use";

interface WebSocketOptions {
	onOpen?: (event: Event) => void;
	onClose?: (event: CloseEvent) => void;
	onError?: (event: Event) => void;
	onMessage?: (event: MessageEvent) => void;
	protocols?: string | string[];
}

export function useWebsocket(url: string, options: WebSocketOptions = {}) {
	const {
		onOpen = () => {},
		onClose = () => {},
		onError = () => {},
		onMessage = () => {},
		protocols,
	} = options;

	const ws = useCreation(() => {
		return new WebSocket(url, protocols);
	}, [url, protocols]);

	useEventListener(ws, "message", onMessage);
	useEventListener(ws, "open", onOpen);
	useEventListener(ws, "close", onClose);
	useEventListener(ws, "error", onError);

	useUnmount(() => ws?.close());

	return ws;
}
