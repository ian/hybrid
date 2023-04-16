import clsx from "clsx"

type Props = {
	className?: string
	withText?: boolean
	size?: "sm" | "md" | "lg" | "xl"
}
export default function Logo({
	className,
	size = "md",
	withText = false
}: Props) {
	return (
		<span className="flex items-center space-x-2">
			<img
				src="/docs/hybrid.svg"
				alt="Hybrid Logo"
				className={clsx(className, sizeToClass(size))}
			/>
			{withText && (
				<span className="font-sans text-xl tracking-wide text-white">
					hybrid
				</span>
			)}
		</span>
	)
}

const sizeToClass = (size: Props["size"]) => {
	switch (size) {
		case "sm":
			return "h-6 w-6"
		case "md":
			return "h-10 w-10"
		case "lg":
			return "h-20 w-20"
		case "xl":
			return "h-32 w-32"
	}
}
