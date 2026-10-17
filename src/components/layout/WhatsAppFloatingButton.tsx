import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface WhatsAppFloatingButtonProps {
  customMessage?: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  customMessage,
}) => {
  const { settings } = useSettings();

  if (!settings.whatsapp) return null;

  const defaultMsg = 'Hi Cosy Reality, I would like more information about your properties.';
  const message = encodeURIComponent(customMessage || defaultMsg);
  const cleanPhone = settings.whatsapp.replace(/\D/g, '');
  const url = `https://wa.me/${cleanPhone}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#16A34A] text-white px-4 py-3 rounded-full shadow-xl hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all duration-200 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageSquare className="w-5 h-5 fill-white text-[#16A34A] group-hover:animate-bounce" />
      <span className="text-sm font-bold pr-1 hidden sm:inline">WhatsApp</span>
    </a>
  );
};
