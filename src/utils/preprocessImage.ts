import * as ImageManipulator from 'expo-image-manipulator';

export interface IPreprocessImage{
    preprocess(imageUri: string): Promise<string>
}

class PreprocessImage implements IPreprocessImage{
   static async preprocess(imageUri: string): Promise<string> {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 800 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      return `data:image/jpeg;base64,${manipulatedImage.base64}`;
    } catch (error) {
      console.error('Erro no pré-processamento:', error);
      throw error;
    }
  }
}

export  default PreprocessImage;