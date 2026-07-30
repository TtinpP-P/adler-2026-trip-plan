export type MealType = "own" | "date";
export type PlaceCategory = "own" | "treat" | "date" | "activity";

export type Meal = {
  id: string;
  time: string;
  label: "Завтрак" | "Обед" | "Ужин";
  type: MealType;
  title: string;
  location: string;
  pack: string;
  storage: string;
  water: string;
  note: string;
  mapUrl: string;
  routeUrl: string;
  status?: "confirmed" | "verify";
};

export type TimelineItem = {
  id: string;
  time: string;
  title: string;
  detail: string;
  kind: "move" | "nature" | "training" | "date" | "mountain" | "rest" | "task";
  mapUrl?: string;
  routeUrl?: string;
  phone?: string;
  checkable?: boolean;
  warning?: string;
};

export type TripDay = {
  id: string;
  shortDate: string;
  weekday: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  budget: string;
  image: string;
  imageAlt: string;
  meals: Meal[];
  timeline: TimelineItem[];
  fallback: string;
};

export type Place = {
  id: string;
  category: PlaceCategory;
  title: string;
  context: string;
  location: string;
  price: string;
  image: string;
  imageAlt: string;
  practical: string;
  foodPolicy: string;
  mapUrl: string;
  routeUrl: string;
  sourceUrl?: string;
  sourceLabel?: string;
};

export type PracticalPlaceCategory =
  | "training"
  | "groceries"
  | "delicacies"
  | "souvenirs"
  | "date"
  | "treat";

export type PracticalPlace = {
  id: string;
  category: PracticalPlaceCategory;
  title: string;
  location: string;
  practical: string;
  mapUrl: string;
  routeUrl: string;
  sourceUrl?: string;
  sourceLabel?: string;
  phone?: string;
};

export type BudgetRow = {
  id: string;
  category: string;
  calculation: string;
  amount: number;
  note: string;
  group: "food" | "route" | "activity" | "reserve";
};

export type TicketItem = {
  id: string;
  date: string;
  title: string;
  detail: string;
  unitPrice: number;
  initialQty: number;
  mode: "online" | "onsite" | "booking" | "free";
  href: string;
  action: string;
  priceNote?: string;
};

export const HOME = "Гостевой дом Дядя Стёпа, Фермерская улица, 26, Адлер";
export const STATION = "Железнодорожный вокзал Адлер, улица Ленина, 113";

export const mapUrl = (place: string) =>
  `https://yandex.ru/maps/?text=${encodeURIComponent(place)}`;

export const routeUrl = (
  from: string,
  to: string,
  mode: "auto" | "pd" = "auto",
) =>
  `https://yandex.ru/maps/?rtext=${encodeURIComponent(from)}~${encodeURIComponent(
    to,
  )}&rtt=${mode}`;

const homeMeal = (
  id: string,
  time: string,
  label: Meal["label"],
  title: string,
  note: string,
): Meal => ({
  id,
  time,
  label,
  type: "own",
  title,
  location: "На базе · Фермерская, 26",
  pack:
    label === "Завтрак"
      ? "Овсянка/яйца, творог или привычный завтрак."
      : "Заранее приготовленная порция из продуктовой корзины.",
  storage: "Холодильник на базе; проверить его работу при заселении.",
  water: "Наполнить бутылки перед выходом.",
  note,
  mapUrl: mapUrl(HOME),
  routeUrl: mapUrl(HOME),
  status: "confirmed",
});

