"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast } from "sonner"

export default function RegisterPage() {

    const router = useRouter()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: FormEvent) => {

        e.preventDefault()

        setError("")
        setLoading(true)

        try {

            const response = await  fetch("/api/auth/register", {

                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({

                    name,
                    email,
                    password
                })
            })

            const data = await response.json();

            if (!response.ok) {

                setError(data.message || "Registration failed")
                toast.error(data.message || "Registration failed")
                return
                
            }

            toast.success(`Registration successfully  |  Welcome ${data.user.name}`)
            router.push("/")
            
        } catch (error) {
            
            console.error("Something went wrong please try again")

            setError("Something went wrong. Please try again")
            toast.error("Something went wrong. Please try again")
            
        } finally {

            setLoading(false)
        }

    }


  return (
    
    <main className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">

            <CardHeader>
                <CardTitle className="text-3xl font-semibold">
                    Create an account
                </CardTitle>

                <CardDescription className="text-xs text-muted-foreground">
                    Start managing your projects and tasks.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">

                    <div className="space-y-2">

                        <Label htmlFor="name">Name</Label>

                        <Input id="name" type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required/>

                    </div>

                <div className="space-y-2">

                    <Label htmlFor="email">Email</Label>

                    <Input id="email" type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required/>

                </div>

                <div className="space-y-2">

                    <Label htmlFor="password">Password</Label>

                    <Input id="password" type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required/>

                </div>

                {
                    error && (

                        <p className="text-sm text-destructive">{error}</p>
                    )
                }

                <Button type="submit" className="w-full" disabled={loading}>

                    {loading ? "Creating account...." : "Create Account "}

                </Button>

                </form>

                <p className="mt-5 text-center text-sm text-muted-foreground">Already have a account?{" "}
                    <Link href='/login' className="font-medium text-primary hover:underline">
                        Login
                    </Link>
                </p>
            </CardContent>

        </Card>
    </main>
  )
}
