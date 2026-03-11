// =============================================
// HEATLOG — app.js
// Etap 3: Widok szczegółów + wizyty serwisowe
// =============================================

// Klucz pod którym przechowujemy dane w localStorage
// To jak nazwa szuflady w magazynie
const KLUCZ_STORAGE = 'heatlog_urzadzenia';

// --- KROK 1: Pobieramy elementy z HTML ---
// document.getElementById() to jak "wskazanie palcem" na element w HTML
// Zapisujemy je do zmiennych (variables), żeby nie szukać ich za każdym razem

const formularz = document.getElementById('formularz-urzadzenia');
const listaUrzadzen = document.getElementById('lista-urzadzen');

// Pola formularza urządzenia
const poleNazwa = document.getElementById('nazwa');
const poleKlient = document.getElementById('klient');
const poleLokalizacja = document.getElementById('lokalizacja');

// Elementy widoku szczegółów
const sekcjaFormularz = document.getElementById('sekcja-formularz');
const sekcjaLista = document.getElementById('sekcja-lista');
const sekcjaSzczegoly = document.getElementById('sekcja-szczegoly');
const formularzWizyty = document.getElementById('formularz-wizyty');
const listaWizyt = document.getElementById('lista-wizyt');
const szczegolyNaglowek = document.getElementById('szczegoly-naglowek');

// Zmienna pamiętająca id aktualnie oglądanego urządzenia
// null oznacza: żadne urządzenie nie jest wybrane
let aktualneUrzadzenieId = null;


// --- KROK 2: Tablica (array) przechowująca urządzenia ---
// Przy starcie próbujemy odczytać dane z localStorage.
// localStorage.getItem() zwraca tekst (string) lub null jeśli nic nie ma.
// JSON.parse() zamienia tekst z powrotem na tablicę JS.

const zapisaneDane = localStorage.getItem(KLUCZ_STORAGE);
let urzadzenia = zapisaneDane ? JSON.parse(zapisaneDane) : [];


// --- KROK 3: Nasłuchiwanie na wysłanie formularza ---
// addEventListener() mówi przeglądarce: "kiedy ktoś wyśle formularz, wywołaj tę funkcję"
// 'submit' to zdarzenie (event) — moment kliknięcia przycisku lub wciśnięcia Enter

formularz.addEventListener('submit', function(event) {

  // Domyślnie formularz przeładowuje stronę po wysłaniu — NIE chcemy tego
  event.preventDefault();

  // Odczytujemy wpisane wartości z pól
  // .value = zawartość pola tekstowego
  // .trim() = usuwa spacje z początku i końca (np. jeśli ktoś wcisnął spację przez pomyłkę)
  const nazwa = poleNazwa.value.trim();
  const klient = poleKlient.value.trim();
  const lokalizacja = poleLokalizacja.value.trim();

  // Walidacja (validation) — sprawdzamy czy pola nie są puste
  // Atrybut "required" w HTML robi to samo, ale dobrą praktyką jest sprawdzenie też w JS
  if (nazwa === '' || klient === '' || lokalizacja === '') {
    alert('Wypełnij wszystkie pola!');
    return; // przerywamy funkcję — nie dodajemy pustego urządzenia
  }

  // Tworzymy obiekt (object) reprezentujący jedno urządzenie
  // Obiekt to zbiór powiązanych danych opisanych parami klucz: wartość
  const noweUrzadzenie = {
    id: Date.now(),    // unikalny identyfikator — liczba milisekund od 1970 roku
    nazwa: nazwa,
    klient: klient,
    lokalizacja: lokalizacja,
    dataUtworzenia: new Date().toLocaleDateString('pl-PL'), // np. "11.03.2026"
    wizyty: []         // pusta tablica wizyt — wypełni się w Etapie 3
  };

  // Dodajemy obiekt do tablicy metodą .push()
  // .push() wstawia nowy element na koniec tablicy
  urzadzenia.push(noweUrzadzenie);

  // Zapisujemy do localStorage i renderujemy zaktualizowaną listę
  zapiszDane();
  renderujListe();

  // Czyścimy pola formularza po dodaniu
  formularz.reset();

});


// --- KROK 4: Funkcja zapisująca dane do localStorage ---
// JSON.stringify() zamienia tablicę JS na tekst (string) — localStorage przyjmuje tylko tekst
// Bez tego dostalibyśmy "[object Object]" zamiast prawdziwych danych

