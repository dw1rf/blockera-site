export type ProductCategory = "privilege" | "case" | "booster" | "cosmetic";

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  highlight?: string;
}

export const products: Product[] = [
  {
    id: "legend",
    name: "LEGEND",
    description: "Доступ ко всем /fly зонам, 6 наборов, персональный ник и выделенный слот на сервере.",
    category: "privilege",
    price: 1499,
    highlight: "Хит продаж"
  },
  {
    id: "titan",
    name: "TITAN",
    description: "Эксклюзивные частицы, +3 /home, усиленный дроп ресурсов и редкий питомец.",
    category: "privilege",
    price: 999
  },
  {
    id: "premium",
    name: "PREMIUM",
    description: "/kit premium каждые 24 часа, +2 /home и доступ к приватной шахте.",
    category: "privilege",
    price: 599
  },
  {
    id: "starter",
    name: "STARTER",
    description: "Набор новичка, +1 /home, эффект Night Vision и быстрый доступ к аукциону.",
    category: "privilege",
    price: 299
  },
  {
    id: "battle-pass",
    name: "Battle Pass S3",
    description: "120 уровней наград, уникальные скины, титулы и внутриигровая валюта.",
    category: "booster",
    price: 899,
    highlight: "Сезонное предложение"
  },
  {
    id: "crate-mystic",
    name: "Mystic Case",
    description: "Шанс получить легендарное оружие, анимированные плащи и эффектные крылья.",
    category: "case",
    price: 459
  },
  {
    id: "crate-epic",
    name: "Epic Case",
    description: "Редкие инструменты с уникальными чарами и косметика для лобби.",
    category: "case",
    price: 259
  },
  {
    id: "booster-farm",
    name: "Фарм бустер x2",
    description: "Удваивает доход фермы и автосбор ресурсов на 7 дней.",
    category: "booster",
    price: 349
  },
  {
    id: "tag-custom",
    name: "Индивидуальный тег",
    description: "Создай уникальный префикс в чате с проверкой модератором.",
    category: "cosmetic",
    price: 199
  },
  {
    id: "particles",
    name: "Аура портала",
    description: "Косметический эффект в лобби и на спавне, подчеркивающий статус.",
    category: "cosmetic",
    price: 149
  }
];

export const categoryFilters: { value: ProductCategory | "all"; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "privilege", label: "Привилегии" },
  { value: "case", label: "Кейсы" },
  { value: "booster", label: "Бустеры" },
  { value: "cosmetic", label: "Косметика" }
];
