import React, { useState } from 'react';
import { Post, BusinessProfile, ImageText } from '../../types/index.ts';
import { generatePostText } from '../../services/geminiService.ts';
import ImageSearch from './ImageSearch.tsx';
import ImageEditor from './ImageEditor.tsx';
import { NeumorphicCard, NeumorphicCardInset } from '../../components/ui/NeumorphicCard.tsx';
import InfoModal from '../../components/ui/InfoModal.tsx';
import { IconButton } from '../../components/ui/IconButton.tsx';

interface PostCreatorProps {
  post: Post;
  businessProfile: BusinessProfile;
  onPostChange: (updatedPost: Post) => void;
  onNewPost: () => void;
}

const PostCreator: React.FC<PostCreatorProps> = ({ post, businessProfile, onPostChange, onNewPost }) => {
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  
  const handleInputChange = (field: keyof Post, value: string | null | ImageText | boolean) => {
    onPostChange({ ...post, [field]: value });
  };

  const handleGenerateText = async () => {
    if (!post.keywords) {
      alert('Por favor, preencha as palavras-chave.');
      return;
    }
    if (!businessProfile.name) {
      alert('Por favor, preencha o nome da empresa no Perfil do Negócio.');
      return;
    }

    setIsGeneratingText(true);
    try {
        const generatedText = await generatePostText(post.keywords, businessProfile);
        handleInputChange('text', generatedText);
    } catch (error: any) {
        handleInputChange('text', `Ocorreu um erro: ${error.message}`);
    } finally {
        setIsGeneratingText(false);
    }
  };
  
  const handleImageSelect = (url: string | null, alt: string | null) => {
    // When a new image is selected, reset any existing image text
    onPostChange({ ...post, imageUrl: url, imageDescription: alt, imageText: null });
  };

  const handleRemoveImage = () => {
    onPostChange({ ...post, imageUrl: null, imageDescription: null, imageText: null });
  };

  const handleSaveImageText = (newImageText: ImageText | null) => {
    handleInputChange('imageText', newImageText);
    setIsEditorOpen(false);
  };

  return (
    <>
      <NeumorphicCard className="p-6 space-y-6">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Criador de Posts</h2>
            <IconButton onClick={() => setIsInfoModalOpen(true)} aria-label="Como funciona?" className="!w-8 !h-8">
              <span className="material-symbols-outlined text-base">help_outline</span>
            </IconButton>
          </div>
          <div className="flex gap-2">
              <button
                  onClick={onNewPost}
                  className="py-2 px-4 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors text-sm"
              >
                  Novo Post
              </button>
          </div>
        </div>

        {/* Keywords Input */}
        <div className="space-y-2">
          <label htmlFor="keywords" className="font-semibold block mb-2">
            1. Insira as Palavras-chave
          </label>
          <NeumorphicCardInset className="flex items-center gap-2 p-1 rounded-lg">
            <input
              id="keywords"
              type="text"
              value={post.keywords}
              onChange={(e) => handleInputChange('keywords', e.target.value)}
              placeholder="Ex: sapatos de couro, promoção de inverno"
              className="w-full bg-transparent p-3 outline-none"
            />
            <button
              onClick={handleGenerateText}
              disabled={isGeneratingText}
              className="py-3 px-5 rounded-lg bg-slate-300 dark:bg-slate-700 font-semibold hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isGeneratingText ? 'Gerando...' : 'Gerar Texto'}
            </button>
          </NeumorphicCardInset>
        </div>

        {/* Post Text Area */}
        <div className="space-y-2">
          <label htmlFor="post-text" className="font-semibold block mb-2">
            2. Edite o Texto Gerado
          </label>
          <NeumorphicCardInset className="p-1 rounded-lg">
            <textarea
              id="post-text"
              value={post.text}
              onChange={(e) => handleInputChange('text', e.target.value)}
              rows={8}
              placeholder="O texto gerado pela IA aparecerá aqui..."
              className="w-full bg-transparent p-3 outline-none resize-y"
            />
          </NeumorphicCardInset>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-right">{post.text.length} / 1500 caracteres</p>
        </div>
        
        {/* Image Search and Editor */}
        <div className="space-y-4">
          <label className="font-semibold block mb-2">3. Adicione uma Imagem</label>
          {post.imageUrl ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">Imagem selecionada:</p>
              <div className="relative group w-48">
                <img src={post.imageUrl} alt={post.imageDescription || ''} className="rounded-lg w-full h-auto object-cover" />
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                <button
                  onClick={() => setIsEditorOpen(true)}
                  className="flex items-center justify-center cursor-pointer py-2 px-4 rounded-lg bg-slate-300 dark:bg-slate-700 font-semibold hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors text-sm"
                >
                  <span className="material-symbols-outlined mr-2 text-base">text_fields</span>
                  Adicionar/Editar Texto
                </button>
                <button
                  onClick={handleRemoveImage}
                  className="flex items-center justify-center cursor-pointer py-2 px-4 rounded-lg bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200 font-semibold hover:bg-red-300 dark:hover:bg-red-900 transition-colors text-sm"
                >
                  <span className="material-symbols-outlined mr-2 text-base">delete</span>
                  Remover
                </button>
                {businessProfile.logoUrl && (
                  <label htmlFor="include-logo-toggle" className="flex items-center gap-2 cursor-pointer select-none text-sm p-2 rounded-lg hover:bg-slate-300/50 dark:hover:bg-slate-700/50">
                    <input
                      type="checkbox"
                      id="include-logo-toggle"
                      checked={post.includeLogo}
                      onChange={(e) => handleInputChange('includeLogo', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                    />
                    <span>Incluir logo</span>
                  </label>
                )}
              </div>
            </div>
          ) : (
            <ImageSearch 
                onImageSelect={handleImageSelect}
                selectedImageUrl={post.imageUrl}
            />
          )}
        </div>
      </NeumorphicCard>

      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Como Funciona o Gerador de Posts">
        <div className="space-y-3">
            <h3 className="font-bold text-lg">Por que é importante?</h3>
            <p>Manter seu Perfil da Empresa no Google (GBP) atualizado com posts regulares aumenta sua visibilidade nas buscas locais, atrai novos clientes e fortalece o relacionamento com os existentes. Posts com textos bem escritos e imagens atraentes geram mais engajamento e cliques.</p>

            <h3 className="font-bold text-lg">Como funciona?</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Passo 1: Insira as Palavras-chave:</strong> Pense no tema do seu post (uma promoção, um novo produto, um evento) e insira os termos principais. A IA usará isso como base.</li>
                <li><strong>Passo 2: Gere e Edite o Texto:</strong> Com um clique, a IA cria uma manchete, um texto persuasivo e hashtags relevantes. Você pode editar o texto livremente para ajustá-lo à sua preferência.</li>
                <li><strong>Passo 3: Adicione uma Imagem:</strong> Busque uma imagem profissional online, suba uma do seu computador e edite-a adicionando textos, seu logo e outros elementos para torná-la única.</li>
                 <li><strong>Passo 4: Copie e Cole:</strong> Com tudo pronto, clique no botão "Copiar Texto e Baixar Imagem". O texto formatado (com links, hashtags, etc.) irá para sua área de transferência, e a imagem será baixada. Depois, é só colar no seu GBP!</li>
            </ul>

            <h3 className="font-bold text-lg">Vantagens:</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Economia de Tempo:</strong> Crie posts completos em minutos, não em horas.</li>
                <li><strong>Textos Profissionais:</strong> A IA utiliza técnicas de marketing para criar textos que convertem.</li>
                <li><strong>Identidade Visual:</strong> Personalize suas imagens com seu logo e mensagens de impacto.</li>
                <li><strong>Aumento de Engajamento:</strong> Posts de alta qualidade com hashtags relevantes geram mais visualizações, cliques e clientes.</li>
            </ul>
        </div>
      </InfoModal>

      {post.imageUrl && (
        <ImageEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveImageText}
          imageUrl={post.imageUrl}
          postText={post.text}
          initialTextState={post.imageText}
          businessProfile={businessProfile}
          includeLogo={post.includeLogo}
        />
      )}
    </>
  );
};

export default PostCreator;