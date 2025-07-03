'use client';

import * as React from 'react';
import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function ComboBox({
  options,
  selectedOptions,
  setSelectedOptions,
  placeholder,
  emptyMessage,
  onSearchChange,
}: {
  options: { value: string; label: string }[];
  selectedOptions: { value: string; label: string }[];
  setSelectedOptions: (options: { value: string; label: string }[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  onSearchChange?: (search: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  // Handle search input changes
  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (onSearchChange) onSearchChange(val);
  };

  // Remove a selected user
  const handleRemove = (value: string) => {
    setSelectedOptions(selectedOptions.filter(opt => opt.value !== value));
  };

  // Add or remove selection
  const handleSelect = (currentValue: string) => {
    const alreadySelected = selectedOptions.some(
      opt => opt.value === currentValue
    );
    if (alreadySelected) {
      setSelectedOptions(
        selectedOptions.filter(opt => opt.value !== currentValue)
      );
    } else {
      const found = options.find(opt => opt.value === currentValue);
      if (found) setSelectedOptions([...selectedOptions, found]);
    }
    setOpen(false);
    setInputValue('');
    if (onSearchChange) onSearchChange('');
  };

  // Get button text based on selection count
  const getButtonText = () => {
    if (selectedOptions.length === 0) {
      return placeholder ?? 'Select users...';
    }
    if (selectedOptions.length === 1) {
      return selectedOptions[0].label;
    }
    return `${selectedOptions.length} selected`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between"
        >
          <span
            className={cn(
              selectedOptions.length === 0 && 'text-muted-foreground'
            )}
          >
            {getButtonText()}
          </span>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder ?? 'Search...'}
            onValueChange={handleInputChange}
            value={inputValue}
          />
          <CommandList>
            {/* Show selected users at the top */}
            {selectedOptions.length > 0 && (
              <>
                <CommandGroup heading="Selected">
                  {selectedOptions.map(option => (
                    <CommandItem
                      key={`selected-${option.value}`}
                      value={`selected-${option.value}`}
                      onSelect={() => handleRemove(option.value)}
                      className="flex items-center justify-between"
                    >
                      <span className="flex items-center">
                        <CheckIcon className="mr-2 h-4 w-4 opacity-100" />
                        {option.label}
                      </span>
                      <XIcon className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Show search results */}
            {options.length === 0 ? (
              <CommandEmpty>{emptyMessage ?? 'No results found.'}</CommandEmpty>
            ) : (
              <CommandGroup heading="Available">
                {options.map(option => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <CheckIcon
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedOptions.some(opt => opt.value === option.value)
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
