import open from "open"
import { Server } from "socket.io"
import { v4 as uuid } from "uuid"

export function createChannel() {
  const channel = uuid()
  return channel
}

// const host = "https://hybrid.dev"
const host = "http://localhost:3000"

type Deployment = {
  address: string
  deployer: string
  txHash: string
  blockHash: string
  blockNumber: number
}

export async function waitForDeployment(
  bytecode: string,
  chainId: number
): Promise<Deployment> {
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

      socket.on("tx", (arg) => {
        // Someday we might want to show a status update
      })

      // User deployed, resolve the promise
      socket.on("receipt", (arg) => {
        server.close()
        resolve(JSON.parse(arg))
      })

      //
      socket.on("disconnect", () => {
        // reject("Window closed, try again")
      })
    })

    server.listen(0)

    // @ts-ignore - httpServer is marked as private
    // but there's no other way to get the port.
    const { port } = server.httpServer.address()

    const url = "ws://localhost:" + port
    await open(host + "/deploy?url=" + url)
  })
}
