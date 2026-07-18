# Plano de Desenvolvimento: Lista de Presentes Chá de Revelação (Real-time)

Este documento descreve o plano detalhado de implementação para um aplicativo de lista de presentes de chá de revelação em tempo real utilizando **Next.js** (Frontend & Backend) e **Supabase** (Banco de Dados, Autenticação e Storage de Imagens).

---

## 💡 Skills Recomendadas para Desenvolvimento (Antigravity)
Ao delegar este plano a um assistente de IA, recomenda-se a utilização/leitura das seguintes skills presentes no projeto para acelerar e garantir a qualidade do desenvolvimento:
*   **[frontend-design](file:///home/igor/Projects/InovaMente/.agents/skills/frontend-design/SKILL.md):** Para guiar a estética visual premium, paleta de cores e tipografia fina.
*   **[premium-ux-animations](file:///home/igor/Projects/InovaMente/.agents/skills/premium-ux-animations/SKILL.md):** Para implementar transições fluidas e efeitos de micro-interações ao reservar presentes.
*   **[progressive-disclosure-patterns](file:///home/igor/Projects/InovaMente/.agents/skills/progressive-disclosure-patterns/SKILL.md):** Para os modais de confirmação e sistema de abas de filtragem.
*   **[minimalist-dashboard-design](file:///home/igor/Projects/InovaMente/.agents/skills/minimalist-dashboard-design/SKILL.md):** Para estruturar a interface do painel administrativo da organizadora de forma limpa.

---

## 🛠️ Stack Tecnológica Recomendada

*   **Frontend & Framework:** React com Next.js (App Router, 100% configurado em **TypeScript**)
*   **Estilização:** CSS Vanilla ou Tailwind CSS (foco em design premium, glassmorfismo e transições suaves)
*   **Backend & DB:** Supabase (PostgreSQL)
    *   **Supabase Realtime:** Para sincronização instantânea das reservas.
    *   **Supabase Storage:** Para hospedar as fotos dos presentes.
    *   **Supabase Auth:** Para login administrativo da organizadora.
*   **Hospedagem:** Vercel (gratuito, associado ao repositório GitHub)

---

## 🗄️ Modelagem do Banco de Dados (Supabase)

### Tabela `gifts`
Tabela principal para armazenar os itens da lista.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Identificador único do presente (gerado automaticamente) |
| `name` | `VARCHAR` | Nome do item (ex: "Fralda P", "Banheira") |
| `description` | `TEXT` | Observações opcionais (ex: "Sugestão de cor: Branco") |
| `image_url` | `TEXT` | URL pública da imagem salva no Storage |
| `is_reserved` | `BOOLEAN` | Define se o item já foi escolhido (padrão: `false`) |
| `reserved_by` | `VARCHAR` | Nome do convidado que reservou o item (nulo se disponível) |
| `reserved_at` | `TIMESTAMP` | Data e hora em que a reserva foi feita |
| `created_at` | `TIMESTAMP` | Data de criação do item |

---

## 🗺️ Etapas de Desenvolvimento (Passo a Passo)

### Passo 1: Inicialização e Configuração
1. Criar um novo projeto Next.js:
   ```bash
   npx create-next-app@latest cha-revelacao --typescript --tailwind --app --src-dir
   ```
2. Instalar o cliente do Supabase:
   ```bash
   npm install @supabase/supabase-js
   ```
3. Configurar as variáveis de ambiente no arquivo `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=seu_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
   ```
4. Criar o cliente do Supabase em `src/lib/supabase.ts`.

### Passo 2: Estrutura da Página Pública (Convidados)
1. **Layout principal:** Criar uma página elegante com tema neutro/revelação (gradientes suaves de rosa, azul e dourado/areia).
2. **Grid de Presentes:** Listar os itens obtidos da tabela `gifts`.
3. **Filtros (Abas):** 
   *   "Todos os Presentes"
   *   "Disponíveis" (onde o botão de reservar fica ativo)
   *   "Reservados" (onde os cards ganham um tom cinza e mostram "Reservado por [Nome]")
4. **Modal de Confirmação:** Ao clicar em "Reservar", abrir um modal solicitando o nome do convidado. Ao enviar, atualizar o banco usando:
   ```typescript
   await supabase
     .from('gifts')
     .update({ is_reserved: true, reserved_by: guestName, reserved_at: new Date() })
     .eq('id', giftId);
   ```

### Passo 3: Implementação do Real-Time
1. No componente da listagem de presentes, assinar os eventos de alteração da tabela `gifts` via Supabase Realtime:
   ```typescript
   useEffect(() => {
     const channel = supabase
       .channel('schema-db-changes')
       .on(
         'postgres_changes',
         { event: '*', schema: 'public', table: 'gifts' },
         (payload) => {
           // Atualizar o estado local dos presentes na tela instantaneamente
           handleDatabaseChange(payload);
         }
       )
       .subscribe();

     return () => {
       supabase.removeChannel(channel);
     };
   }, []);
   ```

### Passo 4: Autenticação Administrativa
1. Criar uma rota `/admin/login` com formulário simples de email/senha usando `supabase.auth.signInWithPassword`.
2. Criar uma rota `/admin/dashboard` protegida por Middleware do Next.js (redirecionar para `/admin/login` se não autenticado).

### Passo 5: Painel de Controle (Admin)
Na página `/admin/dashboard`, dar autonomia total para a organizadora:
1. **Formulário de Cadastro:**
   *   Campos: Nome do presente e Observação.
   *   **Upload de Imagem:** Um input tipo file. O arquivo é enviado para o bucket de Storage do Supabase (`gift-images`) e a URL pública gerada é gravada no campo `image_url` da tabela `gifts`.
2. **Tabela de Gerenciamento:**
   *   Listar todos os presentes cadastrados.
   *   Mostrar quem reservou e quando.
   *   Botão **"Liberar Reserva"** (atualiza `is_reserved` para `false` e limpa o nome).
   *   Botão **"Excluir"** (deleta o registro e remove a imagem associada no Storage).

---

## 🎨 Diretrizes de UI/UX (Design Premium)
*   **Tipografia:** Usar fontes modernas e delicadas (ex: *Outfit* ou *Playfair Display* via Google Fonts).
*   **Cores:** Evitar rosa/azul neon. Optar por tons pastel sofisticados (azul brisa, rosa blush, beige areia e branco).
*   **Micro-interações:**
    *   Efeito de escala suave nos cards de presentes ao passar o mouse.
    *   Transição suave (fade-in) nos modais.
    *   Efeito de vidro fosco (*glassmorphism*) no cabeçalho e nos modais utilizando `backdrop-blur`.

---

## 🚀 Checklist para Lançamento
- [ ] Criar o projeto no Supabase e rodar os scripts SQL.
- [ ] Configurar o Storage público para as imagens.
- [ ] Habilitar o "Realtime" na tabela `gifts`.
- [ ] Desenvolver as páginas `/` e `/admin`.
- [ ] Configurar regras de segurança (RLS - Row Level Security) no Supabase para impedir que convidados editem itens alheios.
- [ ] Subir o código no GitHub.
- [ ] Conectar o GitHub à Vercel e adicionar as variáveis de ambiente.
- [ ] Testar em tempo real usando dois navegadores/dispositivos diferentes simultaneamente.
