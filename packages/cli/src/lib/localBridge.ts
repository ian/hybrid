import { Abi } from "abitype"
import ora from "ora"
import open from "open"
import { Server } from "socket.io"
import { Deployment } from "@hybrd/types"

export async function waitForDeployment(
  abi: Abi,
  bytecode: string,
  chainId: number
): Promise<Deployment> {
  return new Promise((resolve) => {
    const spinner = ora("Waiting for deployment in browser ...").start()
    const server = new Server({
      cors: {
        origin: "*",
      },
    })

    server.on("connection", (socket) => {
      // User connected, send them the abi + bytecode
      socket.emit("init", {
        chainId,
        abi,
        bytecode,
      })

      // Someday we might want to show a status update
      // socket.on("tx", (arg) => {})

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

    // @ts-ignore - httpServer is marked as private
    // but there's no other way to get the port.
    // const { port } = server.httpServer.address()
    const port = 8580
    const url = "ws://localhost:" + port
    // console.log("Opening browser at", host + "/deploy?url=" + url)

    server.listen(port)

    const host = process.env.HYBRID_HOST || "https://hybrid.dev"
    open(host + "/deploy?url=" + url)
  })
}
