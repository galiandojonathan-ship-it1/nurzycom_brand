# Запуск сайтов на своём домене

Два сайта на одном домене `bynurzy.com` (зарегистрирован 4 ноября 2026):

| Что | Папка в репозитории | Адрес |
|---|---|---|
| Главный сайт (EN / RU) | `site/` | `https://bynurzy.com/` и `https://bynurzy.com/ru/` |
| Сайт курса (по паролю) | `docs/` | `https://study.bynurzy.com/` |

Хостинг: Cloudflare Pages, бесплатно. Платите только за домен (около $11 в год у Cloudflare Registrar).
Всё в репозитории уже готово: адреса для поиска и превью ссылок, `robots.txt`, `sitemap.xml`, страницы 404, заголовки безопасности (`_headers`), ссылка «Вход для учеников» в подвале главного сайта. Сайт курса закрыт от поисковиков.

Если купите другой домен, одна команда переписывает все адреса: `python3 deploy/set_domain.py новый-домен.com` (или попросите Claude).

## Аккаунты учеников: ученики регистрируются сами (5 ноября 2026)

Ученик на странице входа нажимает **«Создать аккаунт»**, вводит код класса, имя, логин и пароль. Аккаунты хранятся в бесплатном хранилище Cloudflare (Workers KV). Пароли и материалы туда не попадают: хранится только зашифрованный ключ, логин и имя тоже зашифрованы.

### Один раз: подключить хранилище (3 минуты)

1. Cloudflare → левое меню **Storage & databases** → **Workers KV** (или **KV**) → **Create instance** (или **Create namespace**) → **Namespace name**: `bynurzy-users` → **Create**.
2. Левое меню **Workers & Pages** → **bynurzy-study** → вкладка **Settings** → **Bindings** → **Add** (или **+ Add binding**) → **KV namespace**:
   - **Variable name**: `USERS` (именно так, заглавными)
   - **KV namespace**: `bynurzy-users`
   - **Save**.
3. Вкладка **Deployments** → в нижнем списке **All deployments** у верхней строки **Production** справа **⋯** → **Retry deployment** (или попросите Claude: любое сохранение в `main` тоже пересобирает сайт). Через 1–2 минуты хранилище подключено.

### Потом в кабинете (`https://study.bynurzy.com/teacher.html`, кнопка «Аккаунты учеников и код класса ↓»)

1. **Стать администратором** → появится ключ администратора: сохраните его в Заметках (нужен на другом устройстве).
2. **Создать код класса** → скопируйте готовое сообщение и отправьте ученикам.
3. Сами тоже: **Выйти** → **Создать аккаунт** → код класса, ваше имя, логин, пароль.
4. Когда все ученики создали аккаунты, попросите Claude выключить общий пароль.

Удалить ученика: в списке аккаунтов → **Удалить** (работает сразу). Код утёк: **Новый код класса** (созданные аккаунты остаются).

## Сейчас: сайт курса на study.bynurzy.com со входом по почте (решение 5 ноября 2026)

Главный сайт пока не запускаем. Сайт курса переезжает с GitHub Pages на Cloudflare Pages: только там работает вход по почте (Cloudflare Access, бесплатно до 50 человек).

**Как будет входить ученик.** Открывает `study.bynurzy.com` → вводит свою почту → получает код из 6 цифр → вводит код. Cloudflare помнит вход 30 дней. Потом, один раз на устройстве, ученик вводит пароль сайта (он по-прежнему шифрует материалы). Почты, которых нет в вашем списке, код не получат. Кабинет `teacher.html` открывается только с вашей почты.

### Шаг 1. Сайт на Cloudflare Pages (5 минут)

