Realize as seguintes implementações por etapa, seguindo uma a uma. Ao final, adicione-a de forma numerada no documento "atualizacao_4.5.1.md". Efetue as seguintes melhorias, sem afetar ou interferir nas funcionalidades já existentes. Para que não haja um volume de texto na janela de contexto, otimize e resuma o feedback das atualizações e implementações.

a) atualize sempre a versão da aplicação, no rodapé, no Manual e onde aparecer esta informação.

b) em FUNCIONALIDADES, limite para ser visualizado apenas 5 itens por linha, com a mesma quantidade de colunas, que são 7. Me refiro aos elementos "div.info-item". Crie um padding superior, para distanciá-lo do texto "Clique num ícone para saber mais (51)". E ajuste para que tenha um padding inferior, após o último item, de valor igual. Ajuste os espaçamentos entre os itens, para criar mais respiro. Pode até aumentar um pouco a largura do modal, para deixar um respiro de padding maior entre os itens.

Atualize também nesta janela, itens com as novas Funcionalidades do aplicativo.

c) atualize sempre também o Manual do Catálogo com a versão do aplicativo e as funcionalidades implementadas. Troque o favicon do Manual, para uma versão mais colorida e alegre. Acho ele muito escuro.

d) quando o usuário for Editar um Filme ou Série e a janela EDITAR FILME / EDITAR SÉRIE for aberta, crie um fallback para o local da imagem, caso a capa não seja carregada corretamente. Mostre nesta área um ícone com um texto, semelhante ao que acontece no Card na principal tela do aplicativo. Quero que o tamanho do ícone e o tamanho da fonte sejam iguais ao do Card na tela principal.

e) quando o usuário estiver na janela de EDITAR A SÉRIE, quando clicar no ícone de Lixeira, para "remover todos os campos" de Temporada ou Episódio, os campos mesmo após a remoção, fica com número "1". Quero que mostre zero neste campo ou mostre nulo, sem número nenhum. Quando o usuário entrar com números e clicar em "criar os campos em tempo real"< os campos serão criados automaticamente.

f) o layout de SÉRIES ficou sensacional com esta nova organização, a capa do lado esquerdo e os campos à esquerda terminando igualmente na altura da imagem da capa. Crie este mesmo layout também em FILMES, com a seguinte disposição dos campos abaixo:

- do lado esquerdo a Capa do Filme com as opções que ela já possui. Mesmo efeito hover.
- lado direito: 
Título do Filme - Ano - País (Linha 1).
Diretor (a) (75%) - Duração (25%) (Linha 2).
Elenco Principal (Linha 3)
Sinopse (Linha 4)
Trailer - Gênero - Gerir Gênero (Linha 5).
Link do Filme com Pick Folder integrada ao Caminho em Configurações (Linha 6)
Classificação (40%) - Status (60%) (Linha 7).

Obs.: não quero Outras Informações e nem URL da Capa.

Sempre faça uma revisão e checklist antes me entregar as novas implementações. Gere uma sintaxe limpa, fazendo uma revisão completa – verificando que todos os novos elementos, arrays e handlers existem coritem corretamente. Garanta que todas as funcionalidades, classes, variáveis estão funcionando perfeitamente, não foram alteradas ou mexidas e preservadas nas novas implementações de melhorias. Garanta que nada do que estava funcionando corretamente, seja influenciada ou gere alguma ruptura no aplicativo. sempre mantenha inicialmente tudo o que já funciona e está devidamente ajustado, como: paletas de cores, tipografia, layout, espaçamentos, divs e ids, entre outros itens...