export const DAYS: TripDay[] = [
  {
    id: "2026-08-01",
    shortDate: "1 авг",
    weekday: "Суббота",
    eyebrow: "День 1 · прибытие",
    title: "Заселиться и спокойно настроить базу",
    subtitle: "Без гонки: вокзал, такси, вода и минимальная закупка.",
    budget: "1 000–2 000 ₽",
    image: "/places/adler-station.jpg",
    imageAlt: "Фасад железнодорожного вокзала Адлер",
    meals: [
      {
        id: "d1-breakfast",
        time: "08:00",
        label: "Завтрак",
        type: "own",
        title: "Дорожный контейнер в поезде",
        location: "В вагоне, за своим местом",
        pack: "Каша/сэндвич, белок, фрукт, приборы и салфетки.",
        storage: "Термосумка; первым съесть то, что требует холода.",
        water: "Своя бутылка + запас воды до прибытия.",
        note: "Не покупать случайную вокзальную еду: основа уже с собой.",
        mapUrl: mapUrl(STATION),
        routeUrl: mapUrl(STATION),
        status: "confirmed",
      },
      {
        id: "d1-lunch",
        time: "13:30",
        label: "Обед",
        type: "own",
        title: "Вторая дорожная порция",
        location: "В поезде",
        pack: "Контейнер с устойчивой к дороге едой + сухой перекус.",
        storage: "Достать из термосумки непосредственно перед едой.",
        water: "Проверить, что осталось не меньше 0,7 л.",
        note: "Оставить один небольшой перекус на последние часы пути.",
        mapUrl: mapUrl(STATION),
        routeUrl: mapUrl(STATION),
        status: "confirmed",
      },
      homeMeal(
        "d1-dinner",
        "20:45",
        "Ужин",
        "Быстрый ужин после заселения",
        "Минимальная закупка: вода, яйца/овсянка, творог и готовая база на ужин.",
      ),
    ],
    timeline: [
      {
        id: "d1-arrival",
        time: "≈19:00",
        title: "Вокзал Адлер",
        detail: "Сверить станцию в билете, забрать багаж и вызвать такси.",
        kind: "move",
        mapUrl: mapUrl(STATION),
        routeUrl: routeUrl(STATION, HOME),
        checkable: true,
      },
      {
        id: "d1-checkin",
        time: "19:30–20:15",
        title: "Заселение",
        detail: "Проверить кухню, посуду, холодильник и зарядки.",
        kind: "task",
        mapUrl: mapUrl(HOME),
        checkable: true,
      },
      {
        id: "d1-shop",
        time: "20:15–21:00",
        title: "Только минимальная закупка",
        detail: "Основную корзину удобнее собрать утром 2 августа.",
        kind: "task",
        mapUrl: mapUrl("Базар Апельсин, улица Ленина, 156, Адлер"),
        routeUrl: routeUrl(HOME, "Базар Апельсин, улица Ленина, 156, Адлер", "pd"),
        checkable: true,
      },
    ],
    fallback: "Если поезд опоздает — вода и готовый ужин по пути, большую закупку не переносить на ночь.",
  },
  {
    id: "2026-08-02",
    shortDate: "2 авг",
    weekday: "Воскресенье",
    eyebrow: "День 2 · мягкий старт",
    title: "«Южные культуры», восстановление и море",
    subtitle: "Парк до жары, затем еда на базе и свободный блок.",
    budget: "1 700–2 600 ₽",
    image: "/places/southern-cultures.jpg",
    imageAlt: "Цветущая магнолия в парке Южные культуры",
    meals: [
      homeMeal(
        "d2-breakfast",
        "08:30",
        "Завтрак",
        "Завтрак на базе",
        "Лёгкая еда перед прогулкой; воду и небольшой перекус взять с собой.",
      ),
      {
        id: "d2-lunch",
        time: "13:15",
        label: "Обед",
        type: "own",
        title: "Основной вариант — вернуться на базу",
        location: "На базе после парка",
        pack: "Готовая порция, которую можно быстро разогреть.",
        storage: "Оставить в холодильнике до возвращения.",
        water: "Пополнить бутылки перед морем.",
        note: "Если не хочется возвращаться: взять ланч-бокс и есть только после выхода из парка на набережной. Правила пикника внутри парка уточнить.",
        mapUrl: mapUrl(HOME),
        routeUrl: routeUrl("Парк Южные культуры, Нагорный тупик, 13, Сириус", HOME),
        status: "verify",
      },
      homeMeal(
        "d2-dinner",
        "19:00",
        "Ужин",
        "Ужин после моря",
        "Спокойный ужин без отдельного выезда; вечером собрать еду на насыщенный 3 августа.",
      ),
    ],
    timeline: [
      {
        id: "d2-park",
        time: "10:00–12:30",
        title: "Парк «Южные культуры»",
        detail: "Пруды, мостики, бамбук и тень. Вход 300 ₽ с человека.",
        kind: "nature",
        mapUrl: mapUrl("Парк Южные культуры, Нагорный тупик, 13, Сириус"),
        routeUrl: routeUrl(HOME, "Парк Южные культуры, Нагорный тупик, 13, Сириус"),
        phone: "+78622405136",
        checkable: true,
      },
      {
        id: "d2-rest",
        time: "13:00–17:00",
        title: "Обед, сон или море",
        detail: "Свободный блок без обязательных точек; закончить основную закупку.",
        kind: "rest",
        checkable: true,
      },
    ],
    fallback: "В сильную жару сократить парк и перенести море ближе к вечеру.",
  },
  {
    id: "2026-08-03",
    shortDate: "3 авг",
    weekday: "Понедельник",
    eyebrow: "День 3 · свидание",
    title: "Зал, спокойный Сириус и свидание",
    subtitle: "Единственный ресторанный приём пищи во всей поездке.",
    budget: "7 800–9 000 ₽",
    image: "/places/date-happiness.png",
    imageAlt: "Ресторан для романтического ужина в Сириусе",
    meals: [
      homeMeal(
        "d3-breakfast",
        "07:30",
        "Завтрак",
        "Предтренировочный завтрак",
        "Привычная лёгкая еда; не экспериментировать перед тренировкой.",
      ),
      homeMeal(
        "d3-lunch",
        "11:30",
        "Обед",
        "Восстановительный обед на базе",
        "Плотно поесть до поездки в Сириус, чтобы не превращать прогулку в поиск еды.",
      ),
      {
        id: "d3-dinner",
        time: "17:00",
        label: "Ужин",
        type: "date",
        title: "Свидание в ресторане",
        location: "Основной выбор: «Моё ты счастье»",
        pack: "Ничего: это единственное исключение из своей еды.",
        storage: "—",
        water: "Вода включается в ресторанный чек, не в конверт вкусняшек.",
        note: "Бронь на 17:00–17:30. Лимит ужина на двоих — до 7 000 ₽.",
        mapUrl: mapUrl("Моё ты счастье, Нижнеимеретинская улица, 32В, Сириус"),
        routeUrl: routeUrl(
          "Имеретинская набережная, Сириус",
          "Моё ты счастье, Нижнеимеретинская улица, 32В, Сириус",
          "pd",
        ),
        status: "confirmed",
      },
    ],
    timeline: [
      {
        id: "d3-gym",
        time: "08:30–09:45",
        title: "«Жюль Верн» · тренировка №1",
        detail: "Умеренный full body, RPE 6–7; без тяжёлых ног.",
        kind: "training",
        mapUrl: mapUrl("Жюль Верн, фитнес-клуб, улица Удачи, 7, Адлер"),
        routeUrl: routeUrl(HOME, "Жюль Верн, фитнес-клуб, улица Удачи, 7, Адлер", "pd"),
        phone: "+79890803888",
        checkable: true,
      },
      {
        id: "d3-sirius",
        time: "13:30–16:30",
        title: "Спокойный Сириус и море",
        detail: "Прогулка по Имеретинской набережной без обязательных точек; оставить время на дорогу к ресторану.",
        kind: "rest",
        mapUrl: mapUrl("Имеретинская набережная, Сириус"),
        routeUrl: routeUrl(HOME, "Имеретинская набережная, Сириус"),
        checkable: true,
      },
      {
        id: "d3-date",
        time: "17:00–19:10",
        title: "Романтический ужин",
        detail: "Стол у окна или на террасе. После ужина — спокойный вечер без отдельной программы.",
        kind: "date",
        phone: "+79956123030",
        checkable: true,
      },
    ],
    fallback: "Если после тренировки мало сил — пропустить прогулку по Сириусу и ехать на свидание напрямую.",
  },
  {
    id: "2026-08-04",
    shortDate: "4 авг",
    weekday: "Вторник",
    eyebrow: "День 4 · трекинг",
    title: "Тисо-самшитовая роща: Большое кольцо",
    subtitle: "Кроссовки, вода, перекус и без тренировки после маршрута.",
    budget: "1 900–2 900 ₽",
    image: "/places/grove.jpg",
    imageAlt: "Лесная тропа в Тисо-самшитовой роще",
    meals: [
      homeMeal(
        "d4-breakfast",
        "08:00",
        "Завтрак",
        "Плотный завтрак перед тропой",
        "Добавить углеводы и белок; собрать ланч-бокс сразу после завтрака.",
      ),
      {
        id: "d4-lunch",
        time: "14:15",
        label: "Обед",
        type: "own",
        title: "Ланч-бокс после Большого кольца",
        location: "У визит-центра / в разрешённой зоне отдыха",
        pack: "Плотный контейнер, фрукт, сухой перекус, салфетки.",
        storage: "Термосумка с холодовым элементом; не держать на солнце.",
        water: "1–1,5 л на человека + электролиты по желанию.",
        note: "Место приёма еды уточнить у сотрудника на входе; не есть на узкой тропе и у края каньона.",
        mapUrl: mapUrl("Тисо-самшитовая роща, Самшитовая улица, Хоста"),
        routeUrl: routeUrl(
          "Большое кольцо, Тисо-самшитовая роща",
          "Визит-центр Тисо-самшитовой рощи",
          "pd",
        ),
        status: "verify",
      },
      homeMeal(
        "d4-dinner",
        "19:00",
        "Ужин",
        "Восстановительный ужин",
        "Еда на базе, душ и ранний сон; ноги уже получили полноценную нагрузку.",
      ),
    ],
    timeline: [
      {
        id: "d4-transfer",
        time: "09:00–10:00",
        title: "Дорога в Хосту",
        detail: "До входа на маршрут приехать с запасом.",
        kind: "move",
        routeUrl: routeUrl(HOME, "Тисо-самшитовая роща, Самшитовая улица, Хоста"),
        checkable: true,
      },
      {
        id: "d4-grove",
        time: "10:00–14:00",
        title: "Большое кольцо · около 5 км",
        detail: "Реалистичный темп с фото — 3–4 часа. Вход 300 ₽ с человека.",
        kind: "nature",
        mapUrl: mapUrl("Тисо-самшитовая роща, Самшитовая улица, Хоста"),
        phone: "+78622650097",
        warning: "Вход на Большое кольцо — до 14:00.",
        checkable: true,
      },
      {
        id: "d4-recovery",
        time: "После 16:00",
        title: "Море или полное восстановление",
        detail: "Без зала и без второй длинной прогулки.",
        kind: "rest",
      },
    ],
    fallback: "После сильного дождя проверить состояние маршрута по телефону и не рисковать на мокрых краях.",
  },
  {
    id: "2026-08-05",
    shortDate: "5 авг",
    weekday: "Среда",
    eyebrow: "День 5 · высота",
    title: "Skypark официальным трансфером и лёгкий зал",
    subtitle: "Билет онлайн, трансфер от вокзала и запас по воде.",
    budget: "6 740–7 840 ₽",
    image: "/places/skypark.jpg",
    imageAlt: "Подвесной мост Skybridge в Skypark Сочи",
    meals: [
      homeMeal(
        "d5-breakfast",
        "08:30",
        "Завтрак",
        "Завтрак перед Skypark",
        "Собрать ланч-бокс и выйти без спешки к вокзалу.",
      ),
      {
        id: "d5-lunch",
        time: "15:45",
        label: "Обед",
        type: "own",
        title: "Основной вариант — после возвращения к вокзалу",
        location: "Морская сторона вокзала Адлер / затем база",
        pack: "Ланч-бокс, который безопасно выдержит день в термосумке.",
        storage: "Холодовой элемент обязателен; скоропортящееся съесть раньше.",
        water: "Не меньше 1 л на человека; пополнение уточнить на месте.",
        note: "Правила своей еды внутри Skypark заранее не подтверждены. Надёжнее поесть до посадки или после обратного трансфера.",
        mapUrl: mapUrl(STATION),
        routeUrl: routeUrl("Skypark, Казачий Брод", STATION),
        status: "verify",
      },
      homeMeal(
        "d5-dinner",
        "20:00",
        "Ужин",
        "Ужин после тренировки",
        "Заранее оставить готовую порцию; не переносить ужин ради ещё одной прогулки.",
      ),
    ],
    timeline: [
      {
        id: "d5-station",
        time: "09:20–09:35",
        title: "К морской стороне вокзала",
        detail: "Синяя стела Skypark, посадка по живой очереди.",
        kind: "move",
        routeUrl: routeUrl(HOME, STATION, "pd"),
        checkable: true,
      },
      {
        id: "d5-transfer",
        time: "10:00",
        title: "Официальный трансфер Skypark",
        detail: "200 ₽ с человека за обе стороны; обратное место выбрать по приезде.",
        kind: "move",
        checkable: true,
      },
      {
        id: "d5-park",
        time: "10:45–15:30",
        title: "Skybridge без дополнительных аттракционов",
        detail: "Мост в обе стороны, паузы на смотровых. Онлайн-билет 2 520 ₽ с человека.",
        kind: "mountain",
        mapUrl: mapUrl("Skypark, Краснофлотская улица, 54А, Казачий Брод"),
        phone: "88001004207",
        checkable: true,
      },
      {
        id: "d5-gym",
        time: "18:15–19:25",
        title: "«Жюль Верн» · тренировка №2",
        detail: "Верх тела, техника, памп; при усталости сократить до 40–50 минут.",
        kind: "training",
        routeUrl: routeUrl(HOME, "Жюль Верн, улица Удачи, 7, Адлер", "pd"),
        checkable: true,
      },
    ],
    fallback: "При сильном ветре проверить работу парка. Если отменён — зал утром и спокойный день у моря.",
  },
  {
    id: "2026-08-06",
    shortDate: "6 авг",
    weekday: "Четверг",
    eyebrow: "День 6 · горы",
    title: "«Ласточка», Роза Хутор и кофе на 1100 м",
    subtitle: "Главный горный день; без тренировки после возвращения.",
    budget: "9 500–10 500 ₽",
    image: "/places/rosa.webp",
    imageAlt: "Горный пейзаж курорта Роза Хутор",
    meals: [
      homeMeal(
        "d6-breakfast",
        "07:15",
        "Завтрак",
        "Ранний завтрак перед электричкой",
        "Сразу собрать две безопасные порции: горный обед и резерв на дорогу.",
      ),
      {
        id: "d6-lunch",
        time: "13:00",
        label: "Обед",
        type: "own",
        title: "Ланч-бокс на Розе",
        location: "Роза Долина / разрешённая зона отдыха",
        pack: "Плотный контейнер, фрукт, батончик и салфетки.",
        storage: "Термосумка; на высоте погода прохладнее, но холодовой элемент всё равно нужен.",
        water: "0,75–1 л на человека; пополнять в официальных точках.",
        note: "В комбо «День на Роза Хутор» уже включён обед в «Берлоге». Вы выбираете свою еду, поэтому включённый обед может остаться неиспользованным; правила еды на канатках уточнить.",
        mapUrl: mapUrl("Роза Долина 560, Роза Хутор"),
        routeUrl: routeUrl("Роза Пик 2320", "Роза Долина 560, Роза Хутор"),
        status: "verify",
      },
      homeMeal(
        "d6-dinner",
        "20:30",
        "Ужин",
        "Поздний ужин после гор",
        "Готовая порция на базе. После — только душ и сон.",
      ),
    ],
    timeline: [
      {
        id: "d6-train",
        time: "≈09:10",
        title: "«Ласточка» Адлер → Роза Хутор",
        detail: "Точное расписание проверить за 24–48 часов; ориентир 300 ₽ в одну сторону.",
        kind: "move",
        mapUrl: mapUrl(STATION),
        routeUrl: routeUrl(HOME, STATION),
        warning: "Не привязывать последнюю канатку к последней электричке.",
        checkable: true,
      },
      {
        id: "d6-rosa",
        time: "10:30–16:30",
        title: "Канатные дороги 560 → 1100 → 2320 м",
        detail: "Комбо 3 350 ₽ с человека + нацпарк 300 ₽ с человека.",
        kind: "mountain",
        mapUrl: mapUrl("Роза Хутор, Эсто-Садок"),
        checkable: true,
      },
      {
        id: "d6-treat",
        time: "Пауза по погоде",
        title: "Вкусняшка: Surf Coffee на 1100 м",
        detail: "Кофе/десерт оплачивается из отдельного конверта 2 000 ₽.",
        kind: "rest",
        mapUrl: mapUrl("Surf Coffee Роза Хутор 1100, улица Медовая, 6"),
        checkable: true,
      },
    ],
    fallback: "При грозе или плохой видимости поменять с 7 августа только при безопасном запасе до сборов.",
  },
  {
    id: "2026-08-07",
    shortDate: "7 авг",
    weekday: "Пятница",
    eyebrow: "День 7 · закрытие поездки",
    title: "Финальный зал, море, вкусняшки и сборы",
    subtitle: "Никаких дальних точек: оставить силы на ранний выезд.",
    budget: "2 300–3 300 ₽",
    image: "/places/cafe-malina.jpg",
    imageAlt: "Десерт и напиток как отдельная вкусняшка",
    meals: [
      homeMeal(
        "d7-breakfast",
        "07:45",
        "Завтрак",
        "Завтрак перед финальной тренировкой",
        "Лёгкая привычная еда; после зала не заменять обед десертом.",
      ),
      {
        id: "d7-lunch",
        time: "12:30",
        label: "Обед",
        type: "own",
        title: "Ланч-бокс у моря или обед на базе",
        location: "Выбрать по погоде и состоянию",
        pack: "Контейнер, фрукт, вода; пляжный пакет для мусора.",
        storage: "Термосумка в тени, не оставлять в закрытой машине/на солнце.",
        water: "Наполнить бутылку после душа в зале.",
        note: "Вкусняшка — отдельная пауза после полноценного обеда, а не его замена.",
        mapUrl: mapUrl("Пляж в районе Курортного городка, Адлер"),
        routeUrl: routeUrl(HOME, "Пляж в районе Курортного городка, Адлер", "pd"),
        status: "verify",
      },
      homeMeal(
        "d7-dinner",
        "18:30",
        "Ужин",
        "Финальный ужин на базе",
        "После ужина собрать дорожную еду на 8 августа и закончить чемоданы до 21:00.",
      ),
    ],
    timeline: [
      {
        id: "d7-gym",
        time: "09:00–10:15",
        title: "«Жюль Верн» · тренировка №3",
        detail: "Лёгкий full body/памп, без отказа и новых упражнений.",
        kind: "training",
        routeUrl: routeUrl(HOME, "Жюль Верн, улица Удачи, 7, Адлер", "pd"),
        checkable: true,
      },
      {
        id: "d7-sea",
        time: "11:00–16:30",
        title: "Море + одна выбранная вкусняшка",
        detail: "Не превращать свободный день в новую экспедицию.",
        kind: "rest",
        checkable: true,
      },
      {
        id: "d7-pack",
        time: "18:00–21:00",
        title: "Ужин, сборы и раннее такси",
        detail: "Документы, билеты, вода, еда, два будильника, заказ машины.",
        kind: "task",
        checkable: true,
      },
    ],
    fallback: "Если усталость накопилась — море и вкусняшки отменяем первыми, сборы и сон сохраняем.",
  },
  {
    id: "2026-08-08",
    shortDate: "8 авг",
    weekday: "Суббота",
    eyebrow: "День 8 · отъезд",
    title: "Такси в 04:35 и поезд в 05:46",
    subtitle: "Всё подготовлено с вечера; утром только взять вещи.",
    budget: "600–900 ₽",
    image: "/places/adler-station.jpg",
    imageAlt: "Железнодорожный вокзал Адлер",
    meals: [
      {
        id: "d8-breakfast",
        time: "05:20",
        label: "Завтрак",
        type: "own",
        title: "Дорожный завтрак после посадки",
        location: "В поезде",
        pack: "Готовый с вечера контейнер + тёплый напиток в термосе.",
        storage: "Термосумка рядом, не сдавать с багажом.",
        water: "Бутылка доступна сразу после посадки.",
        note: "Не рассчитывать на открытые точки у вокзала в 05:00.",
        mapUrl: mapUrl(STATION),
        routeUrl: routeUrl(HOME, STATION),
        status: "confirmed",
      },
      {
        id: "d8-lunch",
        time: "13:00",
        label: "Обед",
        type: "own",
        title: "Дорожный обед",
        location: "В вагоне",
        pack: "Вторая порция + сухой резерв.",
        storage: "Проверить срок безопасного хранения ещё при сборке.",
        water: "Пополнять по пути только в надёжных точках.",
        note: "Сначала съесть скоропортящееся, сухой перекус оставить на вечер.",
        mapUrl: mapUrl(STATION),
        routeUrl: mapUrl(STATION),
        status: "confirmed",
      },
      {
        id: "d8-dinner",
        time: "19:00",
        label: "Ужин",
        type: "own",
        title: "Последняя дорожная порция",
        location: "В поезде",
        pack: "Непортящаяся еда: крупа/хлебцы, консерва с ключом, орехи, фрукт.",
        storage: "Комнатное хранение только для подходящих продуктов.",
        water: "Сохранить запас до ночи.",
        note: "Меню собрать под длительность реального обратного маршрута.",
        mapUrl: mapUrl(STATION),
        routeUrl: mapUrl(STATION),
        status: "confirmed",
      },
    ],
    timeline: [
      {
        id: "d8-wake",
        time: "04:20",
        title: "Подъём",
        detail: "Не принимать решений: всё уже лежит у выхода.",
        kind: "task",
        checkable: true,
      },
      {
        id: "d8-taxi",
        time: "04:35–04:45",
        title: "Такси до вокзала",
        detail: "Цель быть у платформы в 05:05–05:15.",
        kind: "move",
        routeUrl: routeUrl(HOME, STATION),
        checkable: true,
      },
      {
        id: "d8-train",
        time: "05:46",
        title: "Отправление",
        detail: "Станцию и платформу проверить в билете.",
        kind: "move",
        mapUrl: mapUrl(STATION),
        checkable: true,
      },
    ],
    fallback: "Если такси задерживается — сразу звонить водителю и параллельно вызывать резервную машину.",
  },
];

