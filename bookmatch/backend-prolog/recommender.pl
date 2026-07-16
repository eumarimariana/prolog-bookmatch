:- dynamic book/2.
:- dynamic has_genre/2.
:- dynamic has_trope/2.

% --- BASE DE DADOS INICIAL DE TESTE ---
book('1', 'Percy Jackson e o Ladrao de Raios').
book('2', 'Jogos Vorazes').
book('3', 'Maze Runner').
book('4', 'A Forma da Agua').

has_genre('1', 'fantasia').
has_genre('2', 'distopia').
has_genre('3', 'distopia').
has_genre('4', 'romance').

has_trope('1', 'mitologia').
has_trope('2', 'sobrevivencia').
has_trope('3', 'sobrevivencia').
has_trope('4', 'monster_romance').
has_trope('4', 'friends_to_lovers').

% --- REGRAS DE INFERÊNCIA ---

% Recomendar por gênero
recommend_by_genre(Genre, Title) :-
    has_genre(ID, Genre),
    book(ID, Title).

% Recomendar cruzando dois tropos diferentes
recommend_by_combined_tropes(Trope1, Trope2, Title) :-
    has_trope(ID, Trope1),
    has_trope(ID, Trope2),
    book(ID, Title).

% Recomendar livro similar (mesmo gênero, mas não é o mesmo livro)
recommend_similar(ReadTitle, RecommendedTitle) :-
    book(ReadID, ReadTitle),
    has_genre(ReadID, Genre),
    has_genre(RecID, Genre),
    ReadID \= RecID,
    book(RecID, RecommendedTitle).