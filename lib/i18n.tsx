"use client";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Category, Day, HelpType, Status, Urgency } from "./data";

export type Lang = "uz" | "ru" | "en";
export const LANGS: Lang[] = ["uz", "ru", "en"];
const LOCALE: Record<Lang, string> = { uz: "uz-UZ", ru: "ru-RU", en: "en-GB" };

/* ------------------------------------------------------------------ */
/*  O'zbekcha — asosiy lug'at (kalitlar shu yerdan olinadi)            */
/* ------------------------------------------------------------------ */
const uz = {
  "meta.title": "GRANDCARE — O'zbekiston bo'ylab yordam xaritasi",
  "meta.desc": "Yolg'iz qariyalar, boshpanasizlar va kam ta'minlangan oilalarga birga yordam beramiz. Xarita, volontyorlar va jonli yangilanishlar.",

  "nav.map": "Xarita", "nav.people": "Muhtojlar", "nav.vols": "Volontyorlar", "nav.dashboard": "Dashboard",
  "nav.myProfile": "Mening profilim", "nav.report": "Muhtoj bildirish", "nav.menu": "Menyu",
  "pref.lang": "Til", "pref.light": "Yorug' rejim", "pref.dark": "Qorong'i rejim",

  "common.loading": "Yuklanmoqda…", "common.connecting": "Ulanmoqda…", "common.live": "Jonli",
  "common.updatedAgo": " · {n}s oldin yangilandi", "common.home": "Bosh sahifa", "common.close": "Yopish",
  "common.sending": "Yuborilmoqda…", "common.checking": "Tekshirilmoqda…", "common.creating": "Yaratilmoqda…",
  "common.noData": "Ma'lumot yo'q", "common.nothingFound": "Hech narsa topilmadi", "common.saved": "✓ Saqlandi",
  "common.person": "kishi", "common.yearsOld": "{n} yosh", "common.regionTotal": "Barcha viloyatlar",
  "common.allStatuses": "Barcha holatlar", "common.allCategories": "Barcha toifalar", "common.anyUrgency": "Har qanday shoshilinchlik",

  "time.now": "hozirgina", "time.min": "{n} daqiqa oldin", "time.hour": "{n} soat oldin", "time.day": "{n} kun oldin",

  "hero.title1": "O'zbekiston bo'ylab", "hero.title2": "birga yordam beramiz",
  "hero.w1": "yolg'iz qariyalarga", "hero.w2": "boshpanasiz insonlarga", "hero.w3": "kam ta'minlangan oilalarga", "hero.w4": "yordamga muhtoj yurtdoshlarga",
  "hero.lead": "Muhtoj insonlarni xaritada ko'ring, volontyor bo'ling yoki yordamga muhtoj odam haqida xabar bering. Hamma narsa jonli yangilanadi.",
  "hero.openMap": "Xaritani ochish", "hero.becomeVol": "Volontyor bo'lish", "hero.report": "Muhtoj bildirish", "hero.reportLong": "Muhtoj haqida xabar berish",
  "hero.waiting": "{n} nafar inson sizning yordamingizni kutmoqda",
  "stat.people": "Muhtoj insonlar", "stat.urgent": "Shoshilinch", "stat.vols": "Volontyorlar", "stat.helped": "Yordam berildi",

  "map.eyebrow": "Jonli xarita", "map.title": "Butun O'zbekiston bo'ylab yordam xaritasi",
  "map.desc": "Markerni bosing — inson haqida to'liq ma'lumot ochiladi. Xaritani kattalashtirish, kichraytirish va to'liq ekranga o'tkazish mumkin.",
  "map.search": "🔎 Ism yoki tuman bo'yicha qidirish", "map.count": "{n} ta natija · {r} ta hududdan",
  "map.loading": "Xarita yuklanmoqda…", "map.small": "Kichik", "map.medium": "O'rta", "map.large": "Katta", "map.full": "To'liq ekran",
  "map.showAll": "🇺🇿 Hammasini ko'rsat", "map.closeFull": "✕ Yopish", "feed.title": "Jonli lenta", "feed.live": "yangi so'rovlar",

  "people.eyebrow": "Muhtoj insonlar", "people.title": "Kimga yordam kerak", "people.desc": "Eng shoshilinchlari tepada. Kartani bosing — xaritada ochiladi.",
  "people.add": "+ Muhtoj bildirish", "people.empty": "Hech narsa topilmadi. Filtrlarni o'zgartirib ko'ring.",
  "people.less": "Kamroq ko'rsatish", "people.more": "Yana {n} ta ko'rsatish",

  "vols.eyebrow": "Jamoa", "vols.title": "Volontyorlarimiz",
  "vols.desc": "Ro'yxatdan o'ting, o'zingizning profilingiz ochiladi va qaysi kuni, qaysi hududda yordam bera olishingizni belgilaysiz.",

  "steps.1.t": "Xabar bering", "steps.1.d": "Yordamga muhtoj odamni ism, rasm va manzil bilan kiriting.",
  "steps.2.t": "Koordinator tekshiradi", "steps.2.d": "Jamoamiz ma'lumotni dashboardda ko'rib chiqib tasdiqlaydi.",
  "steps.3.t": "Volontyor yetib boradi", "steps.3.d": "Eng yaqin volontyor yoki xayrixoh yordam beradi.",

  "pd.region": "📍 Hudud", "pd.added": "🕒 Qo'shilgan", "pd.status": "📋 Holati", "pd.helpers": "🤝 Yordamchilar",
  "pd.reporter": "👤 Xabar bergan", "pd.address": "🏠 Manzil", "pd.phone": "📞 Telefon", "pd.checking": "Tekshirilmoqda",
  "pd.privacy": "Aniq manzil va telefon xavfsizlik uchun faqat koordinatorlarga ko'rinadi.",
  "pd.unknown": "Noma'lum", "pd.openPage": "Alohida sahifada ochish", "pd.helperCount": "{n} kishi",
  "help.btn": "🤝 Yordam beraman",
  "help.thanks": "💙 Rahmat! Koordinator siz bilan bog'lanadi yoki o'zingiz qo'ng'iroq qiling: ",
  "help.createProfile": "Volontyor profilini yarating →",

  "ftr.title": "Agar siz ham yordam bermoqchi bo'lsangiz",
  "ftr.desc": "Har bir hissa — kimningdir issiq ovqati, dorisi yoki iliq so'zi. Quyidagi karta raqamiga mablag' o'tkazishingiz yoki volontyor bo'lib o'zingiz chiqishingiz mumkin.",
  "ftr.statPeople": "muhtoj inson", "ftr.statVols": "volontyor", "ftr.statHelped": "marta yordam",
  "ftr.cardOwner": "Karta egasi", "ftr.copy": "Karta raqamini nusxalash", "ftr.copied": "✓ Nusxalandi",
  "ftr.rights": "O'zbekiston bo'ylab birga yordam beramiz", "ftr.contact": "Aloqa:",

  "person.notFound": "Topilmadi", "person.backMap": "← Xaritaga qaytish",
  "vol.notFound": "Profil topilmadi", "vol.backAll": "← Barcha volontyorlar", "vol.mine": "Mening profilim", "vol.one": "Volontyor",
  "vol.joined": "Qo'shilgan: {when}", "vol.skills": "Qanday yordam beradi", "vol.week": "Haftalik jadval", "vol.phone": "📞 Telefon:",
  "vol.phoneHidden": "Telefon raqam xavfsizlik uchun yashirilgan.", "vol.near": "Hududingizdagi yordamga muhtojlar",

  "form.back": "← Bosh sahifa",
  "form.fullName": "Ism familiya *", "form.age": "Yoshi", "form.ageShort": "Yosh", "form.region": "Viloyat *", "form.district": "Tuman / shahar *",
  "form.districtOpt": "Tuman / shahar", "form.phone": "Telefon *", "form.photoRemove": "Rasmni olib tashlash",
  "form.photoLoading": "Yuklanmoqda…", "form.photoOnly": "Faqat rasm fayli tanlang", "form.photoFail": "Rasm o'qilmadi, boshqasini tanlang",
  "form.sendFail": "Yuborib bo'lmadi, qaytadan urinib ko'ring",

  "report.title": "Muhtoj insonni bildirish",
  "report.desc": "Ma'lumot to'g'ri va aniq bo'lsin — shunda volontyorlar tezroq yetib boradi. Telefon va aniq manzil faqat koordinatorlarga ko'rinadi.",
  "report.photoLbl": "Insonning rasmi *", "report.photoPick": "Rasmga olish yoki tanlash",
  "report.namePh": "Masalan: Malika Karimova", "report.category": "Kim? (toifa) *", "report.districtPh": "Chilonzor tumani",
  "report.address": "Uy manzili (xodimlarga ko'rinadi) *", "report.addressPh": "Ko'cha, mahalla, uy raqami",
  "report.phone": "Telefon (xodimlarga ko'rinadi)", "report.location": "Xaritada joylashuv (ixtiyoriy, lekin tavsiya etiladi)",
  "report.myLoc": "📍 Mening joylashuvim", "report.marked": "Belgilandi: {lat}, {lng}",
  "report.markHint": "Xaritani bosib uyni belgilang. Belgilamasangiz — viloyat markazi olinadi.",
  "report.needs": "Qanday yordam kerak? *", "report.urgency": "Shoshilinchlik darajasi", "report.story": "Holati haqida qisqacha *",
  "report.storyPh": "Kim, qanday sharoitda yashaydi, nimaga muhtoj?", "report.reporter": "Siz kimsiz? (xabar beruvchi)",
  "report.reporterPh": "Ismingiz yoki «Qo'shni», «Mahalla faoli»", "report.submit": "Dashboardga yuborish",
  "report.errName": "Ism familiyani kiriting", "report.errStory": "Holat haqida qisqacha yozing",
  "report.errPhoto": "Iltimos, insonning rasmini yuklang", "report.errHelp": "Kamida bitta yordam turini tanlang",
  "report.errMissing": "Majburiy maydonlar to'ldirilmagan", "report.errGeoUnsupported": "Brauzer joylashuvni qo'llab-quvvatlamaydi",
  "report.errGeo": "Joylashuvni aniqlab bo'lmadi. Xaritadan qo'lda belgilang.",
  "report.thanks": "Rahmat! Xabaringiz qabul qilindi",
  "report.thanksDesc": "Ma'lumot dashboardga tushdi va xaritada «Tekshirilmoqda» belgisi bilan ko'rinadi. Koordinatorlar tez orada tasdiqlaydi.",
  "report.seeOnMap": "Xaritada ko'rish", "report.again": "Yana bildirish",

  "volreg.title": "Volontyor bo'lish", "volreg.desc": "Ma'lumotlaringizni kiriting — shundan so'ng sizga shaxsiy profil sahifasi ochiladi.",
  "volreg.have": "Sizda profil bor: ", "volreg.open": "profilni ochish →", "volreg.photoLbl": "Profil rasmi *", "volreg.photoPick": "Rasmingizni tanlang",
  "volreg.days": "Qaysi kunlari chiqa olasiz? *", "volreg.skills": "Qanday yordam bera olasiz? *", "volreg.about": "O'zingiz haqingizda",
  "volreg.aboutPh": "Kasbingiz, tajribangiz, nima uchun volontyor bo'lmoqchisiz…", "volreg.submit": "Profilni yaratish",
  "volreg.errName": "Ism familiyangizni kiriting", "volreg.errPhone": "Telefon raqamingizni kiriting",
  "volreg.errPhoto": "Profil uchun rasmingizni yuklang", "volreg.errSkills": "Qanday yordam bera olishingizni tanlang", "volreg.errDays": "Kamida bitta kunni tanlang",

  "login.title": "Dashboardga kirish", "login.desc": "Faqat koordinatorlar uchun. Ismingiz va parolni kiriting.",
  "login.name": "Ism", "login.namePh": "Ismingiz", "login.pw": "Parol", "login.submit": "Kirish", "login.err": "Ism yoki parol noto'g'ri",
  "login.back": "← Bosh sahifaga qaytish",

  "dash.eyebrow": "Koordinator paneli", "dash.hello": "Salom, {name} 👋", "dash.logout": "Chiqish",
  "dash.warn": "⚠️ Demo rejim: ma'lumotlar server xotirasida saqlanmoqda va qayta ishga tushganda yoki boshqa server nusxasiga o'tganda yo'qoladi. Doimiy saqlash uchun Vercel → Storage → Upstash Redis ulang (README).",
  "dash.tabOverview": "📊 Umumiy", "dash.tabPeople": "🧓 Muhtojlar", "dash.tabVols": "🤝 Volontyorlar",
  "dash.toast": "🔔 Yangi muhtoj: {name}", "dash.toastMore": " va yana {n} ta",
  "kpi.total": "Jami muhtoj", "kpi.new": "Yangi (tekshirilmagan)", "kpi.urgent": "Shoshilinch", "kpi.helped": "Yordam berildi",
  "kpi.vols": "Volontyorlar", "kpi.totalHelp": "Jami yordam soni",
  "dash.byRegion": "Viloyatlar bo'yicha", "dash.categories": "Toifalar", "dash.recent": "So'nggi qo'shilganlar",
  "dash.search": "🔎 Ism, tuman yoki telefon", "dash.note": "Koordinator izohi", "dash.notePh": "Masalan: 12-oktabrda borildi, dori yetkazildi…",
  "dash.saveNote": "Izohni saqlash", "dash.pageBtn": "Sahifasi", "dash.verify": "✓ Tasdiqlash",
  "dash.confirmDel": "«{name}» o'chirilsinmi?",
  "th.person": "Inson", "th.region": "Hudud", "th.category": "Toifa", "th.urgency": "Shoshilinch", "th.status": "Holat",
  "th.vol": "Volontyor", "th.phone": "Telefon", "th.skills": "Yordam turlari", "th.days": "Kunlar",
  "dash.noVols": "Hali volontyor yo'q",
  "csv.name": "Ism", "csv.age": "Yosh", "csv.category": "Toifa", "csv.region": "Viloyat", "csv.district": "Tuman", "csv.address": "Manzil",
  "csv.phone": "Telefon", "csv.urgency": "Shoshilinch", "csv.status": "Holat", "csv.helpers": "Yordamchilar", "csv.added": "Qo'shilgan",

  "urg.high": "Shoshilinch", "urg.medium": "O'rtacha", "urg.low": "Past",
  "st.new": "Yangi", "st.verified": "Tasdiqlangan", "st.helped": "Yordam berildi", "st.closed": "Yopilgan",
  "cat.elderly": "Yolg'iz qariya", "cat.homeless": "Boshpanasiz", "cat.lowincome": "Kam ta'minlangan oila",
  "cat.disabled": "Nogironligi bor inson", "cat.orphan": "Yetim / parvarishsiz bola",
  "help.food": "Oziq-ovqat", "help.medicine": "Dori-darmon", "help.cleaning": "Tozalash", "help.company": "Suhbatdosh",
  "help.repair": "Ta'mirlash", "help.clothes": "Kiyim-kechak", "help.money": "Moddiy yordam",
  "day.mon": "Dushanba", "day.tue": "Seshanba", "day.wed": "Chorshanba", "day.thu": "Payshanba", "day.fri": "Juma", "day.sat": "Shanba", "day.sun": "Yakshanba",
  "ds.mon": "Du", "ds.tue": "Se", "ds.wed": "Ch", "ds.thu": "Pa", "ds.fri": "Ju", "ds.sat": "Sh", "ds.sun": "Ya",
} as const;

