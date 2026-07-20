Realize as seguintes implementações por etapa, seguindo uma a uma. Ao final, adicione-a de forma numerada no documento "atualizacao_4.5.1.md". Efetue as seguintes melhorias, sem afetar ou interferir nas funcionalidades já existentes. Para que não haja um volume de texto na janela de contexto, otimize e resuma o feedback das atualizações e implementações.

dentro da janela CADASTRO NOVO, em SÉRIES, faça as seguintes melhorias:

dentro da janela CADASTRO NOVO, em SÉRIES, faça as seguintes melhorias:

a) remova o campo LINK DA SÉRIE desta janela SÉRIE e leve-o com seu "ícone, label, campo para direcionar o caminho da pasta SÉRIE e ícone de picker folder" para cada bloco de Episódio da janela "CADASTRAR EPISÓDIOS".

b) remova também o campo TRAILER desta janela SÉRIE e leve-o com seu "ícone, label e campo para o usuário colar o link do trailer do Episódio para cada bloco de Episódio da janela "CADASTRAR EPISÓDIOS".

Obs.: na JANELA CADASTRO NOVO, em SÉRIES, não deverá mais ter os campos "LINK DA SÉRIE " e "TRAILER".

c) aumente o tamanho do campo DURAÇÃO em SÉRIES, empurrando o campo "TEMP", "EPIS" e o botão "Gerar Temporada e Episódio Dinâmico" até o final desta coluna.

d) na aba ESTREIAS, faça as seguintes mudanças:
- remova o botão APLICAR.
- remova também os botões "Aplicar", "Editar" e "Remover". Com isso, aumente o tamanho do campo "Trailer URL" até o final da mesma linha.
- depois que o usuário clicar em "SALVAR", mantenha a janela aberta com todos os dados cadastrados e o usuário poderá criar novas Estréias clicando no botão "+". Cada novo campo, deverá aparecer sempre acima do último campo. Permita que sejam visualizados apenas 5 Estréias e as demais que houverem, crie opção de rolagem, sem exibir a barra de rolagem. Sempre que o usuário for editar esta janela, todas as estréias deverão aparecer e sempre o foco padrão deverá ser na última cadastrada.
- troque  a posição da Data com o nome da Estréia. Quero que a data venha primeiro. Altere também a cor do ícone do data picker para branco.

Se o usuário digitou 60 Episódios, serão criados 60 blocos de campos em tempo real, para o usuário cadastrar os epísódios com os campos abaixo:
- na janela modal que se abrirá sem fechar CADASTRO NOVO, terá um ícone seguido do título da janela, com o mesmo tamanho de fonte de todas as janelas.
- os campos para EPISÓDIOS são:
1) campo dropdown para o usuário escolher a qual Série e qual Temporada estarão vinculados estes EPISÓDIOS. Um campo para cada um
2) número do Episódio, onde cada bloco será auto numerado dinamicamente.
3) total de Episódios (que será capturado do total digitado na SERIEs vigente).
4) Título do EPISÓDIO, Sinopse, Duração (campo de texto), Data (campo de texto), Direção e Classificação (5 estrelas).
5) Status: Exibição - Finalizada - Renovada - Assistir - Favorita

- crie função para o usuário poder limpar todos os dados do episódio e desfazer esta ação.

6) No Rodapé desta janela de EPISÓDIOS, crie botão "CRIAR EPISÓDIOS". Após o usuário clicar neste botão, esta janela de Episódios será fechada e mostrada a janela "CADASTRO NOVO". Se o usuário quiser editar alguma informação do Episódio, é só clicar no botão acima. E quando o botão for clicado para editar, o nome do botão no rodapé da janela, será "SALVAR" e não "CRIAR EPISÓDIO".

Obs.: sempre quando o usuário buscar por uma Série, lemebre-se que vinculada a ela, estão Temporadas e Episódios e deverão ser mostradas de uma forma que o usuário possa escolher qual a Temporada e qual a Série ele desejar Assistir ou Editar.


Sempre faça uma revisão e checklist antes me entregar as novas implementações. Gere uma sintaxe limpa, fazendo uma revisão completa – verificando que todos os novos elementos, arrays e handlers existem coritem corretamente. Garanta que todas as funcionalidades, classes, variáveis estão funcionando perfeitamente, não foram alteradas ou mexidas e preservadas nas novas implementações de melhorias. Garanta que nada do que estava funcionando corretamente, seja influenciada ou gere alguma ruptura no aplicativo. sempre mantenha inicialmente tudo o que já funciona e está devidamente ajustado, como: paletas de cores, tipografia, layout, espaçamentos, divs e ids, entre outros itens...