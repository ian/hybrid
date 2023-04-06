import Link from "next/link"
import Logo from "~/components/Logo"

import HomeHeader from "~/components/Header"
import Footer from "~/components/HomeFooter"

export default function Homepage() {
	return (
		<div className="fixed top-0 left-0 flex flex-col justify-between w-screen h-screen text-white bg-blue-800 bg-opacity-10">
			<main className="flex items-center justify-center flex-grow-0 h-full">
				<div className="flex items-start justify-center text-center sm:w-2/3 h-2/3">
					<div className="max-w-xl px-5 space-y-10">
						<Logo size="xl" className="mx-auto" />
						<p className="text-xl font-sans font-[300] tracking-wide">
							{/* A Solidity + React + Typescript framework for rapidly building
							decentralized EVM applications. */}
							{/* A highly opinionated, Solidity + TypeScript framework for rapidly
							building decentralized EVM applications. */}
							{/* Web3 Framework for building React EVM Applications in
							Solidity + TypeScript. */}
							Web3 Framework for building React EVM Applications
						</p>
						{/* <div className="pb-2">
							<code className="px-5 py-3">npx hybrid init</code>
						</div> */}
						<div className="space-x-5">
							{/* <Link
								href="/platform"
								className="px-5 py-3 text-black no-underline bg-white rounded-full hover:bg-gray-50"
							>
								Get Started
							</Link> */}
							<Link
								href="/docs"
								className="px-5 py-3 text-white no-underline rounded-full outline hover:bg-gray-900"
							>
								Documentation
							</Link>
						</div>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	)
}
