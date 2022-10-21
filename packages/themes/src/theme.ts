import type { SupportStyle } from "@kaze-style/core"
import { animation } from "./animation"

export const theme = {
  animation: (name: keyof typeof animation):SupportStyle => animation[name]
}
