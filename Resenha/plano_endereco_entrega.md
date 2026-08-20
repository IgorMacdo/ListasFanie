# Plano de Implementação: Endereço de Entrega para Compras via Link

Este plano detalha como adicionar um campo editável no painel administrativo para que o casal configure o endereço de entrega, o qual será exibido no modal de presentes para os convidados que escolherem a opção "Link de Compra".

## 🎯 Objetivo
Facilitar o envio de presentes comprados pela internet:
1. Criar uma nova coluna `delivery_note` na tabela `event_settings` do Supabase.
2. Adicionar o input correspondente no painel de administração em **"Informações do Convite"**.
3. Passar esse endereço de entrega dinâmico para o `ReservationModal` e exibi-lo quando o convidado selecionar a opção "Link de Compra" no Passo 2.

---

## 🛠️ Alterações Propostas

### 1. Script SQL de Migração (Supabase)
O usuário precisará executar o seguinte código no **SQL Editor** do Supabase para adicionar a nova coluna com um valor inicial padrão:

```sql
-- Adiciona a coluna de observação de entrega na tabela de configurações
alter table event_settings 
add column delivery_note text default 'Envie para o nosso endereço: Rua Alegre, 123 - Centro, Joinville - SC - CEP 89201-000';
```

### 2. Atualizar Definição do Tipo
#### [MODIFY] [src/types/index.ts](file:///home/igor/Projects/ListasDaSilva/src/types/index.ts)
Adicionar o campo `delivery_note` na interface `EventSettings`:
```typescript
export interface EventSettings {
  id: number;
  couple_names: string;
  description: string;
  event_date: string;
  date_display: string;
  time_display: string;
  location_name: string;
  location_address: string;
  image_url: string;
  delivery_note?: string; // <-- Novo campo opcional
}
```

### 3. Atualizar o Modal de Reserva
#### [MODIFY] [src/components/ReservationModal.tsx](file:///home/igor/Projects/ListasDaSilva/src/components/ReservationModal.tsx)
- Adicionar `deliveryNote?: string` às propriedades do componente (`ReservationModalProps`).
- No bloco condicional `{contributionType === 'link' && (...)}` do Passo 2, exibir uma caixa com as instruções do endereço de entrega recebidas pela propriedade.

```tsx
{contributionType === 'link' && (
  <div className="border border-slate-100 rounded-3xl bg-slate-50/70 p-5 mt-4 shadow-sm animate-fade-in text-left space-y-3">
    {/* ... link do produto ... */}
    
    {deliveryNote && (
      <div className="bg-amber-50/50 border border-pastel-yellow/30 rounded-2xl p-4 text-xs text-slate-700 mt-2">
        <span className="font-bold text-amber-800 block mb-1">📍 Endereço de Entrega:</span>
        <p className="leading-relaxed font-medium">{deliveryNote}</p>
      </div>
    )}
  </div>
)}
```

### 4. Integrar o Endereço no Componente Principal
#### [MODIFY] [src/app/page.tsx](file:///home/igor/Projects/ListasDaSilva/src/app/page.tsx)
- Atualizar o `DEFAULT_SETTINGS` para incluir um valor inicial padrão para `delivery_note`.
- Passar a propriedade `deliveryNote={settings.delivery_note}` no JSX onde renderizamos o `<ReservationModal />`.

### 5. Atualizar o Painel Administrativo
#### [MODIFY] [src/app/admin/dashboard/page.tsx](file:///home/igor/Projects/ListasDaSilva/src/app/admin/dashboard/page.tsx)
- Atualizar o `DEFAULT_SETTINGS` local para conter o endereço padrão de fallback.
- Adicionar um campo `<textarea>` no formulário de **"Informações do Convite"** mapeando o valor de `eventSettings.delivery_note`.
- Salvar o novo campo na chamada `handleUpdateSettings`.

---

## 🧪 Plano de Verificação

### Verificação Manual
1. **Administração:**
   - Acesse o painel de admin (`/admin/dashboard`).
   - Altere a observação do endereço no novo campo e clique em salvar.
2. **Página Inicial:**
   - Acesse a página inicial pública (`/`).
   - Clique em **Reservar** em qualquer presente, preencha a identificação no Passo 2 e selecione "Link de Compra".
   - O endereço personalizado cadastrado pelo admin deve aparecer abaixo do link de forma clara.
