"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast } from "sonner"

export default function LoginPage() {

    const router = useRouter()

    const [email, setEmail] =  useState("")
    const [password, setPassword] = useState("")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {

        e.preventDefault()

        try {

            const response = await fetch("/api/auth/login", {

                method: "POST",
                headers: {

                    "Content-Type": "application/json"
                },
                body: JSON.stringify({

                    email,
                    password
                })
            })

            const data = await response.json()

            if (!response.ok) {

                setError(data.message || "Login Failed")
                toast.error(data.message || "Login failed")
                return
                
            }

            // Token handling will be connected
            // based on your existing login API response.

            router.push('/dashboard')
            router.refresh()
            
        } catch (error) {

            console.log(error);

            setError("Something went wrong. Please try again later")
            toast.error("Something went wrong please try again later")

            
        } finally {

            setLoading(false)
        }


    }

  return (

    <main className="flex min-h-screen items-center justify-center px-4">

        <Card className="w-full max-w-md">

            <CardHeader>
                <CardTitle className="text-3xl font-semibold">
                    Welcome Back
                </CardTitle>

                <CardDescription>
                    Login to continue managing your projects
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">

                    <div className="space-y-2">

                        <Label>Email</Label>

                        <Input id="email" type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required/>

                    </div>

                    <div className="space-y-2">

                        <Label>Password</Label>

                        <Input id="password" type="password" placeholder="Your Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>

                    </div>

                    {

                        error && (

                            <p className="text-sm text-destructive">{error}</p>
                        )
                    }

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Logging in... " : "Login"}
                    </Button>

                </form>

                <p className="mt-5 text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}

                    <Link href='/register' className="font-medium text-primary hover:underline">
                        Create an account
                    </Link>
                </p>

            </CardContent>

        </Card>

    </main>
  )
}
