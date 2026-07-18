# Tutorial: Configuração de Plataformas para o Chá de Revelação

Este guia prático ensina passo a passo como configurar as ferramentas e plataformas necessárias para hospedar e rodar o projeto da Lista de Presentes do Chá de Revelação (Next.js + Supabase/Firebase + GitHub + Vercel/Netlify).

---

## ⚡ 1. Banco de Dados e Storage com Supabase (Recomendado)

O Supabase gerenciará o banco de dados dos presentes, as fotos (Storage) e as atualizações em tempo real.

### Passo 1.1: Criar Conta e Projeto
1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita (pode usar seu login do GitHub).
2. Clique em **New Project** (Novo Projeto).
3. Defina:
   *   **Name:** `cha-revelacao`
   *   **Database Password:** Crie uma senha forte (guarde-a bem!).
   *   **Region:** Escolha uma região próxima (ex: `South America (São Paulo)`).
4. Clique em **Create new project** e aguarde alguns minutos enquanto o banco de dados é criado.

### Passo 1.2: Criar a Tabela de Presentes (SQL Editor)
1. No menu lateral esquerdo, clique em **SQL Editor** (ícone `SQL`).
2. Clique em **New query**.
3. Copie, cole o código abaixo e clique em **Run** (Executar):
   ```sql
   -- Criar a tabela de presentes
   create table gifts (
     id uuid default gen_random_uuid() primary key,
     name text not null,
     description text,
     image_url text,
     is_reserved boolean default false,
     reserved_by text,
     reserved_at timestamp with time zone,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Habilitar o sistema de tempo real (Realtime) na tabela
   alter publication supabase_realtime add table gifts;
   ```

### Passo 1.3: Ativar o Realtime no Painel do Supabase
1. No menu lateral, acesse **Database** -> **Replication** (ou procure pela aba Realtime).
2. Certifique-se de que a replicação para a tabela `gifts` está marcada como **Active**. Isso permite que o Next.js ouça as mudanças de estado instantaneamente.

### Passo 1.4: Configurar o Storage para Imagens
1. No menu lateral, clique em **Storage** (ícone de balde/disco).
2. Clique em **New Bucket** (Novo Balde).
3. Defina:
   *   **Name:** `gift-images`
   *   **Public Bucket:** **ATIVADO** (marcar como público para que os convidados possam ver as imagens das fotos).
4. Clique em **Save**.

### Passo 1.5: Obter as Chaves de Acesso
1. Vá em **Project Settings** (ícone de engrenagem) -> **API**.
2. Copie os valores de:
   *   `Project URL` (será seu `NEXT_PUBLIC_SUPABASE_URL`)
   *   `anon public` (será seu `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

---

## 🔥 2. Alternativa: Banco de Dados com Firebase

Se preferir o ecossistema do Google Firebase:

### Passo 2.1: Criar o Projeto
1. Acesse o [console do Firebase](https://console.firebase.google.com/).
2. Clique em **Adicionar projeto** e dê o nome de `cha-revelacao`.
3. Desative o Google Analytics para simplificar e crie o projeto.

### Passo 2.2: Configurar o Firestore Database
1. No menu lateral, clique em **Build** (Construção) -> **Firestore Database**.
2. Clique em **Criar banco de dados**.
3. Escolha **Iniciar no modo de teste** (para desenvolvimento rápido) e selecione a localização do servidor (ex: `southamerica-east1` em SP).
4. Crie uma coleção chamada `gifts`.

### Passo 2.3: Configurar o Firebase Storage (Imagens)
1. No menu lateral, clique em **Storage**.
2. Clique em **Primeiros passos**, selecione o modo de teste e conclua.

---

## 🐙 3. Guardando o Código com GitHub

O GitHub servirá para guardar o código do seu site e conectá-lo à plataforma de hospedagem.

### Passo 3.1: Criar o Repositório
1. Acesse [github.com](https://github.com) e entre na sua conta.
2. Clique em **New** (Novo repositório).
3. Nomeie como `ListasFanie`.
4. Deixe como **Public** ou **Private** (ambos funcionam) e clique em **Create repository**.

### Passo 3.2: Enviar o Código Local para o GitHub
No terminal da pasta do seu projeto local, execute:
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/IgorMacdo/ListasFanie.git
git push -u origin main
```

---

## 🚀 4. Colocando o Site no Ar (Vercel ou Netlify)

A Vercel e o Netlify são excelentes. A **Vercel** é ideal para projetos Next.js por ter sido criada pela mesma empresa desenvolvedora do framework.

### Opção A: Vercel (Recomendado para Next.js)
1. Acesse [vercel.com](https://vercel.com) e entre com sua conta do GitHub.
2. Clique em **Add New...** -> **Project**.
3. Importe o repositório `ListasFanie`.
4. Na seção **Environment Variables** (Variáveis de Ambiente), adicione as chaves obtidas no passo do Supabase:
   *   `NEXT_PUBLIC_SUPABASE_URL` = (cole a URL do seu Supabase)
   *   `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (cole a chave anon do seu Supabase)
5. Clique em **Deploy**. O site estará no ar em menos de 2 minutos com um link `.vercel.app` gratuito!

### Opção B: Netlify
1. Acesse [netlify.com](https://netlify.com) e faça login com o GitHub.
2. Clique em **Add new site** -> **Import an existing project**.
3. Escolha o GitHub e autorize o acesso ao repositório `ListasFanie`.
4. Nas configurações do deploy, adicione as variáveis de ambiente em **Site configuration** -> **Environment variables**.
5. Clique em **Deploy site**.
