import type { Person, Volunteer, Category, HelpType, Urgency, Status, Day } from "./data";

const M = (n: number) => `https://randomuser.me/api/portraits/men/${n}.jpg`;
const W = (n: number) => `https://randomuser.me/api/portraits/women/${n}.jpg`;

type P = [string, string, number, Category, string, string, string, number, number, HelpType[], Urgency, string, string, Status, number, number];

// id, ism, yosh, kategoriya, viloyat, tuman, manzil, lat, lng, yordam, shoshilinchlik, hikoya, foto, status, helpers, necha soat oldin
const rows: P[] = [
  ["s1", "Malika Karimova", 78, "elderly", "Toshkent shahri", "Chilonzor tumani", "Chilonzor 9-kvartal", 41.2756, 69.2034, ["food", "medicine"], "high", "Yolg'iz yashaydi, yurishi qiyin. Qo'shnilar vaqti-vaqti bilan yordam beradi, lekin dori va oziq-ovqat yetishmaydi.", W(65), "verified", 1, 5],
  ["s2", "Rustam Aliyev", 84, "elderly", "Samarqand viloyati", "Pastdarg'om tumani", "Oqtepa mahallasi", 39.6, 66.8, ["company", "cleaning"], "medium", "Farzandlari chet elda ishlaydi. Uyni tozalashga va suhbatlashishga odam kerak.", M(81), "verified", 2, 30],
  ["s3", "Dilfuza Yoqubova", 41, "lowincome", "Qashqadaryo viloyati", "Shahrisabz tumani", "Yangi hayot ko'chasi", 39.0572, 66.8337, ["food", "clothes", "money"], "high", "Besh nafar farzandi bor, er vafot etgan. Qishga kiyim va oziq-ovqat zarur.", W(44), "new", 0, 2],
  ["s4", "Zulfiya Rahimova", 81, "elderly", "Farg'ona viloyati", "Marg'ilon shahri", "Alisher Navoiy ko'chasi", 40.4711, 71.7246, ["medicine", "repair"], "medium", "Uyining tomi oqyapti, bahorgi yomg'irdan oldin ta'mirlash kerak.", W(79), "verified", 1, 52],
  ["s5", "Anvar Tursunov", 59, "homeless", "Toshkent shahri", "Shayxontohur tumani", "Eski shahar, Chorsu atrofi", 41.3262, 69.2285, ["food", "clothes", "medicine"], "high", "Boshpanasiz, qishga issiq kiyim va vaqtinchalik boshpana kerak.", M(32), "new", 0, 1],
  ["s6", "Saida Ergasheva", 73, "elderly", "Buxoro viloyati", "Buxoro shahri", "Ismoil Somoniy ko'chasi", 39.7681, 64.4556, ["cleaning", "company"], "low", "Haftada bir marta uy ishlarida yordam va suhbat kerak.", W(12), "verified", 3, 120],
  ["s7", "Bahodir Nazarov", 36, "disabled", "Andijon viloyati", "Asaka tumani", "Navbahor mahallasi", 40.6411, 72.2386, ["food", "repair", "money"], "medium", "Nogironlik aravachasida, uchta farzandi bor. Uyga pandus va ta'mir kerak.", M(45), "verified", 1, 75],
  ["s8", "Karim Sodiqov", 88, "elderly", "Namangan viloyati", "Chust tumani", "Do'stlik ko'chasi", 41.0036, 71.2386, ["medicine", "food"], "high", "Qandli diabet, doimiy insulin kerak. Yaqinlari yo'q.", M(67), "verified", 1, 18],
  ["s9", "Gulnora Saidova", 64, "homeless", "Navoiy viloyati", "Navoiy shahri", "Vaqtinchalik boshpana", 40.1031, 65.3739, ["clothes", "food"], "medium", "Vaqtinchalik boshpanada yashaydi, doimiy uy-joy topish kerak.", W(28), "new", 0, 9],
  ["s10", "Shahlo Murodova", 45, "lowincome", "Xorazm viloyati", "Urganch shahri", "Al-Xorazmiy ko'chasi", 41.5534, 60.6313, ["clothes", "repair"], "low", "Isitish tizimi buzilgan, qishgacha ta'mirlash kerak.", W(90), "verified", 2, 200],
  ["s11", "Hamid Qodirov", 80, "elderly", "Jizzax viloyati", "Zomin tumani", "Tog' bag'ri qishlog'i", 39.9603, 68.3961, ["company", "food"], "medium", "Ko'zi yaxshi ko'rmaydi, bozorga chiqa olmaydi.", M(54), "verified", 0, 40],
  ["s12", "Nodira Hasanova", 52, "orphan", "Surxondaryo viloyati", "Termiz shahri", "Mustaqillik ko'chasi", 37.2242, 67.2783, ["food", "clothes", "money"], "high", "Ikki yetim jiyanini yolg'iz boqmoqda, maktab kiyimi va daftar-kitob kerak.", W(33), "new", 0, 3],
  ["s13", "Orifjon Xudoyberdiyev", 69, "disabled", "Sirdaryo viloyati", "Guliston shahri", "Sharq mahallasi", 40.4897, 68.7842, ["medicine", "repair"], "low", "Oyog'i amputatsiya qilingan, protez va uyda yordam kerak.", M(23), "verified", 1, 90],
  ["s14", "Gulbahor Tangriyeva", 76, "elderly", "Qoraqalpog'iston Respublikasi", "Nukus shahri", "Do'stlik ko'chasi", 42.4602, 59.6176, ["food", "company"], "medium", "Yolg'iz, qish oylarida isinish uchun ko'mir va oziq-ovqat kerak.", W(57), "verified", 1, 60],
  ["s15", "Sherzod Boboqulov", 38, "lowincome", "Toshkent viloyati", "Chirchiq shahri", "Gagarin ko'chasi", 41.4689, 69.5822, ["food", "money"], "medium", "Ishsiz qolgan, to'rt kishilik oilani boqish qiyin.", M(15), "new", 0, 12],
  ["s16", "Munira Ibragimova", 83, "elderly", "Andijon viloyati", "Andijon shahri", "Bobur ko'chasi", 40.7821, 72.3442, ["medicine", "cleaning"], "high", "Yotib qolgan, kundalik parvarishga yordam kerak.", W(75), "verified", 2, 8],
];

