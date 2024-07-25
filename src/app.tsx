import { create } from "@shined/reactive";
import { useReactive } from "@shined/react-use";
import {
	useOnebotV11ForwardWS,
	type OneBot,
} from "./hooks/use-onebot-v11-forward-ws";

export function App() {
	const [state, mutate] = useReactive(
		{ history: [] as (OneBot.GroupMessage | OneBot.PrivateMessage)[] },
		{ create },
	);

	const api = useOnebotV11ForwardWS(__WS_URL__ ?? "", {
		onConnected() {
			console.log("WS connection is ready!");
		},
		onMessage(message) {
			console.log(message);
			mutate.history.push(message);
		},
		onDisconnected() {
			console.log("WS connection is closed!");
		},
	});

	return (
		<div className="h-screen w-screen">
			<div>
				<pre>Chat One</pre>
			</div>
			<div>
				{state.history.map((e) => {
					return (
						<div key={e.message_id}>
							{new Date().toLocaleString("zh-CN")}{" "}
							{"group_id" in e ? `[G-${e.group_id}]` : `[F-${e.user_id}]`}{" "}
							{e.sender.nickname ?? "unknown"}:{e.raw_message}
						</div>
					);
				})}
			</div>
			<button
				type="button"
				onClick={async () => {
					const res = await api.action("send_private_msg", {
						user_id: 1141284758,
						message: "Ciallo～(∠·ω< )⌒☆",
					});

					console.log(res);
				}}
			>
				{"Ciallo～(∠·ω< )⌒☆"}
			</button>
		</div>
	);
}
