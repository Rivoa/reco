"use client"

import { useState } from "react"
import { authenticateUser } from "@/app/actions/auth"
import { Terminal } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function clientAction(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const result = await authenticateUser(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    // bg-background automatically handles the flip between white and near-black
    <div className="flex min-h-screen items-center justify-center bg-background p-4 transition-colors duration-300">
      <Card className="w-full max-w-md rounded-none border-border bg-card shadow-2xl">
        <CardHeader className="space-y-2 pb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-primary">
            <Terminal className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground uppercase">
            Klaz Admin
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Authenticate to access the command center.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={clientAction} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@klaz.app"
                required
                className="rounded-none border-input bg-background text-foreground focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="rounded-none border-input bg-background text-foreground focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            {error && (
              <div className="rounded-none border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="mt-2 w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Initialize Session"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
