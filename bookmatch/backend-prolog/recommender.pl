:- dynamic book/2.
:- dynamic has_genre/2.
:- dynamic has_trope/2.
:- dynamic user_likes_genre/2.
:- dynamic user_likes_trope/2.
:- dynamic user_dislikes_trope/2.
:- dynamic user_read/2.
:- dynamic has_mood/2.
:- dynamic has_pacing/2.

% --- PESOS PARA O SISTEMA DE SCORING ---
weight(genre, 10).
weight(trope, 5).
weight(partial, 2).

% --- REGRAS BÁSICAS (Legado adaptado) ---

recommend_by_genre_raw(Genre, Title) :-
    has_genre(ID, Genre),
    book(ID, Title).

recommend_by_trope_raw(Trope, Title) :-
    has_trope(ID, Trope),
    book(ID, Title).

recommend_by_combined_tropes_raw(Trope1, Trope2, Title) :-
    has_trope(ID, Trope1),
    has_trope(ID, Trope2),
    book(ID, Title).

recommend_similar_raw(ReadTitle, RecommendedTitle) :-
    book(ReadID, ReadTitle),
    has_genre(ReadID, Genre),
    has_genre(RecID, Genre),
    ReadID \= RecID,
    book(RecID, RecommendedTitle).

% --- REGRAS PÚBLICAS BÁSICAS (Sem Duplicatas) ---

recommend_by_genre(Genre, Title) :-
    ( setof(T, recommend_by_genre_raw(Genre, T), Titles) -> true ; Titles = [] ),
    member(Title, Titles).

recommend_by_trope(Trope, Title) :-
    ( setof(T, recommend_by_trope_raw(Trope, T), Titles) -> true ; Titles = [] ),
    member(Title, Titles).

recommend_by_combined_tropes(Trope1, Trope2, Title) :-
    ( setof(T, recommend_by_combined_tropes_raw(Trope1, Trope2, T), Titles) -> true ; Titles = [] ),
    member(Title, Titles).

recommend_similar(ReadTitle, RecommendedTitle) :-
    ( setof(T, recommend_similar_raw(ReadTitle, T), Titles) -> true ; Titles = [] ),
    member(RecommendedTitle, Titles).

% --- BUSCA FLEXÍVEL (Substring) ---
recommend_by_substring_raw(Substring, Title) :-
    book(ID, Title),
    (
        (has_genre(ID, Genre), sub_string(Genre, _, _, _, Substring)) ;
        (has_trope(ID, Trope), sub_string(Trope, _, _, _, Substring))
    ).

recommend_by_substring(Substring, Title) :-
    ( setof(T, recommend_by_substring_raw(Substring, T), Titles) -> true ; Titles = [] ),
    member(Title, Titles).


% --- REGRAS COMPLEXAS (Novas) ---

% 1. Sistema de Scoring (Similaridade entre Livros)
similarity_score(BookID1, BookID2, TotalScore) :-
    ( findall(W, (has_genre(BookID1, G), has_genre(BookID2, G), weight(genre, W)), GenreScores) -> true ; GenreScores = [] ),
    ( findall(W, (has_trope(BookID1, T), has_trope(BookID2, T), weight(trope, W)), TropeScores) -> true ; TropeScores = [] ),
    % Partial matches for genres
    ( findall(W, (has_genre(BookID1, G1), has_genre(BookID2, G2), G1 \= G2, (sub_string(G1, _, _, _, G2) ; sub_string(G2, _, _, _, G1)), weight(partial, W)), PartialGScores) -> true ; PartialGScores = [] ),
    append(GenreScores, TropeScores, TempScores),
    append(TempScores, PartialGScores, AllScores),
    sum_list(AllScores, TotalScore).

recommend_best_match(ReferenceTitle, RecommendedTitle, MaxScore) :-
    book(RefID, ReferenceTitle),
    ( findall(Score-RecID, (book(RecID, _), RefID \= RecID, similarity_score(RefID, RecID, Score), Score > 0), Matches) -> true ; Matches = [] ),
    Matches \= [],
    keysort(Matches, SortedMatches),
    reverse(SortedMatches, DescendingMatches),
    % Remove duplicatas mantendo a ordem
    list_to_set(DescendingMatches, UniqueMatches),
    member(MaxScore-RecIDSelected, UniqueMatches),
    book(RecIDSelected, RecommendedTitle).

% 2. Filtragem Personalizada por Perfil de Usuário
recommend_for_user_raw(UserID, RecommendedTitle) :-
    book(BookID, RecommendedTitle),
    \+ user_read(UserID, BookID),
    \+ (has_trope(BookID, BadTrope), user_dislikes_trope(UserID, BadTrope)),
    (
        (user_likes_genre(UserID, G), has_genre(BookID, G)) ;
        (user_likes_trope(UserID, T), has_trope(BookID, T))
    ).

recommend_for_user(UserID, RecommendedTitle) :-
    ( setof(T, recommend_for_user_raw(UserID, T), Titles) -> true ; Titles = [] ),
    member(RecommendedTitle, Titles).

% 3. Explicação (Explainable AI)
recommend_with_reason(Genre, Trope, Title, Reason) :-
    has_genre(ID, Genre),
    has_trope(ID, Trope),
    book(ID, Title),
    string_concat("Combina o gênero ", Genre, P1),
    string_concat(P1, " com o trope ", P2),
    string_concat(P2, Trope, Reason).

% 4. Busca Multi-fatorial (Humor e Ritmo)
recommend_by_vibe_raw(Genre, Mood, Pacing, Title) :-
    has_genre(ID, Genre),
    has_mood(ID, Mood),
    has_pacing(ID, Pacing),
    book(ID, Title).

recommend_by_vibe(Genre, Mood, Pacing, Title) :-
    ( setof(T, recommend_by_vibe_raw(Genre, Mood, Pacing, T), Titles) -> true ; Titles = [] ),
    member(Title, Titles).