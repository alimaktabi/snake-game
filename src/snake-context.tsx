import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react"

export type SnakeContextType = {
  refreshRatePeriod: number
  piecePixels: number
  width: number
  height: number
  snakeMovePosition: MovingAngle

  repaint?: (element: HTMLCanvasElement) => void
}

export const useSnakeContext = () => useContext(SnakeContext)

export const SnakeContext = createContext<SnakeContextType>({
  refreshRatePeriod: 1000,
  piecePixels: 30,
  width: 600,
  height: 300,
  snakeMovePosition: "right",
})

// 30
// 600 / 30 = 20
// 300 / 30 = 10

const blockNumber1 = "#166534"
const blockNumber2 = "#22c55e"

const headImages = {
  left: "/Graphics/head_left.png",
  right: "/Graphics/head_right.png",
  top: "/Graphics/head_up.png",
  bottom: "/Graphics/head_down.png",
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

const appleImage = "/Graphics/apple.png"

export type Block = [number, number]

const resolveTailPosition = (block: Block, nextBlock: Block) => {
  if (nextBlock[0] > block[0]) {
    return "left"
  }
  if (nextBlock[0] < block[0]) {
    return "right"
  }

  if (nextBlock[1] < block[1]) {
    return "down"
  }

  return "up"
}

const resolveBodyPosition = (
  beforeBlock: Block,
  block: Block,
  afterBlock: Block
) => {
  if (beforeBlock[1] == block[1] && block[1] == afterBlock[1])
    return "horizontal"

  if (beforeBlock[0] == block[0] && block[0] == afterBlock[0]) return "vertical"

  if (beforeBlock[0] < block[0] && block[1] < afterBlock[1]) return "bottomleft"

  if (beforeBlock[0] > block[0] && block[1] < afterBlock[1])
    return "bottomright"

  if (beforeBlock[1] > block[1] && block[0] > afterBlock[0]) return "topleft"

  if (beforeBlock[1] < block[1] && block[0] < afterBlock[0]) return "topright"
}

const reEvaluateIfOutOfBounds = (
  block: Block,
  width: number,
  height: number,
  piecePixels: number
): Block => {
  if (block[0] < 0) {
    return [width / piecePixels, block[1]]
  }
  if (block[1] < 0) {
    return [block[0], height / piecePixels]
  }
  if (block[0] * piecePixels > width) {
    return [0, block[1]]
  }
  if (block[1] * piecePixels > height) {
    return [block[0], 0]
  }

  return block
}

export type MovingAngle = "right" | "left" | "bottom" | "top"

const SnakeContextProvider: FC<
  PropsWithChildren & { width: number; height: number; piecePixels: number }
> = ({ children, width, height, piecePixels }) => {
  const [applePosition, setApplePosition] = useState([1, 1])
  const [snakeMovePosition, setSnakeMovePosition] =
    useState<MovingAngle>("right")
  const [snakePositions, setSnakePositions] = useState<Block[]>([
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
    [3, 1],
    [4, 1],
    [5, 1],
  ])

  const [cachedImages, setCachedImages] = useState<{
    [key: string]: HTMLImageElement
  } | null>(null)

  const renderImageToBlock = (
    x: number,
    y: number,
    src: string,
    ctx: CanvasRenderingContext2D
  ) => {
    if (!cachedImages) return

    const image = cachedImages[src]

    if (!image) return

    ctx.drawImage(image, x, y)
  }

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
    const bodySlices = snakePositions.slice(1, -1)

    renderImageToBlock(
      head[0] * piecePixels,
      head[1] * piecePixels,
      headImages[snakeMovePosition],
      ctx
    )

    renderImageToBlock(
      tail[0] * piecePixels,
      tail[1] * piecePixels,
      tailImages[resolveTailPosition(tail, bodySlices[0])],
      ctx
    )

    let previousBlock = tail
    let counter = 1

    for (const slice of bodySlices) {
      let nextBlock = bodySlices[counter] ?? head
      renderImageToBlock(
        slice[0] * piecePixels,
        slice[1] * piecePixels,
        bodyImages[resolveBodyPosition(previousBlock, slice, nextBlock)!],
        ctx
      )
      previousBlock = slice
      counter++
    }
  }

  const moveSnakeToTheFront = () => {
    snakePositions.splice(0, 1)

    const head = snakePositions.at(-1)!

    let newPosition: Block

    switch (snakeMovePosition) {
      case "bottom":
        newPosition = [head[0], head[1] + 1]
        break
      case "top":
        newPosition = [head[0], head[1] - 1]
        break

      case "right":
        newPosition = [head[0] + 1, head[1]]
        break
      case "left":
        newPosition = [head[0] - 1, head[1]]
        break
    }

    snakePositions.push(
      reEvaluateIfOutOfBounds(newPosition, width, height, piecePixels)
    )

    setSnakePositions([...snakePositions])
  }

  const repaint = (c: HTMLCanvasElement) => {
    const ctx = c.getContext("2d")

    if (!ctx || !cachedImages) return

    removePreviousPaint(ctx)
    renderBackgroundPieces(ctx)
    renderApple(ctx)
    renderSnake(ctx)
    moveSnakeToTheFront()
  }

  useEffect(() => {
    const cacheInitialImages = () => {
      const images = [
        ...Object.values(tailImages),
        ...Object.values(bodyImages),
        ...Object.values(headImages),
        appleImage,
      ]

      Promise.all(
        images.map((imageSrc) => {
          const image = new Image()

          const promise = new Promise<[string, HTMLImageElement]>((resolve) => {
            image.onload = () => resolve([imageSrc, image])
          })

          image.src = imageSrc

          return promise
        })
      ).then((images) => {
        const result: { [key: string]: HTMLImageElement } = {}

        images.reduce((prev, current) => {
          prev[current[0]] = current[1]

          return prev
        }, result)

        setCachedImages(result)
      })
    }

    cacheInitialImages()
  }, [])

  useEffect(() => {
    const onKeyboardPressed = (e: KeyboardEvent) => {
      switch (e.code) {
        case "ArrowUp":
          setSnakeMovePosition("top")
          return

        case "ArrowDown":
          setSnakeMovePosition("bottom")
          return

        case "ArrowLeft":
          setSnakeMovePosition("left")
          return

        case "ArrowRight":
          setSnakeMovePosition("right")
          return
      }
    }

    document.addEventListener("keydown", onKeyboardPressed)

    return () => {
      document.removeEventListener("keydown", onKeyboardPressed)
    }
  }, [])

  return (
    <SnakeContext.Provider
      value={{
        refreshRatePeriod: 300,
        piecePixels,
        repaint,
        width,
        height,
        snakeMovePosition,
      }}
    >
      {children}
    </SnakeContext.Provider>
  )
}

export default SnakeContextProvider
