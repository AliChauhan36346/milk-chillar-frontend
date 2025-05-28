import * as React from 'react';
import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import { twMerge } from 'tailwind-merge';

const DropdownMenu = DropdownPrimitive.Root;

const DropdownTrigger = DropdownPrimitive.Trigger;

const DropdownContent = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DropdownPrimitive.Content
    ref={ref}
    className={twMerge(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      className
    )}
    {...props}
  >
    {children}
  </DropdownPrimitive.Content>
));

const DropdownItem = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <DropdownPrimitive.Item
    ref={ref}
    className={twMerge(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
      'focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    {children}
  </DropdownPrimitive.Item>
));

export { 
  DropdownMenu, 
  DropdownTrigger, 
  DropdownContent, 
  DropdownItem 
};