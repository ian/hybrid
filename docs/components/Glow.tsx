import clsx from "clsx"

export default function Glow({
	className,
	children
}: {
	className?: string
	children: React.ReactNode
}) {
	return (
		<div className={clsx(className, "relative group")}>
			<div className="absolute transition duration-1000 opacity-40 -inset-1 bg-gradient-to-r from-blue-600 to-green-600 blur-2xl group-hover:opacity-100 group-hover:duration-200"></div>
			<div className="relative bg-black ring-4 rounded-xl ring-black">
				{children}
			</div>
		</div>
	)
}