export type Key = keyof typeof uz;
type Dict = Record<Key, string>;

const ru: Dict = {
  "meta.title": "GRANDCARE — карта помощи по всему Узбекистану",
  "meta.desc": "Вместе помогаем одиноким пожилым людям, бездомным и малообеспеченным семьям. Карта, волонтёры и обновления в реальном времени.",

  "nav.map": "Карта", "nav.people": "Нуждающиеся", "nav.vols": "Волонтёры", "nav.dashboard": "Панель управления",
  "nav.myProfile": "Мой профиль", "nav.report": "Сообщить о нуждающемся", "nav.menu": "Меню",
  "pref.lang": "Язык", "pref.light": "Светлая тема", "pref.dark": "Тёмная тема",

  "common.loading": "Загрузка…", "common.connecting": "Подключение…", "common.live": "Онлайн",
  "common.updatedAgo": " · обновлено {n} с назад", "common.home": "Главная", "common.close": "Закрыть",
  "common.sending": "Отправка…", "common.checking": "Проверка…", "common.creating": "Создание…",
  "common.noData": "Нет данных", "common.nothingFound": "Ничего не найдено", "common.saved": "✓ Сохранено",
  "common.person": "чел.", "common.yearsOld": "{n} лет", "common.regionTotal": "Все регионы",
  "common.allStatuses": "Все статусы", "common.allCategories": "Все категории", "common.anyUrgency": "Любая срочность",

  "time.now": "только что", "time.min": "{n} мин. назад", "time.hour": "{n} ч. назад", "time.day": "{n} дн. назад",

  "hero.title1": "Вместе помогаем", "hero.title2": "по всему Узбекистану",
  "hero.w1": "одиноким пожилым людям", "hero.w2": "бездомным", "hero.w3": "малообеспеченным семьям", "hero.w4": "нуждающимся землякам",
  "hero.lead": "Смотрите нуждающихся на карте, станьте волонтёром или сообщите о человеке, которому нужна помощь. Всё обновляется в реальном времени.",
  "hero.openMap": "Открыть карту", "hero.becomeVol": "Стать волонтёром", "hero.report": "Сообщить о нуждающемся", "hero.reportLong": "Сообщить о нуждающемся",
  "hero.waiting": "{n} чел. ждут вашей помощи",
  "stat.people": "Нуждающиеся", "stat.urgent": "Срочно", "stat.vols": "Волонтёры", "stat.helped": "Помощь оказана",

  "map.eyebrow": "Живая карта", "map.title": "Карта помощи по всему Узбекистану",
  "map.desc": "Нажмите на маркер — откроется полная информация о человеке. Карту можно увеличить, уменьшить и развернуть на весь экран.",
  "map.search": "🔎 Поиск по имени или району", "map.count": "Результатов: {n} · регионов: {r}",
  "map.loading": "Карта загружается…", "map.small": "Малая", "map.medium": "Средняя", "map.large": "Большая", "map.full": "На весь экран",
  "map.showAll": "🇺🇿 Показать всё", "map.closeFull": "✕ Закрыть", "feed.title": "Живая лента", "feed.live": "новые запросы",

  "people.eyebrow": "Нуждающиеся", "people.title": "Кому нужна помощь", "people.desc": "Самые срочные — вверху. Нажмите на карточку — она откроется на карте.",
  "people.add": "+ Сообщить о нуждающемся", "people.empty": "Ничего не найдено. Измените фильтры.",
  "people.less": "Показать меньше", "people.more": "Показать ещё {n}",

  "vols.eyebrow": "Команда", "vols.title": "Наши волонтёры",
  "vols.desc": "Зарегистрируйтесь — для вас откроется личный профиль, где вы отметите, в какие дни и в каком регионе можете помогать.",

  "steps.1.t": "Сообщите", "steps.1.d": "Укажите нуждающегося: имя, фото и адрес.",
  "steps.2.t": "Координатор проверяет", "steps.2.d": "Наша команда проверит данные в панели и подтвердит их.",
  "steps.3.t": "Волонтёр приезжает", "steps.3.d": "Ближайший волонтёр или благотворитель окажет помощь.",

  "pd.region": "📍 Регион", "pd.added": "🕒 Добавлен", "pd.status": "📋 Статус", "pd.helpers": "🤝 Помощников",
  "pd.reporter": "👤 Сообщил", "pd.address": "🏠 Адрес", "pd.phone": "📞 Телефон", "pd.checking": "На проверке",
  "pd.privacy": "Точный адрес и телефон видны только координаторам — для безопасности.",
  "pd.unknown": "Неизвестно", "pd.openPage": "Открыть на отдельной странице", "pd.helperCount": "{n} чел.",
  "help.btn": "🤝 Я помогу",
  "help.thanks": "💙 Спасибо! Координатор свяжется с вами, или позвоните сами: ",
  "help.createProfile": "Создайте профиль волонтёра →",

  "ftr.title": "Если вы тоже хотите помочь",
  "ftr.desc": "Каждый вклад — чей-то тёплый обед, лекарство или доброе слово. Вы можете перевести средства на карту ниже или стать волонтёром и помочь лично.",
  "ftr.statPeople": "нуждающихся", "ftr.statVols": "волонтёров", "ftr.statHelped": "раз помогли",
  "ftr.cardOwner": "Владелец карты", "ftr.copy": "Скопировать номер карты", "ftr.copied": "✓ Скопировано",
  "ftr.rights": "Вместе помогаем по всему Узбекистану", "ftr.contact": "Контакты:",

  "person.notFound": "Не найдено", "person.backMap": "← Вернуться к карте",
  "vol.notFound": "Профиль не найден", "vol.backAll": "← Все волонтёры", "vol.mine": "Мой профиль", "vol.one": "Волонтёр",
  "vol.joined": "Присоединился: {when}", "vol.skills": "Чем помогает", "vol.week": "Расписание на неделю", "vol.phone": "📞 Телефон:",
  "vol.phoneHidden": "Номер телефона скрыт в целях безопасности.", "vol.near": "Нуждающиеся в вашем регионе",

  "form.back": "← Главная",
  "form.fullName": "Имя и фамилия *", "form.age": "Возраст", "form.ageShort": "Возраст", "form.region": "Регион *", "form.district": "Район / город *",
  "form.districtOpt": "Район / город", "form.phone": "Телефон *", "form.photoRemove": "Удалить фото",
  "form.photoLoading": "Загрузка…", "form.photoOnly": "Выберите файл изображения", "form.photoFail": "Не удалось прочитать фото, выберите другое",
  "form.sendFail": "Не удалось отправить, попробуйте ещё раз",

  "report.title": "Сообщить о нуждающемся",
  "report.desc": "Данные должны быть точными — так волонтёры приедут быстрее. Телефон и точный адрес видны только координаторам.",
  "report.photoLbl": "Фото человека *", "report.photoPick": "Сфотографировать или выбрать",
  "report.namePh": "Например: Малика Каримова", "report.category": "Кто? (категория) *", "report.districtPh": "Чиланзарский район",
  "report.address": "Домашний адрес (виден сотрудникам) *", "report.addressPh": "Улица, махалля, номер дома",
  "report.phone": "Телефон (виден сотрудникам)", "report.location": "Место на карте (необязательно, но желательно)",
  "report.myLoc": "📍 Моё местоположение", "report.marked": "Отмечено: {lat}, {lng}",
  "report.markHint": "Нажмите на карту, чтобы отметить дом. Если не отметите — будет взят центр региона.",
  "report.needs": "Какая помощь нужна? *", "report.urgency": "Степень срочности", "report.story": "Кратко о ситуации *",
  "report.storyPh": "Кто это, в каких условиях живёт, в чём нуждается?", "report.reporter": "Кто вы? (сообщающий)",
  "report.reporterPh": "Ваше имя или «Сосед», «Активист махалли»", "report.submit": "Отправить в панель",
  "report.errName": "Введите имя и фамилию", "report.errStory": "Кратко опишите ситуацию",
  "report.errPhoto": "Пожалуйста, загрузите фото человека", "report.errHelp": "Выберите хотя бы один вид помощи",
  "report.errMissing": "Не заполнены обязательные поля", "report.errGeoUnsupported": "Браузер не поддерживает геолокацию",
  "report.errGeo": "Не удалось определить местоположение. Отметьте на карте вручную.",
  "report.thanks": "Спасибо! Ваше сообщение принято",
  "report.thanksDesc": "Данные попали в панель и отображаются на карте с пометкой «На проверке». Координаторы скоро их подтвердят.",
  "report.seeOnMap": "Посмотреть на карте", "report.again": "Сообщить ещё",

  "volreg.title": "Стать волонтёром", "volreg.desc": "Введите свои данные — после этого для вас откроется личная страница профиля.",
  "volreg.have": "У вас уже есть профиль: ", "volreg.open": "открыть профиль →", "volreg.photoLbl": "Фото профиля *", "volreg.photoPick": "Выберите своё фото",
  "volreg.days": "В какие дни можете выходить? *", "volreg.skills": "Чем можете помочь? *", "volreg.about": "О себе",
  "volreg.aboutPh": "Профессия, опыт, почему хотите стать волонтёром…", "volreg.submit": "Создать профиль",
  "volreg.errName": "Введите имя и фамилию", "volreg.errPhone": "Введите номер телефона",
  "volreg.errPhoto": "Загрузите фото для профиля", "volreg.errSkills": "Выберите, чем можете помочь", "volreg.errDays": "Выберите хотя бы один день",

  "login.title": "Вход в панель управления", "login.desc": "Только для координаторов. Введите имя и пароль.",
  "login.name": "Имя", "login.namePh": "Ваше имя", "login.pw": "Пароль", "login.submit": "Войти", "login.err": "Неверное имя или пароль",
  "login.back": "← Вернуться на главную",

  "dash.eyebrow": "Панель координатора", "dash.hello": "Здравствуйте, {name} 👋", "dash.logout": "Выйти",
  "dash.warn": "⚠️ Демо-режим: данные хранятся в памяти сервера и пропадают при перезапуске или переходе на другую копию сервера. Для постоянного хранения подключите Vercel → Storage → Upstash Redis (README).",
  "dash.tabOverview": "📊 Обзор", "dash.tabPeople": "🧓 Нуждающиеся", "dash.tabVols": "🤝 Волонтёры",
  "dash.toast": "🔔 Новый нуждающийся: {name}", "dash.toastMore": " и ещё {n}",
  "kpi.total": "Всего нуждающихся", "kpi.new": "Новые (не проверены)", "kpi.urgent": "Срочно", "kpi.helped": "Помощь оказана",
  "kpi.vols": "Волонтёры", "kpi.totalHelp": "Всего случаев помощи",
  "dash.byRegion": "По регионам", "dash.categories": "Категории", "dash.recent": "Недавно добавленные",
  "dash.search": "🔎 Имя, район или телефон", "dash.note": "Комментарий координатора", "dash.notePh": "Например: 12 октября навестили, привезли лекарства…",
  "dash.saveNote": "Сохранить комментарий", "dash.pageBtn": "Страница", "dash.verify": "✓ Подтвердить",
  "dash.confirmDel": "Удалить «{name}»?",
  "th.person": "Человек", "th.region": "Регион", "th.category": "Категория", "th.urgency": "Срочность", "th.status": "Статус",
  "th.vol": "Волонтёр", "th.phone": "Телефон", "th.skills": "Виды помощи", "th.days": "Дни",
  "dash.noVols": "Волонтёров пока нет",
  "csv.name": "Имя", "csv.age": "Возраст", "csv.category": "Категория", "csv.region": "Регион", "csv.district": "Район", "csv.address": "Адрес",
  "csv.phone": "Телефон", "csv.urgency": "Срочность", "csv.status": "Статус", "csv.helpers": "Помощники", "csv.added": "Добавлен",

  "urg.high": "Срочно", "urg.medium": "Средне", "urg.low": "Низкая",
  "st.new": "Новый", "st.verified": "Подтверждён", "st.helped": "Помощь оказана", "st.closed": "Закрыт",
  "cat.elderly": "Одинокий пожилой человек", "cat.homeless": "Бездомный", "cat.lowincome": "Малообеспеченная семья",
  "cat.disabled": "Человек с инвалидностью", "cat.orphan": "Сирота / ребёнок без попечения",
  "help.food": "Продукты", "help.medicine": "Лекарства", "help.cleaning": "Уборка", "help.company": "Общение",
  "help.repair": "Ремонт", "help.clothes": "Одежда", "help.money": "Материальная помощь",
  "day.mon": "Понедельник", "day.tue": "Вторник", "day.wed": "Среда", "day.thu": "Четверг", "day.fri": "Пятница", "day.sat": "Суббота", "day.sun": "Воскресенье",
  "ds.mon": "Пн", "ds.tue": "Вт", "ds.wed": "Ср", "ds.thu": "Чт", "ds.fri": "Пт", "ds.sat": "Сб", "ds.sun": "Вс",
};

