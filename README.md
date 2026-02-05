# 🌿 **PlantaVigia** - Sistema de Diagnóstico Inteligente de Plantas

## 📋 Sobre o Projeto

**PlantaVigia** é uma aplicação móvel desenvolvida em React Native para diagnóstico inteligente de saúde de plantas. A aplicação utiliza inteligência artificial para identificar espécies vegetais, detectar doenças e recomendar tratamentos personalizados, ajudando agricultores e entusiastas a manterem suas plantas saudáveis.

### 👥 Equipe de Desenvolvimento
**Disciplina:** Computação Móvel  
**Curso:** Engenharia Informática  
**Universidade:** ISPI  
**Semestre:** 2025/2026  
**Grupo:** PlantaVigia Team

### 🎯 Objetivos do Projeto
- Desenvolver uma aplicação móvel completa para diagnóstico vegetal
- Integrar APIs de IA para identificação de plantas e doenças
- Implementar interface intuitiva com experiência de utilizador otimizada
- Criar sistema de histórico e favoritos para acompanhamento
- Utilizar boas práticas de desenvolvimento mobile no contexto angolano

## 🚀 Funcionalidades Principais

### 🔍 Análise Inteligente
- **Identificação de Plantas**: Reconhecimento de espécies usando PlantNet API
- **Diagnóstico de Doenças**: Detecção de problemas de saúde vegetal
- **Análise de Saúde**: Pontuação de saúde baseada em múltiplos fatores
- **Recomendações Personalizadas**: Sugestões de tratamento baseadas no diagnóstico

### 📊 Sistema de Histórico
- **Armazenamento Local**: Histórico de análises com AsyncStorage/MMKV
- **Filtros Inteligentes**: Filtragem por estado (saudável, com problemas, favoritas)
- **Estatísticas**: Dashboard com métricas de uso
- **Actualização em Tempo Real**: Sincronização automática de dados

### 🎨 Interface do Utilizador
- **Temas Personalizáveis**: Suporte a modo claro e escuro
- **Design Responsivo**: Layout adaptável a diferentes telas
- **Navegação Intuitiva**: Sistema de navegação em múltiplos passos
- **Feedback Visual**: Indicadores claros de estado e progresso

### ⚙️ Configurações Avançadas
- **Modo de Simulação**: Teste sem consumir APIs reais
- **Pré-processamento de Imagens**: Optimização para melhor análise
- **Configurações de Rede**: Gestão de conexão e timeout

## 🏗️ Arquitectura do Projecto

### Estrutura de Directorias
```
src/
├── components/           # Componentes React
│   ├── detection/        # Componentes de detecção
│   ├── history/          # Componentes de histórico
│   ├── home/             # Componentes da tela inicial
│   └── common/           # Componentes partilhados
├── screens/              # Telas da aplicação
├── services/             # Serviços e APIs
├── hooks/                # Custom hooks React
├── navigation/           # Configuração de navegação
├── styles/              # Estilos e temas
├── types/               # Tipos TypeScript
└── utils/               # Utilitários diversos
```

### Tecnologias Utilizadas
- **React Native** - Framework mobile
- **TypeScript** - Tipagem estática
- **Expo** - Desenvolvimento e build
- **React Navigation** - Navegação entre telas
- **Async Storage / MMKV** - Armazenamento local
- **Axios** - Comunicação HTTP
- **PlantNet API** - Identificação de plantas
- **Kindwise API** - Diagnóstico de doenças

## 🔧 Configuração do Ambiente

### Pré-requisitos
- Node.js 24+
- npm ou yarn
- Expo CLI
- EAS CLI
- Android Studio / Xcode (para emuladores) (opcional)

### Instalação
```bash
# Clone o repositório
git clone https://github.com/justino-code/detector
cd detector

# Instale as dependências
npm install
# ou
yarn install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com as suas chaves de API
```

### Configuração de Chaves de API
```env
EXPO_PUBLIC_PLANTNET_API_KEY=sua_chave_aqui
EXPO_PUBLIC_KINDUISE_API_KEY=sua_chave_aqui
```

### Execução
```bash
# Desenvolvimento
npm start
# ou
yarn start

# Build para Android
npm run build:android

# Build para iOS
npm run build:ios
```

## 📱 Telas da Aplicação

### 🏠 Tela Inicial
- Visão geral das funcionalidades
- Actividade recente
- Acções rápidas (nova análise, histórico)

### 🔍 Tela de Detecção
- Captura/upload de imagem
- Processamento em tempo real
- Visualização de resultados

### 📚 Tela de Histórico
- Lista de análises realizadas
- Filtros por estado
- Estatísticas de uso
- Gestão de favoritas

### ⚙️ Tela de Configurações
- Tema (claro/escuro)
- Modo de simulação
- Limpeza de dados
- Sobre a aplicação

## 🧪 Testes e Simulação

### Modo de Simulação
Habilite o modo de simulação para desenvolvimento sem chaves de API:
```typescript
// Em configurações ou via variável de ambiente
DetectionService.setSimulationMode(true);
```

### Testes de Componentes
```bash
# Execute os testes
npm test
# ou
yarn test
```

## 📊 Integração com APIs

### PlantNet API
- Identificação de espécies vegetais
- Taxonomia e informações científicas
- Nomes comuns em múltiplos idiomas

### PlantNet Disease API
- Diagnóstico de doenças
- Probabilidade de problemas

## 🛠️ Desenvolvimento

### Convenções de Código
- **Componentes**: PascalCase (ex: `RecentActivity.tsx`)
- **Funções**: camelCase (ex: `handleActivityPress`)
- **Tipos**: PascalCase com sufixo (ex: `HistoryItem`)
- **Hooks**: Prefixo 'use' (ex: `useTheme`)

### Padrões de Commit
```bash
feat: nova funcionalidade
fix: correcção de bug
docs: documentação
style: formatação de código
refactor: refactorização de código
test: adição de testes
```

### Build e Deploy
```bash
# Build para produção
eas build --platform android --profile production
eas build --platform ios --profile production

# Publicar no Expo
expo publish
```

## 📚 Documentação Adicional

### APIs Externas
- [PlantNet Documentation](https://my.plantnet.org/doc/)
- [Kindwise API Docs](https://kindwise.com/api-docs)

### Bibliotecas Utilizadas
- [React Navigation](https://reactnavigation.org/)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [React Native Vector Icons](https://github.com/oblador/react-native-vector-icons)

### Fluxo de Trabalho
1. Criar branch para feature/bugfix
3. Revisão de código
4. Merge na branch principal

## 📄 Licença
Este projecto está licenciado sob a Licença Apache2 - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos
- Professores da disciplina de Computação Móvel
- APIs PlantNet por disponibilizarem seus serviços

---
**Desenvolvido com ❤️ pela equipa de PlantaVigia team 2025/2026 - ISPI (Lubango)**