# Plano de Implementação: Edição de Presentes no Painel Admin

Este plano detalha como adicionar a funcionalidade de editar um presente existente diretamente no Painel Administrativo.

## 🎯 Objetivo
Evitar que a organizadora precise excluir e cadastrar novamente um presente caso cometa um erro de digitação, link ou queira trocar a imagem:
1. Adicionar um botão de editar (`✏️`) no card de cada produto no painel de administração.
2. Reaproveitar o formulário de cadastro lateral do admin para atuar como formulário de edição quando um presente for selecionado para editar.
3. Permitir atualizar textos, link de compra e a imagem do presente (fazendo upload da nova foto se necessário e mantendo a anterior caso nenhuma nova imagem seja fornecida).

---

## 🛠️ Alterações Propostas

### 1. Atualizar o Componente `GiftCard`
#### [MODIFY] [src/components/GiftCard.tsx](file:///home/igor/Projects/ListasDaSilva/src/components/GiftCard.tsx)
- Adicionar uma nova propriedade opcional: `onEdit?: (gift: Gift) => void`.
- Quando `isAdmin` for verdadeiro, exibir um botão azul com o ícone de lápis (`✏️`) ao lado do botão de excluir (`🗑️`).

```tsx
// Na definição das propriedades:
interface GiftCardProps {
  gift: Gift;
  onReserve: (gift: Gift) => void;
  isAdmin?: boolean;
  onRelease?: (giftId: string) => void;
  onDelete?: (giftId: string) => void;
  onEdit?: (gift: Gift) => void; // <-- Nova propriedade
}

// Na renderização das ações do admin:
<button
  onClick={() => onEdit && onEdit(gift)}
  className="rounded-xl bg-blue-50 px-3 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
  title="Editar presente"
>
  ✏️
</button>
```

### 2. Atualizar o Painel Admin (`AdminDashboard`)
#### [MODIFY] [src/app/admin/dashboard/page.tsx](file:///home/igor/Projects/ListasDaSilva/src/app/admin/dashboard/page.tsx)
- Adicionar um estado `editingGift` de tipo `Gift | null` para controlar se estamos editando um item.
- Criar a função `handleEditClick(gift)` que:
  - Define `editingGift` como o presente selecionado.
  - Preenche os campos do formulário (`name`, `description`, `buyLink`) com os dados do presente.
  - Reseta o input de arquivo de imagem (`imageFile` = null).
- Criar a função `handleCancelEdit()` para limpar o formulário e voltar ao modo de cadastro.
- Atualizar a função de envio para tratar ambos os modos:
  - Se `editingGift` for nulo: executa a criação normal.
  - Se `editingGift` tiver um objeto: executa um `update` no Supabase (ou LocalStorage no modo demo) e limpa o estado.

---

## 🧪 Plano de Verificação

### Verificação Manual
1. **Ativar o Modo de Edição:**
   - No painel administrativo (`/admin/dashboard`), clique no ícone de lápis (`✏️`) em qualquer presente cadastrado.
   - O título do formulário lateral deve mudar para **"✏️ Editar Presente"**.
   - Os campos do formulário devem ser preenchidos automaticamente com o Nome, Descrição e Link do presente selecionado.
2. **Cancelar Edição:**
   - Clique em **"Cancelar"** no formulário. Ele deve ser limpo e o título deve voltar para **"➕ Cadastrar Presente"**.
3. **Salvar Alteração:**
   - Clique em editar em um produto, altere o nome e o link de compra, e clique em **"Salvar Alterações"**.
   - O card na listagem deve ser atualizado na mesma hora sem duplicar o item.
   - Verifique se a mudança também refletiu no site público.
