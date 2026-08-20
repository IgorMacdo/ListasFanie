# Plano de Ajuste: Compactação do Checkout Pix no Modal e Responsividade

Este plano descreve como tornar a tela de checkout Pix no modal mais compacta ("menos agressiva") e garantir a responsividade em dispositivos móveis, resolvendo o bug de rolagem.

## 🎯 Objetivo
1. Impedir que o modal trave a tela ou impeça a rolagem (scroll) de campos de formulário superiores (Nome e Telefone).
2. Deixar a réplica do cartão de pagamento Pix mais compacta e clean, reduzindo espaçamentos e dimensões.
3. Adicionar rolagem vertical interna ao modal principal (`max-h-[90vh] overflow-y-auto`) para que funcione perfeitamente em telas pequenas e celulares.

---

## 🛠️ Alterações Propostas

### 1. Responsividade do Modal Principal
#### [MODIFY] [src/components/ReservationModal.tsx](file:///home/igor/Projects/ListasDaSilva/src/components/ReservationModal.tsx)
- No container principal do modal, alterar a classe `overflow-hidden` para `max-h-[90vh] overflow-y-auto`.
  - Isso garante que se o modal ficar maior do que a tela, uma barra de rolagem aparecerá permitindo alcançar os campos de cima e de baixo.

### 2. Compactação do Bloco Pix
- **Bloco Roxo:**
  - Reduzir padding de `p-6` para `p-4`.
  - Reduzir tamanho da imagem do QR Code de `h-32 w-32` (128px) para `h-20 w-20` (80px), que continua perfeitamente legível para escaneamento.
  - Ajustar fonte do título para `text-sm font-bold`.
  - Simplificar e reduzir o subtexto para uma linha pequena (`text-[10px] text-white/80`).
  - Reduzir o botão de cópia do QR Code: padding vertical menor (`py-2`) e tamanho da fonte menor (`text-[11px]`).
- **Bloco Branco (Dados da Conta):**
  - Reduzir padding de `p-5` para `p-3.5`.
  - Reduzir o espaçamento entre as linhas da tabela Pix (`space-y-2`).
  - Reduzir tamanho dos textos de `text-xs` para `text-[11px]` e labels para `text-[9px]`.

---

## 🧪 Plano de Verificação

1. **Compilação:** Executar `npm run build` localmente.
2. **Teste em Resolução Mobile (Simulação):**
   - Abrir o modal no Passo 2 com o Pix selecionado.
   - Reduzir a altura da janela do navegador.
   - Certificar-se de que a barra de rolagem interna do modal aparece e que é possível rolar até o topo para editar o Nome e o Celular.
   - Confirmar se o QR Code ficou compacto e elegante.
