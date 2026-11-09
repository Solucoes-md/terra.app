# Terra

Landing page em português brasileiro do **Terra**, aplicativo Android de papéis de parede animados que acompanham o clima real e a hora do dia.

O site é um projeto independente. Conteúdo e artes vieram do [projeto Atmosfera](https://github.com/gabzieg/atmosfera); nenhuma alteração no aplicativo Android é necessária para executar esta página.

O [checklist de conclusão e publicação](docs/CHECKLIST.md) reúne o escopo, os responsáveis, os critérios de pronto e as dependências do app. O destino definido é Cloudflare Pages em `terrawallpaper.com.br`, com o domínio no Registro.br na conta do Gabriel e a Cloudflare na conta do Rafael. Alterações são entregues por PR.

## Executar localmente

Pré-requisitos: Node.js 24 ou superior e npm. Validado com Node.js 25.2.1 e npm 11.6.2.

```powershell
git clone https://github.com/Solucoes-md/terra.app.git
cd terra.app
npm ci
npm run dev
```

Abra [http://127.0.0.1:5173](http://127.0.0.1:5173). O servidor usa porta fixa; encerre outra aplicação nessa porta antes de iniciar.

Para conferir o build de produção:

```powershell
npm run build
npm run preview
```

Abra [http://127.0.0.1:4173](http://127.0.0.1:4173). A saída estática fica em `dist/` e não é versionada. Hospedagem e domínio podem ser configurados posteriormente; o nome do repositório não registra um domínio.

## Configurar o Google Play

Quando o app for publicado, edite `src/content/site.ts` e substitua `playStoreUrl: null` pela URL da ficha pública fornecida por Gabriel:

```ts
playStoreUrl: 'URL_FORNECIDA_PELO_PUBLICADOR' as string | null,
```

Até a URL ser fornecida, os CTAs levam à demonstração da própria página. Ao configurá-la, os CTAs principais passam a exibir **Ver no Google Play**, abrem o endereço informado em uma nova aba e usam `noopener noreferrer`. Não é preciso alterar cada botão.

Na mesma configuração estão os links legais e o e-mail de suporte do projeto. Não há cadastro, envio de formulário, analytics nem consulta ao clima ou à localização do visitante.

As páginas do domínio antigo `terra-livewallpaper.pages.dev` não resolveram na verificação. Por isso, o rodapé abre documentos locais em `/documentos/privacidade/index.html`, `/documentos/termos/index.html` e `/documentos/contato/index.html`. Eles estão identificados como documentos de referência do aplicativo: a vigência ainda depende da publicação no Google Play. As datas pendentes estão explicitamente marcadas.

## Página de privacidade

Com o servidor de desenvolvimento aberto, acesse [http://127.0.0.1:5173/documentos/privacidade/index.html](http://127.0.0.1:5173/documentos/privacidade/index.html). No preview de produção, use a porta `4173` no mesmo endereço.

A página usa HTML semântico e CSS dedicado, a fonte Geist local e a identidade visual do Terra. O texto completo, o índice com 16 capítulos, os links e o índice recolhível no celular funcionam sem JavaScript. A navegação lateral fica fixa a partir de 1024 px; tabelas viram blocos identificados em telas estreitas. A impressão usa fundo branco e inclui o resumo, os metadados e todos os capítulos. O movimento reduzido desativa a rolagem suave.

As cópias atuais estão desatualizadas: a privacidade ainda está em **1.1**, com atualização em **29 de setembro de 2026**. Elas foram importadas de `public_html/` do Atmosfera. A fonte canônica atual é [`docs/legal/`](https://github.com/gabzieg/atmosfera/tree/main/docs/legal), com Privacidade **1.22**, Termos **1.12** e Contato **1.10**, conforme a decisão registrada na issue #1. A vigência e a autorização final de publicação permanecem pendentes; aceite de redação não equivale a publicação aprovada.

O importador existente ainda lê as exportações HTML de `public_html/`, não as fontes Markdown canônicas. Antes de atualizar as cópias deste site, siga a geração e a conferência descritas no README de `docs/legal/` do Atmosfera e verifique as versões e o manifesto. A adequação do importador, a cobertura da hospedagem do site e a revisão das cópias estão pendentes no checklist. Para executar o importador existente sobre um checkout de origem já conferido, a partir da raiz deste site:

```powershell
node scripts/prepare-documents.mjs "../atmosfera"
```

O gerador aplica o layout de privacidade automaticamente, extrai metadados e contato do HTML original e cria o índice a partir dos capítulos numerados. Ele mantém o CSS dedicado e também atualiza as cópias de Termos e Contato. Revise o diff e execute as validações após a importação. Após conferir uma mudança de conteúdo, atualize `tests/fixtures/privacy-source.html` com o HTML de origem antes das adaptações: essa referência permite detectar perda ou alteração involuntária do texto nos testes. Edite a apresentação em `scripts/render-privacy.mjs` e `public/documentos/privacidade/styles.css`; o HTML final é gerado e versionado para funcionar sem acesso ao checkout Android. A revisão do publicador e a definição da vigência continuam necessárias antes do lançamento do app.

## Verificar

```powershell
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Os testes Playwright verificam 320, 375, 768, 1024 e 1440 px; título em duas linhas; ausência de rolagem horizontal; imagens carregadas; seleção por teclado; menu móvel; prévia de chuva e noite; pausa; movimento reduzido; redimensionamento; e configuração dos CTAs.

Na página de privacidade, verificam também as cinco larguras, índice e âncoras por teclado, leitura sem JavaScript, tabelas responsivas, impressão, recursos locais e preservação do conteúdo na regeneração. Para executar apenas essas verificações, use `npm run test:e2e -- tests/privacy.spec.ts`.

No Windows, os testes aproveitam o Google Chrome instalado no caminho padrão. Em outro ambiente, instale o navegador do Playwright com `npx playwright install chromium`. Para usar um executável próprio, configure `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. O servidor local é iniciado automaticamente pelos testes, ou reaproveitado quando já está rodando.

Relatórios e traces ficam em `test-results/` e são ignorados pelo Git. Um trace de falha pode ser aberto com `npx playwright show-trace <arquivo>`.

## Interface e movimento

- React e TypeScript, com Vite e CSS; versões fixadas no `package-lock.json`.
- Hero cinematográfico, acordeões de cenários, faixa de estilos e imagens dentro da tipografia.
- GSAP, ScrollTrigger e `@gsap/react`: imagens crescem na entrada e escurecem na saída; os três painéis da demonstração se sobrepõem no desktop.
- O botão de pausa na navegação interrompe GSAP, faixa contínua e chuva. A faixa também tem seu próprio controle. `prefers-reduced-motion` usa conteúdo estático completo. Em telas menores, os painéis ficam em sequência.
- Prévia ilustrativa com efeitos simplificados de sol, chuva e noite. A animação completa do produto roda no Android.
- Fonte Geist local, foco visível, navegação por teclado, imagens responsivas e carregamento tardio abaixo do hero.

## Artes e origem do conteúdo

A seleção de cenários usa o catálogo Android como fonte da verdade, com as artes gratuitas embarcadas: Cabana/pixel, Casa da bruxa/clay, Lavanda/aqua, Esfinge/vangogh e Jardim/ukiyoe. A página não divulga preços, depoimentos ou funcionalidades do catálogo futuro.

As cópias WebP já estão incluídas em `public/images/`; o site não depende do checkout Android após o clone. Para regenerá-las a partir do projeto de origem:

```powershell
node scripts/prepare-assets.mjs "../atmosfera"
```

O script lê os originais, sem modificá-los, e produz três tamanhos: 480, 960 e 1440 px. Usa nearest-neighbour na pixel art da cabana e Lanczos nas outras artes. `public/images/manifest.json` registra os arquivos e tamanhos gerados.

A fonte Geist é distribuída sob SIL Open Font License 1.1; a licença está em `public/fonts/Geist-OFL.txt`. As ilustrações foram fornecidas pelo projeto Terra/Atmosfera e mantêm seus direitos originais.

## Direção visual

Planejamento feito com a skill gpt-taste e seed determinística `3113`. A paleta segue o app: `#0D0E10`, `#17181B`, `#F4F5F7` e `#9A9EA5`. Os contrastes sólidos planejados são 17,70:1 para texto principal, 6,60:1 para secundário e 17,32:1 nos botões principais.

O bento desktop preenche uma matriz 4×2: um cartão 2×2, dois 1×1 e um 2×1. O título principal usa duas linhas e largura máxima de 72 rem. O conteúdo segue AIDA: atenção, benefícios, demonstração e ação.