1. https://dash.cloudflare.com → **Workers & Pages** → **Create** (или **Create application**) → вкладка **Pages** → **Connect to Git** (или **Import an existing Git repository**).
2. **Connect GitHub** → разрешите доступ к репозиторию `nurzycom_brand` → выберите его → **Begin setup**.
3. **Project name**: `bynurzy-study` · **Production branch**: `main` · **Framework preset**: `None` · **Build command**: пусто · **Build output directory**: `docs` → **Save and Deploy**.
4. Через 1–2 минуты появится адрес `bynurzy-study.pages.dev`: откройте, должно быть окно пароля сайта.
5. В проекте → **Custom domains** → **Set up a custom domain** → `study.bynurzy.com` → **Continue** → **Activate domain**. Cloudflare сам создаст запись DNS. Через несколько минут `https://study.bynurzy.com/` откроется.

### Шаг 2. Вход по почте: Cloudflare Access (10 минут)

1. В левом меню **Zero Trust**. При первом входе: придумайте **Team name** (например `bynurzy`) → план **Free** ($0; Cloudflare может попросить карту, списаний нет).
2. **Settings** → **Authentication** → **Login methods**: должен быть **One-time PIN** (обычно включён сам).
3. **Access** (или **Access controls**) → **Applications** → **Add an application** → **Self-hosted**.
   - **Application name**: `bynurzy study` · **Session Duration**: `1 month`.
   - **Application domain** (или **Public hostname**): `study.bynurzy.com`, путь пустой.
   - **Add public hostname** ещё раз: `bynurzy-study.pages.dev` (иначе по этому адресу сайт откроется без входа).
   - **Policies** → **Add a policy**: **Policy name** `Students`, **Action** `Allow`, **Include** → **Emails** → почты учеников и ваша, через запятую.
   - **Save**.
4. Второе приложение для кабинета: **Add an application** → **Self-hosted** → **Application name** `bynurzy teacher` → домен `study.bynurzy.com`, **Path** `teacher.html` → политика `Teacher`, **Allow**, **Include** → **Emails** → только ваша почта → **Save**.
5. Проверка: откройте `https://study.bynurzy.com/` в окне инкогнито → должна появиться страница Cloudflare с полем для почты.

**Новый ученик:** Zero Trust → **Access** → **Applications** → `bynurzy study` → **Policies** → `Students` → **Edit** → добавить почту → **Save**. Ученик ушёл: удалить почту там же.

