import React from 'react';
import { Check, ChevronDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useChurchContext } from '@/contexts/ChurchContext';

export const ChurchSelector: React.FC = () => {
  const {
    selectedChurch,
    setSelectedChurch,
    availableChurches,
    isSuperAdmin,
    isLoading,
  } = useChurchContext();

  const [open, setOpen] = React.useState(false);

  // Don't show selector if not super admin or no churches
  if (!isSuperAdmin || availableChurches.length <= 1 || isLoading) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 min-w-[200px] justify-between bg-background/50 border-border/50 hover:bg-background/80"
        >
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="truncate">
              {selectedChurch ? selectedChurch.name : "Selecionar igreja..."}
            </span>
            {selectedChurch?.type === 'sede' && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                Sede
              </Badge>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Buscar igreja..." className="h-9" />
          <CommandEmpty>Nenhuma igreja encontrada.</CommandEmpty>
          <CommandGroup>
            {availableChurches.map((church) => (
              <CommandItem
                key={church.id}
                onSelect={() => {
                  setSelectedChurch(church);
                  setOpen(false);
                }}
                className="flex items-center space-x-2"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedChurch?.id === church.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 flex items-center justify-between">
                  <span>{church.name}</span>
                  {church.type === 'sede' && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      Sede
                    </Badge>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};