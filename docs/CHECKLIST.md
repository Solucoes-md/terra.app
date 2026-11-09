# Conclusão e publicação do site Terra

Escopo da [issue #1](https://github.com/Solucoes-md/terra.app/issues/1), baseado nas decisões de Gabriel de 09/11/2026. Este documento acompanha a entrega do site; concluir este checklist como documento não significa que o site já pode ser publicado.

## 0. Contexto e decisões

- Manter Vite + React + GSAP e os testes Playwright existentes.
- Apresentar a Willian tudo que já foi construído; Willian decide o conteúdo e as seções finais.
- Sem analytics, cookies ou rastreio do visitante.
- Servir Privacidade, Termos e Contato pelo próprio site. A fonte canônica é [`gabzieg/atmosfera/docs/legal/`](https://github.com/gabzieg/atmosfera/tree/main/docs/legal).
- Conjunto com redação aceita: Privacidade 1.22, Termos 1.12 e Contato 1.10. Vigência ainda pendente. O manifesto consultado ainda registra `aprovado_para_publicacao=false`; o aceite da redação não encerra as pendências de publicação.
- Domínio escolhido: `terrawallpaper.com.br`, no Registro.br, na conta do Gabriel. Hospedagem: Cloudflare Pages; DNS: Cloudflare, na conta Cloudflare do Rafael. Confirmar o estado operacional nas etapas abaixo.
- Pedido posterior de Gabriel em 09/11/2026, repassado pela Friday: publicar o site hoje com as páginas legais referenciadas à revisão atual do Atmosfera; substitui a exigência de versão completa antes da publicação. Execução e configuração de produção continuam com o dono. A URL da ficha pública do Google Play entra no botão quando o app for publicado; até lá, manter a demonstração local.
- Trocar a URL da política no Google Play Console e retirar o Google Sites somente depois de o novo site estar no ar e verificado.
- Repositório público: não incluir dados pessoais, credenciais, tokens, informações de contas ou comprovantes privados. Compra de domínio, criação de contas e publicação cabem a Gabriel. Mudanças no código e na documentação passam por PR, nunca diretamente na `main`.

### Responsáveis e uso

**Site** significa Willian ou quem construir o site. **Gabriel** responde pelas contas, decisões do app e publicação. **App Atmosfera** significa quem mantém o app e seus documentos, com aprovação de Gabriel. Quando houver mais de um responsável, a linha explicita quem executa e quem aprova.

Marcar um item somente quando seu critério estiver atendido. Registrar evidência pública no PR ou na issue (commit, resultado de validação ou URL); evidência que contenha dados pessoais permanece fora do repositório. Itens condicionais só podem ser encerrados como não aplicáveis com justificativa registrada.

## Andamento da próxima entrega — 09/11/2026

Preparação técnica entregue no [PR #6](https://github.com/Solucoes-md/terra.app/pull/6), da [issue #4](https://github.com/Solucoes-md/terra.app/issues/4): conteúdo conferido contra a revisão fixada do app, seções apresentadas para decisão de Willian e documentos canônicos importados com proveniência e testes. Aceite de conteúdo e publicação continuam pendentes; entrega técnica não significa site pronto para publicar.

**Próximo passo:** concluir e revisar o build automático da issue #4/PR #6; com os gates aprovados, avisar Gabriel para configurar Pages, Deploy Hook e secret. A revisão de conteúdo de Willian seguirá em PRs posteriores, sem bloquear esta publicação, conforme confirmação da Friday em 09/11/2026 às 16:53; corrigir as dependências da issue #5 e acompanhar a revisão legal canônica. A aprovação legal, a vigência e a publicação continuam pendentes de Gabriel. O [PR #3](https://github.com/Solucoes-md/terra.app/pull/3) foi integrado em 09/11/2026: conta Cloudflare e domínio conferidos; isso não configura nem publica Pages.

**Dependência legal conferida:** na revisão `d8ed440d5f12dd9f1cacd110ca0343444183420a` do Atmosfera, a política ainda descreve Google Sites para as páginas públicas; a referência a Cloudflare R2 não cobre automaticamente Cloudflare Pages. A adequação precisa ocorrer na fonte canônica antes do aceite da hospedagem do novo site, sem alterar somente a cópia local.

**Pendência de dependências:** a [issue #5](https://github.com/Solucoes-md/terra.app/issues/5) registra os alertas preexistentes encontrados por `npm audit --json` em 09/11/2026 no commit `c2fe470`: correção e conferência antes da publicação, separadas da importação legal.

### Ajuste em implementação — atualização automática

**Decisão editorial posterior (09/11/2026, 16:57, via Friday):** publicar somente documentos com `aprovado_para_publicacao=true` no manifesto canônico e aceite explícito do dono. Se a main contiver rascunho, manter a última revisão aprovada fixada por commit/hashes; sem revisão aprovada, o build falha. Falha de rede ou integridade também interrompe o build. A primeira publicação depende do aceite do delta Pages na issue #89 do Atmosfera. Cada revisão nova exige novo aceite; o site não promove rascunho automaticamente.

A issue #4/PR #6 foi ampliada após o pedido de Gabriel, repassado pela Friday em 09/11/2026 às 16:15 (America/Sao_Paulo). A revisão técnica anterior permanece registrada, mas o novo comportamento exige gates e revisão novos. Não considerar a importação manual fixa como entrega final.

- [ ] Site: `npm run build` busca uma única revisão da `main` do Atmosfera, confere manifesto e hashes, gera as três rotas legais e mostra versão, commit e permalink da fonte em cada página; sem cópias manuais versionadas.
- [ ] Site: falha de rede, manifesto ou hash interrompe o build, sem publicar cópia antiga silenciosamente; controles negativos e caso de atualização válida comprovados.
- [ ] Gabriel: configurar integração GitHub do Pages com a `main` do Terra, build `npm run build`, saída `dist` e Node.js 24; criar Deploy Hook na conta Cloudflare do Rafael e guardar o secret fora do Git.
- [ ] App Atmosfera: disparar o Deploy Hook quando as fontes legais mudarem, no fluxo mantido pela lead daquele projeto; conferir atualização pública efetiva, não somente disparo aceito.
- [ ] Gabriel / App Atmosfera: registrar vigência e metadados na fonte canônica, conforme decisão real; o site preserva o estado recebido e não inventa aprovação.
- [ ] Antes de tornar Atmosfera privado após o lançamento: configurar token com leitura mínima para o build. A consulta anônima deixará de funcionar; guardar token somente no ambiente de build, sem expor em página, log ou repositório.

## 1. Base e qualidade

| Estado | Entrega | Responsável | Critério de pronto |
| --- | --- | --- | --- |
| [ ] | Executar o site em um checkout limpo | Site | Instalar com `npm ci` e abrir `npm run dev`, usando Node.js 24 ou superior, sem depender de outro checkout para servir imagens ou documentos. |
| [ ] | Validar a versão candidata | Site | `npm run typecheck`, `npm run lint`, `npm run build` e `npm run test:e2e` terminam com sucesso no mesmo commit; registrar resultados no PR. No ambiente sem navegador, instalar Chromium com `npx playwright install chromium` antes dos testes. |
| [ ] | Manter instruções portáveis | Site | README contém clone, instalação, execução, build, testes e caminhos relativos ou configuráveis, sem diretórios de máquina pessoal. Conferir os comandos a partir da raiz do checkout. |
| [ ] | Revisar acessibilidade e interação | Site | Testes existentes e revisão manual cobrem celular e desktop, teclado, foco, menu, pausa, movimento reduzido, imagens e ausência de rolagem horizontal; nenhuma regressão pendente. |
| [ ] | Entregar por PR | Site; revisão técnica da lead | Para esta publicação, Gabriel dispensou a espera por Willian; decisões editoriais dele seguem abertas para PRs posteriores. Diff revisado e aprovado pela lead antes do merge; sem dados pessoais ou segredos; preservar a stack e os testes existentes. |

Histórico da análise inicial de 09/11/2026: Playwright não concluiu e foi interrompido. A entrega do PR #6 substitui essa evidência para a candidata técnica: em `66a547a`, typecheck, lint e build passaram, com 3 testes de integridade/importação e 23 Playwright aprovados. O relatório do PR registra controle negativo das guardas de hash e compatibilidade. O aceite final de conteúdo e publicação segue pendente.

## 2. Conteúdo e seções

| Estado | Entrega | Responsável | Critério de pronto |
| --- | --- | --- | --- |
| [ ] | Apresentar a página completa para decisão | Site apresenta; Willian decide | Willian revisa hero, benefícios, cenários/estilos, demonstração, ações e rodapé existentes e registra quais seções ficam, mudam ou saem. |
| [ ] | Conferir nome, descrição e funcionalidades | Site executa; Gabriel valida com o App Atmosfera | Texto corresponde ao app atual; demonstração identificada como ilustrativa; nenhuma promessa de funcionalidade futura apresentada como disponível. |
| [ ] | Conferir catálogo e artes | Site executa; App Atmosfera confirma | Cabana, Casa da bruxa, Lavanda, Esfinge e Jardim, seus estilos, imagens e classificação de acesso correspondem ao catálogo atual, ou são corrigidos; origem registrada em `public/images/manifest.json`. |
| [ ] | Definir política de preços | Willian decide exibição; Gabriel confirma; Site implementa | Hoje o site não divulga preços. Registrar a decisão de manter assim; se forem incluídos, registrar a fonte oficial, moeda, condições e Gabriel como responsável por informar mudanças, com atualização do site por PR antes de divulgar novos valores. |
| [ ] | Preservar ausência de rastreio | Site | Revisão do código e da rede confirma ausência de analytics, pixels, cookies, cadastro e envio de formulários; fontes e artes continuam locais. Verificar também configurações da hospedagem antes da publicação. |
| [ ] | Conferir contato e navegação | Site executa; Gabriel confirma | Canal de suporte público aprovado; rodapé abre as três páginas legais locais, sem links antigos ou quebrados. |

## 3. Documentos legais

| Estado | Entrega | Responsável | Critério de pronto |
| --- | --- | --- | --- |
| [ ] | Fixar a revisão canônica | App Atmosfera fornece; Site registra | Registrar commit de origem, versões e hashes do manifesto de `docs/legal/`; usar PRIVACIDADE.md 1.22, TERMOS.md 1.12 e CONTATO.md 1.10 ou revisão posterior explicitamente aprovada. Não usar históricos de 05/10 como fonte vigente. |
| [ ] | Confirmar cobertura do próprio site | App Atmosfera redige; Gabriel aprova; Site confere | Documento descreve também hospedagem Cloudflare Pages, tratamento técnico associado à hospedagem, contato e ausência de analytics/cookies/rastreio. Lacunas voltam à fonte canônica; não inventar compromissos nem alterar só a cópia do site. |
| [ ] | Adequar a importação e substituir cópias antigas | Site | Fluxo usa fontes canônicas ou exportações geradas e conferidas a partir delas, com versões/hashes rastreáveis. Atualizar o importador que hoje lê `public_html/`, suas instruções e a fixture de privacidade; substituir os três HTMLs em `public/documentos/` preservando o conteúdo aprovado e o layout acessível. |
| [ ] | Validar fidelidade e apresentação | Site | Comparação de conteúdo com a revisão canônica sem perdas; links internos corretos; Playwright de privacidade e demais verificações passam; leitura sem JavaScript, no celular e impressão conferidas. |
| [ ] | Encerrar metadados pendentes para publicação | Gabriel decide; App Atmosfera registra; Site sincroniza | Autorização de publicação, vigência real, versão do app e URLs finais registradas no fluxo canônico; manifesto coerente e cópias regeneradas/conferidas. Não inferir vigência pela data do PR nem pelo aceite parcial da redação. |

**Estado da candidata do PR #6:** Privacidade 1.22, Termos 1.12 e Contato 1.10 da revisão `d8ed440d5f12dd9f1cacd110ca0343444183420a`, sem alterar a redação canônica. O importador confere fontes Markdown, exportações, modelo e gerador contra os hashes de `scripts/documents-source.json`, recusando incompatibilidades antes de gravar. O relatório registra a conferência canônica por `python3 scripts/sincronizar_documentos_legais.py --check`. A cobertura de Pages, a vigência e a aprovação de publicação permanecem pendentes; este checklist não autoriza publicar rascunhos.

Rotas que devem ser preservadas e verificadas no domínio final:

- `/documentos/privacidade/index.html`
- `/documentos/termos/index.html`
- `/documentos/contato/index.html`

## 4. Domínio e hospedagem

| Estado | Entrega | Responsável | Critério de pronto |
| --- | --- | --- | --- |
| [x] | Confirmar domínio e conta | Gabriel | Confirmar registro e controle de `terrawallpaper.com.br` no Registro.br e conta Cloudflare; manter comprovantes e dados de acesso fora do Git. Verificado em 09/11/2026: o Registro.br delega o domínio a `isla.ns.cloudflare.com` e `martin.ns.cloudflare.com` e a zona responde na Cloudflare; ainda sem registros de site (Pages não criado). |
| [x] | Habilitar administrador do repositório | Willian | Repositório transferido para `Solucoes-md/terra.app`; `gabzieg` e `uWillianG` com papel `admin`, verificado em 09/11/2026. |
| [ ] | Escolher e configurar o método de deploy | Gabriel; Site fornece build | Escolher integração GitHub ou upload direto. Na integração, autorizar a Cloudflare para `Solucoes-md/terra.app`, respeitando permissões da organização. No upload, gerar `dist/` de commit aprovado e usar Wrangler na conta Cloudflare do Rafael; registrar commit e deploy. |
| [ ] | Configurar Pages | Gabriel; Site documenta suporte | Raiz do projeto: raiz do repositório; build `npm run build`; saída `dist`; Node.js compatível (24 ou superior). Se usar integração Git, produção a partir de `main` e publicação inicial só com o conteúdo aprovado. Nenhuma credencial no repositório. |
| [ ] | Configurar DNS e domínio no Pages | Gabriel | Zona na Cloudflare, nameservers configurados no Registro.br e domínio adicionado ao projeto Pages; resolução e certificado HTTPS válidos em `terrawallpaper.com.br`. Se adotar `www`, definir e testar redirecionamento para a URL canônica. |
| [ ] | Conferir configurações de privacidade da hospedagem | Gabriel; Site verifica rede | Sem Web Analytics, scripts de rastreio ou desafios que exijam login nas páginas legais; tratamento técnico da hospedagem consistente com a política aprovada. |

Referências operacionais: [React no Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/), [configuração de build](https://developers.cloudflare.com/pages/configuration/build-configuration/) e [upload direto](https://developers.cloudflare.com/pages/get-started/direct-upload/). São alternativas de implantação; confirmar o método antes de criar o projeto Pages.

## 5. Publicação e transição do app

Executar na ordem abaixo. Não retirar o endereço atual antes de confirmar que o substituto funciona.

| Estado | Entrega | Responsável | Critério de pronto |
| --- | --- | --- | --- |
| [ ] | Autorizar a versão completa | Willian aprova conteúdo; Gabriel autoriza publicação | Conteúdo e documentos aprovados, vigência definida, critérios anteriores atendidos e commit candidato identificado; considerar o pedido posterior de publicação em 09/11/2026, preservando pendências explícitas. A ficha do Play continua dependente da publicação do app. |
| [ ] | Publicar o site | Gabriel | Deploy do commit aprovado no domínio final; registrar URL, commit e identificação pública do deploy sem dados de conta. |
| [ ] | Verificar acesso público | Site verifica; Gabriel aceita | Abrir início e as três rotas legais por HTTPS, em sessão anônima e no celular, sem login; receber os documentos corretos, e não o HTML da landing por fallback. Conferir versões, links, fontes, imagens, navegação e ausência de rastreio. |
| [ ] | Trocar política no Google Play Console | Gabriel / App Atmosfera | Somente após a verificação pública: substituir o link pela URL HTTPS final de privacidade e conferir o valor salvo no Console. Registro de conclusão sem capturas ou dados privados no repositório. |
| [ ] | Conferir referências do app | App Atmosfera; Gabriel aprova | Identificar links legais no app e atualizar os necessários no fluxo do Atmosfera; alinhar os documentos embarcados com a revisão publicada e registrar as dependências da próxima versão. |
| [ ] | Retirar Google Sites | Gabriel / App Atmosfera | Novo site aceito, URL do Console trocada e referências antigas avaliadas; só então retirar o Google Sites e registrar a conclusão. |
| [ ] | Ativar o botão do Google Play | Gabriel fornece URL pública; Site implementa | Quando a ficha estiver publicada, preencher `playStoreUrl` em `src/content/site.ts` por PR; validar ficha pública correta, CTA “Ver no Google Play”, nova aba e `noopener noreferrer`. Não substituir por link de teste no lançamento. |
| [ ] | Conferir o lançamento final | Gabriel e Site | Após ativar o link do Play, repetir verificação pública de navegação e páginas legais; registrar conclusão e pendências residuais na issue. |

## Evidências e manutenção

Registrar o andamento na issue #1 e nos PRs correspondentes. Para cada etapa concluída, indicar o item, quem confirmou, a data e a evidência pública. Atualizações de catálogo, preços (se adotados), documentos ou URLs devem passar novamente pelos critérios afetados antes de publicar. O checklist acompanha preparação e aceite; não autoriza compra, criação de contas, publicação ou alteração do Console.
