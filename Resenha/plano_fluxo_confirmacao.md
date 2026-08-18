# Plano de Implementação: Reorganização do Fluxo de Confirmação de Reserva

Este plano detalha as alterações no modal de reservas (`ReservationModal`) para mover a exibição da chave Pix e do QR Code do Passo 1 para o Passo 2, exibindo-os somente após o convidado se identificar e escolher a forma de contribuição.

## 🎯 Objetivo
Melhorar a usabilidade e o fluxo do site de casamentos:
1. **Passo 1 (Escolha do Item):** Apresentar a descrição inicial e o link de compra online de referência (se existir). Remover a seção de Pix/QR Code daqui.
2. **Passo 2 (Identificação e Pagamento):** O convidado informa o Nome e Celular. Ao selecionar a opção de contribuição desejada (via botões de rádio):
   - Se escolher **QR Code / Pix**, exibe o QR Code e a chave Pix celular abaixo do formulário.
   - Se escolher **Link de Compra**, exibe o link do produto para compra (ou aviso de compra livre) abaixo do formulário.

---

## 🛠️ Alterações Propostas

### Modal de Reserva
#### [MODIFY] [src/components/ReservationModal.tsx](file:///home/igor/Projects/ListasDaSilva/src/components/ReservationModal.tsx)

Substituiremos a estrutura dos passos 1 e 2 no JSX do modal:

**Passo 1 (Linhas 117-183):**
- Remover o bloco com o SVG do QR Code e a chave Pix celular static.
- Manter o texto de instruções e a exibição do link de referência do produto (se houver).

**Passo 2 (Linhas 186-294):**
- Manter os campos de Nome, Celular e a escolha (radio buttons) de contribuição.
- Adicionar um bloco condicional:
  - Se `contributionType === 'qrcode'`, exibe o QR Code e a chave Pix para o convidado fazer a transferência naquele momento.
  - Se `contributionType === 'link'`, exibe o link do produto com botão de redirecionamento.

---

## 🧪 Plano de Verificação

### Verificação Manual
1. **Acessar o Modal (Passo 1):**
   - Na página inicial do site, selecione um presente e clique em **Reservar**.
   - No **Passo 1**, confirme que a chave Pix e o QR Code **não** estão mais aparecendo. Apenas os textos informativos e o link de compras online (se aplicável) devem ser exibidos.
   - Clique em **Avançar**.
2. **Identificação e Opção Pix (Passo 2):**
   - O modal pedirá Nome e Celular. A opção padrão de contribuição deve ser "QR Code / Pix".
   - Confirme que o QR Code e a chave Pix `(47) 98765-4321` aparecem destacados no Passo 2.
3. **Opção Link de Compra (Passo 2):**
   - Mude a opção de rádio para "Link de Compra".
   - O QR Code deve sumir e o link para abrir a loja do produto deve aparecer no lugar.
