import React, { useState } from 'react';
import { UnsplashImage } from '../../types/index.ts';
import { searchImages } from '../../services/unsplashService.ts';
import { NeumorphicCardInset } from '../../components/ui/NeumorphicCard.tsx';

interface ImageSearchProps {
  onImageSelect: (url: string | null, alt: string | null) => void;
  selectedImageUrl: string | null;
}

const ImageSearch: React.FC<ImageSearchProps> = ({ onImageSelect, selectedImageUrl }) => {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setIsLoading(true);
    setError(null);
    setImages([]); // Limpa resultados anteriores

    try {
      const results = await searchImages(query);
      setImages(results);
      if (results.length === 0) {
        setError("Nenhuma imagem encontrada para sua busca. Tente outros termos.");
      }
    } catch (err: any) {
        setError(err.message || 'Ocorreu um erro desconhecido ao buscar imagens.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem válido.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImages([]); // Limpa resultados de busca existentes
        setError(null); // Limpa erros anteriores
        onImageSelect(base64String, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Search Action */}
        <form onSubmit={handleSearch} className="flex-grow flex gap-2">
          <NeumorphicCardInset className="flex-grow p-1 rounded-lg">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar imagem online..."
              className="w-full bg-transparent p-3 outline-none"
            />
          </NeumorphicCardInset>
          <button type="submit" className="py-3 px-5 rounded-lg bg-slate-300 dark:bg-slate-700 font-semibold hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors">
            Buscar
          </button>
        </form>
        
        <div className="hidden sm:block text-slate-500 dark:text-slate-400">OU</div>

        {/* Upload Action */}
        <div>
          <label 
            htmlFor="image-upload" 
            className="flex items-center justify-center cursor-pointer py-3 px-5 rounded-lg bg-slate-300 dark:bg-slate-700 font-semibold hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined mr-2">upload_file</span>
            Subir Imagem
          </label>
          <input 
            id="image-upload" 
            type="file" 
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 text-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
            <p className="font-semibold">Aviso</p>
            <p className="text-sm">{error}</p>
        </div>
      )}

      {isLoading && <p className="text-center">Carregando imagens...</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <button
              key={image.id}
              onClick={() => onImageSelect(image.urls.regular, image.alt_description)}
              className={`rounded-lg overflow-hidden transition-all duration-200 ${selectedImageUrl === image.urls.regular ? 'ring-4 ring-blue-500' : 'ring-2 ring-transparent hover:ring-blue-400'}`}
            >
              <img src={image.urls.thumb} alt={image.alt_description} className="w-full h-24 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSearch;