function zapiszDane() {
  localStorage.setItem(KLUCZ_STORAGE, JSON.stringify(urzadzenia));
}


// --- KROK 5: Funkcja renderująca listę ---
// "Renderowanie" = tworzenie elementów HTML na podstawie danych i wstawianie ich do strony
// Ta funkcja uruchamia się za każdym razem gdy lista się zmienia

function renderujListe() {

  // Czyścimy obecną zawartość listy przed ponownym rysowaniem
  // Gdybyśmy tego nie robili, urządzenia by się duplikowały przy każdym dodaniu
  listaUrzadzen.innerHTML = '';

  // Sprawdzamy czy tablica jest pusta
  if (urzadzenia.length === 0) {
    listaUrzadzen.innerHTML = '<li class="lista-pusta">Brak urządzeń. Dodaj pierwsze urządzenie powyżej.</li>';
    return;
  }

  // Iterujemy (iterate) po tablicy — przechodzimy przez każde urządzenie
  // forEach() wywołuje podaną funkcję dla każdego elementu tablicy
  urzadzenia.forEach(function(urzadzenie) {

    // Tworzymy nowy element <li> (list item)
    const li = document.createElement('li');
    li.className = 'urzadzenie-item';

    // Wstawiamy HTML wewnątrz <li> używając template literals (szablonów tekstowych)
    // Backticki ` ` pozwalają wstawiać zmienne JS bezpośrednio w tekście przez ${}
    // Liczymy wizyty — jeśli urządzenie było dodane przed Etapem 3, wizyty mogą nie istnieć
    const liczbaWizyt = urzadzenie.wizyty ? urzadzenie.wizyty.length : 0;

    li.innerHTML = `
      <div class="urzadzenie-info">
        <h3>${urzadzenie.nazwa}</h3>
        <p>👤 ${urzadzenie.klient} &nbsp;|&nbsp; 📍 ${urzadzenie.lokalizacja}</p>
        <p style="font-size: 0.78rem; color: #a0aec0; margin-top: 4px;">
          Dodano: ${urzadzenie.dataUtworzenia} &nbsp;|&nbsp; Wizyty: ${liczbaWizyt}
        </p>
      </div>
      <div class="urzadzenie-akcje">
        <button class="btn-szczegoly" onclick="pokazWidokSzczegoly(${urzadzenie.id})">Szczegóły</button>
        <button class="btn-usun" onclick="usunUrzadzenie(${urzadzenie.id})">Usuń</button>
      </div>
    `;

    // Dołączamy element <li> do listy <ul> w HTML
    listaUrzadzen.appendChild(li);

  });

}


// --- KROK 5: Funkcja usuwania urządzenia ---
// Filtrujemy (filter) tablicę — zostawiamy tylko te urządzenia których id NIE pasuje
// .filter() zwraca NOWĄ tablicę spełniającą podany warunek

function usunUrzadzenie(id) {
  const potwierdzenie = confirm('Czy na pewno chcesz usunąć to urządzenie?');
  if (!potwierdzenie) return; // użytkownik kliknął "Anuluj"

  // Zostawiamy wszystko OPRÓCZ urządzenia o podanym id
  urzadzenia = urzadzenia.filter(function(u) {
    return u.id !== id;
  });

  zapiszDane();
  renderujListe();
}


// --- PRZEŁĄCZANIE WIDOKÓW ---
// Chowanie i pokazywanie sekcji przez klasę CSS "ukryty" (display: none)

function pokazWidokSzczegoly(id) {
  // Zapamiętujemy które urządzenie wybrano
  aktualneUrzadzenieId = id;

  // Chowamy widok listy i formularz, pokazujemy szczegóły
  sekcjaFormularz.classList.add('ukryty');
  sekcjaLista.classList.add('ukryty');
  sekcjaSzczegoly.classList.remove('ukryty');

  // Wypełniamy widok danymi wybranego urządzenia
  renderujSzczegoly();
}

function pokazWidokListy() {
  // Czyścimy zapamiętane id
  aktualneUrzadzenieId = null;

  // Chowamy szczegóły, pokazujemy listę i formularz
  sekcjaSzczegoly.classList.add('ukryty');
  sekcjaFormularz.classList.remove('ukryty');
  sekcjaLista.classList.remove('ukryty');
}


// --- RENDEROWANIE WIDOKU SZCZEGÓŁÓW ---

