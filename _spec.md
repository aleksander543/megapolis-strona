Megapolis - Specyfikacja serwisu internetowego
Poniższa specyfikacja zawiera opis prac, które zostaną wykonane w ramach tworzenia nowej strony internetowej dla Megapolis  oraz opis funkcjonalności, które zostaną udostępnione administratorom serwisu i jego użytkownikom. 
Strona zostanie wykonana w oparciu o CMS WordPress oraz będzie dostosowana do obecnie istniejących urządzeń tradycyjnych i mobilnych. Strona będzie miała charakter otwarty, tzn. będzie mogła zostać rozbudowana o inne funkcjonalności w przyszłości.
Fragmenty oznaczone: /* _ */  nie są uwzględnione w wycenie i wymagają dodatkowej wyceny.
Np.:
/* nazwa funkcji */
Spis treści
1. Streszczenie1
2. Projekt graficzny2
2.1 Lista widoków2
3. Funkcjonalności administratora3
4. Funkcjonalności użytkownika4
5. Edytor tekstu WYSIWYG4
6. Struktura serwisu5
6.1 Theme Options (T.O.)5
6.2 Elementy stałe i powtarzalne:6
6.3 Podstrony9

1. Streszczenie
Obecna Strona
https://megapolis.pl/ 
Oraz: 
https://cloulindego.pl/, https://osiedleozon.pl/, https://osiedlefi.pl/, https://linkbunscha.pl/, 
Struktura linków
Standardowa dla WordPressa
System
Wordpress Multisite
Edytor
Gutenberg + ACF Pro
Wersje językowe
polska, angielska
Udogodnienia dla niepełnosprawnych
Tak, WCAG 2.1
Wtyczka do tłumaczeń
WPML (wtyczkę dostarcza zamawiający) 
Wtyczka do Cookies
GDPR Cookies
Integracje
Google Maps
THTG (CRM do zarządzania mieszkaniami - integracja API) 
YSLAB (wdrożenie gotowych widgetów), 
eRecruiter (integracja po API - ogłoszenia o pracę wyświetlane na stronie),
Calendly (z kalendarzem Google, Outlook, Office 365, iCloud)
Typy postów do migracji ze starej strony
Strony osiedli - w pierwszej fazie projektu strony osiedli powinny zostać zmigrowane do multisite
Wtyczki wymagające licencji Zamawiającego i ine rozwiązania mogą generować dodatkowy koszt:
WPML - €99/rok
Google Maps - API. Do poprawnego działania API Google Maps wymaga podpiętej karty kredytowej. W każdym miesiącu Google oferuje darmowe kredyty do wykorzystania na działanie map. Dodatkowe kredyty są płatne. 
2. Projekt graficzny
Stronę charakteryzować będzie przejrzysty design.
Marka Megapolis oparta jest na archetypie maga, co oznacza połączenie magicznego klimatu z racjonalnymi faktami.
Produkty mają sprawiać wrażenie "magicznej strefy komfortu" po powrocie z pracy. Projekty wykorzystują zabawy ze światłem i elementami nieoczywistymi. Kluczowe jest zachowanie tego klimatu przy jednoczesnym dodaniu funkcjonalności sprzedażowych. 
Benchmarki dla projektu graficznego:
https://investkomfort.pl/pl - główny benchmark 
https://mountanvil.com/ 
https://millcreekplaces.com/?aid=39c654ab-85f0-4a86-a13c-7f6c069757c0 
Elementy wizualne, na które Zamawiający zwraca uwagę:
- duże zdjęcie / animacja na pierwszej stronie
- mapa miasta / miast na stronie głównej
- Zamawiający oczekuje, że unikniemy typowego, blokowego designu. Strona powinna posiadać sekcje o pełnej szerokości, ze zdjęciami w tle wypełniającymi całą przestrzeń. 
Logotyp, księgę znaku i zdjęcia do projektu dostarczy Zamawiający (z własnych zbiorów lub z użyczonego przez Wykonawcę Banku Zdjęć Envato Elements)

Mapa strony

