import { useEffect, useRef } from "react"
import { useSnakeContext } from "./snake-context"

function App() {
  const canvas = useRef<HTMLCanvasElement>(null)

  const { refreshRatePeriod, repaint, height, width, snakeMovePosition } =
    useSnakeContext()

  useEffect(() => {
    const interval = setInterval(
      () => canvas.current && repaint?.(canvas.current),
      refreshRatePeriod
    )

    return () => {
      clearInterval(interval)
    }
  }, [refreshRatePeriod, repaint])

  return (
    <>
      <canvas ref={canvas} width={width} height={height}></canvas>

      <p>Snake move position: {snakeMovePosition}</p>
    </>
  )
}

export default App
