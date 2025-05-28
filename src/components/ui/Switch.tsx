import * as SwitchPrimitive from '@radix-ui/react-switch';
import { twMerge } from 'tailwind-merge';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function Switch({ checked, onCheckedChange, className }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={twMerge(
        'w-[42px] h-[25px] bg-gray-300 rounded-full relative',
        'data-[state=checked]:bg-blue-600',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        className
      )}
    >
      <SwitchPrimitive.Thumb
        className={twMerge(
          'block w-[21px] h-[21px] bg-white rounded-full transition-transform',
          'translate-x-0.5 data-[state=checked]:translate-x-[19px]'
        )}
      />
    </SwitchPrimitive.Root>
  );
}