# Sprint Backlog: MANA 3.0 — Gamified AI English Acquisition Engine

**Sprint:** SDC-MANA-01  
**Orquestrador:** Orion (`@sm` + `@dev` + `@qa`)  
**Metodologia:** AIOX Scrum-Ban com Smart Triage  
**Status:** READY FOR IMPLEMENTATION  

---

## Story 0: Landing Page VSL Subliminar, Mentalidade & Quiz de 5 Perfis (Topo de Funil)
**Como** visitante da landing page e futuro aluno do método MANA,  
**Quero** vivenciar uma VSL gamificada interativa que desmascare a indústria do "aluno eterno", explique os blocos sonoros e aplique um quiz diagnóstico de 5 perfis,  
**Para que** eu alinhe minhas expectativas, perca o medo de errar e entre na triagem de calibração com a AIDA de forma 100% fluida e precisa.

### Critérios de Aceitação:
- [x] Hero section com a quebra do modelo tradicional de receita recorrente das escolas de idiomas.
- [x] O "Teste do Espelho Mental" oferece 4 opções personalizadas mapeando o estado de dor do aluno (Iniciante sobrecarregado, Travado clássico, Intermediário infantilizado ou Praticante em platô).
- [x] Pergunta de auto-avaliação com 5 perfis distintos: A1 (Zero), A2 (Básico Traumatizado), B1 (Intermediário Bloqueado), B2 (Profissional em Lapidação/Refinamento) e C1/C2 (Soberania e Alta Performance).
- [x] Micro-experimento prático de listening de chunk sonoro sem tradução gramatical.
- [x] Confirmação interativa do "Pacto do Jogador" para zerar o filtro afetivo antes da abertura da AIDA.

---

## Story 1: Telemetria de Aquisição Espontânea (Acquisition Memory Engine)
**Como** aluno do método MANA,  
**Quero** que o sistema rastreie em tempo real as estruturas e chunks de vocabulário que eu assimilo e utilizo de forma espontânea,  
**Para que** eu ganhe XP e suba de Rank com base na minha fluência real, e não em testes de gramática decorada.

### Critérios de Aceitação:
- [x] O analisador de turnos pós-sessão identifica chunks classificados como `NOVA`, `EM_PROCESSO` e `ADQUIRIDA`.
- [x] Quando o aluno utiliza uma estrutura sem que a AIDA tenha mencionado nos 3 turnos anteriores, a estrutura é promovida para `ADQUIRIDA`.
- [x] Cada chunk `ADQUIRIDA` concede $+100$ XP ao perfil do Jogador.
- [x] O aluno pode visualizar seu "Inventário de Chunks Adquiridos" no HUD flutuante.

---

## Story 2: Sistema de Daily Quests, Scaffolding de Dicas & Bônus Pure Run
**Como** aluno,  
**Quero** receber 3 missões diárias rápidas (5 a 15 min), contar com dicas de palavras sob demanda para não travar, e ser recompensado com bônus por não usá-las,  
**Para que** eu evolua diariamente sem frustração e seja incentivado a falar de forma 100% autônoma.

### Critérios de Aceitação:
- [x] O sistema gera 3 quests a cada 24 horas: 1 Audio Echo (Listening), 1 Situational Sprint (Roleplay de 6-10 turnos) e 1 Spontaneous Recall.
- [x] Botão de "Dica" sob demanda revela âncoras traduzidas de palavras-chave sem penalizar com notas.
- [x] Completar a missão sem acionar nenhuma dica concede o **Bônus Pure Run** (+50% XP e +Mana).
- [x] A AIDA no chat mantém imersão 100% autêntica sem jamais proferir a palavra "quest", "streak" ou "XP" (Regra de Ouro Krashen H5).

---

## Story 3: A Montanha do B2, Ramificações de Maestria & Mural dos Jogadores
**Como** aluno,  
**Quero** visualizar a Montanha do B2 com módulos finitos (2.500 chunks mapeados), desbloquear ramificações de gírias e negócios, e ver meu progresso no ranking global,  
**Para que** eu saiba exatamente o tamanho do desafio, tenha senso de conquista real e me sinta motivado pela comunidade.

### Critérios de Aceitação:
- [x] Visualização em árvore dos 4 Módulos da Montanha B2 + Módulo 5 de Refinamento C1/C2.
- [x] Ao conquistar um nó, o aluno destrava ramificações de variação (Street/Gírias vs Corporate/Formal).
- [x] Mural dos Jogadores (Leaderboard público) exibindo Rank, Pure Runs acumulados e módulos conquistados.

---

## Story 4: Cockpit de Acompanhamento do Mestre Gabe (Gabriel Lima)
**Como** mentor e professor (Gabe),  
**Quero** um dashboard consolidado que me mostre o status de cada aluno (Rank, tempo diário, chunks adquiridos, relatório de Boss Raids e auto-percepção de nível),  
**Para que** eu possa conduzir aulas semanais cirúrgicas e 100% personalizadas, sabendo exatamente onde o aluno travou.

### Critérios de Aceitação:
- [x] Visão geral de todos os alunos ativos com seus respectivos Ranks (E a S).
- [x] Alerta automático de alunos com filtro afetivo elevado (mais de 2 sessões com menos de 50% de produção ou travamentos superiores a 10s).
- [x] Acesso aos relatórios de Boss Raids para debriefing imediato na mentoria humana de Gabe.
- [x] Botão para aprovar progressão de Rank ou despachar missões personalizadas.

---

## Story 5: Guardrails Pedagógicos da AIDA (Krashen + Swain Protection)
**Como** equipe de governança de qualidade (`@qa`),  
**Quero** testes automatizados de validação de prompt da AIDA,  
**Para que** o agente nunca recorra à correção explícita invasiva ou tradução direta em português.

### Critérios de Aceitação:
- [x] Suite de testes com prompts adversariais (ex: aluno pedindo "qual a regra do passado?" ou "como se traduz maçã?").
- [x] AIDA responde com recasting e parafraseamento em inglês simplificado em 100% dos casos.
