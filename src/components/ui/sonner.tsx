
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:bg-transparent group-[.toast]:text-foreground/80 group-[.toast]:border-none group-[.toast]:hover:bg-secondary group-[.toast]:hover:text-foreground dark:group-[.toast]:text-foreground/90 dark:group-[.toast]:hover:text-foreground",
          error: "group-[.toast]:bg-destructive/15 group-[.toast]:text-destructive group-[.toast]:border-destructive/20 group-[.toast]:dark:bg-destructive/15",
          success: "group-[.toast]:bg-card group-[.toast]:text-foreground group-[.toast]:border-border",
          warning: "group-[.toast]:bg-card group-[.toast]:text-foreground group-[.toast]:border-foreground",
          info: "group-[.toast]:bg-card group-[.toast]:text-foreground group-[.toast]:border-border",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
