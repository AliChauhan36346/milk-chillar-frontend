import { twMerge } from "tailwind-merge";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={twMerge('block text-sm font-medium text-gray-700 mb-1', className)}
      {...props}
    />
  );
}