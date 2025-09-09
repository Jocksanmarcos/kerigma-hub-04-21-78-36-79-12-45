import { cn } from "@/lib/utils"
import { useTheme } from "@/components/ui/theme-provider"

interface AdaptiveLogoProps {
  className?: string
}

export function AdaptiveLogo({ className }: AdaptiveLogoProps) {
  const { theme } = useTheme()
  
  // Determina qual logo usar baseado no tema
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  const logoSrc = isDark 
    ? "/lovable-uploads/87969a0a-3918-41b9-af02-77fa8519f60a.png" // Logo com letras brancas para tema escuro
    : "/lovable-uploads/9f49507c-c09c-4429-a497-da1d6828f2e2.png" // Logo com letras cinzas para tema claro

  return (
    <div className={cn("inline-flex items-center", className)}>
      <img
        src={logoSrc}
        alt="Kerigma Hub - Plataforma Integrada de Gestão Eclesiástica"
        className={cn("object-contain h-full w-auto")}
        loading="eager"
        decoding="async"
      />
    </div>
  )
}