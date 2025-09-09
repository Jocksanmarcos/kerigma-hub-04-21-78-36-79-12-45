import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { captureError } from "@/utils/errorReporting";

const Error500 = ({ error }: { error?: Error }) => {
  useEffect(() => {
    if (error) {
      captureError(error, {
        page: "Error500",
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
    }
  }, [error]);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <AlertTriangle className="h-20 w-20 text-destructive mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-2">500</h1>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Erro Interno do Servidor
          </h2>
          <p className="text-muted-foreground mb-6">
            Algo deu errado em nossos servidores. Nossa equipe foi notificada automaticamente 
            e está trabalhando para resolver o problema.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleReload} 
            className="w-full gap-2"
            variant="default"
          >
            <RotateCcw className="h-4 w-4" />
            Tentar Novamente
          </Button>
          
          <Button 
            onClick={handleGoHome} 
            variant="outline" 
            className="w-full gap-2"
          >
            <Home className="h-4 w-4" />
            Ir para Página Inicial
          </Button>
        </div>
        
        <div className="mt-8 text-xs text-muted-foreground">
          <p>Se o problema persistir, entre em contato com o suporte.</p>
          {error && (
            <details className="mt-2 text-left">
              <summary className="cursor-pointer hover:text-foreground">
                Detalhes técnicos
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default Error500;