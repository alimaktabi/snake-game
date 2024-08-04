import { useEffect, useRef } from "react"
import { useSnakeContext } from "./snake-context"

function App() {
  const canvas = useRef<HTMLCanvasElement>(null)

  const {
    refreshRatePeriod,
    repaint,
    height,
    width,
    snakeMovePosition,
    isGameOver,
    score,
  } = useSnakeContext()

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
      <div className="relative" style={{ width }}>
        {isGameOver && (
          <div className="absolute bg-black/40 inset-0 grid place-items-center">
            <h3 className="text-white">GAME OVER</h3>
          </div>
        )}

        <canvas ref={canvas} width={width} height={height}></canvas>
      </div>

      <p>Snake move position: {snakeMovePosition}</p>
      <p>Score so far: {score}</p>
    </>
  )
}

export default App
