# 📝 Task Management System

- Sistema completo de gerenciamento de tarefas com autenticação, categorias e tags. Desenvolvido com Node.js, Fastify e Prisma.

## 🚀 Tecnologias

### Backend

- Node.js + Fastify
- Prisma ORM + PostgreSQL
- Zod para validação
- Bcrypt para hash de senhas
- JWT para autenticação
- Vitest para testes

## Futuras Funcionaliades

### 🔄 Em desenvolvimento

- Autenticação completa (registro/login)
- CRUD de tarefas
- Sistema de categorias
- Tags para organização
- Comentários em tarefas
- Filtros e busca
- Sistema de prioridades
- API RESTful documentada
- Testes automatizados
- Containerização com Docker
- Frontend React

# 📋 Task Management System - Requirements

## **RFs (Requisitos Funcionais)**

### **Autenticação e Usuários**

- [x] Deve ser possível se cadastrar
- [x] Deve ser possível se autenticar
- [x] Deve ser possível obter o perfil de um usuário logado
- [x] Deve ser possível atualizar o perfil do usuário
- [x] Deve ser possível alterar a senha do usuário
- [ ] Deve ser possível fazer logout

### **Gerenciamento de Tarefas**

- [ ] Deve ser possível criar uma nova tarefa
- [ ] Deve ser possível listar todas as tarefas do usuário
- [ ] Deve ser possível obter os detalhes de uma tarefa específica
- [ ] Deve ser possível atualizar uma tarefa existente
- [ ] Deve ser possível deletar uma tarefa
- [ ] Deve ser possível marcar uma tarefa como concluída
- [ ] Deve ser possível arquivar tarefas antigas
- [ ] Deve ser possível definir prioridade para as tarefas (baixa, média, alta, urgente)
- [ ] Deve ser possível definir data de vencimento para as tarefas
- [ ] Deve ser possível filtrar tarefas por status (a fazer, em progresso, concluída)
- [ ] Deve ser possível filtrar tarefas por prioridade
- [ ] Deve ser possível filtrar tarefas por data de vencimento
- [ ] Deve ser possível buscar tarefas por título ou descrição
- [ ] Deve ser possível obter estatísticas das tarefas (total, concluídas, pendentes)

### **Sistema de Categorias**

- [x] Deve ser possível criar uma nova categoria
- [x] Deve ser possível listar todas as categorias do usuário
- [x] Deve ser possível atualizar uma categoria existente
- [ ] Deve ser possível deletar uma categoria
- [ ] Deve ser possível atribuir uma cor personalizada à categoria
- [ ] Deve ser possível atribuir um ícone à categoria
- [ ] Deve ser possível filtrar tarefas por categoria

### **Sistema de Tags**

- [ ] Deve ser possível criar novas tags
- [ ] Deve ser possível listar todas as tags disponíveis
- [ ] Deve ser possível atribuir múltiplas tags a uma tarefa
- [ ] Deve ser possível remover tags de uma tarefa
- [ ] Deve ser possível filtrar tarefas por tags
- [ ] Deve ser possível buscar tarefas que contenham uma tag específica

### **Sistema de Comentários**

- [ ] Deve ser possível adicionar comentários a uma tarefa
- [ ] Deve ser possível listar todos os comentários de uma tarefa
- [ ] Deve ser possível atualizar um comentário próprio
- [ ] Deve ser possível deletar um comentário próprio

### **Funcionalidades Administrativas**

- [ ] Deve ser possível um admin visualizar estatísticas gerais do sistema
- [ ] Deve ser possível um admin gerenciar usuários
- [ ] Deve ser possível um admin desativar/ativar usuários

---

## **RNs (Regras de Negócios)**

### **Usuários e Autenticação**

- [x] O usuário não deve poder se cadastrar com um e-mail duplicado
- [x] A senha deve ter no mínimo 6 caracteres
- [x] As senhas devem coincidir durante o registro
- [ ] O token JWT deve expirar em 7 dias
- [ ] Apenas usuários autenticados podem acessar as funcionalidades do sistema
- [ ] O usuário só pode visualizar e manipular suas próprias tarefas

### **Tarefas**

- [ ] Uma tarefa deve pertencer obrigatoriamente a um usuário
- [ ] O título da tarefa é obrigatório
- [ ] Uma tarefa só pode ter uma categoria por vez
- [ ] Uma tarefa pode ter múltiplas tags
- [ ] Tarefas arquivadas não aparecem na listagem padrão
- [ ] Ao deletar uma tarefa, todos os comentários associados devem ser removidos
- [ ] O status da tarefa deve seguir o fluxo: A Fazer → Em Progresso → Concluída
- [ ] Tarefas marcadas como concluídas devem ter a data de conclusão registrada automaticamente
- [ ] Não é possível alterar o status de uma tarefa arquivada

### **Categorias**

- [x] O nome da categoria deve ser único por usuário
- [ ] Uma categoria só pode ser deletada se não tiver tarefas associadas
- [ ] Ao deletar uma categoria, as tarefas associadas ficam sem categoria
- [ ] Cada usuário deve ter pelo menos uma categoria padrão criada automaticamente

### **Tags**

- [ ] O nome da tag deve ser único no sistema (global)
- [ ] Tags não utilizadas por nenhuma tarefa podem ser removidas automaticamente
- [ ] Uma tag pode ser utilizada por múltiplos usuários

### **Comentários**

- [ ] Um comentário deve pertencer obrigatoriamente a uma tarefa e a um usuário
- [ ] Apenas o autor do comentário pode editá-lo ou deletá-lo
- [ ] Comentários não podem estar vazios

### **Permissões**

- [ ] Apenas administradores podem acessar funcionalidades administrativas
- [ ] Administradores podem visualizar estatísticas de todos os usuários
- [ ] Usuários comuns só podem gerenciar seus próprios dados

---

## **RNFs (Requisitos Não Funcionais)**

### **Performance**

- [ ] As consultas de listagem devem retornar em menos de 200ms
- [ ] O sistema deve suportar paginação para listas com muitos itens
- [ ] Implementar cache para consultas frequentes

### **Segurança**

- [x] Senhas devem ser criptografadas com bcrypt
- [ ] Implementar rate limiting para evitar spam
- [ ] Validar todos os dados de entrada
- [ ] Implementar logs de auditoria para ações críticas

### **Usabilidade**

- [ ] API deve seguir padrões RESTful
- [ ] Retornar códigos de status HTTP apropriados
- [ ] Mensagens de erro devem ser claras e informativas
- [ ] Documentação da API deve estar sempre atualizada