export const PLACES: Place[] = [
  {
    id: "southern-cultures",
    category: "activity",
    title: "Парк «Южные культуры»",
    context: "2 августа · прогулка до жары",
    location: "Нагорный тупик, 13/3Б, Сириус",
    price: "600 ₽ вход на двоих",
    image: "/places/southern-cultures.jpg",
    imageAlt: "Магнолия в парке Южные культуры",
    practical: "09:00–18:00, билеты до 17:00. План — 10:00–12:30.",
    foodPolicy: "Основной обед — после возвращения. Пикник внутри заранее не заявляем.",
    mapUrl: mapUrl("Парк Южные культуры, Нагорный тупик, 13/3Б, Сириус"),
    routeUrl: routeUrl(HOME, "Парк Южные культуры, Нагорный тупик, 13/3Б, Сириус"),
    sourceUrl:
      "https://www.kavkazzapoved.ru/tours/park-yuzhnye-kultury/park-yuzhnye-kultury",
    sourceLabel: "Официальная страница",
  },
  {
    id: "grove-rest",
    category: "activity",
    title: "Тисо-самшитовая роща",
    context: "4 августа · Большое кольцо",
    location: "Тисо-самшитовая роща, Хоста",
    price: "≈2 100 ₽ на двоих с дорогой",
    image: "/places/grove.jpg",
    imageAlt: "Зелёная тропа Тисо-самшитовой рощи",
    practical: "Ланч-бокс, холодовой элемент, 1–1,5 л воды на человека.",
    foodPolicy: "Разрешённое место приёма еды уточнить у сотрудника на входе.",
    mapUrl: mapUrl("Тисо-самшитовая роща, Самшитовая улица, Хоста"),
    routeUrl: routeUrl(HOME, "Тисо-самшитовая роща, Самшитовая улица, Хоста"),
    sourceUrl: "https://www.kavkazzapoved.ru/en/node/24054",
    sourceLabel: "Официальный маршрут",
  },
  {
    id: "station-seaside",
    category: "own",
    title: "Морская сторона вокзала",
    context: "5 августа · до/после трансфера Skypark",
    location: "Вокзал Адлер, улица Ленина, 113",
    price: "0 ₽",
    image: "/places/adler-station.jpg",
    imageAlt: "Современный вокзал Адлер со стороны улицы",
    practical: "Надёжнее спланировать еду здесь, чем зависеть от правил Skypark.",
    foodPolicy: "Своя еда; выбрать спокойное место, не перекрывая поток пассажиров.",
    mapUrl: mapUrl(STATION),
    routeUrl: routeUrl(HOME, STATION, "pd"),
  },
  {
    id: "skypark",
    category: "activity",
    title: "Skypark",
    context: "5 августа · 10:45–15:30",
    location: "Краснофлотская, 54А, Казачий Брод",
    price: "≈5 440 ₽ билеты + трансфер",
    image: "/places/skypark.jpg",
    imageAlt: "Длинный подвесной мост Skybridge",
    practical: "Обратный трансфер забронировать сразу по приезде.",
    foodPolicy: "Правила своей еды внутри нужно уточнить; основной план не зависит от этого.",
    mapUrl: mapUrl("Skypark, Краснофлотская улица, 54А, Казачий Брод"),
    routeUrl: routeUrl(STATION, "Skypark, Краснофлотская улица, 54А, Казачий Брод"),
    sourceUrl: "https://skypark.ru/getting-here/",
    sourceLabel: "Трансфер и проезд",
  },
  {
    id: "rosa-valley",
    category: "activity",
    title: "Роза Хутор",
    context: "6 августа · 560 → 1100 → 2320 м",
    location: "Роза Долина, 560 м",
    price: "≈9 800 ₽ на двоих",
    image: "/places/rosa.webp",
    imageAlt: "Горы и зона отдыха курорта Роза Хутор",
    practical: "Скамейки и более предсказуемая логистика, чем на верхней станции.",
    foodPolicy: "Свою еду и конкретную разрешённую зону уточнить у курорта.",
    mapUrl: mapUrl("Роза Долина 560, Роза Хутор"),
    routeUrl: routeUrl("Железнодорожная станция Роза Хутор", "Роза Долина 560, Роза Хутор"),
    sourceUrl: "https://rosakhutor.ru/",
    sourceLabel: "Официальный курорт",
  },
  {
    id: "surf-1100",
    category: "treat",
    title: "Surf Coffee, 1100 м",
    context: "6 августа · кофе с видом",
    location: "Горная Олимпийская деревня, Медовая, 6",
    price: "Ориентир 600–1 200 ₽ на двоих",
    image: "/places/surf-coffee.webp",
    imageAlt: "Интерьер кофейни Surf Coffee на Роза Хутор",
    practical: "08:00–22:00 по официальной карточке. Хорошо ложится в горный день.",
    foodPolicy: "Вкусняшка, не основной приём пищи. Оплата из конверта 2 000 ₽.",
    mapUrl: mapUrl("Surf Coffee Роза Хутор 1100, улица Медовая, 6"),
    routeUrl: routeUrl("Роза Пик 2320", "Surf Coffee Роза Хутор 1100, улица Медовая, 6", "pd"),
    sourceUrl: "https://rosakhutor.ru/what-to-do/kofeynya-surf-coffee/",
    sourceLabel: "Официальная карточка",
  },
  {
    id: "happiness",
    category: "date",
    title: "«Моё ты счастье»",
    context: "Основной выбор на 3 августа",
    location: "Нижнеимеретинская, 32В",
    price: "5 500–7 000 ₽ на двоих",
    image: "/places/date-happiness.png",
    imageAlt: "Ресторан Моё ты счастье",
    practical: "Бронь на 17:00–17:30; просить стол у окна или на террасе.",
    foodPolicy: "Единственный ресторанный приём пищи в плане.",
    mapUrl: mapUrl("Моё ты счастье, Нижнеимеретинская улица, 32В, Сириус"),
    routeUrl: routeUrl("Имеретинская набережная, Сириус", "Моё ты счастье, Нижнеимеретинская улица, 32В, Сириус", "pd"),
    sourceUrl: "https://moetischastie.rest/",
    sourceLabel: "Сайт ресторана",
  },
  {
    id: "my-star",
    category: "date",
    title: "«Моя Звезда by Novikov»",
    context: "Резерв, только после проверки чека",
    location: "Олимпийский проспект, 36/6",
    price: "Риск выйти за 7 000 ₽",
    image: "/places/date-star.webp",
    imageAlt: "Интерьер ресторана Моя Звезда",
    practical: "Логистически удобно, но это премиальный резерв, а не равнозначная замена.",
    foodPolicy: "Выбирать только при заранее подтверждённой возможности удержать лимит.",
    mapUrl: mapUrl("Моя Звезда by Novikov, Олимпийский проспект, 36/6, Сириус"),
    routeUrl: routeUrl("Имеретинская набережная, Сириус", "Моя Звезда by Novikov, Олимпийский проспект, 36/6, Сириус", "pd"),
    sourceUrl: "https://www.novikovgroup.ru/restaurants/detail/moya-zvezda/",
    sourceLabel: "Сайт ресторана",
  },
  {
    id: "jules-verne",
    category: "activity",
    title: "Три тренировки в «Жюль Верн»",
    context: "3, 5 и 7 августа",
    location: "Улица Удачи, 7, Адлер",
    price: "≈2 800 ₽ за три парные тренировки",
    image: "/places/adler-station.jpg",
    imageAlt: "Адлер — район расположения фитнес-клуба Жюль Верн",
    practical: "Тренировки умеренные: full body, восстановительная и финальная. Режим клуба 08:00–22:00.",
    foodPolicy: "Своя еда до или после тренировки по расписанию выбранного дня.",
    mapUrl: mapUrl("Жюль Верн, фитнес-клуб, улица Удачи, 7, Адлер"),
    routeUrl: routeUrl(HOME, "Жюль Верн, фитнес-клуб, улица Удачи, 7, Адлер", "pd"),
    sourceUrl: "https://jv-fit.ru/",
    sourceLabel: "Сайт фитнес-клуба",
  },
];

