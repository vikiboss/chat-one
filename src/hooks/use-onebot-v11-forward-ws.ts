import { useCreation } from "@shined/react-use";
import { useWebsocket } from "./use-websocket";

export interface UseOneBotV11ForwardWSOptions {
	onMessage?: (message: OneBot.GroupMessage | OneBot.PrivateMessage) => void;
	onNotice?: (notice: unknown) => void;
	onRequest?: (request: unknown) => void;
	onMetaEvent?: (metaEvent: unknown) => void;
	onConnected?: () => void;
	onDisconnected?: () => void;
}

export function useOnebotV11ForwardWS(
	url: string,
	options: UseOneBotV11ForwardWSOptions = {},
) {
	const {
		onConnected = () => {},
		onDisconnected = () => {},
		onMessage = () => {},
		onNotice = () => {},
		onRequest = () => {},
		onMetaEvent = () => {},
	} = options;

	const [base, sp] = url.split("?");

	const ApiUrl = `${base}/api${sp ? `?${sp}` : ""}`;
	const eventUrl = `${base}/event${sp ? `?${sp}` : ""}`;

	const apiWS = useWebsocket(ApiUrl);

	useWebsocket(eventUrl, {
		onOpen: onConnected,
		onClose: onDisconnected,
		onMessage(message) {
			const msg = JSON.parse(message.data);

			switch (msg.post_type) {
				case "message":
					onMessage(msg);
					break;
				case "notice":
					onNotice(msg);
					break;
				case "request":
					onRequest(msg);
					break;
				case "meta_event":
					onMetaEvent(msg);
					break;
				default:
					break;
			}
		},
	});

	const api = useCreation(() => ({
		action: (action: string, params: Record<string, unknown>) => {
			apiWS.send(JSON.stringify({ action, params }));
		},
		send: (data: Record<string, unknown>) => {
			apiWS.send(JSON.stringify(data));
		},
	}));

	return api;
}

export namespace OneBot {
	export interface AnonymousInfo {
		id: number;
		name: string;
		flag: string;
	}

	export interface Message {
		time: number;
		self_id: number;
		post_type: string;
		message_type: string;
		sub_type: string;
		message_id: number;
		user_id: number;
		message: string;
		raw_message: string;
		font: number;
	}

	export interface Sender {
		user_id: number;
		nickname: string;
		sex?: "male" | "female" | "unknown";
		age?: number;
	}

	export interface PrivateMessage extends Message {
		sender: Sender;
	}

	export interface GroupMessage {
		group_id: number;
		anonymous: AnonymousInfo | null;
		sender: Sender & {
			card: string;
			area: string;
			level: string;
			role: "owner" | "admin" | "member";
			title: string;
		};
	}
}
