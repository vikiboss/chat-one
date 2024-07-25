import { useOnebotV11ForwardWS } from "./hooks/use-onebot-v11-forward-ws";

export function App() {
	const api = useOnebotV11ForwardWS(__WS_URL__ ?? "", {
		onConnected() {
			console.log("WS connection is ready!");
		},
		onMessage(message) {
			console.log(message);
		},
		onDisconnected() {
			console.log("WS connection is closed!");
		},
	});

	return (
		<div className="h-screen w-screen grid place-content-center">
			<pre>Chat One</pre>
			<button
				type="button"
				onClick={() => {
					api.action("send_private_msg", {
						user_id: 1141284758,
						message: "Ciallo～(∠·ω< )⌒☆",
					});
				}}
			>
				send
			</button>
		</div>
	);
}
