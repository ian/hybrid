import Link from "next/link"
import {
	RiDiscordFill,
	RiGithubFill,
	RiNpmjsFill,
	RiTwitterFill
} from "react-icons/ri"

import NPMVersion from "~/components/NPMVersion"

const Footer = () => {
	return (
		<footer className="flex items-center justify-center py-5 space-x-5 text-sm sm:px-5 sm:space-x-12">
			<Link
				href="https://npmjs.com/hybrid"
				target="_blank"
				className="flex items-center no-underline hover:underline"
			>
				<RiNpmjsFill className="mr-1" size={18} />
				<NPMVersion />
			</Link>
			<Link
				href="https://github.com/hybridhq/hybrid"
				target="_blank"
				className="flex items-center no-underline hover:underline"
			>
				<RiGithubFill className="mr-1" size={18} />
				Github
			</Link>
			<Link
				href="https://twitter.com/hybrid__dev"
				target="_blank"
				className="flex items-center no-underline hover:underline"
			>
				<RiTwitterFill className="mr-1" size={18} />
				Twitter
			</Link>
			<Link
				href="https://discord.gg/AcJFXZ9Mfk"
				target="_blank"
				className="flex items-center no-underline hover:underline"
			>
				<RiDiscordFill className="mr-1" size={18} />
				Community
			</Link>
		</footer>
	)
}

export default Footer
