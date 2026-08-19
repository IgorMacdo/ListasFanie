# Plano de Implementação: Réplica da Tela de Pagamento Pix (Nubank Style)

Este plano descreve como replicar a interface de checkout Pix do Nubank dentro do modal de reservas, exibindo o QR Code real, o botão de copiar código copia-e-cola e as informações da conta.

## 🎯 Objetivo
Oferecer uma experiência de pagamento profissional e transparente para o convidado:
1. Substituir a exibição simples do Pix no Passo 2 do modal por uma réplica da tela Nubank (`PixPix.png`).
2. Adicionar o QR Code real do casal (`QRCode.jpg`).
3. Adicionar botões interativos para copiar o código Pix "copia-e-cola" e a chave e-mail Pix.
4. Exibir detalhes de titularidade: Nome completo, banco, CPF mascarado e identificador da transação.

---

## 🛠️ Alterações Propostas

### 1. Preparação de Mídia
- Já copiamos o arquivo de imagem do QR Code (`QRCode.jpg`) da pasta da resenha para a pasta pública do Next.js: `public/QRCode.jpg`. Desta forma, o navegador conseguirá renderizá-lo como `/QRCode.jpg`.

### 2. Atualizar o Modal de Reserva
#### [MODIFY] [src/components/ReservationModal.tsx](file:///home/igor/Projects/ListasDaSilva/src/components/ReservationModal.tsx)
- Adicionar estados de feedback para cópia realizada com sucesso:
  - `copiedCode`: para o código copia-e-cola.
  - `copiedKey`: para a chave e-mail.
- Criar métodos `handleCopyCode` e `handleCopyKey` utilizando a API da área de transferência (`navigator.clipboard.writeText`).
- Substituir o bloco condicional de Pix/QR Code no Passo 2 (`contributionType === 'qrcode'`) pelo design Nubank:
  - Um bloco roxo (`bg-[#7C1AEC]`) com cantos arredondados contendo a instrução, o QR Code em um quadrado branco, o valor simbólico `R$ 0,00` e o botão de copiar o código copia-e-cola.
  - Um bloco branco inferior contendo a chave Pix e os dados da conta (Titular, CPF mascarado, Banco e Identificador) em formato de lista chave-valor com alinhamento profissional.

---

## 🧪 Plano de Verificação

### Verificação Manual
1. **Fluxo do Convidado:**
   - Acesse a página inicial do site, selecione um presente e vá até o Passo 2 do modal.
   - Preencha Nome e Celular, e mantenha "QR Code / Pix" selecionado.
2. **Visual da Tela de Pagamento:**
   - O novo cartão roxo e branco deve aparecer abaixo das opções.
   - Verifique se a imagem `/QRCode.jpg` está carregando com alta nitidez no centro do quadrado branco.
   - Verifique se o valor `R$ 0,00` e os textos de instrução estão centralizados.
3. **Cópia do Código Copia-e-Cola:**
   - Clique em **"Copiar código do QR Code"**.
   - O texto do botão deve mudar para **"Código Copiado! ✅"** por 2 segundos.
   - Cole o conteúdo em um bloco de notas para certificar que o código Pix longo foi copiado corretamente.
4. **Cópia da Chave E-mail:**
   - No bloco inferior, clique no botão de copiar ao lado da chave e-mail.
   - O e-mail `faniieoliveira2@gmail.com` deve ser copiado para a área de transferência e o ícone de feedback deve ser atualizado temporariamente.