function renderujSzczegoly() {
  // Szukamy urządzenia po id w tablicy
  // .find() przechodzi przez tablicę i zwraca PIERWSZY element spełniający warunek
  const urzadzenie = urzadzenia.find(function(u) {
    return u.id === aktualneUrzadzenieId;
  });

  if (!urzadzenie) return; // zabezpieczenie — nie powinno się zdarzyć

  // Wypełniamy nagłówek danymi urządzenia
  szczegolyNaglowek.innerHTML = `
    <h2>🔧 ${urzadzenie.nazwa}</h2>
    <p>👤 ${urzadzenie.klient} &nbsp;|&nbsp; 📍 ${urzadzenie.lokalizacja}</p>
    <p style="font-size: 0.78rem; color: #718096; margin-top: 4px;">Dodano: ${urzadzenie.dataUtworzenia}</p>
  `;

  // Renderujemy historię wizyt
  renderujWizyty(urzadzenie);
}


// --- RENDEROWANIE HISTORII WIZYT ---

function renderujWizyty(urzadzenie) {
  listaWizyt.innerHTML = '';

  // Upewniamy się że tablica wizyt istnieje (starsze urządzenia mogą jej nie mieć)
  if (!urzadzenie.wizyty || urzadzenie.wizyty.length === 0) {
    listaWizyt.innerHTML = '<li class="lista-pusta">Brak wizyt serwisowych. Dodaj pierwszą wizytę powyżej.</li>';
    return;
  }

  // Sortujemy wizyty od najnowszej — spread operator [...] kopiuje tablicę
  // żeby nie modyfikować oryginału; .sort() porównuje daty jako tekst (format YYYY-MM-DD sortuje się poprawnie)
  const posortowane = [...urzadzenie.wizyty].sort(function(a, b) {
    return new Date(b.data) - new Date(a.data);
  });

  posortowane.forEach(function(wizyta) {
    const li = document.createElement('li');
    li.className = 'wizyta-item';

    // Formatujemy datę z formatu YYYY-MM-DD (format input[date]) na czytelny polski format
    const dataFormatowana = new Date(wizyta.data + 'T00:00:00').toLocaleDateString('pl-PL');

    li.innerHTML = `
      <div class="wizyta-data">📅 ${dataFormatowana}</div>
      <div class="wizyta-pole"><strong>Usterka:</strong> ${wizyta.usterka}</div>
      <div class="wizyta-pole"><strong>Wykonano:</strong> ${wizyta.czynnosci}</div>
      ${wizyta.czesci ? `<div class="wizyta-pole"><strong>Części:</strong> ${wizyta.czesci}</div>` : ''}
    `;

    listaWizyt.appendChild(li);
  });
}


// --- OBSŁUGA FORMULARZA WIZYT ---

formularzWizyty.addEventListener('submit', function(event) {
  event.preventDefault();

  const data = document.getElementById('wizyta-data').value;
  const usterka = document.getElementById('wizyta-usterka').value.trim();
  const czynnosci = document.getElementById('wizyta-czynnosci').value.trim();
  const czesci = document.getElementById('wizyta-czesci').value.trim();

  if (!data || !usterka || !czynnosci) {
    alert('Wypełnij wymagane pola wizyty!');
    return;
  }

  // Tworzymy obiekt wizyty
  const nowaWizyta = {
    id: Date.now(),
    data: data,         // format YYYY-MM-DD z input[type="date"]
    usterka: usterka,
    czynnosci: czynnosci,
    czesci: czesci      // może być pusty string — to OK
  };

  // Znajdujemy urządzenie i dodajemy wizytę do jego tablicy wizyt
  const urzadzenie = urzadzenia.find(function(u) {
    return u.id === aktualneUrzadzenieId;
  });

  if (!urzadzenie.wizyty) urzadzenie.wizyty = []; // zabezpieczenie dla starszych danych
  urzadzenie.wizyty.push(nowaWizyta);

  // Zapisujemy całą tablicę urządzeń (razem z nową wizytą) do localStorage
  zapiszDane();

  // Odświeżamy widok i czyścimy formularz
  renderujWizyty(urzadzenie);
  formularzWizyty.reset();
});


// --- START: Renderujemy listę przy pierwszym załadowaniu strony ---
// Dane zostały już wczytane z localStorage na górze pliku (KROK 2)
// Jeśli coś było zapisane — pojawi się od razu po otwarciu strony
renderujListe();