**По желанию:** Zero Trust → **Settings** → **Custom Pages** → **Login page**: название `nurzycom · SAT`, чёрный фон (#0A0A0A), логотип — тогда страница входа будет в стиле курса.

### Шаг 3. Старый адрес на GitHub Pages

Когда новый адрес работает и ученики получили ссылку: GitHub → репозиторий → **Settings** → **Pages** → **Unpublish site** (или **Source** → `None`). Иначе старая копия `…github.io/nurzycom_brand/` останется открытой без входа по почте (материалы там зашифрованы, но лучше убрать).

Пароль сайта меняется как раньше: `https://study.bynurzy.com/teacher.html` → **Пароль сайта** → GitHub, ветка `main`; Cloudflare сам пересоберёт сайт за 1–2 минуты.

Шаги ниже (главный сайт и общий план) — на потом.

## 1. Домен в Cloudflare

Домен `bynurzy.com` уже куплен. Дальше всё зависит от того, где он зарегистрирован.

- **Куплен в Cloudflare** (Domain Registration): ничего делать не нужно, домен уже в аккаунте. Проверьте **Auto-renew**.
- **Куплен у другого регистратора** (Namecheap, GoDaddy, ps.kz и т. п.): Cloudflare → **Add a domain** → `bynurzy.com` → план **Free** → **Continue**. Cloudflare покажет два nameserver (вида `xxx.ns.cloudflare.com`). У регистратора откройте настройки домена → **Nameservers** → **Custom DNS** → вставьте эти два адреса → **Save**. Через 10 минут – 24 часа домен в Cloudflare станет **Active**. Включите автопродление у регистратора.

## 2. Репозиторий и ветка

- Сайты собираются из ветки `main` (создана 4 ноября 2026: в ней вся работа из трёх прежних веток `claude/…`).
- **Settings** → **General** → **Default branch** → значок ⇄ → `main` → **Update**.
- Claude сохраняет работу прямо в `main`, и каждое сохранение через 1–2 минуты выходит на сайт. Если новая сессия Claude начнёт в ветке `claude/…`, скажите ей: «сохраняй в main».
- Старые ветки `claude/…` больше не нужны (всё из них уже в `main`): **Branches** → значок корзины рядом с веткой.

## 3. Главный сайт

1. Cloudflare → **Workers & Pages** → **Create** → вкладка **Pages** → **Connect to Git**.
   (Если Cloudflare показывает только **Import a repository**, выберите его: шаги те же.)
2. Подключите GitHub, выберите репозиторий `nurzycom_brand` → **Begin setup**.
3. **Project name**: `nurzycom` · **Production branch**: `main` · **Framework preset**: `None` · **Build command**: пусто · **Build output directory**: `site` → **Save and Deploy**.
4. Проект → **Custom domains** → **Set up a custom domain** → `bynurzy.com` → **Continue** → **Activate domain**. Повторите для `www.bynurzy.com`.

## 4. Сайт курса

1. Снова **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → тот же репозиторий.
2. **Project name**: `nurzycom-study` · **Production branch**: `main` · **Build output directory**: `docs` → **Save and Deploy**.
3. **Custom domains** → `study.bynurzy.com` → **Activate domain**.
4. Откройте `https://study.bynurzy.com/`: должно появиться окно пароля сайта.

Запасной вариант без Cloudflare Pages: сайт курса может остаться на GitHub Pages (**Settings** → **Pages** → **Deploy from a branch** → `main` → `/docs` → **Save**, затем **Custom domain** → `study.bynurzy.com` → **Save**), а в Cloudflare → домен → **DNS** → **Records** → **Add record**: Type `CNAME`, Name `study`, Target `galiandojonathan-ship-it1.github.io`, Proxy status **DNS only**. Вход по почте (пункт 6) тогда не работает.

GitHub Pages после переезда можно выключить: GitHub → **Settings** → **Pages** → **Source**: `None`. Тогда репозиторий можно сделать приватным (**Settings** → **General** → **Danger Zone** → **Change visibility** → **Private**): Cloudflare продолжит собирать сайт.

## 5. Смена пароля сайта на новом хостинге

`https://study.bynurzy.com/teacher.html` → **GitHub · подключить один раз**: ветка теперь по умолчанию `main`. После смены пароля Cloudflare пересоберёт сайт за 1–2 минуты.

## 6. (По желанию) Вход по почте для каждого ученика: Cloudflare Access

Бесплатно до 50 человек. Ученик вводит свою почту и получает код. Вы добавляете и удаляете почты, общий пароль можно не рассылать.

1. Cloudflare → **Zero Trust** → выберите план **Free** (карта нужна, списаний нет).
2. **Settings** → **Authentication** → **Login methods** → должен быть **One-time PIN**.
3. **Access** → **Applications** → **Add an application** → **Self-hosted**.
   - **Application name**: `nurzycom study` · **Application domain**: `study.bynurzy.com`.
   - **Policy name**: `Students` · **Action**: `Allow` · **Include** → **Emails** → почты учеников и ваша.
   - **Save**.
4. Отдельно закройте кабинет: ещё одно приложение с доменом `study.bynurzy.com`, путь `teacher.html`, в **Include** только ваша почта.
5. Общий пароль сайта останется вторым замком. Если захотите оставить только вход по почте, попросите Claude убрать пароль.

## 7. Проверка после запуска

- `https://bynurzy.com/` и `/ru/` открываются, кнопка RU / EN работает, превью ссылки в Telegram показывает фото.
- Ссылка «Вход для учеников» в подвале ведёт на `study.bynurzy.com`.
- На сайте курса: войти, сдать любую часть, проверить, что ответ пришёл в Google Form.
- В кабинете (`teacher.html`) открыть ответы: даты должны совпадать с Google Sheets.
- По желанию: Google Search Console → **Add property** → **Domain** → `bynurzy.com` (подтверждение через запись DNS в Cloudflare).
