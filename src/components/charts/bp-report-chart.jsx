"use client"

import { TrendingUp } from "lucide-react"
import {
  BarChart,
  Bar,
  CartesianGrid,
  Rectangle,
  XAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"


const defaultColors = [
  "rgba(75, 192, 192, 0.5)",
  "rgba(153, 102, 255, 0.5)",
]
// rgba(54, 162, 235, 0.5)
// rgba(255, 206, 86, 0.5)
// rgba(75, 192, 192, 0.5)
// rgba(153, 102, 255, 0.5)

export function BpReportChart({
  title = "Underweigh & Overweight Report",
  description = "Women Vs Children",
  data,
  isLoading,
}) {

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const chartData = data.map((d, i) => ({
    ...d,
    fill: d.fill ?? defaultColors[i % defaultColors.length],
  }))

  const chartConfig = {
    low: { label: "Underweight" },
    high: { label: "Overweight" },
    ...Object.fromEntries(
      chartData.map((d) => [
        d.label.toLowerCase(),
        { label: d.label, color: d.fill },
      ])
    ),
  }

  if (!mounted || isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-slate-200" />
          <Skeleton className="h-5 w-60 bg-slate-100 mt-2" />
        </CardHeader>
        <CardContent>
          {/* Mimic a 4-bar layout using a flex container */}
          <div className="flex items-end justify-center h-[250px] space-x-4">
            {/* Each Skeleton here represents one bar.
                You can adjust the heights to match your expected data range. */}
            <Skeleton className="w-36 bg-slate-200" style={{ height: "150px" }} />
            <Skeleton className="w-36 bg-slate-100" style={{ height: "200px" }} />
            <Skeleton className="w-36 bg-slate-200" style={{ height: "120px" }} />
            <Skeleton className="w-36 bg-slate-100" style={{ height: "170px" }} />
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <Skeleton className="h-4 w-72" />
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="low"
              fill="hsl(var(--chart-4))"
              radius={[6, 6, 0, 0]}
              activeBar={(props) => (
                <Rectangle
                  {...props}
                  stroke={props.fill}
                  fillOpacity={0.9}
                  strokeDasharray={4}
                />
              )}
            />
            <Bar
              dataKey="high"
              fill="hsl(var(--chart-2))"
              radius={[6, 6, 0, 0]}
              activeBar={(props) => (
                <Rectangle
                  {...props}
                  stroke={props.fill}
                  fillOpacity={0.9}
                  strokeDasharray={4}
                />
              )}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Body weight figures Body mass index wise over the recent survey
        </div>
      </CardFooter>
    </Card>
  )
}
