import * as React from "react"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  defaultValue,
  children,
  ...props
}: React.ComponentProps<"div"> & { defaultValue?: string }) {
  const [activeTab, setActiveTab] = React.useState(defaultValue ?? "")

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div data-slot="tabs" className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const TabsContext = React.createContext<{
  activeTab: string
  setActiveTab: (tab: string) => void
}>({
  activeTab: "",
  setActiveTab: () => {},
})

function useTabsContext() {
  return React.useContext(TabsContext)
}

function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-1",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  value,
  ...props
}: React.ComponentProps<"button"> & { value: string }) {
  const { activeTab, setActiveTab } = useTabsContext()
  const isActive = activeTab === value

  return (
    <button
      data-slot="tabs-trigger"
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-background text-foreground shadow",
        className
      )}
      onClick={() => setActiveTab(value)}
      {...props}
    />
  )
}

function TabsContent({
  className,
  value,
  ...props
}: React.ComponentProps<"div"> & { value: string }) {
  const { activeTab } = useTabsContext()

  if (activeTab !== value) return null

  return (
    <div
      data-slot="tabs-content"
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
