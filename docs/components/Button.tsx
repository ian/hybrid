import clsx from "clsx"
import styles from "./Button.module.css"
import Link from "next/link"

export type ButtonProps = {
	className?: string
	href?: string
	intent?: "default" | "success" | "error"
	mode?: "default" | "outline"
	onClick?: () => void
	children: React.ReactNode
	disabled?: boolean
}

const INTENTS = {
	default: styles.DefaultButtonBase,
	success: styles.DefaultButtonSuccess,
	error: styles.DefaultButtonError
}

const Button = (props: ButtonProps) => {
	const {
		// className = "px-8 py-3 transition-all cursor-pointer duration-250 hover:scale-[1.05] rounded-xl font-bold",
		className,
		href,
		intent = "default",
		onClick,
		children,
		disabled
	} = props

	if (href) {
		return (
			<Link
				href={href}
				className={clsx(
					styles.DefaultButton,
					className,
					INTENTS[intent],
					disabled && styles.DefaultButtonDisabled
				)}
				onClick={!disabled ? onClick : undefined}
			>
				{children}
			</Link>
		)
	}

	return (
		<button
			className={clsx(
				styles.DefaultButton,
				className,
				INTENTS[intent],
				disabled && styles.DefaultButtonDisabled
			)}
			onClick={!disabled ? onClick : undefined}
		>
			{children}
		</button>
	)
}

export default Button