2.1 Lista widoków
Design w wersji desktop: TAK 
Design w wersja mobilna:  TAK 

Podstrona
Strona główna
Inwestycja
1
Strona główna
Tak
Tak
2
O nas
Tak
Nie
3
Nasze realizacje
Tak
Nie
4
Poj. realizacja
Tak
Nie
5
Generalny wykonawca
Tak
Nie
6
Kontakt
Tak
Megapolis
7
Kariera
Tak
Nie
8
Ogłoszenie o pracę
Tak
Nie
9
Strona tekstowa
Tak
Megapolis
10
Strona 404
Tak
Megapolis
11
Wyszukiwarka 3D
Nie
Widget
12
Wyszukiwarka tekstowa
Tak
Megapolis
13
Podstrona 1
Nie
Tak
14
Podstrona 2
Nie
Tak
15
PopUp
Tak
Megapolis

Galeria
(jako blok)
(jako blok)

3. Kluczowe funkcjonalności
WordPress Multisite
WordPress Multisite umożliwia wygodne zarządzanie poszczególnymi stronami ekosystemu. W ramach współpracy wykonawca wykona:
- Nowy projekt strony głównej
- Nowy projekt (szablon) strony osiedla
- Zmigruje istniejące strony osiedli do struktury Multisite
Administrator może zalogować się do ekosystemu Multisite i z jego poziomu przejść do zaplecza administracyjnego wybranej strony www lub może zalogować się bezpośr. Do wybranej strony www.
Dla nowych projektów (1- i 2) administrator może zmienić globalne fonty i kolory w sekcji ustawienia. O ile w/w elementy nie zostały nadpisane w ustawieniach bloku, zmiana kolorów i fontów globalnych będzie odzwierciedlona na całej stronie (z wyłączeniem iframe’ów i widgetów zewnętrznych).
Administrator może samodzielnie tworzyć i usuwać nowe strony osiedli w oparciu o instrukcję przekazaną przez Wykonawcę. 
W przypadku stron zmigrowanych osiedli, ich funkcjonalności pozostają niezmienione.

Wyszukiwarka tekstowa
Integracja między WordPress i THTG będzie zrobiona w zakresie, na który pozwala dokumentacja API. W związku z tym opis poniższej funkcjonalności może odbiegać od ostatecznej wersji wdrożenia i zostanie zaktualizowany.

Wyszukiwarka tekstowa powinna działać w oparciu o bezpośrednią integrację z CRM THTG. Integracja powinna być wykonana dwustronnie, tzn.: 
- Z THTG do WordPressa: lista mieszkań wraz z określonymi parametrami powinna być automatycznie zaciągana do WordPressa i wyświetlana użytkownikom
- /* Poza uzgodnionym zakresem, do dodatkowej wyceny: Z wordPressa do THTG: 
- Użytkownik może uiścić opłatę rezerwacyjną za wybrane mieszkanie za pomocą szybkiej płatności (zobacz kolejny punkt:  Opłata rezerwacyjna (przedpłata) - dodatkowe informacje) */

Działanie wyszukiwarki:
Użytkownik może korzystać z wyszukiwarki tekstowej na stronie Megapolis i stronie osiedli, ew. Również na podstronie miasta. Wskazane wyszukiwarki mogą różnić się filtrami.
Użytkownik może wyszukać interesującą go inwestycję wybierając:
- Miasto (tylko strona główna)
- Inwestycja (tylko strona główna, ew. Strona miasta)
- Liczba pokoi (select), powierzchnia (od - do), cena (od - do), piętro (select)
- Strona świata
- Przyległości (balkon, taras, antresola)
- Promocje 
Po wybraniu interesujących filtrów użytkownik widzi listę dostępnych mieszkań z możliwością kliknięcia w szczegóły mieszkania

