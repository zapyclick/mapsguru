import React, { useState, useRef, useEffect } from 'react';
import { Post, BusinessProfile } from '../../types/index.ts';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard.tsx';

// Helper function to find URLs in text and return an array of React elements
const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
  
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
};

// Helper to draw a rounded rectangle on a canvas
function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
}

interface PostPreviewProps {
  post: Post;
  businessProfile: BusinessProfile;
}

const PostPreview: React.FC<PostPreviewProps> = ({ post, businessProfile }) => {
    const [copyStatus, setCopyStatus] = useState<'idle' | 'processing' | 'success'>('idle');
    const [isCanvasReady, setIsCanvasReady] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { name, logoUrl } = businessProfile;
    const { text, imageUrl, imageText, includeLogo } = post;
  
    const defaultText = "O texto do seu post aparecerá aqui. Use o gerador acima para começar!";
    const defaultBusinessName = "Nome da Empresa";

    useEffect(() => {
      const drawFinalImage = async () => {
          if (!imageUrl || !canvasRef.current) return;
          
          setIsCanvasReady(false); // Canvas is being redrawn, so it's not ready
  
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
  
          const loadImage = (src: string): Promise<HTMLImageElement> => {
              return new Promise((resolve, reject) => {
                  const img = new Image();
                  img.crossOrigin = 'anonymous';
                  img.onload = () => resolve(img);
                  img.onerror = reject;
                  img.src = src;
              });
          };
  
          try {
              const mainImage = await loadImage(imageUrl);
  
              canvas.width = mainImage.naturalWidth;
              canvas.height = mainImage.naturalHeight;
  
              // 1. Draw main image
              ctx.drawImage(mainImage, 0, 0);
  
              // 2. Draw Logo
              if (businessProfile.logoUrl && includeLogo) {
                  try {
                      const logoImage = await loadImage(businessProfile.logoUrl);
                      const logoWidth = canvas.width * 0.15; // 15% width
                      const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
                      const padding = canvas.width * 0.02; // 2% padding from edge
                      const x = canvas.width - logoWidth - padding;
                      const y = canvas.height - logoHeight - padding;
                      ctx.drawImage(logoImage, x, y, logoWidth, logoHeight);
                  } catch (logoError) {
                      console.error("Failed to load logo for preview:", logoError);
                  }
              }
  
              // 3. Draw Text Overlay
              if (imageText && imageText.text) {
                  const { text, fontSize, color, backgroundColor, bold, italic, x, y, rotation, strokeWidth, strokeColor, cornerRadius } = imageText;
                  
                  const fontStyle = italic ? 'italic' : 'normal';
                  const fontWeight = bold ? 'bold' : 'normal';
                  const responsiveFontSize = (fontSize / 1000) * canvas.width;
                  ctx.font = `${fontStyle} ${fontWeight} ${responsiveFontSize}px sans-serif`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
  
                  const centerX = (x / 100) * canvas.width;
                  const centerY = (y / 100) * canvas.height;
  
                  ctx.save();
                  ctx.translate(centerX, centerY);
                  ctx.rotate(rotation * Math.PI / 180);
  
                  const lines = text.split('\n');
                  const lineHeight = responsiveFontSize * 1.2;
                  const totalTextHeight = lines.length * lineHeight;
  
                  let maxWidth = 0;
                  lines.forEach(line => {
                      const metrics = ctx.measureText(line);
                      if (metrics.width > maxWidth) {
                          maxWidth = metrics.width;
                      }
                  });
                  
                  const paddingX = responsiveFontSize * 0.4;
                  const paddingY = responsiveFontSize * 0.2;
  
                  if (backgroundColor && backgroundColor !== '#00000000') {
                      ctx.fillStyle = backgroundColor;
                      drawRoundedRect(
                          ctx,
                          -maxWidth / 2 - paddingX,
                          -totalTextHeight / 2 - paddingY,
                          maxWidth + paddingX * 2,
                          totalTextHeight + paddingY * 2,
                          cornerRadius * (responsiveFontSize / 50)
                      );
                  }
                  
                  lines.forEach((line, index) => {
                      const lineY = -totalTextHeight / 2 + lineHeight / 2 + (index * lineHeight);
                      
                      if (strokeWidth > 0) {
                          ctx.strokeStyle = strokeColor;
                          ctx.lineWidth = strokeWidth * (responsiveFontSize / 50);
                          ctx.strokeText(line, 0, lineY);
                      }
                     
                      ctx.fillStyle = color;
                      ctx.fillText(line, 0, lineY);
                  });
  
                  ctx.restore();
              }
          } catch (mainImageError) {
              console.error("Failed to load image for canvas:", mainImageError);
              // If the main image fails, draw an error message on the canvas
              // to prevent downloading a broken/old image.
              canvas.width = 1280; // Default size for error message
              canvas.height = 720;
              ctx.fillStyle = '#f3f4f6'; // bg-slate-100
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#ef4444'; // text-red-500
              ctx.font = 'bold 48px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('Erro ao carregar imagem', canvas.width / 2, canvas.height / 2 - 30);
              ctx.font = '24px sans-serif';
              ctx.fillText('A URL da imagem pode estar quebrada ou ser inválida.', canvas.width / 2, canvas.height / 2 + 30);
          } finally {
              setIsCanvasReady(true); // Drawing finished (or failed), canvas is now ready for download
          }
      };
  
      drawFinalImage();
  }, [imageUrl, imageText, businessProfile.logoUrl, includeLogo]);


    const handleCopyAndDownload = async () => {
        if (!text || copyStatus !== 'idle' || !isCanvasReady) return;
    
        setCopyStatus('processing');

        let textToCopy = text;
        const whatsappLinkRegex = /https:\/\/wa\.me\/[^\s]+/;
        const match = text.match(whatsappLinkRegex);
        
        if (match && text.trim().endsWith(match[0])) {
            textToCopy = text.trim() + '\n';
        }
    
        try {
          await navigator.clipboard.writeText(textToCopy);
    
          if (imageUrl) {
            const canvas = canvasRef.current;
            if (canvas && canvas.width > 0 && canvas.height > 0) {
              await new Promise<void>((resolve, reject) => {
                canvas.toBlob((blob) => {
                  if (blob) {
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `gbp-post-image.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(link.href);
                    resolve();
                  } else {
                    reject(new Error('Falha ao converter canvas para Blob. A imagem pode ser muito grande ou de uma fonte não permitida.'));
                  }
                }, 'image/png');
              });
            } else {
              throw new Error('O canvas da imagem não está pronto. Por favor, aguarde a imagem carregar completamente.');
            }
          }
    
          setCopyStatus('success');
    
        } catch (err) {
          console.error('Falha ao copiar ou baixar:', err);
          alert(`Ocorreu um erro ao copiar ou baixar. Por favor, tente novamente. Detalhes: ${err instanceof Error ? err.message : String(err)}`);
          setCopyStatus('idle');
        }
    
        setTimeout(() => {
          setCopyStatus('idle');
        }, 3000);
    };

    const getButtonText = () => {
        if (imageUrl && !isCanvasReady) {
            return 'Preparando imagem...';
        }
        switch (copyStatus) {
            case 'processing':
                return 'Copiando e Baixando...';
            case 'success':
                return 'Pronto!';
            default:
                return 'Copiar Texto e Baixar Imagem';
        }
    }

    return (
      <NeumorphicCard className="p-6">
        <h2 className="text-2xl font-bold mb-4">Pré-visualização do Post</h2>
        <div className="border border-slate-300 dark:border-slate-700 rounded-lg p-4 space-y-4 bg-white dark:bg-slate-800">
          {/* Header */}
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo da empresa" 
                className="w-10 h-10 rounded-full object-cover bg-white" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                {name ? name.charAt(0).toUpperCase() : 'N'}
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{name || defaultBusinessName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Postando agora</p>
            </div>
          </div>
  
          {/* Post Text with clickable links */}
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
            {text ? renderTextWithLinks(text) : defaultText}
          </p>
  
          {/* Post Image */}
          {imageUrl && (
            <div className="rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
               <canvas ref={canvasRef} className="w-full h-auto" />
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-6">
            <button
                onClick={handleCopyAndDownload}
                disabled={!text || copyStatus !== 'idle' || (!!imageUrl && !isCanvasReady)}
                className="w-full py-3 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {getButtonText()}
            </button>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-3">
              Após colar no Google, o links do post podem precisar ser ativados manualmente no editor, usando a tecla Enter no final do link.
            </p>
        </div>
      </NeumorphicCard>
    );
};
  
export default PostPreview;