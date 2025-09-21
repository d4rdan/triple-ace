// src/components/roulette/components/game/BettingTableDesktop.tsx

import React from "react"
import { Bet, BetType, ChipValue } from "../../types"
import { RED_NUMBERS } from "../../utils/constants"
import { useBettingLogic } from "../../hooks/useBettingLogic"

interface BettingTableDesktopProps {
  activeBets: Bet[]
  selectedChip: ChipValue | null
  onPlaceBet: (
    position: string | number,
    type: BetType,
    numbers: number[]
  ) => void
  disabled: boolean
}

export const BettingTableDesktop: React.FC<BettingTableDesktopProps> = (
  props
) => {
  const {
    renderChipStack,
    handleNumberClick,
    handleSplitClick,
    handleCornerClick,
    handleStreetClick,
    handleSixLineClick,
    handleOutsideClick,
  } = useBettingLogic(props)

  const { disabled, selectedChip } = props

  // Main betting grid
  const rows = [
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
  ]

  return (
    <div className="h-full w-full bg-emerald-800 pt-6">
      {/* Main betting area - FULL HEIGHT */}
      <div className="h-full p-2 lg:p-4">
        <div className="bg-green-800 p-2 lg:p-4 rounded-lg shadow-2xl h-full flex flex-col">
          {/* Numbers section - 70% of height */}
          <div className="flex gap-1 h-48">
            {/* Zero - responsive width */}
            <div
              onClick={() => handleNumberClick(0)}
              className={`
              relative bg-green-600 border-2 border-white
              flex items-center justify-center cursor-pointer hover:bg-green-500 transition-colors
              ${
                disabled || !selectedChip ? "cursor-not-allowed opacity-75" : ""
              }
            `}
              style={{ width: "7%" }}
            >
              <span className="text-white font-bold text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl">
                0
              </span>
              {renderChipStack(0)}
            </div>

            {/* Numbers grid - takes remaining space */}
            <div className="flex-1 flex flex-col gap-1">
              {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1 flex-1">
                  {row.map((num, colIndex) => {
                    const isRed = RED_NUMBERS.includes(num)
                    return (
                      <div key={num} className="flex-1 relative">
                        <div
                          onClick={() => handleNumberClick(num)}
                          className={`
                          relative border-2 border-white h-full
                          flex items-center justify-center cursor-pointer transition-all group
                          ${
                            isRed
                              ? "bg-red-700 hover:bg-red-600"
                              : "bg-gray-900 hover:bg-gray-800"
                          }
                          ${
                            disabled || !selectedChip
                              ? "cursor-not-allowed opacity-75"
                              : ""
                          }
                        `}
                        >
                          <span className="text-white font-bold text-lg lg:text-2xl xl:text-3xl 2xl:text-4xl">
                            {num}
                          </span>
                          {renderChipStack(num)}
                        </div>

                        {/* Street bet (3 numbers) - left side of first column */}
                        {colIndex === 0 && (
                          <div
                            onClick={() =>
                              handleStreetClick(
                                [
                                  rows[0][colIndex],
                                  rows[1][colIndex],
                                  rows[2][colIndex],
                                ],
                                `street-${rows[0][colIndex]}`
                              )
                            }
                            className={`
                            absolute -left-3 lg:-left-4 top-0 bottom-0
                            w-3 lg:w-4 z-20 cursor-pointer
                            ${
                              disabled || !selectedChip
                                ? "cursor-not-allowed"
                                : "hover:bg-yellow-400/50 rounded"
                            }
                          `}
                          >
                            {renderChipStack(`street-${rows[0][colIndex]}`)}
                          </div>
                        )}

                        {/* Vertical splits (between rows) */}
                        {rowIndex < rows.length - 1 && (
                          <div
                            onClick={() =>
                              handleSplitClick(
                                [num, rows[rowIndex + 1][colIndex]],
                                `${num}-${rows[rowIndex + 1][colIndex]}`
                              )
                            }
                            className={`
                            absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2
                            w-6 h-6 lg:w-8 lg:h-8 z-20 cursor-pointer
                            ${
                              disabled || !selectedChip
                                ? "cursor-not-allowed"
                                : "hover:bg-yellow-400/50 rounded-full"
                            }
                          `}
                          >
                            {renderChipStack(
                              `${num}-${rows[rowIndex + 1][colIndex]}`
                            )}
                          </div>
                        )}

                        {/* Horizontal splits (between columns) */}
                        {colIndex < row.length - 1 && (
                          <div
                            onClick={() =>
                              handleSplitClick(
                                [num, row[colIndex + 1]],
                                `${num}-${row[colIndex + 1]}`
                              )
                            }
                            className={`
                            absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2
                            w-6 h-6 lg:w-8 lg:h-8 z-20 cursor-pointer
                            ${
                              disabled || !selectedChip
                                ? "cursor-not-allowed"
                                : "hover:bg-yellow-400/50 rounded-full"
                            }
                          `}
                          >
                            {renderChipStack(`${num}-${row[colIndex + 1]}`)}
                          </div>
                        )}

                        {/* Corner bets */}
                        {rowIndex < rows.length - 1 &&
                          colIndex < row.length - 1 && (
                            <div
                              onClick={() =>
                                handleCornerClick(
                                  [
                                    num,
                                    row[colIndex + 1],
                                    rows[rowIndex + 1][colIndex],
                                    rows[rowIndex + 1][colIndex + 1],
                                  ],
                                  `${num}-${row[colIndex + 1]}-${
                                    rows[rowIndex + 1][colIndex]
                                  }-${rows[rowIndex + 1][colIndex + 1]}`
                                )
                              }
                              className={`
                            absolute right-0 bottom-0 transform translate-x-1/2 translate-y-1/2
                            w-6 h-6 lg:w-8 lg:h-8 z-30 cursor-pointer rounded-full
                            ${
                              disabled || !selectedChip
                                ? "cursor-not-allowed"
                                : "hover:bg-yellow-400/50"
                            }
                          `}
                            >
                              {renderChipStack(
                                `${num}-${row[colIndex + 1]}-${
                                  rows[rowIndex + 1][colIndex]
                                }-${rows[rowIndex + 1][colIndex + 1]}`
                              )}
                            </div>
                          )}

                        {/* Six line bets (between street bets) */}
                        {colIndex === 0 && rowIndex < rows.length - 1 && (
                          <div
                            onClick={() =>
                              handleSixLineClick(
                                [
                                  rows[rowIndex][0],
                                  rows[rowIndex][1],
                                  rows[rowIndex][2],
                                  rows[rowIndex + 1][0],
                                  rows[rowIndex + 1][1],
                                  rows[rowIndex + 1][2],
                                ],
                                `sixline-${rows[rowIndex][0]}-${
                                  rows[rowIndex + 1][0]
                                }`
                              )
                            }
                            className={`
                            absolute -left-3 lg:-left-4 bottom-0 transform translate-y-1/2
                            w-3 lg:w-4 h-6 lg:h-8 z-25 cursor-pointer
                            ${
                              disabled || !selectedChip
                                ? "cursor-not-allowed"
                                : "hover:bg-yellow-400/50 rounded"
                            }
                          `}
                          >
                            {renderChipStack(
                              `sixline-${rows[rowIndex][0]}-${
                                rows[rowIndex + 1][0]
                              }`
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Column bets */}
                  <div
                    onClick={() =>
                      handleOutsideClick(
                        `col${rowIndex + 1}`,
                        `column${rowIndex + 1}` as BetType, // Changed from 'column' to 'column1', 'column2', 'column3'
                        row
                      )
                    }
                    className={`
                    relative border-2 border-white bg-green-700
                    flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors
                    ${
                      disabled || !selectedChip
                        ? "cursor-not-allowed opacity-75"
                        : ""
                    }
                  `}
                    style={{ width: "7%" }}
                  >
                    <span className="text-white font-bold text-sm lg:text-base xl:text-lg 2xl:text-xl">
                      2:1
                    </span>
                    {renderChipStack(`col${rowIndex + 1}`)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dozens - 15% of height */}
          <div className="flex gap-1 mt-2 h-20">
            <div style={{ width: "7%" }} /> {/* Spacer for zero */}
            <div className="flex-1 flex gap-1">
              {["1st", "2nd", "3rd"].map((dozen, idx) => (
                <div
                  key={dozen}
                  onClick={() =>
                    handleOutsideClick(
                      dozen,
                      `dozen${idx + 1}` as BetType, // Changed from 'dozen' to 'dozen1', 'dozen2', 'dozen3'
                      Array.from({ length: 12 }, (_, i) => i + 1 + idx * 12)
                    )
                  }
                  className={`
                  relative flex-1 border-2 border-white bg-green-700
                  flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors
                  ${
                    disabled || !selectedChip
                      ? "cursor-not-allowed opacity-75"
                      : ""
                  }
                `}
                >
                  <span className="text-white font-bold text-base lg:text-lg xl:text-xl 2xl:text-2xl">
                    {dozen} 12
                  </span>
                  {renderChipStack(dozen)}
                </div>
              ))}
            </div>
          </div>

          {/* Outside bets - 15% of height */}
          <div className="flex gap-1 mt-2 h-14 lg:h-20">
            <div style={{ width: "7%" }} /> {/* Spacer for zero */}
            {/* Even money bets */}
            <div className="flex-1 flex gap-1">
              {[
                {
                  pos: "low",
                  type: "low" as BetType,
                  label: "1-18",
                  nums: Array.from({ length: 18 }, (_, i) => i + 1),
                },
                {
                  pos: "even",
                  type: "even" as BetType,
                  label: "EVEN",
                  nums: Array.from({ length: 18 }, (_, i) => (i + 1) * 2),
                },
                {
                  pos: "red",
                  type: "red" as BetType,
                  label: "RED",
                  nums: RED_NUMBERS,
                },
                {
                  pos: "black",
                  type: "black" as BetType,
                  label: "BLACK",
                  nums: Array.from({ length: 36 }, (_, i) => i + 1).filter(
                    (n) => !RED_NUMBERS.includes(n)
                  ),
                },
                {
                  pos: "odd",
                  type: "odd" as BetType,
                  label: "ODD",
                  nums: Array.from({ length: 18 }, (_, i) => i * 2 + 1),
                },
                {
                  pos: "high",
                  type: "high" as BetType,
                  label: "19-36",
                  nums: Array.from({ length: 18 }, (_, i) => i + 19),
                },
              ].map((bet) => (
                <div
                  key={bet.pos}
                  onClick={() =>
                    handleOutsideClick(bet.pos, bet.type, bet.nums)
                  }
                  className={`
                  relative flex-1 border-2 border-white flex items-center justify-center
                  cursor-pointer transition-all
                  ${
                    bet.pos === "red"
                      ? "bg-red-700 hover:bg-red-600"
                      : bet.pos === "black"
                      ? "bg-gray-900 hover:bg-gray-800"
                      : "bg-green-700 hover:bg-green-600"
                  }
                  ${
                    disabled || !selectedChip
                      ? "cursor-not-allowed opacity-75"
                      : ""
                  }
                `}
                >
                  <span className="text-white font-bold text-sm lg:text-base xl:text-lg 2xl:text-xl">
                    {bet.label}
                  </span>
                  {renderChipStack(bet.pos)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
