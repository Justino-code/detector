import * as ImageManipulator from 'expo-image-manipulator';
import * as Crypto from 'expo-crypto';
import { Image } from 'react-native';

export interface PreprocessResult {
  base64Image: string;
  metadata: {
    timestamp: number;
    hash: string;
    sizeKB: number;
  };
}

export interface IPreprocessImage {
  preprocess(imageUri: string): Promise<PreprocessResult>;
}

export class PreprocessImage implements IPreprocessImage {

  static async preprocess(imageUri: string): Promise<PreprocessResult> {
    try {
      // 1️⃣ Obter dimensões originais
      console.log("iniciando preprocessamento de de imagem");
      
      const { width } = await new Promise<{ width: number; height: number }>(
        (resolve, reject) => {
          Image.getSize(imageUri, (w, h) => resolve({ width: w, height: h }), reject);
        }
      );

      // 2️⃣ Redimensionar apenas se necessário
      const actions = width > 800 ? [{ resize: { width: 800 } }] : [];

      // 3️⃣ Compressão base (ajustada depois se necessário)
      let compress = 0.7;

      let manipulated = await ImageManipulator.manipulateAsync(
        imageUri,
        actions,
        {
          compress,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      // 4️⃣ Estimar tamanho (Base64 → bytes)
      const sizeKB = (manipulated.base64!.length * 3) / 4 / 1024;

      // 5️⃣ Compressão adicional se muito grande (>3MB)
      if (sizeKB > 3000) {
        compress = 0.5;

        manipulated = await ImageManipulator.manipulateAsync(
          imageUri,
          actions,
          {
            compress,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          }
        );
      }

      // 6️⃣ Validação básica
      if (!manipulated.base64) {
        throw new Error('Imagem processada inválida');
      }

      // 7️⃣ Hash da imagem
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        manipulated.base64
      );

      return {
        base64Image: `data:image/jpeg;base64,${manipulated.base64}`,
        metadata: {
          timestamp: Date.now(),
          hash,
          sizeKB: Math.round(sizeKB),
        },
      };

    } catch (error) {
      console.error('Erro no pré-processamento da imagem:', error);
      throw error;
    }
  }
}
