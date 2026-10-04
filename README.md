# Terra

Landing page em português brasileiro do **Terra**, aplicativo Android de papéis de parede animados que acompanham o clima real e a hora do dia.

O site é um projeto independente. Conteúdo e artes vieram do [projeto Atmosfera](https://github.com/gabzieg/atmosfera); nenhuma alteração no aplicativo Android é necessária para executar esta página.

## Executar localmente

Pré-requisitos: Node.js 24 ou superior e npm. Validado com Node.js 25.2.1 e npm 11.6.2.

```powershell
cd "D:\Git repos\terra.app"
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

Edite `src/content/site.ts` e substitua `playStoreUrl: null` pela URL pública do aplicativo ou pelo link de adesão ao teste:

```ts
playStoreUrl: 'URL_FORNECIDA_PELO_PUBLICADOR' as string | null,
```

Até a URL ser fornecida, os CTAs levam à demonstração da própria página. Ao configurá-la, os CTAs principais passam a exibir **Ver no Google Play**, abrem o endereço informado em uma nova aba e usam `noopener noreferrer`. Não é preciso alterar cada botão.

Na mesma configuração estão os links legais e o e-mail de suporte do projeto. Não há cadastro, envio de formulário, analytics nem consulta ao clima ou à localização do visitante.

As páginas do domínio antigo `terra-livewallpaper.pages.dev` não resolveram na verificação. Por isso, o rodapé abre cópias locais dos HTML existentes em `public_html/`, em `/documentos/privacidade/index.html`, `/documentos/termos/index.html` e `/documentos/contato/index.html`. Elas estão identificadas como documentos de referência do aplicativo: a vigência ainda depende da publicação no Google Play. As datas pendentes estão explicitamente marcadas; os textos legais do projeto de origem não foram alterados. Estas cópias não substituem a revisão do publicador antes do lançamento do app.

## Verificar

```powershell
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Os testes Playwright verificam 320, 375, 768, 1024 e 1440 px; título em duas linhas; ausência de rolagem horizontal; imagens carregadas; seleção por teclado; menu móvel; prévia de chuva e noite; pausa; movimento reduzido; redimensionamento; e configuração dos CTAs.

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
node scripts/prepare-assets.mjs "D:\Git repos\atmosfera"
```

O script lê os originais, sem modificá-los, e produz três tamanhos: 480, 960 e 1440 px. Usa nearest-neighbour na pixel art da cabana e Lanczos nas outras artes. `public/images/manifest.json` registra os arquivos e tamanhos gerados.

A fonte Geist é distribuída sob SIL Open Font License 1.1; a licença está em `public/fonts/Geist-OFL.txt`. As ilustrações foram fornecidas pelo projeto Terra/Atmosfera e mantêm seus direitos originais.

## Direção visual

Planejamento feito com a skill gpt-taste e seed determinística `3113`. A paleta segue o app: `#0D0E10`, `#17181B`, `#F4F5F7` e `#9A9EA5`. Os contrastes sólidos planejados são 17,70:1 para texto principal, 6,60:1 para secundário e 17,32:1 nos botões principais.

O bento desktop preenche uma matriz 4×2: um cartão 2×2, dois 1×1 e um 2×1. O título principal usa duas linhas e largura máxima de 72 rem. O conteúdo segue AIDA: atenção, benefícios, demonstração e ação.
