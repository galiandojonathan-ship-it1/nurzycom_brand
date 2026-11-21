// Keep shortcuts to results and account settings working from the former teacher page.
const cabinet = new URL("cabinet.html", location.href);
cabinet.search = location.search;
cabinet.hash = location.hash;
location.replace(cabinet);
