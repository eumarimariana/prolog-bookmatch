:- dynamic book/2.
:- dynamic has_genre/2.
:- dynamic has_trope/2.

% --- REGRAS DE INFERÊNCIA ---

% Recomendar por gênero
recommend_by_genre_raw(Genre, Title) :-
    has_genre(ID, Genre),
    book(ID, Title).

% Recomendar cruzando dois tropos diferentes
recommend_by_combined_tropes_raw(Trope1, Trope2, Title) :-
    has_trope(ID, Trope1),
    has_trope(ID, Trope2),
    book(ID, Title).

% Recomendar livro similar (mesmo gênero, mas não é o mesmo livro)
recommend_similar_raw(ReadTitle, RecommendedTitle) :-
    book(ReadID, ReadTitle),
    has_genre(ReadID, Genre),
    has_genre(RecID, Genre),
    ReadID \= RecID,
    book(RecID, RecommendedTitle).

% regras publicas usadas pela API para nao ter titulos duplicados

recommend_by_genre(Genre, Title) :-
    ( setof(T, recommend_by_genre_raw(Genre, T), Titles) -> true ; Titles = [] ),
    member(Title, Titles).

recommend_by_combined_tropes(Trope1, Trope2, Title) :-
    ( setof(T, recommend_by_combined_tropes_raw(Trope1, Trope2, T), Titles) -> true ; Titles = [] ),
    member(Title, Titles).

recommend_similar(ReadTitle, RecommendedTitle) :-
    ( setof(T, recommend_similar_raw(ReadTitle, T), Titles) -> true ; Titles = [] ),
    member(RecommendedTitle, Titles).