import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateChurch, useChurches } from '@/hooks/useChurches';
import { AlertCircle } from 'lucide-react';

const churchSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['sede', 'missao'], {
    required_error: 'Tipo é obrigatório',
  }),
  parent_church_id: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  pastor_responsavel: z.string().optional(),
}).refine((data) => {
  // Se for missão, parent_church_id é obrigatório
  if (data.tipo === 'missao' && !data.parent_church_id) {
    return false;
  }
  return true;
}, {
  message: 'Sede responsável é obrigatória para missões',
  path: ['parent_church_id'],
});

type ChurchFormData = z.infer<typeof churchSchema>;

interface ModalCadastrarIgrejaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: 'sede' | 'missao';
  lockType?: boolean;
}

export const ModalCadastrarIgreja: React.FC<ModalCadastrarIgrejaProps> = ({
  open,
  onOpenChange,
  initialType = 'sede',
  lockType = false,
}) => {
  const { data: churches = [] } = useChurches();
  const createChurch = useCreateChurch();

  const form = useForm<ChurchFormData>({
    resolver: zodResolver(churchSchema),
    defaultValues: {
      nome: '',
      tipo: initialType,
      parent_church_id: '',
      cidade: '',
      estado: '',
      email: '',
      telefone: '',
      pastor_responsavel: '',
    },
  });

  const watchedTipo = form.watch('tipo');
  const sedeChurches = churches.filter(church => church.type === 'sede');

  // Se não há sedes e está tentando criar uma missão, mostra aviso
  const showSedeWarning = watchedTipo === 'missao' && sedeChurches.length === 0;

  const onSubmit = async (data: ChurchFormData) => {
    try {
      // Se for missão mas não há sede, converte para sede automaticamente
      if (data.tipo === 'missao' && sedeChurches.length === 0) {
        data.tipo = 'sede';
        data.parent_church_id = undefined;
      }

      const churchData = {
        name: data.nome,
        type: data.tipo as 'sede' | 'missao',
        cidade: data.cidade || undefined,
        estado: data.estado || undefined,
        email: data.email || undefined,
        telefone: data.telefone || undefined,
        pastor_responsavel: data.pastor_responsavel || undefined,
        parent_church_id: data.parent_church_id || undefined,
        ativa: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await createChurch.mutateAsync(churchData);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error creating church:', error);
    }
  };

  React.useEffect(() => {
    if (open) {
      form.reset({
        nome: '',
        tipo: initialType,
        parent_church_id: '',
        cidade: '',
        estado: '',
        email: '',
        telefone: '',
        pastor_responsavel: '',
      });
    }
  }, [open, initialType, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {lockType ? 
              (initialType === 'sede' ? 'Criar Primeira Igreja Sede' : 'Nova Missão') :
              'Nova Igreja'
            }
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da igreja" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!lockType && (
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sede">Igreja Sede</SelectItem>
                        <SelectItem value="missao">Missão</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showSedeWarning && (
              <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-md">
                <AlertCircle className="h-4 w-4 text-warning" />
                <p className="text-sm text-warning">
                  Não há igrejas sede cadastradas. Esta igreja será criada como sede automaticamente.
                </p>
              </div>
            )}

            {watchedTipo === 'missao' && sedeChurches.length > 0 && (
              <FormField
                control={form.control}
                name="parent_church_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sede Responsável *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a sede responsável" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sedeChurches.map((church) => (
                          <SelectItem key={church.id} value={church.id}>
                            {church.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input placeholder="Estado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pastor_responsavel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pastor Responsável</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do pastor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createChurch.isPending}
              >
                {createChurch.isPending ? 'Salvando...' : 'Salvar Igreja'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};