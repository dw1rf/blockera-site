export type ProductCategory = "privilege" | "case" | "booster" | "cosmetic";

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  privilegeRank?: number;
  highlight?: string;
  commands?: string;
  regionLimit?: number;
  easyDonateProductId?: string;
  easyDonateServerId?: number;
}

export const products: Product[] = [
  {
    id: "creative",
    name: "Креатив",
    description: "Свобода строительства и выживания без ограничений.",
    commands:
      "/gm или /gamemode 1; /back; до 5 домов — /sethome <имя> / /home <имя>; /me <сообщение>; /jobs; /chatcolor gui.",
    category: "privilege",
    price: 349,
    privilegeRank: 1,
    regionLimit: 200_000,
    easyDonateProductId: "1030373"
  },
  {
    id: "admin",
    name: "Админ",
    description: "Полный контроль над сервером и мгновенная модерация.",
    commands:
      "/kick <игрок>; /mute <игрок> / /unmute <игрок>; /mutechat / /unmutechat; /tp <игрок>; до 7 домов — /sethome <имя> / /home <имя>.",
    category: "privilege",
    price: 549,
    privilegeRank: 3,
    regionLimit: 300_000,
    easyDonateProductId: "1030968"
  },
  {
    id: "moderator",
    name: "Модератор",
    description: "Роль для поддержания порядка и помощи игрокам.",
    commands: "/jail <игрок> / /unjail <игрок>; /nick <ник>; до 10 домов — /sethome.",
    category: "privilege",
    price: 499,
    privilegeRank: 2,
    regionLimit: 350_000,
    easyDonateProductId: "1030971"
  },
  {
    id: "soul",
    name: "Soul",
    description: "Расширенные возможности модерации и помощи игрокам.",
    commands: "/ban <игрок> / /unban <игрок>; /fly <игрок>; /heal; до 12 домов — /sethome <имя> / /home <имя>.",
    category: "privilege",
    price: 699,
    privilegeRank: 4,
    regionLimit: 400_000,
    easyDonateProductId: "1030972"
  },
  {
    id: "platinum",
    name: "Platinum",
    description: "Расширенный креативный инструмент и WorldEdit‑команды.",
    commands:
      "/speed [уровень]; /undo; /navigate; базовое редактирование регионов — /set / /expand; rg flag: block-break / block-place / PvP / item-drop.",
    category: "privilege",
    price: 799,
    privilegeRank: 5,
    regionLimit: 500_000,
    easyDonateProductId: "1030973"
  },
  {
    id: "legend",
    name: "Legend",
    description: "Легендарный статус и расширенные настройки мира.",
    commands: "/time <день|ночь|число>; /jobs (до 7 профессий); /snow / /thaw; /wg teleport own; /wg priority.",
    category: "privilege",
    price: 1_149,
    privilegeRank: 6,
    regionLimit: 1_000_000,
    easyDonateProductId: "1030974"
  },
  {
    id: "immortal",
    name: "Immortal",
    description: "Максимальная мощь и полный доступ к инструментам редактирования.",
    commands: "/kill <игрок>; /clearzone; /tphere <игрок>; полный доступ к кистям — /brush.*; /removebelow / /removenear.",
    category: "privilege",
    price: 2_149,
    privilegeRank: 7,
    regionLimit: 2_000_000,
    easyDonateProductId: "1030975"
  },
  {
    id: "shine",
    name: "Shine",
    description: "Сияющая сила для тех, кто строит масштабные проекты.",
    commands: "//cylinder; //sphere; //line; /wg teleport.",
    category: "privilege",
    price: 4_599,
    privilegeRank: 8,
    regionLimit: 2_500_000,
    easyDonateProductId: "1030976"
  },
  {
    id: "ethereal",
    name: "Ethereal",
    description: "Высшая форма власти и полный доступ к WorldEdit инструментам.",
    commands: "/chatcolor change <цвет>; доступ к copy, paste, rotate; /delchunks; /jobs (до 10 профессий).",
    category: "privilege",
    price: 8_190,
    privilegeRank: 9,
    regionLimit: 5_000_000,
    easyDonateProductId: "1030978"
  }
];

export const categoryFilters: { value: ProductCategory | "all"; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "privilege", label: "Привилегии" },
  { value: "case", label: "Кейсы" },
  { value: "booster", label: "Бустеры" },
  { value: "cosmetic", label: "Косметика" }
];