const en: Dict = {
  "meta.title": "GRANDCARE — help map across Uzbekistan",
  "meta.desc": "Together we help lonely elderly people, the homeless and low-income families. A map, volunteers and live updates.",

  "nav.map": "Map", "nav.people": "People in need", "nav.vols": "Volunteers", "nav.dashboard": "Dashboard",
  "nav.myProfile": "My profile", "nav.report": "Report a person in need", "nav.menu": "Menu",
  "pref.lang": "Language", "pref.light": "Light mode", "pref.dark": "Dark mode",

  "common.loading": "Loading…", "common.connecting": "Connecting…", "common.live": "Live",
  "common.updatedAgo": " · updated {n}s ago", "common.home": "Home", "common.close": "Close",
  "common.sending": "Sending…", "common.checking": "Checking…", "common.creating": "Creating…",
  "common.noData": "No data", "common.nothingFound": "Nothing found", "common.saved": "✓ Saved",
  "common.person": "people", "common.yearsOld": "{n} y.o.", "common.regionTotal": "All regions",
  "common.allStatuses": "All statuses", "common.allCategories": "All categories", "common.anyUrgency": "Any urgency",

  "time.now": "just now", "time.min": "{n} min ago", "time.hour": "{n} h ago", "time.day": "{n} d ago",

  "hero.title1": "Together we help", "hero.title2": "all across Uzbekistan",
  "hero.w1": "lonely elderly people", "hero.w2": "people without shelter", "hero.w3": "low-income families", "hero.w4": "fellow citizens in need",
  "hero.lead": "See people in need on the map, become a volunteer, or report someone who needs help. Everything updates live.",
  "hero.openMap": "Open the map", "hero.becomeVol": "Become a volunteer", "hero.report": "Report a person in need", "hero.reportLong": "Report someone in need",
  "hero.waiting": "{n} people are waiting for your help",
  "stat.people": "People in need", "stat.urgent": "Urgent", "stat.vols": "Volunteers", "stat.helped": "Helped",

  "map.eyebrow": "Live map", "map.title": "Help map across all of Uzbekistan",
  "map.desc": "Click a marker to see full details about the person. You can zoom the map in and out or switch to full screen.",
  "map.search": "🔎 Search by name or district", "map.count": "{n} results · {r} regions",
  "map.loading": "Loading map…", "map.small": "Small", "map.medium": "Medium", "map.large": "Large", "map.full": "Fullscreen",
  "map.showAll": "🇺🇿 Show all", "map.closeFull": "✕ Close", "feed.title": "Live feed", "feed.live": "new requests",

  "people.eyebrow": "People in need", "people.title": "Who needs help", "people.desc": "The most urgent are on top. Click a card to open it on the map.",
  "people.add": "+ Report a person in need", "people.empty": "Nothing found. Try changing the filters.",
  "people.less": "Show less", "people.more": "Show {n} more",

  "vols.eyebrow": "Team", "vols.title": "Our volunteers",
  "vols.desc": "Sign up to get your own profile where you set which days and in which region you can help.",

  "steps.1.t": "Report", "steps.1.d": "Enter the person in need with a name, photo and address.",
  "steps.2.t": "A coordinator checks", "steps.2.d": "Our team reviews the information in the dashboard and verifies it.",
  "steps.3.t": "A volunteer arrives", "steps.3.d": "The nearest volunteer or well-wisher provides help.",

  "pd.region": "📍 Region", "pd.added": "🕒 Added", "pd.status": "📋 Status", "pd.helpers": "🤝 Helpers",
  "pd.reporter": "👤 Reported by", "pd.address": "🏠 Address", "pd.phone": "📞 Phone", "pd.checking": "Under review",
  "pd.privacy": "For safety, the exact address and phone are visible only to coordinators.",
  "pd.unknown": "Unknown", "pd.openPage": "Open on a separate page", "pd.helperCount": "{n} people",
  "help.btn": "🤝 I will help",
  "help.thanks": "💙 Thank you! A coordinator will contact you, or call yourself: ",
  "help.createProfile": "Create a volunteer profile →",

  "ftr.title": "If you want to help too",
  "ftr.desc": "Every contribution is someone's warm meal, medicine or kind word. You can transfer funds to the card below or become a volunteer and help in person.",
  "ftr.statPeople": "people in need", "ftr.statVols": "volunteers", "ftr.statHelped": "times helped",
  "ftr.cardOwner": "Card holder", "ftr.copy": "Copy card number", "ftr.copied": "✓ Copied",
  "ftr.rights": "Together we help all across Uzbekistan", "ftr.contact": "Contact:",

  "person.notFound": "Not found", "person.backMap": "← Back to the map",
  "vol.notFound": "Profile not found", "vol.backAll": "← All volunteers", "vol.mine": "My profile", "vol.one": "Volunteer",
  "vol.joined": "Joined: {when}", "vol.skills": "How they help", "vol.week": "Weekly schedule", "vol.phone": "📞 Phone:",
  "vol.phoneHidden": "The phone number is hidden for safety.", "vol.near": "People in need in your region",

  "form.back": "← Home",
  "form.fullName": "Full name *", "form.age": "Age", "form.ageShort": "Age", "form.region": "Region *", "form.district": "District / city *",
  "form.districtOpt": "District / city", "form.phone": "Phone *", "form.photoRemove": "Remove photo",
  "form.photoLoading": "Loading…", "form.photoOnly": "Please choose an image file", "form.photoFail": "Could not read the image, choose another",
  "form.sendFail": "Could not send, please try again",

  "report.title": "Report a person in need",
  "report.desc": "Keep the details accurate so volunteers can arrive faster. The phone and exact address are visible only to coordinators.",
  "report.photoLbl": "Photo of the person *", "report.photoPick": "Take or choose a photo",
  "report.namePh": "E.g. Malika Karimova", "report.category": "Who? (category) *", "report.districtPh": "Chilonzor district",
  "report.address": "Home address (visible to staff) *", "report.addressPh": "Street, neighbourhood, house number",
  "report.phone": "Phone (visible to staff)", "report.location": "Location on the map (optional, but recommended)",
  "report.myLoc": "📍 My location", "report.marked": "Marked: {lat}, {lng}",
  "report.markHint": "Click the map to mark the home. If you don't, the region centre is used.",
  "report.needs": "What help is needed? *", "report.urgency": "Urgency level", "report.story": "Brief description of the situation *",
  "report.storyPh": "Who they are, how they live, what they need?", "report.reporter": "Who are you? (reporter)",
  "report.reporterPh": "Your name or “Neighbour”, “Community activist”", "report.submit": "Send to dashboard",
  "report.errName": "Enter the full name", "report.errStory": "Briefly describe the situation",
  "report.errPhoto": "Please upload a photo of the person", "report.errHelp": "Select at least one type of help",
  "report.errMissing": "Required fields are missing", "report.errGeoUnsupported": "Your browser does not support geolocation",
  "report.errGeo": "Could not detect your location. Mark it on the map manually.",
  "report.thanks": "Thank you! Your report was received",
  "report.thanksDesc": "The information reached the dashboard and shows on the map as “Under review”. Coordinators will verify it soon.",
  "report.seeOnMap": "See on the map", "report.again": "Report another",

  "volreg.title": "Become a volunteer", "volreg.desc": "Enter your details — you will then get a personal profile page.",
  "volreg.have": "You already have a profile: ", "volreg.open": "open profile →", "volreg.photoLbl": "Profile photo *", "volreg.photoPick": "Choose your photo",
  "volreg.days": "Which days can you go out? *", "volreg.skills": "How can you help? *", "volreg.about": "About you",
  "volreg.aboutPh": "Your profession, experience, why you want to volunteer…", "volreg.submit": "Create profile",
  "volreg.errName": "Enter your full name", "volreg.errPhone": "Enter your phone number",
  "volreg.errPhoto": "Upload a photo for your profile", "volreg.errSkills": "Select how you can help", "volreg.errDays": "Select at least one day",

  "login.title": "Dashboard login", "login.desc": "For coordinators only. Enter your name and password.",
  "login.name": "Name", "login.namePh": "Your name", "login.pw": "Password", "login.submit": "Sign in", "login.err": "Wrong name or password",
  "login.back": "← Back to home",

  "dash.eyebrow": "Coordinator panel", "dash.hello": "Hello, {name} 👋", "dash.logout": "Sign out",
  "dash.warn": "⚠️ Demo mode: data is kept in server memory and is lost on restart or when another server instance answers. For permanent storage connect Vercel → Storage → Upstash Redis (see README).",
  "dash.tabOverview": "📊 Overview", "dash.tabPeople": "🧓 People in need", "dash.tabVols": "🤝 Volunteers",
  "dash.toast": "🔔 New person in need: {name}", "dash.toastMore": " and {n} more",
  "kpi.total": "Total in need", "kpi.new": "New (unchecked)", "kpi.urgent": "Urgent", "kpi.helped": "Helped",
  "kpi.vols": "Volunteers", "kpi.totalHelp": "Total help count",
  "dash.byRegion": "By region", "dash.categories": "Categories", "dash.recent": "Recently added",
  "dash.search": "🔎 Name, district or phone", "dash.note": "Coordinator note", "dash.notePh": "E.g. visited on 12 October, medicine delivered…",
  "dash.saveNote": "Save note", "dash.pageBtn": "Page", "dash.verify": "✓ Verify",
  "dash.confirmDel": "Delete “{name}”?",
  "th.person": "Person", "th.region": "Region", "th.category": "Category", "th.urgency": "Urgency", "th.status": "Status",
  "th.vol": "Volunteer", "th.phone": "Phone", "th.skills": "Help types", "th.days": "Days",
  "dash.noVols": "No volunteers yet",
  "csv.name": "Name", "csv.age": "Age", "csv.category": "Category", "csv.region": "Region", "csv.district": "District", "csv.address": "Address",
  "csv.phone": "Phone", "csv.urgency": "Urgency", "csv.status": "Status", "csv.helpers": "Helpers", "csv.added": "Added",

  "urg.high": "Urgent", "urg.medium": "Medium", "urg.low": "Low",
  "st.new": "New", "st.verified": "Verified", "st.helped": "Helped", "st.closed": "Closed",
  "cat.elderly": "Lonely elderly person", "cat.homeless": "Homeless", "cat.lowincome": "Low-income family",
  "cat.disabled": "Person with a disability", "cat.orphan": "Orphan / child without care",
  "help.food": "Food", "help.medicine": "Medicine", "help.cleaning": "Cleaning", "help.company": "Company",
  "help.repair": "Repairs", "help.clothes": "Clothing", "help.money": "Financial aid",
  "day.mon": "Monday", "day.tue": "Tuesday", "day.wed": "Wednesday", "day.thu": "Thursday", "day.fri": "Friday", "day.sat": "Saturday", "day.sun": "Sunday",
  "ds.mon": "Mo", "ds.tue": "Tu", "ds.wed": "We", "ds.thu": "Th", "ds.fri": "Fr", "ds.sat": "Sa", "ds.sun": "Su",
};

