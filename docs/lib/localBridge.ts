import { Abi } from "abitype"
import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

type InitParams = {
	abi: Abi,
	bytecode: string
	chainId: number
}

type Callbacks = {
	init: (params: InitParams) => void
	onConnect?: () => void
	onDisconnect?: () => void
}

type LocalBridge = {
	emit: (event: string, data: any) => void
	close: () => void
}

export const useLocalBridge = (
	host: string,
	callbacks: Callbacks
): LocalBridge => {
	const [socket, setSocket] = useState<Socket>()

	useEffect(() => {
		if (!host) return
		const socket = io(host)

		socket.on("init", callbacks.init)
		socket.on("connect", () => {
			callbacks.onConnect?.()
		})
		socket.on("disconnect", () => {
			callbacks.onDisconnect?.()
		})

		setSocket(socket)
	}, [host])

	return {
		emit: (event: string, data: any) => {
			socket?.emit(event, data)
		},
		close: () => {
			socket?.close()
		}
	}
}
