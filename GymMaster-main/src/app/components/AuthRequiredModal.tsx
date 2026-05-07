import { Link } from "react-router";
import { X, Lock } from "lucide-react";
import { useEffect } from "react";

type AuthRequiredModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
};

export function AuthRequiredModal({
  isOpen,
  onClose,
  title = "Acció no permesa",
  message = "Has d'iniciar sessió per utilitzar aquesta funcionalitat.",
}: AuthRequiredModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col items-center text-center mt-2">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-[#00B4D8]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-gray-600 mb-8">{message}</p>
            
            <div className="flex flex-col w-full gap-3">
              <Link
                to="/login"
                className="w-full text-white py-3 rounded-md transition-all duration-200 font-semibold text-center bg-gymmaster-primary hover:bg-gymmaster-secondary hover:shadow-lg active:scale-[0.98]"
                onClick={onClose}
              >
                Iniciar sessió
              </Link>
              <Link
                to="/register"
                className="w-full py-3 rounded-md transition-all duration-200 font-semibold text-center border-2 border-gymmaster-accent text-gymmaster-accent hover:bg-gymmaster-accent hover:text-white hover:shadow-lg active:scale-[0.98]"
                onClick={onClose}
              >
                Crear compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
