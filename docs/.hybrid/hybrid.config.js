
module.exports = {
  chain: "Ethereum",
  foundry: {
    src: "./contracts",
    test: "./contracts",
    cache: true,
    cache_path: ".hybrid/cache",
    out: ".hybrid/out",
    gas_reports: ["*"],
    libs = ["node_modules"]
  }
}
