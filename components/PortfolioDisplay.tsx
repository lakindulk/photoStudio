"use client"

import { PortfolioType1 } from "@/components/portfolio-styles/PortfolioType1"
import { PortfolioType2 } from "@/components/portfolio-styles/PortfolioType2"
import { PortfolioType3 } from "@/components/portfolio-styles/PortfolioType3"
import { PortfolioType4 } from "@/components/portfolio-styles/PortfolioType4"
import type { PortfolioItem, PortfolioType } from "@/types"

interface PortfolioDisplayProps {
  items: PortfolioItem[]
  portfolioType?: PortfolioType
  title?: string
}

export function PortfolioDisplay({ items, portfolioType = "type1", title = "Portfolio" }: PortfolioDisplayProps) {
  switch (portfolioType) {
    case "type2":
      return <PortfolioType2 items={items} title={title} />
    case "type3":
      return <PortfolioType3 items={items} title={title} />
    case "type4":
      return <PortfolioType4 items={items} title={title} />
    case "type1":
    default:
      return <PortfolioType1 items={items} title={title} />
  }
}
