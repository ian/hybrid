import open from "open"
import { Server } from "socket.io"
import { v4 as uuid } from "uuid"

export function createChannel() {
  const channel = uuid()
  return channel
}

// const host = "https://hybrid.dev"
const host = "http://localhost:3000"

export async function waitForDeployment(bytecode: string, chainId: number) {
  return new Promise(async (resolve, reject) => {
    const server = new Server({
      cors: {
        origin: "*"
      }
    })

    server.on("connection", (socket) => {
      // User connected, send them the bytecode
      socket.emit("init", {
        chainId,
        bytecode
      })

      // User deployed, resolve the promise
      socket.on("deploy", (arg) => {
        resolve(arg)
      })

      //
      socket.on("disconnect", () => {
        // reject("Window closed, try again")
      })
    })

    server.listen(4001)

    const url = "ws://localhost:4001"
    await open(host + "/deploy?url=" + url)
  })
}