Działanie wyszukiwarki na zapleczu:
- Informacje o mieszkaniach są zaciągane bezpośrednio z THTG i administrator nie edytuje ich na zapleczu WordPressa, a w THTG
- Administrator może wybrać, jakie filtry mają być aktywne, a jakie nieaktywne
- Administrator może utworzyć nowy filtr, np. PROMOCJA. Tworzenie filtru odbywa się osobno dla każdej ze stron www ekosystemu (osobno na stronie Megapolis i każdej ze stron osiedli)
- Administrator wskazuje W THTG, które mieszkania przynależą do promocji (Administrator uzupełnia pole „Cena promocyjna”. Jeśli pole jest wypełnione, to mieszkanie jest na promocji)

/* Poza uzgodnionym zakresem, do dodatkowej wyceny:
Opłata rezerwacyjna (przedpłata) - dodatkowe informacje
Użytkownik może uiścić opłatę rezerwacyjną za wybrane mieszkanie za pomocą szybkiej płatności (zobacz kolejny punkt)
- W momencie dokonania płatności status mieszkania powinien zostać zmieniony z dostępne na zarezerwowane
- Zmiana jest widoczna 
- w obrębie strony www - na stronie matce i na stronie właściwej inwestycji (Z wyłączeniem widgetu wyszukiwarki graficznej YSLAB)
- W THTG 
Po dokonaniu wpłaty rezerwacyjnej zarówno administrator, jak i użytkownik otrzymują odpowiednie powiadomienie mailowe na ten temat. 
Administrator ma możliwość edycji treści powiadomień.

Opłata rezerwacyjna: kroki:
Krok 1: Aby dokonać opłaty rezerwacyjnej użytkownik musi podać:
- Imię i nazwisko
- Nr telefonu
- Adres mailowy
- Zaakceptować regulamin 
- Kliknąć przycisk
Krok 2:
Użytkownik przenoszony jest na stronę płatności. 
Krok 3:
Jeśli płatność jest udana:
- użytkownik widzi komunikat potwierdzający rezerwację nieruchomości.
- powiadomienia mailowe są wysyłane
- zmiana w THTG i w wyszukiwarce tekstowej jest wprowadzana

Jeśli płatność jest nieudana, użytkownik widzi komunikat informujący o nieudanej transakcji. Powiadomienia mailowe nie są wysyłane. */

Wyszukiwarka graficzna - widget YSLAB
Wyszukiwarka graficzna będzie dodana do strony jako iframe lub widget dostarczony przez zewnętrznego dostawcę. Wszelkie modyfikacje widgetu dokonywane są przez dostawcę. Działanie widgetu jest niezależne od strony www.
Wyszukiwarka graficzna, ze względu na swoją funkcjonalność, jest dostępna z poziomu strony głównej oraz na stronach konkretnej inwestycji 

Integracja eRecruiter
Strona będzie zintegrowana po API z systemem eRecruiter. Ogłoszenia o pracę będą pobierane bezpośrednio z eRecruiter i wyświetlane na odpowiednio ostylowanej stronie.  Treść ogłoszenia jest edytowana w eRecruiter.

Integracja Calendly
Integracja Calendly z kalendarzem (Google, Outlook, Office 365, iCloud) to podstawa działania aplikacji, która automatycznie sprawdza dostępność i dodaje nowe spotkania. W ustawieniach „Dostępność” (Availability) -> „Połączenie kalendarza” (Calendar Connections) można połączyć wiele kalendarzy, aby uniknąć podwójnych rezerwacji.

Mapa inwestycji
Mapa inwestycji jest wykonana w oparciu o Google Maps API (API dostarcza Zamawiający). Na mapie inwestycji naniesione są obecnie realizowane inwestycji. Z perspektywy użytkownika, mapa daje standardowe funkcjonalności (zoom, przesunięcie, możliwość kliknięcia na wskazany znacznik).
Mapy są zarządzane osobno dla strony głównej i stron osiedli. 
Administrator może zarządzać wieloma mapami, może tworzyć nowe mapy, edytować i usuwać istniejące.
Administrator może nanieść dodatkowy punkt na mapę i określić:
- Jego położenie
- Nazwę
- Dodać logo inwestycji
- Dodać tytuł
- Dodać link do inwestycji. Administrator może edytować treść przycisku. Jeśli link nie jest dodany, wyświetlana treść przycisku to: “Dostępne wkrótce”.
 
