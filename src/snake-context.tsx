import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from "react"

export type SnakeContextType = {
  refreshRatePeriod: number
  piecePixels: number
  width: number
  height: number

  repaint?: (element: HTMLCanvasElement) => void
}

export const useSnakeContext = () => useContext(SnakeContext)

export const SnakeContext = createContext<SnakeContextType>({
  refreshRatePeriod: 1000,
  piecePixels: 30,
  width: 600,
  height: 300,
})

// 30
// 600 / 30 = 20
// 300 / 30 = 10

const blockNumber1 = "#166534"
const blockNumber2 = "#22c55e"

const headImages = {
  left: "/Graphics/head_left.png",
  right: "/Graphics/head_right.png",
  up: "/Graphics/head_up.png",
  down: "/Graphics/head_down.png",
}

const bodyImages = {
  bottomleft: "/Graphics/body_bottomleft.png",
  bottomright: "/Graphics/body_bottomright.png",
  topleft: "/Graphics/body_topleft.png",
  topright: "/Graphics/body_topright.png",
  horizontal: "/Graphics/body_horizontal.png",
  vertical: "/Graphics/body_vertical.png",
}

const tailImages = {
  left: "/Graphics/tail_left.png",
  right: "/Graphics/tail_right.png",
  up: "/Graphics/tail_up.png",
  down: "/Graphics/tail_down.png",
}

const renderImageToBlock = (
  x: number,
  y: number,
  src: string,
  ctx: CanvasRenderingContext2D
) => {
  const image = new Image()

  image.onload = () => {
    ctx.drawImage(image, x, y)
  }

  image.src = src
}

const SnakeContextProvider: FC<
  PropsWithChildren & { width: number; height: number; piecePixels: number }
> = ({ children, width, height, piecePixels }) => {
  const [applePosition, setApplePosition] = useState([1, 1])
  const [snakePositions, setSnakePositions] = useState<[number, number][]>([
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
    [3, 1],
    [4, 1],
    [5, 1],
  ])

  const renderApple = (context: CanvasRenderingContext2D) => {
    const [x, y] = applePosition
    renderImageToBlock(
      x * piecePixels,
      y * piecePixels,
      "/Graphics/apple.png",
      context
    )
  }

  const removePreviousPaint = (context: CanvasRenderingContext2D) => {
    context.clearRect(0, 0, width, height)
  }

  const renderBackgroundPieces = (ctx: CanvasRenderingContext2D) => {
    for (let i = 0; i < width / piecePixels; i++) {
      for (let j = 0; j < height / piecePixels; j++) {
        ctx.fillStyle = (i + j) % 2 === 0 ? blockNumber1 : blockNumber2

        ctx.fillRect(i * piecePixels, j * piecePixels, piecePixels, piecePixels)
      }
    }
  }

  const renderSnake = (ctx: CanvasRenderingContext2D) => {
    if (snakePositions.length < 3)
      throw new Error("Cannot render snake because the length is lower than 3")

    const tail = snakePositions[0]
    const head = snakePositions.at(-1)!

    renderImageToBlock(
      head[0] * piecePixels,
      head[1] * piecePixels,
      headImages.right,
      ctx
    )

    renderImageToBlock(
      tail[0] * piecePixels,
      tail[1] * piecePixels,
      tailImages.left,
      ctx
    )

    const bodySlices = snakePositions.slice(1, -1)

    for (const slice of bodySlices) {
      renderImageToBlock(
        slice[0] * piecePixels,
        slice[1] * piecePixels,
        bodyImages.horizontal,
        ctx
      )
    }
  }

  const moveSnakeToTheFront = () => {}

  const repaint = (c: HTMLCanvasElement) => {
    const ctx = c.getContext("2d")

    if (!ctx) return

    removePreviousPaint(ctx)
    renderBackgroundPieces(ctx)
    renderApple(ctx)
    renderSnake(ctx)
  }

  return (
    <SnakeContext.Provider
      value={{
        refreshRatePeriod: 1000,
        piecePixels,
        repaint,
        width,
        height,
      }}
    >
      {children}
    </SnakeContext.Provider>
  )
}

export default SnakeContextProvider
