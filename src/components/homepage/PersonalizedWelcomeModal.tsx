import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PersonalizedWelcomeModalProps {
  isOpen: boolean;
  onResponse: (response: 'first_time' | 'returning') => void;
  onClose: () => void;
}

export const PersonalizedWelcomeModal: React.FC<PersonalizedWelcomeModalProps> = ({
  isOpen,
  onResponse,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Bem-vindo ao CBN Kerigma! 🙏
          </DialogTitle>
        </DialogHeader>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 py-4"
        >
          <p className="text-center text-muted-foreground">
            Para personalizar sua experiência, nos diga:
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => onResponse('first_time')}
              className="w-full h-auto p-4 justify-start bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary border border-primary/30"
            >
              <div className="text-left">
                <div className="font-semibold">✨ É minha primeira vez aqui</div>
                <div className="text-sm opacity-80">
                  Quero conhecer a comunidade e explorar
                </div>
              </div>
            </Button>
            
            <Button
              onClick={() => onResponse('returning')}
              className="w-full h-auto p-4 justify-start bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground transition-all duration-200"
            >
              <div className="text-left">
                <div className="font-semibold">🏠 Já conheço a igreja</div>
                <div className="text-sm opacity-80">
                  Quero acessar conteúdos e atualizações
                </div>
              </div>
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};