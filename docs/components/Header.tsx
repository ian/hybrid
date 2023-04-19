import Link from "next/link"
import Logo from "./Logo"
import clsx from "clsx"
import { IoMdClose } from "react-icons/io"
import React from "react"
import { RiDiscordFill, RiGithubFill, RiTwitterFill } from "react-icons/ri"

const Header = ({ className }: { className?: string }) => {
	return (
		<div className={className}>
			<nav className="flex flex-wrap items-center justify-between max-w-6xl p-5 mx-auto">
				<Link href="/" className="no-underline">
					<Logo withText />
				</Link>
				<MobileMenu />

				<div className="hidden w-full md:block md:w-auto" id="navbar-default">
					<Menu />
				</div>
			</nav>
		</div>
	)
}

const LINKS = [
	{
		href: "https://github.com/hybridhq/hybrid",
		// label: "Github",
		icon: <RiGithubFill className="mr-1 hover:text-white" size={28} />
	},
	{
		href: "https://twitter.com/hybrid__dev",
		// label: "Twitter",
		icon: <RiTwitterFill className="mr-1 hover:text-white" size={28} />
	},
	{
		href: "https://discord.gg/AcJFXZ9Mfk",
		// label: "Discord",
		icon: <RiDiscordFill className="mr-1 hover:text-white" size={28} />
	}
]

const Menu = ({ className }: { className?: string }) => {
	return (
		<ul
			className={clsx(
				className,
				"flex flex-col ml-0 list-none sm:flex-row sm:space-x-3"
			)}
		>
			{LINKS.map((link) => (
				<Link
					href={link.href}
					key={link.href}
					className="flex items-center py-2 no-underline"
					target="_blank"
				>
					{link.icon}
					{/* {link.label} */}
				</Link>
			))}
		</ul>
	)
}

const MobileMenu = () => {
	const [isOpen, setOpen] = React.useState(false)
	const toggleOpen = React.useCallback(() => setOpen(!isOpen), [isOpen])
	return (
		<>
			<button
				data-collapse-toggle="navbar-default"
				type="button"
				className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 transition-all rounded-lg md:hidden focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:focus:ring-gray-600"
				aria-controls="navbar-default"
				aria-expanded="false"
				onClick={toggleOpen}
			>
				<span className="sr-only">Open menu</span>
				<svg
					className="w-6 h-6"
					aria-hidden="true"
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fillRule="evenodd"
						d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
						clipRule="evenodd"
					></path>
				</svg>
			</button>
			<div
				className={clsx(
					isOpen ? "fixed" : "hidden",
					"top-0 left-0 w-full h-screen bg-black sm:hidden p-5 space-y-5 flex flex-col justify-between"
				)}
				id="navbar-default"
			>
				<div className="flex items-center justify-between ">
					<Logo withText />
					<IoMdClose
						size={32}
						// className="fixed right-6 top-6"
						className="mr-1"
						onClick={toggleOpen}
					/>
				</div>

				<div className="flex-grow">
					<Menu className="text-xl" />
				</div>
			</div>
		</>
	)
}

export default Header