export const FEATURED_EVENT_IDS = [
  "southern-cultures",
  "grove-rest",
  "skypark",
  "rosa-valley",
  "jules-verne",
] as const;

export const TICKETS: TicketItem[] = [
  {
    id: "southern",
    date: "2 августа",
    title: "Парк «Южные культуры»",
    detail: "Взрослый вход. Билет приобретается в кассе парка до 17:00.",
    unitPrice: 300,
    initialQty: 2,
    mode: "onsite",
    href: "https://www.kavkazzapoved.ru/tours/park-yuzhnye-kultury/park-yuzhnye-kultury",
    action: "Правила и касса",
  },
  {
    id: "grove",
    date: "4 августа",
    title: "Тисо-самшитовая роща",
    detail: "Единый вход на маршруты. Для Большого кольца билет рекомендуют брать в день похода.",
    unitPrice: 300,
    initialQty: 2,
    mode: "onsite",
    href: "https://www.kavkazzapoved.ru/en/node/24054",
    action: "Маршрут и касса",
  },
  {
    id: "skypark",
    date: "5 августа",
    title: "Skypark · прогулка",
    detail: "Вход в парк, Skybridge и смотровые площадки. Онлайн-скидка уже учтена.",
    unitPrice: 2520,
    initialQty: 2,
    mode: "online",
    href: "https://skypark.ru/",
    action: "Купить на Skypark",
  },
  {
    id: "rosa",
    date: "6 августа",
    title: "Роза Хутор · прогулочный",
    detail: "Плановый комбо-билет на канатные дороги. Точный тариф зависит от выбранной даты.",
    unitPrice: 3350,
    initialQty: 2,
    mode: "online",
    href: "https://rosakhutor.ru/tickets/",
    action: "Выбрать дату на Розе",
    priceNote: "плановая цена",
  },
  {
    id: "gym",
    date: "3, 5 и 7 августа",
    title: "«Жюль Верн» · разовый вход",
    detail: "Три парные тренировки. Перед первым визитом подтвердить разовый тариф.",
    unitPrice: 400,
    initialQty: 6,
    mode: "booking",
    href: "https://jv-fit.ru/",
    action: "Уточнить у клуба",
    priceNote: "ориентир",
  },
];

