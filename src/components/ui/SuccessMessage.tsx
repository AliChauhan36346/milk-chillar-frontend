import { CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

interface SuccessMessageProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export function SuccessMessage({ message, onClose, duration = 3000 }: SuccessMessageProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 border border-green-100">
        <div className="flex-shrink-0">
          <CheckCircle className="w-6 h-6 text-green-500" />
        </div>
        <p className="text-gray-800 font-medium">{message}</p>
      </div>
    </div>
  );
} 