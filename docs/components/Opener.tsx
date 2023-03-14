import Image from "next/image"
import { Link } from "react-scroll"

export default function Opener() {
	return (
		<section className="flex flex-col items-center justify-center h-screen space-y-5">
			<Image src="/logo.svg" alt="MintDrop Logo" width={200} height={200} />
			<h1 className="text-3xl font-semibold">The NFT Development Framework</h1>

			{/* <p>
    powered by <a className="underline text-green">Foundry</a>,{" "}
    <a className="underline text-green">Wagmi</a>,{" "}
    <a className="underline text-green">Wagmi</a>
  </p> */}

			<Link
				activeClass="active"
				to="welcome"
				spy={true}
				smooth={true}
				duration={250}
				className="px-10 py-3 text-lg text-black rounded-full cursor-pointer bg-green"
			>
				Read the Docs
			</Link>
		</section>
	)
}