export const EVENT_COUNT = FEATURED_EVENT_IDS.length;
export const TICKET_ITEM_COUNT = TICKETS.length;
export const ONLINE_TICKET_COUNT = TICKETS.filter(
  (ticket) => ticket.mode === "online",
).length;

export const PRACTICAL_PLACES: PracticalPlace[] = [
  {
    id: "gym",
    category: "training",
    title: "Фитнес-клуб «Жюль Верн»",
    location: "Улица Удачи, 7, Адлер",
    practical: "Три тренировки по плану. Ежедневно 08:00–22:00; перед первым визитом уточнить разовый вход.",
    mapUrl: mapUrl("Жюль Верн, фитнес-клуб, улица Удачи, 7, Адлер"),
    routeUrl: routeUrl(HOME, "Жюль Верн, фитнес-клуб, улица Удачи, 7, Адлер", "pd"),
    sourceUrl: "https://jv-fit.ru/",
    sourceLabel: "Сайт клуба",
    phone: "+79890803888",
  },
  {
    id: "orange-market",
    category: "groceries",
    title: "«Апельсин.Базар»",
    location: "Улица Ленина, 156, Адлер",
    practical: "Самая удобная точка для базовой закупки после заселения: продукты, вода и бытовые мелочи.",
    mapUrl: mapUrl("Апельсин Базар, улица Ленина, 156, Адлер"),
    routeUrl: routeUrl(HOME, "Апельсин Базар, улица Ленина, 156, Адлер", "pd"),
    sourceUrl: "https://apelsin-bazar.com/",
    sourceLabel: "Сайт рынка",
    phone: "+79881812244",
  },
  {
    id: "cheese",
    category: "delicacies",
    title: "«Сырные дела»",
    location: "ТЦ «Апельсин», улица Ленина, 156",
    practical: "Фермерские сыры, молочная продукция и мясные деликатесы. Удобно совместить с основной закупкой.",
    mapUrl: mapUrl("Сырные дела, ТЦ Апельсин, улица Ленина, 156, Адлер"),
    routeUrl: routeUrl(HOME, "Сырные дела, ТЦ Апельсин, улица Ленина, 156, Адлер", "pd"),
    sourceUrl: "https://syrnyedella.ru/",
    sourceLabel: "Сайт магазина",
    phone: "+79186188000",
  },
  {
    id: "adler-market",
    category: "delicacies",
    title: "Центральный Адлерский рынок",
    location: "Демократическая улица, 38А",
    practical: "Южные фрукты, специи, чай, сыры, орехи и чурчхела. Для свежих продуктов лучше приезжать утром.",
    mapUrl: mapUrl("Центральный Адлерский рынок, Демократическая улица, 38А, Адлер"),
    routeUrl: routeUrl(HOME, "Центральный Адлерский рынок, Демократическая улица, 38А, Адлер"),
    sourceUrl: "https://adlermarket.ru/",
    sourceLabel: "Сайт рынка",
    phone: "+78622403310",
  },
  {
    id: "rosa-souvenirs",
    category: "souvenirs",
    title: "Фирменные сувениры «Роза Хутор»",
    location: "Роза Долина, Набережная Полянка, 3",
    practical: "Покупка прямо в горный день без отдельного выезда: фирменные аксессуары и небольшие подарки.",
    mapUrl: mapUrl("Магазин Сувениры, Набережная Полянка, 3, Роза Хутор"),
    routeUrl: routeUrl("Роза Долина 560, Роза Хутор", "Набережная Полянка, 3, Роза Хутор", "pd"),
    sourceUrl: "https://rosakhutor.ru/what-to-do/magazin-suveniry/",
    sourceLabel: "Официальная карточка",
  },
  {
    id: "sea-souvenirs",
    category: "souvenirs",
    title: "«Море сувениров»",
    location: "Приреченская улица, 11/3, Сириус",
    practical: "Специализированный магазин рядом с маршрутом по Сириусу. Часы лучше подтвердить звонком.",
    mapUrl: mapUrl("Море сувениров, Приреченская улица, 11/3, Сириус"),
    routeUrl: routeUrl("Имеретинская набережная, Сириус", "Море сувениров, Приреченская улица, 11/3, Сириус", "pd"),
    sourceUrl: "https://2gis.ru/sochi/branches/4222661521595166",
    sourceLabel: "Карточка филиалов",
    phone: "+79890810808",
  },
  {
    id: "pontos-market",
    category: "groceries",
    title: "Рынок «Понтос»",
    location: "Голубые Дали, 58/11, строение 5",
    practical: "Запасная точка за овощами и фруктами ближе к жилому району; наличие нужных продуктов проверить на месте.",
    mapUrl: mapUrl("Рынок Понтос, Голубые Дали, 58/11 строение 5, Адлер"),
    routeUrl: routeUrl(HOME, "Рынок Понтос, Голубые Дали, 58/11 строение 5, Адлер", "pd"),
  },
  {
    id: "date-place",
    category: "date",
    title: "Ресторан «Моё ты счастье»",
    location: "Нижнеимеретинская улица, 32В, Сириус",
    practical: "Единственный ресторанный приём пищи: бронь на 17:00–17:30, лимит до 7 000 ₽ на двоих.",
    mapUrl: mapUrl("Моё ты счастье, Нижнеимеретинская улица, 32В, Сириус"),
    routeUrl: routeUrl("Имеретинская набережная, Сириус", "Моё ты счастье, Нижнеимеретинская улица, 32В, Сириус", "pd"),
    sourceUrl: "https://moetischastie.rest/",
    sourceLabel: "Сайт ресторана",
    phone: "+79956123030",
  },
  {
    id: "surf-treat",
    category: "treat",
    title: "Surf Coffee, 1100 м",
    location: "Горная Олимпийская деревня, Медовая, 6",
    practical: "Кофе или десерт в день Розы Хутор; не заменяет основную еду и оплачивается из конверта вкусняшек.",
    mapUrl: mapUrl("Surf Coffee Роза Хутор 1100, улица Медовая, 6"),
    routeUrl: routeUrl("Роза Пик 2320", "Surf Coffee Роза Хутор 1100, улица Медовая, 6", "pd"),
    sourceUrl: "https://rosakhutor.ru/what-to-do/kofeynya-surf-coffee/",
    sourceLabel: "Официальная карточка",
  },
];

