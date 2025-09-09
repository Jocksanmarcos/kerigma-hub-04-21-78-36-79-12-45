import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  AlertTriangle,
  User,
  Calendar,
  MapPin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QrScanner } from '@yudiel/react-qr-scanner';

interface CheckInResult {
  success: boolean;
  pessoa?: {
    nome_completo: string;
    email: string;
  };
  evento?: {
    titulo: string;
    local: string;
    data_inicio: string;
  };
  message: string;
  already_checked?: boolean;
}

interface CheckInAppProps {
  eventoId?: string;
}

export const CheckInApp: React.FC<CheckInAppProps> = ({ eventoId }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const checkInMutation = useMutation({
    mutationFn: async (qrCode: string) => {
      // Simular o processo de check-in via QR code
      const { data, error } = await supabase
        .from('evento_inscricoes')
        .select(`
          id,
          check_in_status,
          evento_id,
          pessoas (
            nome_completo,
            email
          ),
          eventos (
            titulo,
            local,
            data_inicio
          )
        `)
        .eq('qr_code_hash', qrCode)
        .single();

      if (error) {
        throw new Error('QR Code inválido ou inscrição não encontrada');
      }

      if (data.check_in_status) {
        return {
          success: true,
          already_checked: true,
          pessoa: data.pessoas as any,
          evento: data.eventos as any,
          message: 'Check-in já realizado anteriormente'
        };
      }

      const { error: updateError } = await supabase
        .from('evento_inscricoes')
        .update({ check_in_status: true })
        .eq('id', data.id);

      if (updateError) {
        throw new Error('Erro ao realizar check-in');
      }

      return {
        success: true,
        pessoa: data.pessoas as any,
        evento: data.eventos as any,
        message: 'Check-in realizado com sucesso!'
      };
    },
    onSuccess: (result) => {
      setLastResult(result);
      setScanCount(prev => prev + 1);
      queryClient.invalidateQueries({ queryKey: ['evento-inscricoes'] });
      
      if (!result.already_checked) {
        toast({ 
          title: 'Check-in realizado!', 
          description: `${result.pessoa?.nome_completo} confirmado(a)` 
        });
      }
    },
    onError: (error) => {
      setLastResult({
        success: false,
        message: error.message
      });
      toast({ 
        title: 'Erro no check-in', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const startCamera = async () => {
    setIsScanning(true);
  };

  const stopCamera = () => {
    setIsScanning(false);
  };

  const simulateQRScan = () => {
    // Para demonstração, simular leitura de QR code
    const mockQRCode = `evento_${eventoId}_${Date.now()}`;
    checkInMutation.mutate(mockQRCode);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-kerigma text-white">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <UserCheck className="h-6 w-6" />
            Check-in Evento
          </CardTitle>
          <p className="text-white/90">Escaneie o QR Code do ingresso</p>
        </CardHeader>
      </Card>

      {/* Scanner */}
      <Card>
        <CardContent className="p-6">
          {!isScanning ? (
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto bg-muted rounded-kerigma flex items-center justify-center">
                <Camera className="h-16 w-16 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Ativar Câmera</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Posicione o QR Code do ingresso dentro do campo de visão
                </p>
                <Button onClick={startCamera} className="w-full">
                  <Camera className="mr-2 h-4 w-4" />
                  Iniciar Scanner
                </Button>
              </div>
            </div>
          ) : (
              <div className="space-y-4">
                <div className="relative aspect-square rounded-kerigma overflow-hidden bg-black">
                  <QrScanner 
                    constraints={{ facingMode: 'environment' }}
                    onDecode={(value) => {
                      const code = Array.isArray(value) ? (value[0] as any)?.rawValue ?? String(value) : String(value);
                      if (code) {
                        checkInMutation.mutate(code);
                      }
                    }}
                    onError={(err) => {
                      console.error('QR scan error', err);
                    }}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={stopCamera} variant="outline" className="flex-1">
                    Parar Scanner
                  </Button>
                </div>
              </div>
          )}
        </CardContent>
      </Card>

      {/* Resultado do último scan */}
      {lastResult && (
        <Card className={lastResult.success ? 'border-green-500' : 'border-red-500'}>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              {lastResult.success ? (
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500 mt-1" />
              )}
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">
                    {lastResult.success ? 'Check-in Confirmado' : 'Erro no Check-in'}
                  </h4>
                  {lastResult.already_checked && (
                    <Badge variant="secondary">Já Realizado</Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">{lastResult.message}</p>
                
                {lastResult.pessoa && (
                  <div className="space-y-2 p-3 bg-muted/30 rounded-kerigma">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{lastResult.pessoa.nome_completo}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {lastResult.pessoa.email}
                    </div>
                  </div>
                )}
                
                {lastResult.evento && (
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {lastResult.evento.titulo}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {lastResult.evento.local}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{scanCount}</div>
            <p className="text-sm text-muted-foreground">Check-ins realizados</p>
          </div>
        </CardContent>
      </Card>

      {/* Dicas */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Dica:</strong> Mantenha o QR Code bem iluminado e próximo à câmera para melhor leitura.
        </AlertDescription>
      </Alert>
    </div>
  );
};