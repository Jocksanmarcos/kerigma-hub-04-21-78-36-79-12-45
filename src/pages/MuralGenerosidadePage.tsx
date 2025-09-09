import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Heart } from "lucide-react";
import { DoacoesGrid } from "@/components/mural-generosidade/DoacoesGrid";
import { FormularioDoacao } from "@/components/mural-generosidade/FormularioDoacao";
import { FormularioPedidoAjuda } from "@/components/mural-generosidade/FormularioPedidoAjuda";
import { NecessidadesComunidade } from "@/components/mural-generosidade/NecessidadesComunidade";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function MuralGenerosidadePage() {
  const [modalDoacaoOpen, setModalDoacaoOpen] = useState(false);
  const [modalAjudaOpen, setModalAjudaOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Mural da Generosidade
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Uma plataforma de ajuda mútua que conecta a oferta com a necessidade 
            dentro da nossa comunidade da fé.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Dialog open={modalDoacaoOpen} onOpenChange={setModalDoacaoOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 text-base">
                <Plus className="mr-2 h-5 w-5" />
                Oferecer Doação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <FormularioDoacao onSuccess={() => setModalDoacaoOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={modalAjudaOpen} onOpenChange={setModalAjudaOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12 px-6 text-base">
                <Heart className="mr-2 h-5 w-5" />
                Solicitar Ajuda Confidencialmente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <FormularioPedidoAjuda onSuccess={() => setModalAjudaOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="doacoes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="doacoes" className="text-base">
              Itens para Doar
            </TabsTrigger>
            <TabsTrigger value="necessidades" className="text-base">
              Necessidades da Comunidade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="doacoes">
            <DoacoesGrid />
          </TabsContent>

          <TabsContent value="necessidades">
            <NecessidadesComunidade />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}