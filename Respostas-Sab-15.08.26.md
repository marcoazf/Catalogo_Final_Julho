# Respostas — Sábado 15/08/2026

Aplicativo: **CineCatalog Elo** (Electron, versão atual **32.3.0**)

---

## 1) Este aplicativo é para um cliente. Quais arquivos devo enviar a ele?

**Essencial (único arquivo obrigatório):**
- `CineCatalog_Elo_Setup_32.3.0.1.exe` — o instalador. Ele contém o aplicativo completo (interface, lógica, temas). Basta instalar e usar.

**Opcionais (recomendados para boa experiência):**
- Uma pasta com as **mídias do cliente**: capas (cards de Filmes/Séries) e vídeos. Esses arquivos **não vêm dentro do instalador** — o app apenas *referencia* os caminhos configurados no menu Config → CAMINHOS. Sem eles, os cards aparecem sem imagem e os filmes não têm arquivo de mídia.
- Um pequeno `LEIA-ME.txt` com passos de instalação e de configuração dos CAMINHOS (muito útil para um cliente leigo).

**O que NÃO enviar:**
- A pasta `release/win-unpacked` (é só para testes internos).
- Nenhum dado seu (backups, acervo de desenvolvimento).

---

## 2) Como executar em uma SmartTV? E como acessar Filmes/Cards da máquina local? Mídia em dispositivo externo?

### a) O app NÃO roda nativamente em SmartTV
O CineCatalog Elo é um aplicativo **desktop para Windows** (Electron). SmartTVs usam outros sistemas (Tizen, webOS, Google TV, Vidaa) e não executam `.exe`. Não existe versão para SmartTV.

### b) Assistir na TV com as mídias na máquina local — 2 caminhos práticos

**Opção 1 — Espelhar a tela do PC (mais simples, sem instalar nada no app):**
- **HDMI:** ligue o notebook/PC na TV com cabo HDMI. Imagem e som perfeitos, zero configuração.
- **Sem fio:** use o recurso de projeção da TV (Miracast / AirPlay / Chromecast / Amazon Fire Stick). O que estiver na tela do PC (incluindo os Cards) aparece na TV.

**Opção 2 — Servidor de mídia (recomendado se quiser "navegar" o catálogo pela TV):**
- Instale no PC um servidor como **Plex** ou **Jellyfin** (gratuito) apontando para as mesmas pastas de filmes/capas.
- Na SmartTV, instale o aplicativo do Plex/Jellyfin (existe para quase todas as TVs).
- O catálogo (Cards) e os filmes ficam disponíveis pela TV, sem espelhar a tela.
- *Nota:* isso usa software externo — não é uma função do CineCatalog Elo hoje.

### c) Mídias em dispositivo externo (HD/USB/HDD/pen drive) ou rede — SIM, é possível
O app não guarda as mídias dentro dele; ele só guarda o **cadastro** (títulos, capas referenciadas, caminhos) em uma área de dados do Windows. Por isso:
- Configure os CAMINHOS do app (Config → CAMINHOS) apontando para o dispositivo externo, por exemplo:
  - Capas de Filmes: `D:\Capas`
  - Capas de Séries: `D:\CapasSeries`
  - Vídeos: `D:\Filmes`
  - Ou caminho de rede: `\\SERVIDOR\Filmes` (a pasta deve estar compartilhada).
- O PC precisa estar ligado e o dispositivo conectado/montado sempre que o app for usado.
- Para assistir na TV com mídia externa: espelhe a tela (HDMI/Miracast) ou use Plex/Jellyfin apontando para a mesma pasta externa.

---

## 3) Como atualizar o app já instalado (com centenas de cadastros) sem perder nada?

### Onde ficam os dados (importante entender)
- Os cadastros (Filmes/Séries/Estreias, config, temas) ficam em:
  `C:\Users\<usuário>\AppData\Roaming\cinecatalog-elo`
  (pasta de dados do app no Windows — **fora** da pasta de instalação).
