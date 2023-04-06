import ReactConfetti from "react-confetti"
import useWindowSize from "react-use/lib/useWindowSize"

export default function Confetti() {
  const { width, height } = useWindowSize()

  return (
    <ReactConfetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={1000}
      gravity={0.1}      
    />
  )
}
