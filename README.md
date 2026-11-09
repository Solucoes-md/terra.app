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

As páginas do domínio antigo `terra-livewallpaper.pages.dev` não resolveram na verificação. Por isso, o rodapé abre documentos locais em `/documentos/privacidade/index.html`, `/documentos/termos/index.html` e `/documentos/contato/index.html`. Eles estão identificados como documentos de referência do aplicativo: a vigência ainda depende da disponibilização efetiva da versão final do teste, após aprovação e publicação dos textos. As datas pendentes estão explicitamente marcadas.

## Página de privacidade

Com o servidor de desenvolvimento aberto, acesse [http://127.0.0.1:5173/documentos/privacidade/index.html](http://127.0.0.1:5173/documentos/privacidade/index.html). No preview de produção, use a porta `4173` no mesmo endereço.

A página usa HTML semântico e CSS dedicado, a fonte Geist local e a identidade visual do Terra. O texto completo, o índice com 12 capítulos, os links e o índice recolhível no celular funcionam sem JavaScript. A navegação lateral fica fixa a partir de 1024 px; tabelas viram blocos identificados em telas estreitas. A impressão usa fundo branco e inclui o resumo, os metadados e todos os capítulos. O movimento reduzido desativa a rolagem suave.

As cópias usam o conjunto canônico Privacidade **1.22**, Termos **1.12** e Contato **1.10**, da revisão [`d8ed440d5f12dd9f1cacd110ca0343444183420a`](https://github.com/gabzieg/atmosfera/tree/d8ed440d5f12dd9f1cacd110ca0343444183420a/docs/legal). O estado continua **rascunho para revisão**, `aprovado_para_publicacao=false` e `vigencia=null`. Aceite parcial de redação não autoriza publicação.

A proveniência pública mínima (repositório, commit, versões, caminhos e SHA-256 das fontes Markdown, HTMLs, modelo e gerador) fica em `scripts/documents-source.json`. O manifesto interno do app não é copiado. Antes de importar, obtenha um checkout da revisão fixada e execute nele a conferência canônica:

```powershell
python scripts/sincronizar_documentos_legais.py --check
```

Depois, na raiz deste site:

```powershell
node scripts/prepare-documents.mjs "../atmosfera"
npm run test:documents
```

O importador confere o estado e os bytes das três fontes e exportações contra os hashes fixados, além do modelo e gerador canônicos. Recusa incompatibilidade ou hash divergente antes de gravar qualquer página. Não executa scripts da origem nem aceita automaticamente uma nova revisão: uma atualização exige conferir novamente o fluxo canônico, revisar a proveniência e atualizar as fixtures públicas em `tests/fixtures/` com os bytes de origem, sem adaptar essas fixtures.

Somente a apresentação e os destinos `href` entre documentos são adaptados. URLs exibidas no texto, redação, datas e metadados são preservados. A privacidade recebe o layout de `scripts/render-privacy.mjs` e `public/documentos/privacidade/styles.css`; Termos e Contato mantêm o layout canônico com aviso editorial e retorno ao site. Todas as páginas exibem publicação não autorizada, têm `noindex, nofollow` e funcionam sem JavaScript. As cópias geradas são versionadas; o site não precisa do app para rodar.

**Dependência legal para publicar:** a política canônica §1 ainda descreve o site no Google Sites; a referência à Cloudflare em §4/§8 trata da entrega de artes pelo R2, sem cobrir por si a hospedagem desta landing no Pages. A fonte canônica precisa avaliar operação, dados técnicos, retenção e fornecedores do site/domínio antes do aceite final. Este repositório não cria compromissos legais nem altera a redação para supor essa cobertura. A revisão de conteúdo/seções por Willian, a vigência, a aprovação final e a publicação continuam pendentes na issue #4. A correção das dependências vulneráveis preexistentes é acompanhada na issue #5.

## Verificar

```powershell
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Os testes Playwright verificam 320, 375, 768, 1024 e 1440 px; título em duas linhas; ausência de rolagem horizontal; imagens carregadas; seleção por teclado; menu móvel; prévia de chuva e noite; pausa; movimento reduzido; redimensionamento; e configuração dos CTAs.

Na página de privacidade, verificam também as cinco larguras, índice e âncoras por teclado, leitura sem JavaScript, tabelas responsivas, impressão, recursos locais e preservação integral da redação dos três documentos, links locais e recusa de fontes incompatíveis ou alteradas. Para executar apenas essas verificações, use `npm run test:e2e -- tests/privacy.spec.ts`.

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