export const BUDGET: BudgetRow[] = [
  {
    id: "taxi",
    category: "Такси прибытие/выезд",
    calculation: "2 поездки × ориентир 700 ₽",
    amount: 1400,
    note: "Такси по отдельным дням уже лежит в конвертах объектов.",
    group: "route",
  },
  {
    id: "own-food",
    category: "Ваша продуктовая корзина",
    calculation: "Своя еда на 8 дней / 24 приёма",
    amount: 4200,
    note: "23 приёма своей еды + запас в дорогу; ресторан только 3 августа.",
    group: "food",
  },
  {
    id: "companion-food",
    category: "Обычное питание девушки",
    calculation: "Отдельный конверт на 7 дней",
    amount: 12000,
    note: "Сохранено из утверждённой сметы; не смешивается с вашей продуктовой корзиной.",
    group: "food",
  },
  {
    id: "date",
    category: "Романтический ужин",
    calculation: "1 ужин на двоих",
    amount: 7000,
    note: "Потолок чека; бронь на 17:00–17:30.",
    group: "food",
  },
  {
    id: "treats",
    category: "Вкусняшки и напитки",
    calculation: "Кофе/чай 600 + напитки 600 + десерты 800",
    amount: 2000,
    note: "Отдельно от трёх основных приёмов пищи.",
    group: "food",
  },
  {
    id: "southern",
    category: "«Южные культуры»",
    calculation: "Вход 600 + дорога/запас 1 400",
    amount: 2000,
    note: "На двоих.",
    group: "activity",
  },
  {
    id: "grove",
    category: "Тисо-самшитовая роща",
    calculation: "Вход 600 + дорога 1 500",
    amount: 2100,
    note: "Большое кольцо, на двоих.",
    group: "activity",
  },
  {
    id: "skypark",
    category: "Skypark",
    calculation: "Онлайн-вход 5 040 + трансфер 400 + запас 1 060",
    amount: 6500,
    note: "Без прыжков и дополнительных аттракционов.",
    group: "activity",
  },
  {
    id: "rosa",
    category: "«Роза Хутор»",
    calculation: "Комбо 6 700 + нацпарк 600 + поезд 1 200 + логистика/запас 1 300",
    amount: 9800,
    note: "Кофе идёт из конверта вкусняшек, а не отсюда.",
    group: "activity",
  },
  {
    id: "gym",
    category: "Три парные тренировки",
    calculation: "400 × 2 человека × 3 + запас 400",
    amount: 2800,
    note: "Жёсткий потолок зала — 3 000 ₽.",
    group: "activity",
  },
  {
    id: "souvenirs",
    category: "Сувениры",
    calculation: "Один общий конверт",
    amount: 1800,
    note: "Покупать по пути, без отдельной поездки.",
    group: "activity",
  },
  {
    id: "reserve",
    category: "Рабочий резерв",
    calculation: "Защита нового потолка",
    amount: 1100,
    note: "Минимальный неприкосновенный запас после сокращения маршрута.",
    group: "reserve",
  },
];

export const PLAN_TOTAL = BUDGET.filter((row) => row.id !== "reserve").reduce(
  (sum, row) => sum + row.amount,
  0,
);
export const WORKING_CEILING = BUDGET.reduce(
  (sum, row) => sum + row.amount,
  0,
);