Pop-Up / Top Bar
Na każdej stronie ekosystemu administrator może włączyć: 
Pop-up. 
Administrator może zmienić zdjęcie, nagłówek, tekst i przycisk (tekst + link) w popupie. Zamknięcie popupa jest możliwe przez kliknięcie przycisku X lub kliknięcie poza obręb popupa. 
W popupie może być wklejony formularz kontaktowy.
Administrator może tworzyć wiele popupów. 
Administrator może wskazać na jakiej podstronie strony www ma wyświetlać się popup.
Dla każdej strony ekosystemu tworzony jest osobny zestaw popupów.
Administrator może aktywować i deaktywować wyświetlanie popupa.

Top bar tekstowy
Administrator może tekst i przycisk (tekst + link) w top barze. Zamknięcie topbara jest możliwe przez kliknięcie przycisku X.
Administrator może tworzyć wiele jeden topbar dla jednej strony ekosystemu. 
Dla każdej strony ekosystemu tworzony jest osobny topbar.
Administrator może aktywować i deaktywować wyswietlanie topbara.

3.1. Pozostałe funkcjonalności administratora
W obrębie serwisu administrator może: 
- Dodawać / usuwać strony www osiedli w oparciu o wcześniej stworzony motyw potomny (zaprojektowany i wdrożony przez dewelopera) - nowe strony stanowią część ekosystemu WordPress Multisite
- Modyfikować globalnie fonty i kolory strony www
- W oparciu o edytor blokowy, dodawać, usuwać i zmieniać treści na stronie głównej, podstronach i postach ekosystemu (z wyłączeniem:
- stron archiwów, np. podstrona Blog 
- podstron, które stanowią szablon dla treści zaimportowanych bezpośrednio z systemów zewnętrznych, np. podstrona ogłoszenia o pracę.)
- Dodawać / usuwać / edytować  pytania FAQ
- Dodawać / usuwać / edytować aktualności
- Dodawać / usuwać zdjęcia w galeriach,
- Dodawać / usuwać / edytować formularze, 
- Edytować treści w stopce strony,
- Zarządzać elementami wyświetlanymi w menu, 
- Dodawać nowe konta (administratorów, edytorów) dla osób zarządzających serwisem
- Mierzyć statystyki odwiedzin za pomocą Google Analytics (GA) lub Google Search Console. Kod Google Analytics dodany przez zamawiającego,
3.2. Pozostałe funkcjonalności użytkownika
W obrębie serwisu użytkownik może: 
- Korzystać z bezpiecznego połączenia SSL podczas przeglądania strony (certyfikat SSL dostarczony przez zamawiającego), 
- Czytać treści dostępne na stronie w wersji językowej angielskiej i polskiej,
- Oglądać mieszkania dostępne w wersji polskiej i angielskiej
- Skontaktować się z firmą za pomocą formularzy kontaktowych, klikalnych numerów telefonów i adresów e-mail,
- Zaakceptować komunikat dot. wykorzystania plików cookies, 
- Powiększyć zdjęcia w galeriach za pomocą funkcji Lightbox (powiększenie zdjęcia)
- /* Dokonać wpłaty rezerwacyjnej za pomocą szybkich płatności za wybrane mieszkanie, 
- Otrzymać powiadomienie mailowe o dokonanej wpłacie rezerwacyjnej */

3.3 Inne funkcjonalności serwisu:
- Strona będzie responsywna i będzie działała prawidłowo na urządzeniach mobilnych i desktop 
- Strona będzie dostosowana do wymagań WCAG 2.1 (z wył. komponentów zewnętrznych)
- Strona będzie posiadała klikalne maile i numery telefonów
- Strona będzie posiadała wdrożony certyfikat SSL udostępniony przez Zamawiającego
- Strona będzie posiadała wdrożony zewnętrzny widget / iframe wyszukiwarki graficznej
- Strona będzie zoptymalizowana pod względem SEO
- Zabezpieczenie formularzy przed spamem za pomocą reCaptcha (API dostarcza Zamawiający) 

