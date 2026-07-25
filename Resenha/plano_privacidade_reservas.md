# Plano de Implementação: Privacidade nas Reservas (Apenas Admin vê quem escolheu)

Este plano descreve as alterações para ocultar os nomes dos convidados que reservaram presentes dos outros visitantes da página inicial, mantendo essa informação exclusiva para os administradores no painel de controle.

## 🎯 Objetivo
Garantir a privacidade dos convidados no site público:
- Os convidados comuns devem visualizar que um item está **"Reservado"** ou **"Já Escolhido"**, mas **não** devem saber quem o reservou.
- Somente usuários autenticados no Painel Administrativo (`/admin/dashboard`) poderão visualizar o nome do padrinho/convidado, telefone e método de contribuição selecionado.

---

## 🛠️ Alterações Propostas

### Componente `GiftCard`
#### [MODIFY] [GiftCard.tsx](file:///home/igor/Projects/ListasDaSilva/src/components/GiftCard.tsx)

Vamos alterar a renderização do bloco de detalhes da reserva. Atualmente, ele mostra `Escolhido por: {reserved_by}` para qualquer visitante. Vamos condicionar a exibição do nome do convidado à propriedade `isAdmin`.

**Antes:**
```tsx
        {is_reserved && reserved_by && (
          <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 border border-slate-100 space-y-1">
            <div>Escolhido por: <span className="font-semibold text-slate-800">{reserved_by}</span></div>
            {isAdmin && gift.reserved_phone && (
              <div>Celular: <span className="font-semibold text-slate-800">{gift.reserved_phone}</span></div>
            )}
            {isAdmin && gift.contribution_type && (
              <div>Forma: <span className="font-semibold text-slate-800">{gift.contribution_type === 'qrcode' ? 'QR Code / Pix 📳' : 'Link de Compra 🔗'}</span></div>
            )}
          </div>
        )}
```

**Depois:**
```tsx
        {is_reserved && (
          <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 border border-slate-100 space-y-1">
            {isAdmin && reserved_by ? (
              <div>Escolhido por: <span className="font-semibold text-slate-800">{reserved_by}</span></div>
            ) : (
              <div className="font-medium text-slate-400 italic">🎁 Este item já foi reservado!</div>
            )}
            {isAdmin && gift.reserved_phone && (
              <div>Celular: <span className="font-semibold text-slate-800">{gift.reserved_phone}</span></div>
            )}
            {isAdmin && gift.contribution_type && (
              <div>Forma: <span className="font-semibold text-slate-800">{gift.contribution_type === 'qrcode' ? 'QR Code / Pix 📳' : 'Link de Compra 🔗'}</span></div>
            )}
          </div>
        )}
```

---

## 🧪 Plano de Verificação

### Verificação Manual
1. **Página de Convidados (`/`):**
   - Acesse o site principal localmente (`http://localhost:3000`).
   - Reserve um item de teste.
   - O item deve receber a marcação visual de "RESERVADO" e, no texto abaixo do card, deve constar apenas: *"🎁 Este item já foi reservado!"* (sem revelar o nome inserido no formulário).
2. **Painel do Administrador (`/admin/dashboard`):**
   - Faça login no painel administrativo (`http://localhost:3000/admin/login`).
   - O mesmo item reservado no passo anterior deve mostrar:
     - O nome do convidado (*Escolhido por: [Nome]*).
     - O celular do convidado (*Celular: [Telefone]*).
     - A forma de contribuição (*Forma: QR Code / Pix 📳* ou *Link de Compra 🔗*).
