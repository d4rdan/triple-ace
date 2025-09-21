// src/components/roulette/components/game/BettingTableMobile.tsx

import React from "react"
import { Bet, BetType, ChipValue } from "../../types"
import { RED_NUMBERS } from "../../utils/constants"
import { useBettingLogic } from "../../hooks/useBettingLogic"

interface BettingTableMobileProps {
  activeBets: Bet[]
  selectedChip: ChipValue | null
  onPlaceBet: (
    position: string | number,
    type: BetType,
    numbers: number[]
  ) => void
  disabled: boolean
}

export const BettingTableMobile: React.FC<BettingTableMobileProps> = (
  props
) => {
  const {
    renderChipStack,
    handleNumberClick,
    handleSplitClick,
    handleCornerClick,
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
    <div className="h-full w-full flex items-center justify-center p-1">
      <div className="w-full h-full flex items-center justify-center">
        <div className="bg-green-800 p-1 rounded shadow-xl w-full max-h-full">
          {/* Main betting area */}
          <div className="flex gap-[2px]">
            {/* Zero */}
            <div className="flex-shrink-0" style={{ width: "8%" }}>
              <div
                onClick={() => handleNumberClick(0)}
                className={`
                  relative bg-green-600 border border-white
                  flex items-center justify-center cursor-pointer hover:bg-green-500
                  ${
                    disabled || !selectedChip
                      ? "cursor-not-allowed opacity-75"
                      : ""
                  }
                `}
                style={{ height: "calc(3 * 2.5rem + 4px)" }}
              >
                <span className="text-white font-bold text-sm">0</span>
                {renderChipStack(0, "mobile")}
              </div>
            </div>

            {/* Numbers grid */}
            <div className="flex-1">
              {rows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex gap-[2px] mb-[2px] last:mb-0 relative"
                >
                  {row.map((num, colIndex) => {
                    const isRed = RED_NUMBERS.includes(num)
                    return (
                      <div key={num} className="flex-1 relative">
                        <div
                          onClick={() => handleNumberClick(num)}
                          className={`
                            relative border border-white h-10
                            flex items-center justify-center cursor-pointer transition-all
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
                          <span className="text-white font-bold text-[10px]">
                            {num}
                          </span>
                          {renderChipStack(num, "mobile")}
                        </div>

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
                              absolute -bottom-[3px] left-1/2 transform -translate-x-1/2 
                              w-5 h-2 z-20 cursor-pointer
                              ${
                                disabled || !selectedChip
                                  ? "cursor-not-allowed"
                                  : "hover:bg-yellow-400/50 rounded"
                              }
                            `}
                          >
                            {renderChipStack(
                              `${num}-${rows[rowIndex + 1][colIndex]}`,
                              "mobile"
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
                              absolute -right-[3px] top-1/2 transform -translate-y-1/2 
                              w-2 h-5 z-20 cursor-pointer
                              ${
                                disabled || !selectedChip
                                  ? "cursor-not-allowed"
                                  : "hover:bg-yellow-400/50 rounded"
                              }
                            `}
                          >
                            {renderChipStack(
                              `${num}-${row[colIndex + 1]}`,
                              "mobile"
                            )}
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
                              absolute -right-[3px] -bottom-[3px] w-3 h-3 z-30 cursor-pointer rounded-full
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
                                }-${rows[rowIndex + 1][colIndex + 1]}`,
                                "mobile"
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
                      relative border border-white bg-green-700 h-10
                      flex items-center justify-center cursor-pointer hover:bg-green-600
                      ${
                        disabled || !selectedChip
                          ? "cursor-not-allowed opacity-75"
                          : ""
                      }
                    `}
                    style={{ minWidth: "8%" }}
                  >
                    <span className="text-white font-bold text-[8px]">2:1</span>
                    {renderChipStack(`col${rowIndex + 1}`, "mobile")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dozens */}
          <div className="flex gap-[2px] mt-[2px]">
            <div style={{ width: "8%" }} /> {/* Spacer for zero */}
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
                  relative flex-1 border border-white bg-green-700 h-8
                  flex items-center justify-center cursor-pointer hover:bg-green-600
                  ${
                    disabled || !selectedChip
                      ? "cursor-not-allowed opacity-75"
                      : ""
                  }
                `}
              >
                <span className="text-white font-bold text-[10px]">
                  {dozen} 12
                </span>
                {renderChipStack(dozen, "mobile")}
              </div>
            ))}
          </div>

          {/* Outside bets */}
          <div className="flex gap-[2px] mt-[2px]">
            <div style={{ width: "8%" }} /> {/* Spacer for zero */}
            {/* Even money bets */}
            <div className="flex-1 grid grid-cols-6 gap-[2px]">
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
                    relative border border-white h-8 flex items-center justify-center
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
                  <span className="text-white font-bold text-[8px]">
                    {bet.label}
                  </span>
                  {renderChipStack(bet.pos, "mobile")}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
