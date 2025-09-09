import { cn } from "@/lib/utils"
import { useTheme } from "@/components/ui/theme-provider"

interface PlatformLogoProps {
  className?: string
}

export function PlatformLogo({ className }: PlatformLogoProps) {
  const { theme } = useTheme()
  
  // Determina qual logo usar baseado no tema
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  const logoSrc = isDark 
    ? "/lovable-uploads/cec8825d-073d-46f4-8d45-78ea839025b1.png" // Logo branco para tema escuro
    : "/lovable-uploads/fbf65238-4d8d-4d14-a0f2-55be18925351.png" // Logo azul para tema claro

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