# 📅 Planejador de Agenda Interativo

Um planejador web interativo otimizado para iOS 14+ e Safari, com visualização semanal em formato de caderno, edição de anotações com marcação de cores seletiva e impressão profissional.

## ✨ Funcionalidades

### 📱 Visualização Semanal (Caderno)
- Layout em **2 colunas**: 4 dias à esquerda, 3 dias à direita
- **30 linhas visíveis** em cada dia (formato de caderno)
- **Sábados, domingos e feriados destacados em vermelho**
- Pré-visualização de anotações com cores mantidas
- Navegação entre semanas com botões ou gesto de arrastar

### ✏️ Edição Diária em Tela Cheia
- **30 linhas de texto livre** por dia
- **Paleta de 20 cores vibrantes** para marcação
- **Marcação seletiva**: aplicar cores apenas ao texto selecionado
- **Múltiplas cores na mesma linha**: cada palavra pode ter uma cor diferente
- Armazenamento local automático (localStorage)
- Interface limpa sem números de linha

### 📆 Visualização Mensal
- Calendário completo do mês
- Pré-visualização de anotações em cada dia
- Sábados, domingos e feriados destacados em vermelho
- Navegação entre meses

### 🖨️ Impressão Profissional
- **Impressão Diária**: A4 Retrato com 30 linhas
- **Impressão Semanal**: 7 páginas (um dia por página) em A4 Retrato
- **Impressão Mensal**: Calendário em A4 Paisagem
- Cores e marcações mantidas em todas as impressões
- Otimizado para caber em uma única folha A4
- Ajuste automático de fontes e layout

### 🎯 Compatibilidade
- ✅ iOS 14+ e Safari
- ✅ iPad Mini 4 e iPhone 17
- ✅ Suporte a notch e safe areas
- ✅ Responsivo para todos os tamanhos de tela
- ✅ Fonte Arial em toda a interface

## 🚀 Como Usar

### Instalação Local
1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/planejador_agenda.git
cd planejador_agenda
```

2. Abra o arquivo `index.html` no navegador:
```bash
# Usando Python 3
python3 -m http.server 3000

# Ou usando Node.js (http-server)
npx http-server -p 3000
```

3. Acesse em `http://localhost:3000`

### Uso no iPhone/iPad
1. Abra o Safari
2. Acesse a URL do seu servidor
3. Toque no botão de compartilhamento (↗️)
4. Selecione "Adicionar à Tela Inicial"
5. Nomeie como "Planejador"
6. Toque em "Adicionar"

### Funcionalidades Principais

#### Visualizar Semana
- Clique em "📅 Semanal" para ver a visão semanal
- Use os botões ‹ › para navegar entre semanas
- Arraste para esquerda/direita para mudar de semana

#### Editar Dia
- Clique em qualquer dia para abrir a edição
- Digite o texto nas 30 linhas
- Selecione o texto que deseja colorir
- Clique em uma cor para aplicar

#### Imprimir
- **Impressão Diária**: Abra um dia e clique em "🖨️ Imprimir"
- **Impressão Semanal**: Na visão semanal, clique em "🖨️ Imprimir Semana"
- **Impressão Mensal**: Clique em "📆 Mensal" e use a impressão do navegador

#### Cores
- Selecione o texto que deseja marcar
- Clique em uma das 20 cores vibrantes
- Você pode aplicar cores diferentes no mesmo texto

## 📁 Estrutura do Projeto

```
planejador_agenda/
├── index.html          # Estrutura HTML
├── styles.css          # Estilos responsivos
├── app.js              # Lógica da aplicação
├── .gitignore          # Arquivos ignorados pelo Git
└── README.md           # Este arquivo
```

## 🎨 Paleta de Cores

O planejador inclui 20 cores vibrantes:
- Vermelho, Laranja, Amarelo, Verde, Ciano
- Azul, Roxo, Magenta, Rosa, Verde Claro
- Laranja Escuro, Azul Claro, Vermelho Escuro, Turquesa, Rosa Claro
- Verde Limão, Laranja Queimado, Roxo Escuro, Verde Neon, Rosa Quente

## 💾 Armazenamento de Dados

Todos os dados são salvos localmente no seu dispositivo usando **localStorage**:
- Os dados persistem mesmo após fechar o navegador
- Não há sincronização com servidor (dados locais apenas)
- Você pode exportar/importar dados manualmente se necessário

## 🔧 Desenvolvimento

### Dependências
- Nenhuma! O projeto é puro HTML, CSS e JavaScript

### Navegadores Suportados
- Safari (iOS 14+)
- Chrome/Edge (versões recentes)
- Firefox (versões recentes)

### Customização
Você pode personalizar:
- **Cores**: Edite o array `COLORS` em `app.js`
- **Feriados**: Edite o array `FERIADOS_BRASIL` em `app.js`
- **Estilos**: Modifique `styles.css`

## 📋 Feriados Inclusos

O planejador inclui os seguintes feriados brasileiros:
- Ano Novo (01/01)
- Sexta-feira de Carnaval (02/13)
- Tiradentes (04/21)
- Dia do Trabalho (05/01)
- Independência (09/07)
- Nossa Senhora Aparecida (10/12)
- Finados (11/02)
- Consciência Negra (11/20)
- Natal (12/25)

## 🐛 Troubleshooting

### Dados não estão sendo salvos
- Verifique se o localStorage está habilitado no navegador
- Tente limpar o cache do navegador

### Impressão não cabe em uma folha
- Ajuste as margens da página antes de imprimir
- Use a opção "Reduzir" ou "Encolher para caber" no diálogo de impressão

### Cores não aparecem na impressão
- Verifique se a opção "Imprimir fundos" está habilitada
- Tente usar o modo "Impressão em cores"

## 📝 Licença

Este projeto é de código aberto e pode ser usado livremente.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se livre para:
- Reportar bugs
- Sugerir novas funcionalidades
- Fazer pull requests com melhorias

## 📧 Suporte

Para dúvidas ou sugestões, abra uma issue no repositório do GitHub.

---

**Desenvolvido com ❤️ para organização e produtividade**
