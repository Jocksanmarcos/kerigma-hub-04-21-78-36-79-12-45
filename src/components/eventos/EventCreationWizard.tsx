import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import { EventoForm } from './EventoForm';

export const EventCreationWizard: React.FC = () => {
  const [open, setOpen] = useState(false);
  const formId = "event-creation-form";
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Novo Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[85vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-3 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Assistente de Criação de Evento
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <EventoForm formId={formId} hideSubmit onSuccess={() => setOpen(false)} />
        </div>
        <DialogFooter className="px-6 py-4 border-t bg-background">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button type="submit" form={formId} variant="outline">Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
