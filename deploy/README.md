# Запуск сайтов на своём домене

Два сайта на одном домене `bynurzy.com` (зарегистрирован 4 ноября 2026):

| Что | Папка в репозитории | Адрес |
|---|---|---|
| Главный сайт (EN / RU) | `site/` | `https://bynurzy.com/` и `https://bynurzy.com/ru/` |
| Сайт курса (по паролю) | `docs/` | `https://study.bynurzy.com/` |

Хостинг: Cloudflare Pages, бесплатно. Платите только за домен (около $11 в год у Cloudflare Registrar).
Всё в репозитории уже готово: адреса для поиска и превью ссылок, `robots.txt`, `sitemap.xml`, страницы 404, заголовки безопасности (`_headers`), ссылка «Вход для учеников» в подвале главного сайта. Сайт курса закрыт от поисковиков.

Если купите другой домен, одна команда переписывает все адреса: `python3 deploy/set_domain.py новый-домен.com` (или попросите Claude).

## 1. Домен в Cloudflare

Домен `bynurzy.com` уже куплен. Дальше всё зависит от того, где он зарегистрирован.

- **Куплен в Cloudflare** (Domain Registration): ничего делать не нужно, домен уже в аккаунте. Проверьте **Auto-renew**.
- **Куплен у другого регистратора** (Namecheap, GoDaddy, ps.kz и т. п.): Cloudflare → **Add a domain** → `bynurzy.com` → план **Free** → **Continue**. Cloudflare покажет два nameserver (вида `xxx.ns.cloudflare.com`). У регистратора откройте настройки домена → **Nameservers** → **Custom DNS** → вставьте эти два адреса → **Save**. Через 10 минут – 24 часа домен в Cloudflare станет **Active**. Включите автопродление у регистратора.

## 2. Репозиторий и ветка

- Репозиторий называется `bynurzy` (переименование: GitHub → репозиторий → **Settings** → **General** → **Repository name** → `bynurzy` → **Rename**). Старые ссылки на `nurzycom_brand` GitHub перенаправляет сам.
- Сайты собираются из ветки `main` (создана 4 ноября 2026 из `claude/ecstatic-mayer-3asg7r`).
- **Settings** → **General** → **Default branch** → значок ⇄ → `main` → **Update**.
- Новые изменения попадают в `main` через **Pull request** → **Merge**, или попросите Claude обновить `main`.

## 3. Главный сайт

1. Cloudflare → **Workers & Pages** → **Create** → вкладка **Pages** → **Connect to Git**.
   (Если Cloudflare показывает только **Import a repository**, выберите его: шаги те же.)
2. Подключите GitHub, выберите репозиторий `bynurzy` → **Begin setup**.
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
