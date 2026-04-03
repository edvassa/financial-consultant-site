import { Facebook, Twitter, Linkedin, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SocialShareProps {
  title: string;
  url: string;
  description?: string;
}

export default function SocialShare({ title, url, description }: SocialShareProps) {
  // Extract slug from URL for preview endpoint
  const slug = url.split('/blog/')[1]?.split('?')[0] || '';
  // Use preview endpoint if available, otherwise use regular URL
  const shareUrl = slug ? `${window.location.origin}/api/blog/preview/${slug}` : url;
  
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
    window.open(shareLinks[platform], "_blank", "width=600,height=400");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url); // Copy original URL, not preview
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
      >
        <span className="text-lg">🔗</span>
        <span className="hidden sm:inline">Копировать</span>
      </Button>
      
      {/* Hidden note for users */}
      <span className="text-xs text-slate-500 ml-2">Социальные сети получат красивое превью с изображением и описанием</span>
    </div>
  );
}
