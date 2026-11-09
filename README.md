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

As páginas legais são geradas automaticamente, sem HTML versionado em `public/documentos`. `npm run build` resolve uma vez o commit de `main` de [gabzieg/atmosfera](https://github.com/gabzieg/atmosfera), busca o manifesto, as três fontes Markdown e suas exportações HTML nesse mesmo SHA e valida a estrutura das versões e os SHA-256 independentes de Markdown e HTML. Nenhum script remoto é executado. Não há token ou credencial no cliente de leitura pública. Os hashes são os do manifesto da revisão recebida, sem congelar uma versão antiga.

Cada página mostra versão, commit completo e permalink da fonte Markdown. A redação e os metadados canônicos são preservados, incluindo aprovação e vigência reais. O build exige `aprovado_para_publicacao=true` e `aprovacao_registro` não vazio; não cria aprovação. Vigência pode permanecer nula e é exibida como pendente. O manifesto aprovado usa `status=aprovado_para_publicacao`; `versao_app` e `vigencia` podem continuar nulos. O Markdown editorial aceito pode ainda dizer rascunho: o gerador canônico deriva os metadados públicos no HTML. O site valida os hashes independentes e renderiza essa exportação, sem exigir igualdade dos cabeçalhos Markdown/HTML. A adaptação muda somente layout e destinos de navegação local. CSS permanece em `public/documentos/privacidade/styles.css`. As páginas funcionam sem JavaScript.

Quando `main` está aprovada, suas páginas são geradas automaticamente na revisão resolvida. Quando está em rascunho, o build só pode conservar uma revisão aprovada por meio de `scripts/legal-approved.json`: inicialmente `null`, ou objeto estrito com `sourceCommit` (SHA Git completo), `manifestSha256` (SHA-256 dos bytes do manifesto nesse commit) e `approvalUrl` (URL HTTPS do aceite público). Preencher/atualizar somente por PR com evidência real; o build não grava esse pin nem procura a revisão “mais recente” no histórico. Um avanço aprovado de `main` não atualiza o pin por suposição.

A seleção do pin ocorre apenas após conferir os bytes e metadados da `main` rascunho. O manifesto pinado precisa corresponder ao hash registrado, manter `aprovado_para_publicacao=true`, `aprovacao_registro` não vazio e hashes individuais válidos. Sem registro aprovado, build falha. Erro de rede, API, schema ou integridade de `main` ou do pin jamais aciona outra revisão. O primeiro registro depende do aceite Pages na fonte canônica; um rascunho não pode ser pinado como aprovado. Exemplo de estrutura, sem valores de aprovação fabricados:

```json
null
```

Os artefatos ignorados ficam em `.generated/documentos/` e no build `dist/documentos/`; `provenance.json` contém somente proveniência pública mínima, sem campos operacionais internos do manifesto. Falha de rede/API, timeout, manifesto inválido, versão incoerente ou hash divergente cancela a geração. `npm run build` apaga `dist` antes de começar e também após falha: não reutiliza saída antiga. Não publique uma pasta gerada por comando incompleto ou diferente do build documentado.

`npm run dev` busca uma revisão nova a cada inicialização; reinicie para receber alterações do Atmosfera. As rotas desconhecidas em `/documentos/` retornam 404. `/privacidade`, `/termos` e `/contato` redirecionam com 301 para as três rotas preservadas, conforme `public/_redirects`, copiado ao `dist`. Dev, preview e o servidor dos testes executam essas mesmas regras. A operação real do Pages depende de configuração/verificação posterior. `npm run preview` serve exclusivamente o último `dist` concluído, sem consultar novamente a fonte e sem fallback de landing; execute `npm run build` antes. Os testes offline usam fontes simuladas explicitamente aprovadas em servidor próprio e geram também um build Vite hermético com preview. Não há variável de ambiente que selecione fixture no build de produção.

A cobertura jurídica de Pages é responsabilidade da fonte canônica. A revisão conferida originalmente ainda descrevia Google Sites, enquanto Cloudflare R2 tratava da entrega de artes. Somente uma alteração explicitamente aprovada é publicada, sem redação legal criada neste repositório. Decisões editoriais posteriores de Willian, cobertura legal e alertas da issue #5 seguem registrados nas issues; não equivalem a aprovação inventada pelo gerador.

## Integração de hospedagem (configuração posterior)

Para a integração GitHub do **Cloudflare Pages**, selecionar este repositório, branch de produção `main`, Node.js **24**, comando `npm run build` e diretório de saída `dist`. A integração GitHub é a fonte do código; o destino de hospedagem é Cloudflare Pages, não o serviço GitHub Pages. A configuração de conta e publicação não é executada por este PR.

O dono configura o Deploy Hook na conta Cloudflare do Rafael; `atmosfera-lead` configura o disparo após mudanças da fonte canônica. O fluxo do Atmosfera filtra aprovações antes de disparar; o hook inicia novo build, que resolve a `main` atual do Atmosfera e aplica o gate editorial e o pin explícito acima. Antes disso, alterar Atmosfera não dispara sozinho a hospedagem. Nunca colocar URL do hook ou token no repositório, issue ou log. O build usa somente a API pública GitHub sem credencial. Se Atmosfera se tornar privado, a leitura falhará fechada até implementação e configuração autorizadas de token de leitura restrito; não há suporte implícito a credenciais neste PR.

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
