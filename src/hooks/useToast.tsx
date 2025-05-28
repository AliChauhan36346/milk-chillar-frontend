import { toast } from 'sonner';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
}

export function useToast() {
  const showToast = ({ title, description, variant = 'default' }: ToastProps) => {
    switch (variant) {
      case 'success':
        toast.success(title, { description });
        break;
      case 'error':
        toast.error(title, { description });
        break;
      default:
        toast(title, { description });
    }
  };

  return { toast: showToast };
}