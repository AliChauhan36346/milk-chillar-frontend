import * as SwitchPrimitive from '@radix-ui/react-switch';
import { twMerge } from 'tailwind-merge';

interface SwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ id, checked, onCheckedChange, disabled, className }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={twMerge(
        'w-[42px] h-[25px] bg-gray-300 rounded-full relative',
        'data-[state=checked]:bg-blue-600',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
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