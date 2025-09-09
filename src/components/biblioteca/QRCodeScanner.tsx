import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCodeScanned: (code: string) => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  open,
  onOpenChange,
  onCodeScanned,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (open && !isScanning) {
      startScanning();
    } else if (!open && stream) {
      stopScanning();
    }

    return () => {
      if (stream) {
        stopScanning();
      }
    };
  }, [open]);

  const startScanning = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Preferir câmera traseira
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setStream(mediaStream);
        setIsScanning(true);
        
        // Iniciar detecção de QR Code
        startQRDetection();
      }
    } catch (err: any) {
      setError('Erro ao acessar a câmera. Verifique as permissões.');
      toast({
        title: 'Erro de câmera',
        description: 'Não foi possível acessar a câmera. Verifique as permissões.',
        variant: 'destructive'
      });
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const startQRDetection = () => {
    // Implementação simplificada - em uma aplicação real, usaria uma biblioteca como jsQR
    const detectQR = () => {
      if (!videoRef.current || !canvasRef.current || !isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        // Aqui integraria com jsQR ou similar para detectar QR codes
        // Por enquanto, simulamos a detecção com um clique manual
      }

      if (isScanning) {
        setTimeout(detectQR, 100);
      }
    };

    detectQR();
  };

  const handleManualInput = () => {
    const code = prompt('Digite o código QR manualmente:');
    if (code) {
      onCodeScanned(code);
      onOpenChange(false);
    }
  };

  const simulateQRScan = () => {
    // Para demonstração, simula a leitura de um QR code
    const simulatedCode = `QR_${Date.now()}`;
    onCodeScanned(simulatedCode);
    toast({
      title: 'QR Code detectado!',
      description: `Código: ${simulatedCode}`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Scanner QR Code</DialogTitle>
          <DialogDescription>
            Aponte a câmera para o QR code do livro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-red-500 mb-4">
                  <Camera className="h-12 w-12 mx-auto mb-2" />
                  <p>{error}</p>
                </div>
                <Button onClick={startScanning} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-lg bg-black"
                style={{ aspectRatio: '16/9' }}
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-primary border-dashed rounded-lg w-48 h-48 bg-transparent">
                    <div className="w-full h-full border border-primary/50 rounded-lg flex items-center justify-center">
                      <span className="text-primary text-sm font-medium bg-background/80 px-2 py-1 rounded">
                        Posicione o QR Code aqui
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={simulateQRScan}
              className="flex-1"
              disabled={!isScanning}
            >
              <Camera className="h-4 w-4 mr-2" />
              Simular Scan (Demo)
            </Button>
            <Button 
              onClick={handleManualInput}
              variant="outline"
              className="flex-1"
            >
              Inserir Manualmente
            </Button>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};