Realize as seguintes implementações por etapa, seguindo uma a uma. Ao final, adicione-a de forma numerada no documento "atualizacao_4.5.1.md". Efetue as seguintes melhorias, sem afetar ou interferir nas funcionalidades já existentes.

a) quando o usuário clicar em Configurações, esta janela deverá sempre abrir carregando o ACERVO VAZIO NO topo. Sempre deverá abrir carregando esta seção primeiro.

b) no ícone de Pick folder de ÍCONE, o aplicativo deverá aceitar somente os formatos (PNG, ICO, SVG e WEBP). Crie uma descrição abaixo do campo mencionando estes formatos aceitos. Quando o ícone ou o nome do ícone for colocado no campo crie uma visualização em miniatura em tempo real, exibindo o tamanho em Kb do arquivo.

c) na janela CONFIGURAÇÕES, em ACERVO VAZIO, deixe TAMANHO ÍCONE e OPACIDADE ÍCONE na mesma linha, separados por uma distância coerente e aumente um pouco o padding acima e abaixo destas funcionalidades.

d) TAMANHO ÍCONE está aumentando somente a div que envolve o ícone. Preciso que aumente a div e o ícone também, permitindo ficar bem grande, de forma que seu limite seja o palco da tela. Aumente um pouco o tamanho das fontes que mostram 78px destas 2 ferramentas.

e) em TÍTULO, SUBTÍTULO 1 e SUBTÍTULO 2, diminua o tamanho dos campo e insira as funcionalidades de Bold, Italic, size, cor hex. e caixa de cor na mesma linha de cada campo. Ficará melhor distribuído.

f) em PERSONALIZAÇÃO DOS CARDS, em GÊNEROS (TOPO DO CARD), defina a COR DO TEXTO = branca e FUNDO = preto. Isso deverá ser default para o aplicativo. 

g) Garanta que quando o Electron gerar o instalável .exe em CAMINHOS, cada caminho apareça limpo, para que o usuário possa escolher o caminho para cada pasta. E nestes campos deverão aparecer o caminho completo de cada pasta e não somente o nome da última pasta. Ex.: "C:\Users\marco\Desktop\Catalogo_Final_Julho_\cards".

Importante:

Estes caminhos, deverão estar sempre correlacionados com os caminhos que o usuário deverá escolher as capas, filmes e séries dentro da janela CADASTRO NOVO. Ex.:

Link do Filme = deverá abrir diretamente a pasta definida pelo usuário em Configurações e mostrar o caminho completo com o nome do filme.
Link da Série = deverá abrir diretamente a pasta definida pelo usuário em Configurações e mostrar o caminho completo com o nome da série.
Carregar Capa = deverá abrir diretamente a pasta definida pelo usuário em Configurações e mostrar o caminho completo com o nome da capa.

h) em CAMINHOS, ACERVO GERAL, na mesma linha, crie um campo menor para que o usuário entre com o nome do arquivo que será usado como backup. Se o usuário trocar o nome, é este nome que será definido. Na mesma linha teremos campo para nome do arquivo (35%) e campo para caminho da pasta (65%) do comprimento do campo.

i) dentro de NOTIFICAÇÕES DE ESTREIAS, remova o spinner no campo de duração.
j) dentro de NOTIFICAÇÃO DE CADASTRO, remova o spinner no campo de duração.

k) na janela principal em Configurar Animação, aumente um pouco o tamanho da fonte desta janela, deixando os textos com maior conforto visual.

l) em GESTÃO DE ATALHOS, aumente também um pouco o tamanho da fonte dos textos internos desta janela, deixando os textos com maior conforto visual.

m) remova do centro do rodapé o ícone e o texto de auto salvamento e troque-os de local. Depois do status de filmes no rodapé à direita, adicine uma separação e adicione um ícone de disquete, que será o ícone para exibir o auto-salvamento:

- desligado (cinza mais claro.
- ligado (azul neon) com size quase da altura da barra

Importante:
use o centro do rodapé, para staus de ações do usuário e informações do aplicativo.

Sempre faça uma revisão e checklist antes me entregar as novas implementações. Gere uma sintaxe limpa, fazendo uma revisão completa – verificando que todos os novos elementos, arrays e handlers existem coritem corretamente. Garanta que todas as funcionalidades, classes, variáveis estão funcionando perfeitamente, não foram alteradas ou mexidas e preservadas nas novas implementações de melhorias. Garanta que nada do que estava funcionando corretamente, seja influenciada ou gere alguma ruptura no aplicativo. sempre mantenha inicialmente tudo o que já funciona e está devidamente ajustado, como: paletas de cores, tipografia, layout, espaçamentos, divs e ids, entre outros itens...