import toast, { Toast } from 'react-hot-toast';
import { CheckCircle2, AlertCircle, Info, TriangleAlert } from 'lucide-react';

export const useToast = () => {
  return {
    success: (message: string) => 
      toast.success(message, {
        icon: <CheckCircle2 className="w-5 h-5 text-income-500" />,
      }),
    error: (message: string) => 
      toast.error(message, {
        icon: <AlertCircle className="w-5 h-5 text-expense-500" />,
      }),
    info: (message: string) => 
      toast(message, {
        icon: <Info className="w-5 h-5 text-primary-500" />,
      }),
    warning: (message: string) => 
      toast(message, {
        icon: <TriangleAlert className="w-5 h-5 text-yellow-500" />,
      }),
    loading: (message: string) => 
      toast.loading(message),
    dismiss: (toastId?: string) => 
      toast.dismiss(toastId),
  };
};
