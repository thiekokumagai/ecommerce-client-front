import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/5567991032937"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(142_70%_45%)] shadow-lg shadow-[hsl(142_70%_45%/0.3)] transition-transform hover:scale-110 active:scale-95"
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle className="h-6 w-6 text-primary-foreground" />
    </a>
  );
};

export default WhatsAppButton;
