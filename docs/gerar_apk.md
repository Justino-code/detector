Antes de gerar o APK/Build do app, certifique-se de criar todas as chaves necessárias usando o EAS Secrets, para que as variáveis de ambiente públicas (EXPO_PUBLIC_...) fiquem disponíveis no build final.

exemplo:

eas env:create --name PLANTNET_API_KEY --value "sua_chave_aqui" --environment production --visibility secret

eas env:create --name EXPO_PUBLIC_PLANTNET_API_URL --value "https://my-api.plantnet.org/v2/identify" --environment production --visibility plaintext

eas env:create --name EXPO_PUBLIC_PLANTNET_DISEASES_API_URL --value https://my-api.plantnet.org/v2/diseases/identify --environment production --visibility plaintext
