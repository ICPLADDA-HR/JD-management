import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-primary-600/20 backdrop-blur-md transition-all duration-300"
          onClick={onClose}
        ></div>

        <div className={`relative inline-block align-bottom bg-white/95 backdrop-blur-xl rounded-2xl shadow-apple-lg transform transition-all duration-300 sm:my-8 sm:align-middle ${sizes[size]} w-full`}>
          <div className="bg-gradient-to-b from-white/80 to-white/60 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between px-8 py-6 border-b border-primary-100">
              <h3 className="text-heading-3 font-semibold text-primary-600">{title}</h3>
              <button
                onClick={onClose}
                className="text-primary-400 hover:text-primary-600 transition-all duration-200 hover:bg-primary-50 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-8 py-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