const DICTS: Record<Lang, Dict> = { uz: uz as unknown as Dict, ru, en };

/* Viloyat nomlari (ma'lumotda o'zbekcha nom kalit bo'lib qoladi) */
const REGION_NAMES: Record<string, Record<"ru" | "en", string>> = {
  "Toshkent shahri": { ru: "г. Ташкент", en: "Tashkent city" },
  "Toshkent viloyati": { ru: "Ташкентская область", en: "Tashkent region" },
  "Andijon viloyati": { ru: "Андижанская область", en: "Andijan region" },
  "Buxoro viloyati": { ru: "Бухарская область", en: "Bukhara region" },
  "Farg'ona viloyati": { ru: "Ферганская область", en: "Fergana region" },
  "Jizzax viloyati": { ru: "Джизакская область", en: "Jizzakh region" },
  "Xorazm viloyati": { ru: "Хорезмская область", en: "Khorezm region" },
  "Namangan viloyati": { ru: "Наманганская область", en: "Namangan region" },
  "Navoiy viloyati": { ru: "Навоийская область", en: "Navoiy region" },
  "Qashqadaryo viloyati": { ru: "Кашкадарьинская область", en: "Kashkadarya region" },
  "Samarqand viloyati": { ru: "Самаркандская область", en: "Samarkand region" },
  "Sirdaryo viloyati": { ru: "Сырдарьинская область", en: "Syrdarya region" },
  "Surxondaryo viloyati": { ru: "Сурхандарьинская область", en: "Surkhandarya region" },
  "Qoraqalpog'iston Respublikasi": { ru: "Республика Каракалпакстан", en: "Republic of Karakalpakstan" },
};
const REGION_SHORT: Record<string, Record<"ru" | "en", string>> = {
  "Toshkent shahri": { ru: "Ташкент", en: "Tashkent" }, "Toshkent viloyati": { ru: "Ташкентская", en: "Tashkent reg." },
  "Andijon viloyati": { ru: "Андижан", en: "Andijan" }, "Buxoro viloyati": { ru: "Бухара", en: "Bukhara" },
  "Farg'ona viloyati": { ru: "Фергана", en: "Fergana" }, "Jizzax viloyati": { ru: "Джизак", en: "Jizzakh" },
  "Xorazm viloyati": { ru: "Хорезм", en: "Khorezm" }, "Namangan viloyati": { ru: "Наманган", en: "Namangan" },
  "Navoiy viloyati": { ru: "Навои", en: "Navoiy" }, "Qashqadaryo viloyati": { ru: "Кашкадарья", en: "Kashkadarya" },
  "Samarqand viloyati": { ru: "Самарканд", en: "Samarkand" }, "Sirdaryo viloyati": { ru: "Сырдарья", en: "Syrdarya" },
  "Surxondaryo viloyati": { ru: "Сурхандарья", en: "Surkhandarya" }, "Qoraqalpog'iston Respublikasi": { ru: "Каракалпакстан", en: "Karakalpakstan" },
};

