# Plano de Implementação: Edição de Informações do Evento (Convite e Detalhes)

Este plano descreve como permitir que o casal edite as informações da página inicial (Nomes, Convite, Data, Hora, Local e Contagem Regressiva) diretamente através do Painel Administrativo.

## 🎯 Objetivo
Dar autonomia total para a organizadora/casal alterarem os dados do convite sem mexer no código:
1. Criar uma nova tabela no Supabase (`event_settings`) para salvar as configurações.
2. Adicionar uma nova seção no Painel Administrativo (`/admin/dashboard`) para editar esses campos e enviar uma nova foto de convite.
3. Carregar dinamicamente as informações do banco na Página Inicial (`/`), mantendo os dados atuais de Sthefanie & Daniel como valores padrão (*fallback*) caso a tabela esteja vazia ou em modo demonstrativo.

---

## 🗄️ Modelagem do Banco (Supabase)

Criaremos uma tabela simples de configuração chamada `event_settings`. Ela terá apenas **uma linha** (ID 1) para armazenar os dados globais.

### Tabela `event_settings`
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `INTEGER` (PK) | Sempre `1` (garante linha única) |
| `couple_names` | `TEXT` | Nomes exibidos (ex: "Sthefanie & Daniel") |
| `description` | `TEXT` | Texto de boas-vindas do topo |
| `event_date` | `TIMESTAMP` | Data/hora exata (usado no relógio regressivo) |
| `date_display` | `TEXT` | Texto legível da data (ex: "14 Set") |
| `time_display` | `TEXT` | Texto legível da hora (ex: "15:00h") |
| `location_name` | `TEXT` | Nome do local resumido (ex: "Joinville") |
| `location_address` | `TEXT` | Endereço completo para o convite |
| `image_url` | `TEXT` | URL pública da imagem do convite |

---

## 🛠️ Alterações Propostas

### 1. Script SQL de Migração (Supabase)
O casal precisará executar este código no **SQL Editor** do Supabase para criar a tabela e liberar o acesso público de leitura:

```sql
-- Criar tabela de configurações do evento
create table event_settings (
  id integer primary key default 1 check (id = 1),
  couple_names text not null default 'Sthefanie & Daniel',
  description text default 'Venha celebrar conosco e conhecer nosso novo lar! Escolha um item abaixo na lista de presentes para nos ajudar a montar nossa casa.',
  event_date timestamp with time zone default '2026-09-14T15:00:00-03:00'::timestamp with time zone,
  date_display text default '14 Set',
  time_display text default '15:00h',
  location_name text default 'Joinville',
  location_address text default 'Rua Alegre, 123, Joinville - SC',
  image_url text default '/convite.png'
);

-- Inserir os valores iniciais padrão
insert into event_settings (id) values (1) on conflict (id) do nothing;

-- Habilitar leitura pública para os convidados
grant select on public.event_settings to anon, authenticated, service_role;

-- Habilitar alteração para o painel admin
grant insert, update on public.event_settings to anon, authenticated, service_role;
```

### 2. Definição do Tipo no Frontend
#### [MODIFY] [src/types/index.ts](file:///home/igor/Projects/ListasDaSilva/src/types/index.ts)
Adicionar a interface das configurações:
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
}
```

### 3. Painel Administrativo
#### [MODIFY] [dashboard/page.tsx](file:///home/igor/Projects/ListasDaSilva/src/app/admin/dashboard/page.tsx)
- Adicionar estado para gerenciar o formulário de configurações do evento.
- Buscar as configurações atuais ao carregar a página.
- Criar a função `handleUpdateSettings` para atualizar os dados usando `supabase.from('event_settings').upsert(...)`.
- Se uma nova imagem for enviada pelo formulário, faremos o upload dela para o bucket `gift-images` e salvaremos o link.
- Adicionar uma nova aba ou seção de formulário na interface visual: **"📝 Informações do Convite"**.

### 4. Página Inicial
#### [MODIFY] [src/app/page.tsx](file:///home/igor/Projects/ListasDaSilva/src/app/page.tsx)
- Criar estado para guardar as configurações dinâmicas do evento.
- Fazer a busca `supabase.from('event_settings').select('*').eq('id', 1).single()` ao carregar a página.
- Caso ocorra algum erro (ou esteja em modo demonstrativo), utilizar o estado inicial com os dados hardcoded atuais (Sthefanie & Daniel, 14 de Setembro, etc.) de forma transparente.
- Substituir todos os textos do topo pelo conteúdo dinâmico do estado.

---

## 🧪 Plano de Verificação

### Verificação Manual
1. **Verificação do Admin:**
   - Acesse o painel admin e preencha o novo formulário alterando os nomes para "Sthefanie & Igor", a data legível para "20 Set" e envie uma nova imagem de teste.
   - Clique em salvar. A alteração deve ser gravada com sucesso.
2. **Verificação da Página Inicial:**
   - Acesse a página inicial (`http://localhost:3000`).
   - A imagem, os nomes de cabeçalho, a contagem regressiva e os detalhes do evento devem ter atualizado automaticamente de acordo com o formulário salvo no admin.