- Por isso, **instalar a nova versão por cima da antiga NÃO apaga os dados**. As mídias (capas/vídeos) ficam nas pastas configuradas e também não são tocadas.

### Procedimento seguro (faça sempre na ordem)
1. **Antes de atualizar, dentro do app faça um BACKUP:**
   - Menu Config → campo **BACKUP GERAL**: preencha o caminho de destino, ative e deixe o auto-save salvar (gera um `CineCatalog_Backup_Geral.json` com TODO o acervo + config).
   - Alternativa: use o botão **Exportar** (gera `CineCatalog_Backup.json`).
   - Guarde esse arquivo em outro disco/pendrive (nunca só na mesma máquina).
2. **Rode o novo instalador** (`CineCatalog_Elo_Setup_32.3.0.1.exe` ou versão futura) por cima do instalado — ele atualiza apenas os arquivos do app.
3. **Abra o aplicativo e confira** o contador de itens (ex.: "1.234 filmes") e abra alguns cards com capa.
4. **Se algo der errado:** abra o app, use o **Importar** apontando para o JSON do backup do passo 1.

### Cuidados (para não perder dados)
- **NÃO desinstalar** o app antes de atualizar (nem apagar `AppData\Roaming\cinecatalog-elo`).
- **NÃO rodar a versão nova num computador/usuário diferente** do que tem os dados sem antes importar o backup.
- Em uma "primeira execução" genuína o app inicia limpo por design — mas isso só ocorre em perfil totalmente novo. Na atualização (mesmo usuário e mesmo PC) o marcador de primeira execução está presente e **nenhum dado é apagado**. Mesmo assim, mantenha o backup do passo 1.

---

## 4) Quais camadas de segurança implementar (app local, 1 único usuário)?

Para um app 100% local e de usuário único, as ameaças reais são: **furto da máquina, malware/ransomware, exclusão acidental e acesso físico por terceiros**. Então o mais importante é proteger a máquina e os dados — a parte técnica do app é secundária.

### Camada 1 — Sistema operacional (impacto máximo, esforço mínimo)
- Conta de usuário do Windows **com senha** (bloqueia a tela ao sair — `Win+L`).
- **BitLocker ativado** (criptografia de disco inteiro): se a máquina for roubada, os dados ficam ilegíveis. *Recomendo prioridade máxima.*
- Windows Defender ativo e Windows atualizado.
- **Permissões NTFS** na pasta das mídias e da pasta de dados: liberar acesso apenas para o usuário do app.

### Camada 2 — Backup (proteção contra perda)
- BACKUP GERAL periódico + cópia em **outro local** (nuvem/HD externo).
- Se possível, backup criptografado (ex.: `.zip` com senha ou BitLocker no HD externo).

### Camada 3 — Reforços técnicos no app (posso implementar se quiser)
- **CSP** (Content-Security-Policy) no `index.html` para bloquear execução de scripts vindos da internet.
- **Bloquear DevTools** em produção (hoje o menu já está oculto; dá para também travar F12/Ctrl+Shift+I).
- Manter a janela de mídia em modo **sandbox + contextIsolation** (já está assim).
- **Trailers e links abrem fora do app** (navegador/player do sistema) — evita código remoto rodando dentro do aplicativo (já é assim hoje).
- Opcional (baixo valor para uso único local): trava por senha/PIN ao abrir o app, e criptografia do JSON do acervo em repouso.

### Camada 4 — Comportamento / uso
- Conectar a máquina apenas a redes confiáveis.
- Não clicar em links/arquivos suspeitos na mesma máquina (o vetor nº 1 de malware).
- Manter o instalador atualizado na entrega ao cliente.

---

*Resumo prático: mandar só o `.exe` + mídias; para TV, espelhar tela ou usar Plex/Jellyfin; para atualizar, backup geral + instalar por cima (os dados ficam em `AppData\Roaming\cinecatalog-elo` e não se perdem); para segurança, BitLocker + senha + backups em outro local — e, se quiser, eu implemento CSP/DevTools bloqueado no app.*
