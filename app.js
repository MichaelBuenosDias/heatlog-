// =============================================
// HEATLOG — app.js
// Etap 2: localStorage — dane przeżywają odświeżenie
// =============================================

// Klucz pod którym przechowujemy dane w localStorage
// To jak nazwa szuflady w magazynie
const KLUCZ_STORAGE = 'heatlog_urzadzenia';

// --- KROK 1: Pobieramy elementy z HTML ---
// document.getElementById() to jak "wskazanie palcem" na element w HTML
// Zapisujemy je do zmiennych (variables), żeby nie szukać ich za każdym razem

const formularz = document.getElementById('formularz-urzadzenia');
const listaUrzadzen = document.getElementById('lista-urzadzen');

// Pola formularza — będziemy z nich odczytywać wpisane wartości
const poleNazwa = document.getElementById('nazwa');
const poleKlient = document.getElementById('klient');
const poleLokalizacja = document.getElementById('lokalizacja');


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
    dataUtworzenia: new Date().toLocaleDateString('pl-PL') // np. "11.03.2026"
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
    li.innerHTML = `
      <div class="urzadzenie-info">
        <h3>${urzadzenie.nazwa}</h3>
        <p>👤 ${urzadzenie.klient} &nbsp;|&nbsp; 📍 ${urzadzenie.lokalizacja}</p>
        <p style="font-size: 0.78rem; color: #a0aec0; margin-top: 4px;">Dodano: ${urzadzenie.dataUtworzenia}</p>
      </div>
      <div class="urzadzenie-akcje">
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


// --- START: Renderujemy listę przy pierwszym załadowaniu strony ---
// Dane zostały już wczytane z localStorage na górze pliku (KROK 2)
// Jeśli coś było zapisane — pojawi się od razu po otwarciu strony
renderujListe();
