"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// This file is deprecated. Dark mode is no longer supported.
export default function ThemeProvider({ children }: { children: React.ReactNode }) { return <>{children}</>; }