4. Edytor tekstu WYSIWYG 
Edytor będzie umożliwiał tworzenie bloków tekstowych. Administrator będzie miał możliwość:
- Dodawania tekstów i nagłówków H1-H6,
- Stylować tekst za pomocą pogrubienia i kursywy i przekreślenia,
- Stylować tekst za pomocą wyboru koloru,
- Wyrównywać tekst do prawej / lewej / środka strony,
- Dodawać linki decydując o formie linku (dofollow/nofollow) oraz o tym, czy link będzie otwierał się w nowej lub tej samej karcie,
- Dodawać cytat, który będzie ostylowanym wyróżnikiem tekstu, 
- Dodawać punktory i numerowanie,
- Dodawać znaki specjalne,
- Dodawać pojedyncze zdjęcia decydując o jego położeniu (wyrównane do lewej / prawej / wyśrodkowane, wielkości (pełna szerokość lub miniatura), linku do zdjęcia (link do przekierowania lub powiększenie zdjęcia za pomocą lightboxa, opcjonalnego podpisu pod zdjęciem i opisów ALT zdjęć,
- Dodawać galerie zdjęć składającej się z dowolnej liczby zdjęć. 
- Stylować tekst do ramki (frame)
- edytować kod HTML,
- Dodawać do wpisów blogowych dostępne bloki.
5. Struktura serwisu 
Strona będzie zbudowana w oparciu o WordPress Multisite. Ekosystem Megapolis będą tworzyły:
- Strona główna Megapolis
- Strony osiedli Megapolis
W ramach ekosystemu Administrator będzie mógł samodzielnie stworzyć nowe strony www osiedli w oparciu o szablon strony osiedla. Każda strona osiedla może mieć:
- Własny font, inny niż fonty pozostałych stron stron Ekosystemu
- Własne kolory
Fonty i kolory wybierane są z customizera WordPressa.

5.1 Theme Options (T.O.)
Sekcja Theme Options jest zarządzana oddzielnie dla każdej strony Ekosystemu. W T.O. Admin może ustawić elementy, które są wyświetlane globalnie:
- Włączyć opcje wysokiego kontrastu
- Dodać logo 
- Ukryć header / footer
- Dodać informację o prawach autorskich
- Dodać linki social media
- Wprowadzić ustawienia dla Google Maps.
- Wybrać ID strony 404
5.2 Elementy stałe i powtarzalne:
Ich wygląd  i funkcjonalności na każdej podstronie będą takie same:
Formularze kontaktowe:
- w tytule wiadomości wysyłanej do administratora znajduje się nazwa podstrony, z której został wysłany formularz.
Header
Header każdej podstrony zbudowany jest z:
- w wersji desktop:
- logotypu
- menu głównego z submenu (każde menu edytowalne jest w sekcji Wygląd -> Menu)
- (opcjonalnie) top menu
- w wersji mobile:
- logotypu
- (opcjonalnie) widocznego numeru telefonu
- (opcjonalnie) widocznego przycisku
- burger menu, w którym - po otwarciu - znajdują się pozycje menu i przełącznik języka
Stopka
Stopka każdej podstrony zbudowana jest z
- w wersji desktop:
- (opcjonalnie) logotypu
- (opcjonalnie)kolumn z danymi kontaktowymi, adresowymi
- (opcjonalnie) linków social media
- (opcjonalnie) linków do podstron
- linku polityki prywatności
- oznaczenia autorstwa
- w wersji mobile:
- (opcjonalnie) logotypu
- (opcjonalnie)kolumny z danymi kontaktowymi, adresowymi
- (opcjonalnie) linków social media
- linku polityki prywatności
- oznaczenia autorstwa
Sekcja Kontaktowa - dodawana osobno na każdej podstronie
Sekcja Kontaktowa zbudowana jest z
- nagłówka i (opcjonalnie) krótkiego paragrafu
- danych kontaktowych i (opcjonalnie) zdjęcia
- Ikon social media
- formularza kontaktowego (imię i nazwisko, email, telefon, akceptacja polityki prywatności, opcjonalnie wiadomość, przycisk)
Formularze kontaktowe wysyłane są bezpośrednio na adres mailowy wskazany przez Zamawiającego I zintegrowane z CRM THTG. W tytule wiadomości znajduje się informacja, z jakiej strony formularz został wysłany.
Formularz edytowalny globalnie z wyjątkami, np. Strona pojedynczej oferty pracy.
Jeśli na podstronach sekcja kontaktowa będzie się powtarzała, to zostanie opisana jedynie jako Sekcja kontaktowa.
Modyfikacja formularzy jest możliwa w zakładce kontakt, z wykorzystaniem shortcode’ów i kodu HTML.
Administrator może tworzyć nowe formularze i edytować istniejące.
Wiadomości wysłane przez formularz nie są zapisywane w WordPress ze względów bezpieczeństwa.
Dla każdej strony ekosystemu multisite formularze tworzone są osobno.
Sekcja tytułowa 1 - strony kluczowe
- okruszki
- Tekst:
- tytuł (H1)
- Paragraf (opcjonalnie)
- Przycisk (opcjonalnie)
- Zdjęcie / wideo w tle
Sekcja tytułowa 2 - strony pomocnicze
- okruszki
- Tekst:
- tytuł (H1)
- Paragraf (opcjonalnie)
- Możliwośc ustawienia tła
5.3 Bloki
Administrator zarządza treściami, modyfikuje je i dodaje nowe za pomocą edytora blokowego. Na podstronach i w postach strony www (z wyłączeniem stron archiwów i stron funkcyjnych (wyszukiwarki, strona 404) oraz stron zmigrowanych do ekosystemu), administrator będzie mógł korzystać z gotowych bloków do tworzenia treści:
- Bloki będą miały stały wygląd. W zależności od bloku, administrator będzie miał możliwość zmiany ustawienia dodatkowych elementów: dodania odstępu, koloru tła, koloru i rozmiaru fontu
- Administrator będzie miał możliwość wstawiania właściwych treści, które są przewidziane w danym bloku
- Wybrane bloki mogą zostać ukryte przez administratora, jeśli nie używane (tymczasowo lub na typie ekranu, np. mobile)
Lista bloków:
Text
- Blok umożliwiający dodanie nagłówka H1-H6 oraz tekstu.
- wszystkie sekcje opisane jako Text / Paragraf mają edytor WYSIWYG, z opcjami stylowania tekstu, dodania nagłówka czy obrazu
- Możliwość ustawienia odstępów
- wszystkie obrazy w paragrafach mają opcję wyrównania do lewej, prawej, do środka
Lista
- Blok umożliwia dodanie listy punktorów lub numerowanej
- Lista może posiadać dowolną liczbę elementów
- Możliwość ustawienia odstępów dla całej sekcji
- Możliwość wyboru ikony punktu
Animated number / Animowana liczba
- Blok umożliwia dodanie animowanej liczby i wybrane stylu liczny (p, H1-H6)
- Administrator może wgrać dodatkową ikonę znaku lob dodać znak jako treść
- Możliwość ustawienia odstępów
Przycisk / Button
Blok umożliwia wyświetlenie przycisku. Wygląd przycisku będzie zdefiniowany. Administrator będzie miał możliwość:
- Zmiany treści przycisku,
- Wstawienia linku przekierowującego do podstrony w serwisie lub strony zewnętrznej,
- Zdefiniowania czy link ma otwierać się w tej samej czy w nowej karcie. 
- Wyboru zdefiniowanych stylów (kolor tła + kolor ramki + kolor fontu) przycisku w oparciu o kolory globalne
Jeśli pole przycisku nie jest wypełnione (brak linku i opisu - wymagane oba) przycisk nie wyświetla się. 
Obraz / Image
Blok umożliwiający wgranie zdjęcia z biblioteki mediów na stronie lub dowolnego załącznika z komputera. Administrator ma możliwość zastąpienia obrazów, chyba, że w specyfikacji jest zapisane, że dany obraz nie jest edytowalny lub jest na podstronie, która nie jest edytowalna. 
- Obraz można powiększyć klikając z zdjęcie, który zostanie wyświetlony w formie lightboxa. 
- Do obrazu można dodać link.
- Możliwość ustawienia odstępów dla całej sekcji
- Możliwość ustawienia wybranego rozmiaru dla zdjęcia (szer x wys)
Sekcja tytułowa / Hero section
Typowa sekcja tytułowa zawierająca:
- okruszki (linki pokazujące gdzie w serwisie znajduje się dana strona)
- tytuł (pole tekstowe, H1)
- paragraf
- tło
Slider tytułowy / Hero slider
Typowa sekcja tytułowa w formie karuzeli zawierająca slajdy, na których można ustawić:
- okruszki (linki pokazujące gdzie w serwisie znajduje się dana strona)
- tytuł (pole tekstowe, H1)
- paragraf
- tło
Wpisy blogowe / Posts columns
Blok umożliwia wyświetlenie wpisów opublikowanych na blogu. Administrator będzie miał możliwość:
- Wyboru typu wpisów do wyświetlenia
- Ustawienia treści przycisku przy każdym poście
- Wybór ilości wyświetlanych postów 2 / 3 / 4 /6 / 8 / wszystkie
- Zmianę sposobu wyświetlania na karuzelę
Kolumna z obrazem, tytułem i tekstem / Column with image, title and text
Blok umożliwiający dodanie sekcji z tytułem, paragrafem tekstowym oraz obrazem. 
FAQ - Frequently asked questions
Blok umożliwia wyświetlanie zwijanych/rozwijanych pytań i odpowiedzi.
- Użytkownik będzie miał możliwość wyboru pytania i zobaczenia odpowiedzi na zasadzie accordion,
- Administrator będzie miał możliwość dodania dowolnej liczby pytań i odpowiedzi.
Karuzela ze zdjęciami / Image Slider
Blok umożliwia dodawanie dowolnej liczby zdjęć wyświetlanych w formie slidera. W przypadku większej ilości zdjęć poniżej wyświetlana będzie nawigacja i kontrolery (kropki odpowiadające ilości slajdów oraz strzałki).
Logotypy - slider / Logotypes slider
Blok umożliwia wyświetlanie siatki logotypów.  Administrator będzie mógł zdefiniować logotypy w ustawieniach serwisu. Przy dodawaniu bloku będzie mógł skorzystać z domyślnych logotypów lub nadpisać je na wybranej podstronie. Logotypy będą miały zdefiniowany rozmiar oraz format (.png lub .svg).  Do logotypu będzie możliwość wstawienia linku.
Opinie - slider / Testimonials slider
Blok umożliwia wyświetlanie siatki opinii.  Jeśli dodana jest jedna opinia, strzałki są domyślnie ukryte. Sekcja zbudowana jest ze:
- zdjęcia autora (edytowalne na podstronie stanowiska)
- Podpisu autora:
- Imienia i nazwiska 
- nazwa stanowiska
- linku (nazwa linku nie jest edytowalna)
- element nie jest edytowalny na podstronach, 
- stanowiska zaciągane są automatycznie z listy dostępnych stanowisk, od najnowszego
Elementy siatki: Section (Sekcja) / Row (Rząd) / Column (Kolumna)
Elementy służą do budowania struktury strony.
Sekcja jest elementem nadrzędnym. Jej zawartość stanowią rzędy. Każdy rząd może być podzielony na kolumny.
Dla sekcji i rządu administrator może określić szerokość bloku (pełna, szeroka, standardowa)
Dla sekcji administrator może określić wysokość.
W ramach każdego bloku administrator może:
- Ustawić kolor tła
- Ustawić zdjęcie lub wideo w tle
- Wybrać inny obraz / wideo dla mobile
- Ustawić obramowanie
- Ustawić odstępy

Blok siatki - Grid - section
Domyślny blok grupujący bloki w sekcji np. z tym samym tłem. Administrator będzie miał możliwość wyboru szerokości danej sekcji. Sekcje mogą składać się z rzędów oraz kolumn opisanych w następnych blokach.
Blok siatki - Grid - row
Blok pozwalający grupować elementy w rzędzie. Administrator będzie miał możliwość wyboru szerokości danego rzędu. Sekcje często składają się z tła na pełną szerokość oraz elementów o nieco mniejszej szerokości znajdujących się w środku.
Kolumna / Grid - column
Blok umożliwia dodanie kolumn w rzędzie. Administrator będzie miał możliwość wyboru szerokości danej kolumny zależnie od rozdzielczości ekranu użytkownika. Np. 2 kolumny o szerokości 50% na komputerze i szerokości 100% na urządzeniach przenośnych. Dzięki temu elementowi, administrator jest w stanie sam wdrażać nawet bardziej skomplikowane układy treści.
Google Map
Mapa Google - wymagany jest do niej klucz API od Google. Administrator będzie mógł ustawić konkretny punkt na mapie oraz dostosować jej przybliżenie.
Shortcode
Blok pozwalający dodać shortcode czyli mały kawałek kodu mogący wyglądać na przykład tak: [nazwa_shortcode’u parametr_a=1 parametr_b=2]
Tabelka / Table
Blok pozwalający dodać tabelę.
Galeria / Gallery
Blok pozwalający wyświetlić galerię z opcją lightboxa.
Video
Blok wyświetlający wideo, które można wgrać z komputera, wybrać z biblioteki mediów WordPress’a lub wyświetlić z zewnętrznego linku.
Embed
Grupa bloków pozwalających wyświetlić różne zewnętrzne elementy - film z vimeo, film z youtube, konkretny Twitt z Twittera, pokaz slajdów ze Slideshare, konkretny Pin z Pinteresta czy video z Tik Toka. Stylowanie tych elementów nie jest wliczone w cenę projektu.
5.4 Podstrony
Lista opisuje strukturę podstron.
Struktura stron może nieznacznie odbiegać od 
Strona Megapolis:
Strona główna:
Strona zbudowana z bloków i wykorzystaniem funkcjonalności opisanych powyżej.
Blok CTA jest zbudowany z wykorzystaniem dostepnych bloków: Text + Przycisk
O nas, Generalny Wykonawca, Kariera, Miasto, Kontakt, Strona tekstowa, Serwis osiedla:
Strona zbudowana z bloków i wykorzystaniem funkcjonalności opisanych powyżej.
Nasze realizacje:
Strona zbudowana z bloków i wykorzystaniem funkcjonalności opisanych powyżej.
Sekcja nasze realizacje będzie posiadała filtr, który pozwala wybrać:
- Lokalizację i / lub typ realizacji
Administrator może dodawać nowe typy dla w/w filtrów.
Aktualności:
Strona archiwum, edtowalny jest jedynie:
- Sekcja tytułowa
- Tekst na dole strony
- Zdjęcia, tytuły i daty są automatycznie zaciągane z ustawień pojedynczej aktualności
Strona 404, Poj. stanowisko
Strony nieedytowalne
Poj. Aktualności:
Post zbudowany z bloków i wykorzystaniem funkcjonalności opisanych powyżej.
 
Strona Osiedla:
Strona zbudowana z bloków i wykorzystaniem funkcjonalności opisanych powyżej.
Harmonogram:
Zadanie
13-24.04
27.04-08.05
11-22.05
25.05-5.06
8-19.06
22.06-3.07
6-17.07
20-31.07
Analiza i koncepcja UX/UI

Design szablonu głównego

Kodowanie szablonu głównego

Migracja obecnych stron inwestycji

Przekierowania SEO

Uruchomienie środowiska *

Design szablonu inwestycji

Kodowanie szablonu inwestycji

Dostosowanie szablonów inwestycji

Optymalizacja SEO

Treści, testy, integracje marketingowe

Zamknięcie projektu

* Uruchomienie środowiska = strona główna Megapolis + przeniesione strony inwestycji
Start projektu: W ciągu 10 dni od wystawienia FV