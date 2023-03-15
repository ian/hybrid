import clsx from "clsx"
import styles from "./DefaultButton.module.css"

export type DefaultButtonProps = {
  className?: string
  intent?: "default" | "success" | "error"
  onClick?: () => void
  children: React.ReactNode
  disabled?: boolean
}

const INTENTS = {
  default: styles.DefaultButtonBase,
  success: styles.DefaultButtonSuccess,
  error: styles.DefaultButtonError
}

const DefaultButton = (props: DefaultButtonProps) => {
  const {
    // className = "px-8 py-3 transition-all cursor-pointer duration-250 hover:scale-[1.05] rounded-xl font-bold",
    className = styles.DefaultButton,
    intent = "default",
    onClick,
    children,
    disabled
  } = props

  return (
    <button
      className={clsx(
        className,
        INTENTS[intent],
        disabled && styles.DefaultButtonDisabled
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default DefaultButton
