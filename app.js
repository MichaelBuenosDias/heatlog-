// =============================================
// HEATLOG — app.js
// Etap 5: Wyszukiwanie i filtry
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
const poleInterwal = document.getElementById('interwal');

// Elementy paska filtrów
const poleSzukaj = document.getElementById('szukaj');
const filtrStatus = document.getElementById('filtr-status');
const poleSortuj = document.getElementById('sortuj');

// Elementy widoku szczegółów
const sekcjaFormularz = document.getElementById('sekcja-formularz');
const sekcjaLista = document.getElementById('sekcja-lista');
const sekcjaSzczegoly = document.getElementById('sekcja-szczegoly');
const sekcjaRaport = document.getElementById('sekcja-raport');
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
    id: Date.now(),
    nazwa: nazwa,
    klient: klient,
    lokalizacja: lokalizacja,
    // dataIso — data w formacie YYYY-MM-DD, potrzebna do obliczeń dat
    dataIso: new Date().toISOString().split('T')[0],
    dataUtworzenia: new Date().toLocaleDateString('pl-PL'),
    interwal: parseInt(poleInterwal.value), // 6 lub 12 — parseInt zamienia string na liczbę
    wizyty: []
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

// Parametr "lista" pozwala przekazać przefiltrowaną tablicę.
// Jeśli nie podamy argumentu — użyje domyślnie pełnej tablicy urzadzenia.
function renderujListe(lista = urzadzenia) {

  listaUrzadzen.innerHTML = '';

  if (lista.length === 0) {
    listaUrzadzen.innerHTML = '<li class="lista-pusta">Brak urządzeń spełniających kryteria wyszukiwania.</li>';
    return;
  }

  lista.forEach(function(urzadzenie) {

    // Tworzymy nowy element <li> (list item)
    const li = document.createElement('li');
    li.className = 'urzadzenie-item';

    // Wstawiamy HTML wewnątrz <li> używając template literals (szablonów tekstowych)
    // Backticki ` ` pozwalają wstawiać zmienne JS bezpośrednio w tekście przez ${}
    const liczbaWizyt = urzadzenie.wizyty ? urzadzenie.wizyty.length : 0;
    const statusInfo = obliczStatus(urzadzenie);

    // Dodajemy klasę statusu do elementu <li> — zmienia kolor lewego paska
    li.classList.add(statusInfo.klasa);

    li.innerHTML = `
      <div class="urzadzenie-info">
        <h3>${urzadzenie.nazwa}</h3>
        <p>👤 ${urzadzenie.klient} &nbsp;|&nbsp; 📍 ${urzadzenie.lokalizacja}</p>
        <p style="font-size: 0.78rem; color: #a0aec0; margin-top: 4px;">
          Dodano: ${urzadzenie.dataUtworzenia} &nbsp;|&nbsp; Wizyty: ${liczbaWizyt} &nbsp;|&nbsp; Przegląd: co ${urzadzenie.interwal || 12} mies.
        </p>
        <span class="status-badge ${statusInfo.klasa}">${statusInfo.etykieta}</span>
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


// --- OBLICZANIE STATUSU PRZEGLĄDU ---
// Funkcja zwraca obiekt z informacjami o statusie urządzenia

function obliczStatus(urzadzenie) {
  const interwal = urzadzenie.interwal || 12; // domyślnie 12 jeśli brak (starsze dane)

  // Szukamy daty ostatniej wizyty — sortujemy i bierzemy pierwszą (najnowszą)
  let dataOstatniejWizyty;

  if (urzadzenie.wizyty && urzadzenie.wizyty.length > 0) {
    const posortowane = [...urzadzenie.wizyty].sort(function(a, b) {
      return new Date(b.data) - new Date(a.data);
    });
    dataOstatniejWizyty = posortowane[0].data; // format YYYY-MM-DD
  } else {
    // Brak wizyt — nie liczymy niczego, zwracamy neutralny status
    return {
      status: 'brak-danych',
      klasa: 'status-brak',
      etykieta: '⬜ Brak danych — dodaj wizytę',
      roznicaDni: null
    };
  }

  // Obliczamy datę następnego przeglądu
  // Tworzymy obiekt Date z ostatniej wizyty i dodajemy miesiące
  const dataNastepnego = new Date(dataOstatniejWizyty + 'T00:00:00');
  dataNastepnego.setMonth(dataNastepnego.getMonth() + interwal);

  // Liczymy ile dni pozostało do przeglądu
  // Math.ceil zaokrągla w górę — np. 0.3 dnia → 1 dzień
  const dzisiaj = new Date();
  dzisiaj.setHours(0, 0, 0, 0); // zerujemy godziny żeby porównywać tylko daty
  const roznicaMs = dataNastepnego - dzisiaj; // różnica w milisekundach
  const roznicaDni = Math.ceil(roznicaMs / (1000 * 60 * 60 * 24)); // ms → dni

  // Przypisujemy status na podstawie liczby dni
  let status, etykieta, klasa;

  if (roznicaDni > 30) {
    status = 'ok';
    klasa = 'status-ok';
    etykieta = `✅ OK — ${roznicaDni} dni do przeglądu`;
  } else if (roznicaDni >= 0) {
    status = 'wkrotce';
    klasa = 'status-wkrotce';
    etykieta = `⚠️ Wkrótce — ${roznicaDni} dni do przeglądu`;
  } else {
    status = 'przeterminowany';
    klasa = 'status-przeterminowany';
    etykieta = `🔴 Przeterminowany — ${Math.abs(roznicaDni)} dni po terminie`;
  }

  return { status, klasa, etykieta, roznicaDni };
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


// --- FILTROWANIE I SORTOWANIE ---

function filtrujIRenderuj() {
  // Odczytujemy aktualne wartości filtrów
  // .toLowerCase() zamienia na małe litery — żeby "kowalski" pasowało do "Kowalski"
  const fraza = poleSzukaj.value.toLowerCase().trim();
  const wybranyStatus = filtrStatus.value;
  const kryteriumSortowania = poleSortuj.value;

  // Krok 1: filtrowanie (filtering) — tworzymy nową tablicę spełniającą warunki
  let wynik = urzadzenia.filter(function(u) {

    // Sprawdzamy czy fraza pasuje do klienta LUB lokalizacji
    const pasujeFraza = fraza === ''
      || u.klient.toLowerCase().includes(fraza)
      || u.lokalizacja.toLowerCase().includes(fraza)
      || u.nazwa.toLowerCase().includes(fraza);

    // Sprawdzamy czy status pasuje do wybranego filtra
    const statusInfo = obliczStatus(u);
    const pasujeStatus = wybranyStatus === 'wszystkie'
      || statusInfo.status === wybranyStatus;

    // Urządzenie trafia do wyników tylko jeśli OBA warunki są spełnione
    return pasujeFraza && pasujeStatus;
  });

  // Krok 2: sortowanie (sorting) — porządkujemy przefiltrowane wyniki
  // .sort() przyjmuje funkcję porównującą dwa elementy (a, b):
  //   zwróć liczbę ujemną → a przed b
  //   zwróć liczbę dodatnią → b przed a
  //   zwróć 0 → kolejność bez zmian
  if (kryteriumSortowania === 'nazwaRosnaco') {
    wynik.sort(function(a, b) {
      return a.nazwa.localeCompare(b.nazwa, 'pl'); // localeCompare obsługuje polskie znaki
    });
  } else if (kryteriumSortowania === 'terminPrzegladuRosnaco') {
    wynik.sort(function(a, b) {
      return obliczStatus(a).roznicaDni - obliczStatus(b).roznicaDni; // najpilniejsze pierwsze
    });
  } else {
    // dataUtworzenia — sortujemy po id (większy id = nowszy)
    wynik.sort(function(a, b) {
      return b.id - a.id;
    });
  }

  renderujListe(wynik);
}

// Nasłuchujemy na zmiany w polach filtrów
// 'input' = odpala się przy każdym wciśnięciu klawisza (wyszukiwanie na żywo)
// 'change' = odpala się gdy zmieni się wartość select
poleSzukaj.addEventListener('input', filtrujIRenderuj);
filtrStatus.addEventListener('change', filtrujIRenderuj);
poleSortuj.addEventListener('change', filtrujIRenderuj);


// =============================================
// ETAP 6: Drukowanie raportu
// =============================================

function drukujRaport() {
  // Szukamy urządzenia po aktualnie wybranym id
  const urzadzenie = urzadzenia.find(function(u) {
    return u.id === aktualneUrzadzenieId;
  });

  // Zabezpieczenie — jeśli coś poszło nie tak i id nie pasuje
  if (!urzadzenie) return;

  // Sortujemy wizyty od najnowszej
  const wizyty = [...(urzadzenie.wizyty || [])].sort(function(a, b) {
    return new Date(b.data) - new Date(a.data);
  });

  // Budujemy HTML wizyt do raportu
  // Jeśli brak wizyt — wyświetlamy komunikat
  const wizytyHTML = wizyty.length === 0
    ? '<p>Brak zarejestrowanych wizyt serwisowych.</p>'
    : wizyty.map(function(w) {
        return `
          <div class="raport-wizyta">
            <h3>Wizyta: ${w.data}</h3>
            <p><strong>Usterka / zgłoszenie:</strong> ${w.usterka}</p>
            <p><strong>Wykonane czynności:</strong> ${w.czynnosci}</p>
            ${w.czesci ? `<p><strong>Użyte części:</strong> ${w.czesci}</p>` : ''}
          </div>
        `;
      }).join('');

  // Data wydruku — formatujemy po polsku
  const dzisiaj = new Date().toLocaleDateString('pl-PL', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // Wypełniamy sekcję raportu gotowym HTML
  sekcjaRaport.innerHTML = `
    <div class="raport-naglowek">
      <h1>HeatLog — Raport urządzenia</h1>
      <p class="raport-meta">Wydrukowano: ${dzisiaj}</p>
    </div>

    <div class="raport-urzadzenie">
      <h2>${urzadzenie.nazwa}</h2>
      <p><strong>Klient:</strong> ${urzadzenie.klient}</p>
      <p><strong>Lokalizacja:</strong> ${urzadzenie.lokalizacja}</p>
      <p><strong>Interwał przeglądu:</strong> co ${urzadzenie.interwal || 12} miesięcy</p>
      <p><strong>Liczba wizyt:</strong> ${wizyty.length}</p>
    </div>

    <h2>Historia wizyt serwisowych</h2>
    ${wizytyHTML}

    <div class="raport-stopka">
      Raport wygenerowany przez HeatLog &mdash; aplikację do zarządzania serwisem wymienników ciepła.
    </div>
  `;

  // Otwieramy okno drukowania systemu
  // @media print w CSS zadba o resztę — schowa aplikację, pokaże raport
  window.print();
}


// --- START: Renderujemy listę przy pierwszym załadowaniu strony ---
// Dane zostały już wczytane z localStorage na górze pliku (KROK 2)
// Jeśli coś było zapisane — pojawi się od razu po otwarciu strony
renderujListe();