export function seedPeople(now = Date.now()): Person[] {
  return rows.map((r) => ({
    id: r[0], name: r[1], age: r[2], category: r[3], region: r[4], district: r[5], address: r[6],
    phone: "+998 90 " + String(1000000 + ((r[2] * 7919) % 8999999)).slice(0, 3) + " " + String(r[2]).padStart(2, "0") + " " + String(10 + (r[7] * 100) % 89 | 0),
    lat: r[7], lng: r[8], help: r[9], urgency: r[10], story: r[11], photo: r[12],
    reporter: "Mahalla faoli", status: r[13], helpers: r[14],
    createdAt: now - r[15] * 3600_000, updatedAt: now - r[15] * 3600_000,
  }));
}

export function seedVolunteers(now = Date.now()): Volunteer[] {
  const v = (id: string, name: string, age: number, phone: string, region: string, district: string, days: Day[], skills: HelpType[], about: string, photo: string, ago: number): Volunteer => ({
    id, name, age, phone, region, district, days, skills, about, photo, createdAt: now - ago * 3600_000,
  });
  return [
    v("v1", "Aziza Karimova", 24, "+998 90 123 12 34", "Toshkent shahri", "Chilonzor tumani", ["mon", "sat"], ["food", "company"], "Talabaman. Qariyalar bilan suhbatlashishni va oziq-ovqat yetkazishni yaxshi ko'raman.", W(68), 300),
    v("v2", "Bekzod Tursunov", 31, "+998 93 456 45 67", "Toshkent shahri", "Yunusobod tumani", ["mon", "wed"], ["repair"], "Quruvchiman. Tom, eshik va elektr ishlarini bepul ta'mirlab bera olaman.", M(36), 250),
    v("v3", "Dilnoza Rahmonova", 28, "+998 97 888 11 22", "Samarqand viloyati", "Samarqand shahri", ["sat", "sun"], ["medicine", "food"], "Hamshiraman. Dori yetkazish va oddiy tibbiy ko'rikda yordam beraman.", W(21), 200),
    v("v4", "Timur Abdullayev", 35, "+998 99 222 90 10", "Farg'ona viloyati", "Farg'ona shahri", ["tue", "sat"], ["cleaning", "repair"], "Hafta oxirlari hashar tashkil qilaman, uyni tozalash va ta'mirlashga chiqaman.", M(52), 150),
    v("v5", "Sevara Mirzayeva", 22, "+998 91 700 50 05", "Buxoro viloyati", "Buxoro shahri", ["thu", "fri"], ["clothes", "company"], "Kiyim yig'ish aksiyalarini olib boraman, qariyalarga qo'ng'iroq qilaman.", W(5), 100),
  ];
}
