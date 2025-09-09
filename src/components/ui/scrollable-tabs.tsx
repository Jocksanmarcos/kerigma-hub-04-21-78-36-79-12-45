import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const ScrollableTabs = TabsPrimitive.Root

const ScrollableTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-11 items-center justify-start rounded-kerigma bg-muted p-1 text-muted-foreground shadow-kerigma overflow-x-auto scrollbar-hide",
      "w-full max-w-full",
      className
    )}
    {...props}
  />
))
ScrollableTabsList.displayName = TabsPrimitive.List.displayName

const ScrollableTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-kerigma",
      "flex-shrink-0 min-w-max",
      className
    )}
    {...props}
  />
))
ScrollableTabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const ScrollableTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
ScrollableTabsContent.displayName = TabsPrimitive.Content.displayName

export { ScrollableTabs, ScrollableTabsList, ScrollableTabsTrigger, ScrollableTabsContent }