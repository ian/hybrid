import { Abi } from "abitype"
import ora from "ora"
import open from "open"
import { Server } from "socket.io"
import { Deployment } from "@hybrd/types"

const host = "https://hybrid.dev"

export async function waitForDeployment(
  abi: Abi,
  bytecode: string,
  chainId: number
): Promise<Deployment> {
  return new Promise(async (resolve, reject) => {
    let spinner
    const server = new Server({
      cors: {
        origin: "*"
      }
    })

    server.on("connection", (socket) => {
      // User connected, send them the bytecode
      socket.emit("init", {
        chainId,
        abi,
        bytecode
      })

      socket.on("tx", (arg) => {
        // Someday we might want to show a status update
      })

      // User deployed, resolve the promise
      socket.on("receipt", (arg) => {
        spinner.succeed("Contract deployed to testnet")
        server.close()
        resolve(JSON.parse(arg))
      })

      //
      socket.on("disconnect", () => {
        // Should we do something here? Maybe just let them reload the window.
      })
    })

    server.listen(0)

    // @ts-ignore - httpServer is marked as private
    // but there's no other way to get the port.
    const { port } = server.httpServer.address()

    const url = "ws://localhost:" + port
    // console.log("Opening browser at", host + "/deploy?url=" + url)

    spinner = ora("Waiting for deployment in browser ...").start()
    await open(host + "/deploy?url=" + url)
  })
}