export interface I18n {
  lang: Lang;
  locale: string;
  setLang: (l: Lang) => void;
  t: (key: Key, vars?: Record<string, string | number>) => string;
  help: (h: HelpType) => string;
  category: (c: Category) => string;
  urgency: (u: Urgency) => string;
  status: (s: Status) => string;
  day: (d: Day) => string;
  dayShort: (d: Day) => string;
  region: (name: string) => string;
  regionShort: (name: string) => string;
  timeAgo: (ts: number) => string;
}

const Ctx = createContext<I18n | null>(null);
const KEY = "mehr-lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("uz");

  // Saqlangan tilni mount'dan keyin o'qiymiz (server/klient HTML mos kelishi uchun)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as Lang | null;
      if (saved && LANGS.includes(saved)) setLangState(saved);
    } catch {}
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch {}
  }, []);

  const path = usePathname();
  useEffect(() => {
    const apply = () => {
      document.documentElement.lang = lang;
      document.title = DICTS[lang]["meta.title"];
      document.querySelector('meta[name="description"]')?.setAttribute("content", DICTS[lang]["meta.desc"]);
    };
    apply();
    // Next.js metadata hydratsiyadan keyin sarlavhani qayta yozishi mumkin — shuning uchun yana bir marta qo'llaymiz
    const t1 = setTimeout(apply, 150), t2 = setTimeout(apply, 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [lang, path]);

  const value = useMemo<I18n>(() => {
    const d = DICTS[lang];
    const t: I18n["t"] = (key, vars) => {
      let s = d[key] ?? DICTS.uz[key] ?? key;
      if (vars) for (const k in vars) s = s.split(`{${k}}`).join(String(vars[k]));
      return s;
    };
    const locale = LOCALE[lang];
    return {
      lang, locale, setLang, t,
      help: (h) => t(`help.${h}` as Key),
      category: (c) => t(`cat.${c}` as Key),
      urgency: (u) => t(`urg.${u}` as Key),
      status: (s) => t(`st.${s}` as Key),
      day: (x) => t(`day.${x}` as Key),
      dayShort: (x) => t(`ds.${x}` as Key),
      region: (n) => (lang === "uz" ? n : REGION_NAMES[n]?.[lang] ?? n),
      regionShort: (n) => (lang === "uz" ? n.replace(" viloyati", "").replace(" Respublikasi", "") : REGION_SHORT[n]?.[lang] ?? n),
      timeAgo: (ts) => {
        const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
        if (s < 60) return t("time.now");
        const m = Math.floor(s / 60);
        if (m < 60) return t("time.min", { n: m });
        const h = Math.floor(m / 60);
        if (h < 24) return t("time.hour", { n: h });
        const dd = Math.floor(h / 24);
        if (dd < 30) return t("time.day", { n: dd });
        return new Date(ts).toLocaleDateString(locale);
      },
    };
  }, [lang, setLang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const c = useContext(Ctx);
  if (!c) throw new Error("LangProvider yo'q");
  return c;
}
