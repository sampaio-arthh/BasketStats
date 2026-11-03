# BasketStats Web
Painel responsivo para registrar estatísticas de treinos e jogos de basquete. Construído com React, TypeScript e Vite, sem backend e pronto para GitHub Pages.

## Recursos
- Treinos e jogos separados
- PPG, AST/J, REB/J, STL/J, FG%, 3PT%, FT% e TS%
- Busca por sessão
- Layout responsivo para celular e desktop
- Persistência local com localStorage
- Backup em JSON
- Deploy automático com GitHub Actions

## Rodar localmente
Requer Node.js 22 LTS e npm.
```bash
npm install
npm run dev
```
Abra o endereço indicado no terminal, normalmente http://localhost:5173.

## Testar a versão de produção
```bash
npm run build
npm run preview
```

## Publicar no GitHub Pages
1. Crie um repositório vazio no GitHub, por exemplo `basket-stats-web`.
2. Nesta pasta, execute:
```bash
git init
git add .
git commit -m "feat: primeira versão do BasketStats Web"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/basket-stats-web.git
git push -u origin main
```
3. No GitHub, abra `Settings > Pages`.
4. Em `Build and deployment > Source`, escolha `GitHub Actions`.
5. Abra a aba `Actions` e aguarde o workflow `Deploy to GitHub Pages` terminar.
6. O endereço será `https://SEU-USUARIO.github.io/basket-stats-web/`.

O `base: './'` do Vite usa caminhos relativos e permite publicar sem editar o nome do repositório.

## Dados e privacidade
Os registros ficam apenas no `localStorage` do navegador atual. Limpar os dados do navegador remove os registros. Use `Exportar backup` antes de limpar ou trocar de dispositivo. GitHub Pages é hospedagem estática, portanto não fornece banco de dados ou login.
