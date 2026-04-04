'use client'

import { useActionState } from 'react'
import { logIn, signUp, type AuthActionState } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function LoginForm({ defaultTab = 'login' }: { defaultTab?: string }) {
  const [signUpState, signUpAction, signUpPending] = useActionState<
    AuthActionState,
    FormData
  >(signUp, undefined)

  const [logInState, logInAction, logInPending] = useActionState<
    AuthActionState,
    FormData
  >(logIn, undefined)

  return (
    <Tabs defaultValue={defaultTab} className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Log In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>

      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={logInAction} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </div>
              {logInState?.error ? (
                <p className="text-sm text-red-500">{logInState.error}</p>
              ) : null}
              <Button type="submit" className="w-full" disabled={logInPending}>
                {logInPending ? 'Logging in…' : 'Log In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={signUpAction} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="signup-name">Name</Label>
                <Input id="signup-name" name="name" required autoComplete="name" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              {signUpState?.error ? (
                <p className="text-sm text-red-500">{signUpState.error}</p>
              ) : null}
              <Button type="submit" className="w-full" disabled={signUpPending}>
                {signUpPending ? 'Creating account…' : 'Sign Up'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
