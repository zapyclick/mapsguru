import React, { useState, useEffect, useRef, useCallback, MouseEvent } from 'react';
import { ImageText, BusinessProfile } from '../../types/index.ts';
import { NeumorphicCard, NeumorphicCardInset } from '../../components/ui/NeumorphicCard.tsx';
import { generateImageTextSuggestion } from '../../services/geminiService.ts';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageText: ImageText | null) => void;
  imageUrl: string;
  postText: string;
  initialTextState: ImageText | null;
  businessProfile: BusinessProfile;
  includeLogo: boolean;
}

const DEFAULT_TEXT_STATE: ImageText = {
  text: 'Edite este texto',
  fontSize: 50,
  color: '#FFFFFF',
  backgroundColor: '#00000080',
  bold: false,
  italic: false,
  x: 50,
  y: 50,
  rotation: 0,
  strokeWidth: 2,
  strokeColor: '#000000',
  cornerRadius: 15,
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


const ImageEditor: React.FC<ImageEditorProps> = ({ isOpen, onClose, onSave, imageUrl, postText, initialTextState, businessProfile, includeLogo }) => {
  const [textState, setTextState] = useState<ImageText>(initialTextState || DEFAULT_TEXT_STATE);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, textX: 0, textY: 0 });

  useEffect(() => {
    setTextState(initialTextState || DEFAULT_TEXT_STATE);
  }, [initialTextState, isOpen]);

  const handleStateChange = (field: keyof ImageText, value: any) => {
    setTextState(prev => ({ ...prev, [field]: value }));
  };

  const drawCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

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
        
        const container = canvas.parentElement;
        if (!container) return;

        const canvasWidth = container.clientWidth;
        const scale = canvasWidth / mainImage.naturalWidth;
        const canvasHeight = mainImage.naturalHeight * scale;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // 1. Draw main image
        ctx.drawImage(mainImage, 0, 0, canvas.width, canvas.height);

        // 2. Draw Logo
        if (businessProfile.logoUrl && includeLogo) {
            try {
                const logoImage = await loadImage(businessProfile.logoUrl);
                const logoWidth = canvas.width * 0.15; // 15% width
                const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
                const padding = canvas.width * 0.02; // 2% padding
                const x = canvas.width - logoWidth - padding;
                const y = canvas.height - logoHeight - padding;
                ctx.drawImage(logoImage, x, y, logoWidth, logoHeight);
            } catch (logoError) {
                console.error("Failed to load logo image:", logoError);
            }
        }

        // 3. Draw Text Overlay
        if (textState.text) {
             const { text, fontSize, color, backgroundColor, bold, italic, x, y, rotation, strokeWidth, strokeColor, cornerRadius } = textState;
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
            
            const paddingX = responsiveFontSize * 0.4; // Horizontal padding
            const paddingY = responsiveFontSize * 0.2; // Vertical padding (thinner)

            if (backgroundColor && backgroundColor !== '#00000000') {
                ctx.fillStyle = backgroundColor;
                drawRoundedRect(
                    ctx,
                    -maxWidth / 2 - paddingX,
                    -totalTextHeight / 2 - paddingY,
                    maxWidth + paddingX * 2,
                    totalTextHeight + paddingY * 2,
                    cornerRadius * (responsiveFontSize / 50) // Scale radius
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
        console.error("Failed to load main image:", mainImageError);
    }
  }, [imageUrl, textState, businessProfile.logoUrl, includeLogo]);


  useEffect(() => {
    if(isOpen) {
        const handleResize = () => drawCanvas();
        drawCanvas();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }
  }, [isOpen, drawCanvas]);
  
  const getTextBoundingBox = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !textState.text) return null;

    const { text, fontSize, bold, italic, x, y, rotation } = textState;
    const fontStyle = italic ? 'italic' : 'normal';
    const fontWeight = bold ? 'bold' : 'normal';
    const responsiveFontSize = (fontSize / 1000) * canvas.width;
    ctx.font = `${fontStyle} ${fontWeight} ${responsiveFontSize}px sans-serif`;

    const lines = text.split('\n');
    const lineHeight = responsiveFontSize * 1.2;
    const totalTextHeight = lines.length * lineHeight;
    let maxWidth = 0;
    lines.forEach(line => {
        const metrics = ctx.measureText(line);
        if (metrics.width > maxWidth) maxWidth = metrics.width;
    });

    return {
        x: (x / 100) * canvas.width,
        y: (y / 100) * canvas.height,
        width: maxWidth,
        height: totalTextHeight,
        rotation: rotation,
    };
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const box = getTextBoundingBox();
    if (!box) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const angle = -box.rotation * Math.PI / 180;
    const dx = mouseX - box.x;
    const dy = mouseY - box.y;
    const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
    const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);

    if (Math.abs(rotatedX) < box.width / 2 && Math.abs(rotatedY) < box.height / 2) {
        setIsDragging(true);
        setDragStart({ x: mouseX, y: mouseY, textX: textState.x, textY: textState.y });
        canvas.style.cursor = 'grabbing';
    }
  };
  
  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const box = getTextBoundingBox();
    if (!box) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    if (isDragging) {
      const dx = mouseX - dragStart.x;
      const dy = mouseY - dragStart.y;
      const newTextX = dragStart.textX + (dx / canvas.width) * 100;
      const newTextY = dragStart.textY + (dy / canvas.height) * 100;
      setTextState(prev => ({ ...prev, x: newTextX, y: newTextY }));
    } else {
        const angle = -box.rotation * Math.PI / 180;
        const dx_hit = mouseX - box.x;
        const dy_hit = mouseY - box.y;
        const rotatedX = dx_hit * Math.cos(angle) - dy_hit * Math.sin(angle);
        const rotatedY = dx_hit * Math.sin(angle) + dy_hit * Math.cos(angle);
        if (Math.abs(rotatedX) < box.width / 2 && Math.abs(rotatedY) < box.height / 2) {
             canvas.style.cursor = 'grab';
        } else {
             canvas.style.cursor = 'default';
        }
    }
  };

  const handleMouseUpOrLeave = () => {
    if (canvasRef.current) canvasRef.current.style.cursor = 'default';
    setIsDragging(false);
  };

  const handleSave = () => onSave(textState);

  const handleGenerateSuggestion = async () => {
    if(!postText) {
        alert("Escreva o texto do post primeiro para gerar uma sugestão.");
        return;
    }
    setIsGeneratingSuggestion(true);
    const suggestion = await generateImageTextSuggestion(postText);
    if(suggestion && !suggestion.includes("Erro")) {
        handleStateChange('text', suggestion);
    } else {
        alert("Não foi possível gerar uma sugestão.");
    }
    setIsGeneratingSuggestion(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <NeumorphicCard className="w-full max-w-5xl h-[90vh] flex flex-col p-4 sm:p-6 gap-4">
        <h2 className="text-xl font-bold text-center">Editor de Imagem</h2>
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
          {/* Canvas */}
          <div className="md:col-span-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden shadow-light-neumorphic-inset dark:shadow-dark-neumorphic-inset">
             <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUpOrLeave} onMouseLeave={handleMouseUpOrLeave} />
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4 overflow-y-auto pr-2">
            <div>
              <label className="font-semibold text-sm mb-2 block">Texto</label>
              <NeumorphicCardInset className="p-1 rounded-lg">
                <textarea
                    value={textState.text}
                    onChange={(e) => handleStateChange('text', e.target.value)}
                    className="w-full bg-transparent p-2 outline-none resize-none"
                    rows={3}
                />
              </NeumorphicCardInset>
              <button onClick={handleGenerateSuggestion} disabled={isGeneratingSuggestion} className="text-sm text-blue-500 hover:underline mt-2 disabled:opacity-50">
                {isGeneratingSuggestion ? 'Gerando...' : 'Gerar sugestão com IA'}
              </button>
            </div>
            
            <div>
              <label className="font-semibold text-sm mb-2 block">Tamanho da Fonte</label>
              <NeumorphicCardInset className="p-1 rounded-lg flex items-center gap-2">
                 <input
                    type="range" min="10" max="150" value={textState.fontSize}
                    onChange={(e) => handleStateChange('fontSize', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 text-center">{textState.fontSize}</span>
              </NeumorphicCardInset>
            </div>

            <div>
              <label className="font-semibold text-sm mb-2 block">Rotação</label>
              <NeumorphicCardInset className="p-1 rounded-lg flex items-center gap-2">
                 <input
                    type="range" min="-180" max="180" value={textState.rotation}
                    onChange={(e) => handleStateChange('rotation', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 text-center">{textState.rotation}°</span>
              </NeumorphicCardInset>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="font-color" className="font-semibold text-sm mb-2 block">Cor da Fonte</label>
                    <NeumorphicCardInset className="p-1 rounded-lg">
                        <input id="font-color" type="color" value={textState.color} onChange={(e) => handleStateChange('color', e.target.value)} className="w-full bg-transparent border-none outline-none cursor-pointer h-10" />
                    </NeumorphicCardInset>
                </div>
                <div>
                    <label className="font-semibold text-sm mb-2 block">Estilo</label>
                    <div className="flex gap-2">
                        <button onClick={() => handleStateChange('bold', !textState.bold)} className={`h-12 w-12 rounded-lg font-bold transition-colors ${textState.bold ? 'bg-blue-500 text-white shadow-light-neumorphic-inset dark:shadow-dark-neumorphic-inset' : 'bg-slate-200 dark:bg-slate-800 shadow-light-neumorphic dark:shadow-dark-neumorphic'}`}>B</button>
                        <button onClick={() => handleStateChange('italic', !textState.italic)} className={`h-12 w-12 rounded-lg italic transition-colors ${textState.italic ? 'bg-blue-500 text-white shadow-light-neumorphic-inset dark:shadow-dark-neumorphic-inset' : 'bg-slate-200 dark:bg-slate-800 shadow-light-neumorphic dark:shadow-dark-neumorphic'}`}>I</button>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-300 dark:border-slate-700 pt-4 mt-2">
                <label className="font-semibold text-sm mb-2 block">Fundo do Texto</label>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="bg-color" className="font-semibold text-xs mb-2 block">Cor</label>
                            <NeumorphicCardInset className="p-1 rounded-lg">
                                <input id="bg-color" type="color" value={textState.backgroundColor.slice(0, 7)} onChange={(e) => handleStateChange('backgroundColor', e.target.value + '80')} className="w-full bg-transparent border-none outline-none cursor-pointer h-10" />
                            </NeumorphicCardInset>
                        </div>
                        <div className="self-end">
                            <button onClick={() => handleStateChange('backgroundColor', '#00000000')} className="w-full py-2 px-3 rounded-lg bg-slate-300 dark:bg-slate-700 font-semibold hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors h-12 text-xs">
                                Remover Fundo
                            </button>
                        </div>
                    </div>
                     <div>
                        <label className="font-semibold text-xs mb-2 block">Raio do Canto</label>
                        <NeumorphicCardInset className="p-1 rounded-lg flex items-center gap-2">
                            <input
                                type="range" min="0" max="50" value={textState.cornerRadius}
                                onChange={(e) => handleStateChange('cornerRadius', parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="w-12 text-center">{textState.cornerRadius}px</span>
                        </NeumorphicCardInset>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-300 dark:border-slate-700 pt-4 mt-2">
                <label className="font-semibold text-sm mb-2 block">Borda</label>
                 <div className="space-y-4">
                    <div>
                        <label className="font-semibold text-xs mb-2 block">Largura da Borda</label>
                        <NeumorphicCardInset className="p-1 rounded-lg flex items-center gap-2">
                            <input
                                type="range" min="0" max="20" value={textState.strokeWidth}
                                onChange={(e) => handleStateChange('strokeWidth', parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="w-12 text-center">{textState.strokeWidth}</span>
                        </NeumorphicCardInset>
                    </div>
                    <div>
                        <label htmlFor="stroke-color" className="font-semibold text-xs mb-2 block">Cor da Borda</label>
                         <NeumorphicCardInset className="p-1 rounded-lg">
                            <input id="stroke-color" type="color" value={textState.strokeColor} onChange={(e) => handleStateChange('strokeColor', e.target.value)} className="w-full bg-transparent border-none outline-none cursor-pointer h-10" />
                        </NeumorphicCardInset>
                    </div>
                 </div>
            </div>

          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-300 dark:border-slate-700">
            <button onClick={onClose} className="py-2 px-5 rounded-lg bg-slate-300 dark:bg-slate-700 font-semibold hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors">Cancelar</button>
            <button onClick={handleSave} className="py-2 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors">Salvar Alterações</button>
        </div>
      </NeumorphicCard>
    </div>
  );
};

export default ImageEditor;
