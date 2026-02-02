// src/services/ImagePreprocessor.ts
import { PreprocessImage } from '../../utils/preprocessImage';

export class ImagePreprocessor {
  async preprocess(imageUri: string): Promise<string> {
    console.log('🖼️  Pré-processando imagem...');
    
    try {
      // Simplesmente delega para a função já existente
      const result = await PreprocessImage.preprocess(imageUri);
      console.log('✅ Imagem pré-processada com sucesso');
      return result.base64Image;
    } catch (error) {
      console.error('❌ Erro no pré-processamento:', error);
      throw new Error('Falha ao processar a imagem. Tente com outra imagem.');
    }
  }

  // Método opcional para validação
  async validateImage(imageUri: string): Promise<boolean> {
    // Implementação simples - poderia verificar se a URI é válida
    return imageUri.startsWith('file://') || imageUri.startsWith('data:image');
  }
}