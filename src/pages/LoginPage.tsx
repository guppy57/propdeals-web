import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export function LoginPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/home", { replace: true })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          navigate("/home", { replace: true })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [navigate])

  async function handleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Propdeals 2.0</h1>
          <Button className="mt-2" onClick={handleLogin}>
            Login with GitHub
          </Button>
        </div>
      </div>
    </div>
  )
}
