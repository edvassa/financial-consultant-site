import { Facebook, Twitter, Linkedin, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface SocialShareProps {
  title: string;
  url: string;
  description?: string;
}

export default function SocialShare({ title, url, description }: SocialShareProps) {
  // Use the direct blog URL - SSR middleware handles social media crawlers
  // This ensures social media platforms get the HTML with proper OG tags
  const shareUrl = url;
  
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    // Track share event in Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'share', {
        'method': platform,
        'content_type': 'blog_article',
        'item_id': url,
        'content_title': title
      });
    }
    
    window.open(shareLinks[platform], "_blank", "width=600,height=400");
  };

  const handleCopyLink = () => {
    // Track copy link event in Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'share', {
        'method': 'copy_link',
        'content_type': 'blog_article',
        'item_id': url,
        'content_title': title
      });
    }
    
    navigator.clipboard.writeText(shareUrl);
    toast.success("Ссылка скопирована в буфер обмена!");
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <span className="text-sm font-medium text-slate-600">Поделиться:</span>
      
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleShare("facebook")}
        className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
        title="Поделиться в Facebook"
        data-ga-event="share_facebook"
      >
        <Facebook className="h-4 w-4" />
        <span className="hidden sm:inline">Facebook</span>
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => handleShare("twitter")}
        className="gap-2 border-sky-200 text-sky-700 hover:bg-sky-50"
        title="Поделиться в Twitter"
        data-ga-event="share_twitter"
      >
        <Twitter className="h-4 w-4" />
        <span className="hidden sm:inline">Twitter</span>
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => handleShare("linkedin")}
        className="gap-2 border-blue-300 text-blue-800 hover:bg-blue-50"
        title="Поделиться в LinkedIn"
        data-ga-event="share_linkedin"
      >
        <Linkedin className="h-4 w-4" />
        <span className="hidden sm:inline">LinkedIn</span>
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => handleShare("whatsapp")}
        className="gap-2 border-green-200 text-green-700 hover:bg-green-50"
        title="Поделиться в WhatsApp"
        data-ga-event="share_whatsapp"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">WhatsApp</span>
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => handleShare("telegram")}
        className="gap-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50"
        title="Поделиться в Telegram"
        data-ga-event="share_telegram"
      >
        <Send className="h-4 w-4" />
        <span className="hidden sm:inline">Telegram</span>
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={handleCopyLink}
        className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100"
        title="Копировать ссылку"
        data-ga-event="share_copy_link"
      >
        <span className="text-lg">🔗</span>
        <span className="hidden sm:inline">Копировать</span>
      </Button>
      
      {/* Hidden note for users */}
      <span className="text-xs text-slate-500 ml-2">Социальные сети получат красивое превью с изображением и описанием</span>
    </div>
  );
}
