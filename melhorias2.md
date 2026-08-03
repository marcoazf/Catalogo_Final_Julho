Realize as seguintes implementações por etapa, seguindo uma a uma. Ao final, adicione-a de forma numerada no documento "atualizacao_4.5.1.md". Efetue as seguintes melhorias, sem afetar ou interferir nas funcionalidades já existentes. Para que não haja um volume de texto na janela de contexto, otimize e resuma o feedback das atualizações e implementações.

a) dentro da janela CADASTRO NOVO, seja na aba Filmes ou Séries, crie uma conexão da funcionalidade CARREGAR CAPA, com o caminho configurado em "CAMINHOS > CARDS", dentro da janela CONFIGURAÇÕES. Quando o usuário clicar em CARREGAR CAPA, deverá abrir imediatamente o Explorer com a pasta configurada no caminho de CARDS.

b) garanta que todas as configurações e preferências do usuário configuradas dentro de CONFIGURAÇÕES, serão salvas ao clicar no botão "APLICAR" ou quando a janela for fechada. Estas configurações deverão permancer sempre salvas até que o próprio usuário altere. Quando o aplicativo for sempre aberto, estas configurações deverão ser sempre lembradas e estar vigentes na plataforma.

c) ainda em CONFIGURAÇÕES, dentro de PERSONALIZAÇÃO DOS CARDS, em GÊNEROS (TOPO DO CARD), inicie sempre a aplicação com as seguintes configurações como default:

cor texto = branco
fundo = preto

d) em GESTÃO DE MÍDIA, em PLAYER DE VÍDEO, analise o sistema operacional do usuário e liste no dropdown, todos os players de aúdio e vídeo encontrados. A opção "Personalizado" serve para o usuário entrar com o caminho .exe de um player diferente que ele quer que seja padrão de execução de filmes e séries. Quando o usuário escolher esta opção e carregar o "path" do player, mostre também "Ativado" como nos Caminhos acima. Se esta opção for mudada, o desativado se oculta.

e) Não se isso acontece porque a versão desta aplicação ainda esta no navegador e não é um .exe fechada com o Electron. Quando preenche as informações do "Filme", carrego a capa e os links, quando clico em "SALVAR", abre-se uma janela chamada "Selecione uma pasta que este site possa ver". Não quero esta janela aberta e solicitando pasta. Após o cadastramento, todos os campos do formulário deverão ser limpos e aguardar o usuário cadastrar novo filme ou fechar a janela no "X".

Sempre faça uma revisão e checklist antes me entregar as novas implementações. Gere uma sintaxe limpa, fazendo uma revisão completa – verificando que todos os novos elementos, arrays e handlers existem coritem corretamente. Garanta que todas as funcionalidades, classes, variáveis estão funcionando perfeitamente, não foram alteradas ou mexidas e preservadas nas novas implementações de melhorias. Garanta que nada do que estava funcionando corretamente, seja influenciada ou gere alguma ruptura no aplicativo. sempre mantenha inicialmente tudo o que já funciona e está devidamente ajustado, como: paletas de cores, tipografia, layout, espaçamentos, divs e ids, entre outros itens...