# Convite de Casamento

Site estático para GitHub Pages com confirmação de presença gravando em uma planilha do Google Sheets via Google Apps Script.

Observação: o GitHub Pages não executa backend Node.js. Neste projeto, o Node.js fica como servidor local opcional; o backend publicado é o Google Apps Script.

## Arquivos principais

- `index.html`: estrutura do convite.
- `styles.css`: visual responsivo.
- `config.js`: nomes, data, local e URL do Google Apps Script.
- `script.js`: envio do RSVP.
- `apps-script/Code.gs`: backend para colar no Google Apps Script.
- `server.js`: servidor local opcional com Node.js.

## Configurar o convite

Edite `config.js`:

```js
window.WEDDING_CONFIG = {
  coupleNames: "Nome & Nome",
  weddingDate: "20 de setembro de 2026",
  weddingTime: "16h30",
  ceremonyVenue: "Nome do espaço",
  ceremonyAddress: "Endereço completo",
  receptionVenue: "Recepção no mesmo local",
  receptionAddress: "Endereço completo",
  dressCode: "Traje social",
  mapsUrl: "https://www.google.com/maps",
  calendar: {
    start: "2026-09-20T16:30:00-03:00",
    end: "2026-09-20T23:30:00-03:00"
  },
  scriptUrl: "URL_DO_WEB_APP"
};
```

## Configurar Google Sheets

1. Crie uma planilha no Google Sheets.
2. Abra `Extensões` > `Apps Script`.
3. Cole o conteúdo de `apps-script/Code.gs`.
4. Se o script estiver ligado à planilha, deixe `SPREADSHEET_ID` vazio.
5. Clique em `Implantar` > `Nova implantação`.
6. Selecione o tipo `App da Web`.
7. Use `Executar como: Eu`.
8. Use `Quem pode acessar: Qualquer pessoa`.
9. Copie a URL do app da Web.
10. Cole essa URL em `config.js`, no campo `scriptUrl`.

As respostas entram na aba `Confirmacoes`.

## Rodar localmente

Com Node.js instalado:

```bash
npm run dev
```

Abra:

```txt
http://127.0.0.1:5173
```

Também dá para abrir `index.html` diretamente no navegador.

## Publicar no GitHub Pages

Crie um repositório no GitHub e rode:

```bash
git init
git add .
git commit -m "Criar convite de casamento"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

Depois, no GitHub:

1. Entre no repositório.
2. Abra `Settings` > `Pages`.
3. Em `Build and deployment`, escolha `Deploy from a branch`.
4. Selecione `main` e `/root`.
5. Salve.

O GitHub vai gerar a URL do convite em alguns instantes.
