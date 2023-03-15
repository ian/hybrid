import clsx from "clsx"

export type DefaultButtonProps = {
  className?: string
  intent?: "default" | "success" | "error"
  onClick?: () => void
  children: React.ReactNode
  disabled?: boolean
}

const INTENTS = {
  default: "text-white bg-blue-500",
  success: "text-white bg-green-500",
  error: "text-white bg-red-500"
}

const DefaultButton = (props: DefaultButtonProps) => {
  const {
    className = "px-8 py-3 transition-all cursor-pointer duration-250 hover:scale-[1.05] rounded-xl font-bold",
    intent = "default",
    onClick,
    children,
    disabled
  } = props

  return (
    <button
      className={clsx(className, INTENTS[intent], disabled && "brightness-75")}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default DefaultButton
