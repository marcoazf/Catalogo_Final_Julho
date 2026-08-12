Realize as seguintes implementações por etapa, seguindo uma a uma. Ao final, adicione-a de forma numerada no documento "atualizacao_4.5.1.md". Efetue as seguintes melhorias, sem afetar ou interferir nas funcionalidades já existentes. Para que não haja um volume de texto na janela de contexto, otimize e resuma o feedback das atualizações e implementações.

a) na janela INFO, altere o Tooltip do botão "Play" de trailer, para aparecer abaixo e à direita do cursor. Troque o estilo da fonte para regular e deixe o background levemente transparênte.

A configuração desta janela ficou muito noa, mas preciso de algumas melhorias. Remova os botões de "EXECUTAR TEMPORADA" das Temporadas. Somente possuem botões os EPISÓDIOS.
Crie opção para que cada Temporada possa ter seus EPISÓDIOS recolhidos como em um Accordeon, porque tem Séries com muitas Temporadas e também existem Temporadas com muitos Episódios. E isso se torna ruim de visualizar. Então inicie todas as Temporadas fechadas e permita o usuário abrir todas manualmente e deverão ser fechadas também manualmente pelo usuário. Sempre feche todas as Temporadas ao fechar a janela INFO.

b) atualize sempre a versão da aplicação, no rodapé, no Manual e onde aparecer esta informação.

c) em CONFIGURAÇÕES > CAMINHOS, troque o texto de CARDS para CARDS DE FILMES e abaixo dele, adicone uma nova opção para CARDS DE SÉRIES. Com estes textos maiores, será necessário reduzir o tamanho do campo que mostrará o caminho completo. Crie também um Pick Folder e botão ATIVAR igual aos demais. Serão 5 caminhos no total.

d) na janela de SÉRIES, em Gênero, quero que o usuário possa ter este tipo de escolha: "Drama, História / Suspense Histórico". O Sistema de Gestão pode manter, para que o usuário possa criar novas categorias nos Gêneros.

e) nos Cards de Séries (se o usuário não escolheu Gênero, então nem mostre no Card).

f) na janela CADASTRO NOVO > SÉRIES, faça os seguintes ajustes:
- remova o ícone e o título NOVA SÉRIE. 
- reduza o tamanho da área da Capa para 50%. E ajuste para que o tamanho da Capa, coincida com o final dos campos do lado direito, mesmo que o tamanho fique em 52%, 55%. O importante é este alinhamento harmonioso.
- do lado direito em CADASTRO DA SÉRIE, ajuste para os seguintes campos:
Título (até o final da coluna).
Ano (mesmo tamanho do campo) e País (ocupa o restante).
Diretor (mesmo tamanho)
Elenco Principal  (mesmo tamanho de campo)
Sinopse (ocupando os 50% desta largura)
Trailer (tamanho de 50% da largura)
Gênero (utilize a largura toda destes 50% para criar a funcionalidade do usuário poder ter o Gênero desta forma extendida: "Drama, História / Suspense Histórico".
Ajuste para que Total Temporadas e Total Episódios, ocupem a mesma linha e com os respectivos botões Automatização e Lixeira.
- remova as opções de URL da Capa, Classificação, Outras Informações e Status.

g) ainda em SÉRIES > CADASTRAR TEMPORADAS, mostre um totalizador da quantidade de Temporada. Ajuste para 02 linhas cada Temporada:
Título e Elenco (linha 1).
Ano (mantenha o tamanho padrão do campo) e Trailer (linha 2).
Obs.: mantenha os demais botões globais e remover individual. Altere a ordem numérica para ir do menor para o maior.

h) ainda em SÉRIES > CADASTRAR EPISÓDIOS, mostre um totalizador da quantidade de Episódios. Ajuste para 02 linhas cada Episódios:
Número da Temporada. Ex.: Temporada 50 , Título e Elenco (linha 1).
Ano (mantenha o tamanho padrão do campo), Duração e Link  (com pick folder) (linha 2).
Obs.: mantenha os demais botões globais e remover individual. Altere a ordem numérica para ir do menor para o maior.

h) Quando o usuário clicar no botão SALVAR nesta janela, diferente dos FILMES, os campos não são resetados e a janela permanece aberta. Só é fechada no botão "X" pelo usuário. A tecla "ESC" não fecha esta janela.

Sempre faça uma revisão e checklist antes me entregar as novas implementações. Gere uma sintaxe limpa, fazendo uma revisão completa – verificando que todos os novos elementos, arrays e handlers existem coritem corretamente. Garanta que todas as funcionalidades, classes, variáveis estão funcionando perfeitamente, não foram alteradas ou mexidas e preservadas nas novas implementações de melhorias. Garanta que nada do que estava funcionando corretamente, seja influenciada ou gere alguma ruptura no aplicativo. sempre mantenha inicialmente tudo o que já funciona e está devidamente ajustado, como: paletas de cores, tipografia, layout, espaçamentos, divs e ids, entre outros itens...