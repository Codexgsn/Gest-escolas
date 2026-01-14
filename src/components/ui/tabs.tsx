"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState(props.defaultValue || '');
  const tabsRef = React.useRef<(HTMLButtonElement | null)[]>([]);

  // If the parent component controls the value, update the state
  React.useEffect(() => {
    if (props.value !== undefined) {
      setActiveTab(props.value);
    }
  }, [props.value]);

  const activeTabIndex = React.Children.toArray(children).findIndex(
    (child) => React.isValidElement(child) && child.props.value === activeTab
  );

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "relative inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      <AnimatePresence>
        {activeTabIndex !== -1 && tabsRef.current[activeTabIndex] && (
          <motion.div
            layout
            className="absolute inset-0 z-10"
            style={{
              width: tabsRef.current[activeTabIndex]?.offsetWidth,
              height: tabsRef.current[activeTabIndex]?.offsetHeight,
              left: tabsRef.current[activeTabIndex]?.offsetLeft,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
             <div className="h-full w-full rounded-sm bg-background shadow-sm" />
          </motion.div>
        )}
      </AnimatePresence>
       {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          // Clone the element to attach a ref and an onClick handler
          return React.cloneElement(child, {
            // @ts-ignore
            ref: (el: HTMLButtonElement) => (tabsRef.current[index] = el),
            onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
              setActiveTab(child.props.value);
              // Call original onClick if it exists
              if (child.props.onClick) {
                child.props.onClick(e);
              }
            }
          });
        }
        return child;
      })}
    </TabsPrimitive.List>
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative z-20 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
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
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
