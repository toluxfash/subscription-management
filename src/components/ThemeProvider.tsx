"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useSettingsStore } from "@/store/settingsStore"

function ThemeSync() {
  const { theme, fetchSettings } = useSettingsStore()

  React.useEffect(() => {
    // Fetch settings on app start to sync with backend
    fetchSettings()
  }, [fetchSettings])

  return null
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeSync />
      {children}
    </NextThemesProvider>
  )
}