/**
 * Google Apps Script - Recenzní formulář pro BIO Ceremoniální Cacao
 *
 * JAK POUŽÍT:
 * 1. Otevři https://script.google.com
 * 2. Vytvoř nový projekt (+ New project)
 * 3. Smaž obsah Code.gs a vlož celý tento kód
 * 4. Klikni na "Run" (▶) u funkce createReviewForm
 * 5. Povolí přístup k Google Forms (autorizace)
 * 6. V logu (View → Execution log) najdeš URL formuláře
 */

function createReviewForm() {
  // Vytvoření formuláře
  var form = FormApp.create("Recenze BIO Cacao | EZOPEACH");

  form.setDescription(
    "Děkujeme, že jste vyzkoušeli naše BIO Cacao! " +
    "Vaše zpětná vazba nám pomáhá zlepšovat naše produkty a služby. " +
    "Vyplnění zabere pouze 2 minuty."
  );

  form.setConfirmationMessage(
    "Děkujeme za vaši recenzi! 🙏\n\n" +
    "Vaše zpětná vazba je pro nás velmi cenná. " +
    "Pokud máte jakékoliv další dotazy, kontaktujte nás na info@ezopeach.eu"
  );

  form.setAllowResponseEdits(false);
  form.setLimitOneResponsePerUser(false);
  form.setProgressBar(false);

  // 1. Jméno
  var nameItem = form.addTextItem();
  nameItem.setTitle("Vaše jméno");
  nameItem.setHelpText("Jak vás máme oslovovat (zobrazí se u recenze)");
  nameItem.setRequired(true);

  // 2. Email (volitelný)
  var emailItem = form.addTextItem();
  emailItem.setTitle("E-mail");
  emailItem.setHelpText(
    "Volitelné — pouze pro případné kontaktování ohledně vaší recenze"
  );
  emailItem.setRequired(false);

  // 3. Celkové hodnocení (hvězdičky 1-5)
  var ratingItem = form.addScaleItem();
  ratingItem.setTitle("Celkové hodnocení");
  ratingItem.setHelpText("Jak jste celkově spokojeni s naším cacao?");
  ratingItem.setBounds(1, 5);
  ratingItem.setLabels("Nespokojen/a", "Velmi spokojen/a");
  ratingItem.setRequired(true);

  // 4. Co se vám nejvíce líbilo?
  var likesItem = form.addCheckboxItem();
  likesItem.setTitle("Co se vám nejvíce líbilo?");
  likesItem.setHelpText("Můžete vybrat více možností");
  likesItem.setChoices([
    likesItem.createChoice("Chuť a aroma"),
    likesItem.createChoice("Kvalita suroviny"),
    likesItem.createChoice("Energizující účinky"),
    likesItem.createChoice("BIO certifikace"),
    likesItem.createChoice("Balení a prezentace"),
    likesItem.createChoice("Poměr cena/kvalita"),
    likesItem.createChoice("Rychlé doručení"),
  ]);
  likesItem.setRequired(false);

  // 5. Jak cacao připravujete?
  var prepItem = form.addMultipleChoiceItem();
  prepItem.setTitle("Jak cacao nejčastěji připravujete?");
  prepItem.setChoices([
    prepItem.createChoice("Klasický horký nápoj s vodou"),
    prepItem.createChoice("S rostlinným mlékem"),
    prepItem.createChoice("S kravským mlékem"),
    prepItem.createChoice("Ceremoniálním způsobem (meditace)"),
    prepItem.createChoice("Přidávám do smoothie"),
    prepItem.createChoice("Jinak"),
  ]);
  prepItem.setRequired(false);

  // 6. Textová recenze
  var reviewItem = form.addParagraphTextItem();
  reviewItem.setTitle("Vaše recenze");
  reviewItem.setHelpText(
    "Popište svou zkušenost — co vás zaujalo, jak vám cacao chutnalo, jaké účinky jste pocítili..."
  );
  reviewItem.setRequired(true);

  // 7. Doporučili byste produkt?
  var recommendItem = form.addMultipleChoiceItem();
  recommendItem.setTitle("Doporučili byste naše cacao přátelům?");
  recommendItem.setChoices([
    recommendItem.createChoice("Rozhodně ano!"),
    recommendItem.createChoice("Spíše ano"),
    recommendItem.createChoice("Spíše ne"),
    recommendItem.createChoice("Ne"),
  ]);
  recommendItem.setRequired(true);

  // 8. Souhlas se zveřejněním
  var consentItem = form.addCheckboxItem();
  consentItem.setTitle("Souhlas se zveřejněním");
  consentItem.setChoices([
    consentItem.createChoice(
      "Souhlasím se zveřejněním mé recenze na webu ezopeach.eu"
    ),
    consentItem.createChoice(
      "Souhlasím s použitím mé fotografie na webu ezopeach.eu"
    ),
  ]);
  consentItem.setRequired(true);

  // Nastavení triggeru pro email notifikace
  ScriptApp.newTrigger("onReviewSubmit")
    .forForm(form)
    .onFormSubmit()
    .create();

  Logger.log("=== TRIGGER NASTAVEN ===");
  Logger.log("Email notifikace budou chodit na: info@ezopeach.eu");

  // Logování URL
  var publishedUrl = form.getPublishedUrl();
  var editUrl = form.getEditUrl();

  Logger.log("=== FORMULÁŘ VYTVOŘEN ===");
  Logger.log("URL pro zákazníky (sdílení): " + publishedUrl);
  Logger.log("URL pro úpravy (admin): " + editUrl);
  Logger.log("ID formuláře: " + form.getId());

  return {
    publishedUrl: publishedUrl,
    editUrl: editUrl,
    formId: form.getId(),
  };
}

/**
 * Trigger — spustí se automaticky při každém odeslání formuláře.
 * Pošle email s přehledem recenze na info@ezopeach.eu.
 */
function onReviewSubmit(e) {
  var response = e.response;
  var items = response.getItemResponses();

  var name = items[0].getResponse(); // Jméno
  var email = items[1].getResponse() || "neuvedeno"; // Email
  var rating = items[2].getResponse(); // Hodnocení 1-5
  var likes = items[3].getResponse() || []; // Co se líbilo
  var prep = items[4].getResponse() || "neuvedeno"; // Příprava
  var review = items[5].getResponse(); // Text recenze
  var recommend = items[6].getResponse(); // Doporučení
  var consent = items[7].getResponse() || []; // Souhlas

  var stars = "";
  for (var i = 0; i < parseInt(rating); i++) stars += "\u2605";
  for (var i = parseInt(rating); i < 5; i++) stars += "\u2606";

  var subject = "Nova recenze " + stars + " od " + name + " | EZOPEACH Cacao";

  var body =
    "NOVA RECENZE — BIO Cacao | EZOPEACH\n" +
    "=========================================\n\n" +
    "Jmeno:        " + name + "\n" +
    "Email:        " + email + "\n" +
    "Hodnoceni:    " + stars + " (" + rating + "/5)\n" +
    "Doporuceni:   " + recommend + "\n\n" +
    "--- RECENZE ---\n" +
    review + "\n\n" +
    "--- DETAILY ---\n" +
    "Co se libilo: " + (Array.isArray(likes) ? likes.join(", ") : likes) + "\n" +
    "Priprava:     " + prep + "\n" +
    "Souhlas:      " + (Array.isArray(consent) ? consent.join(", ") : consent) + "\n\n" +
    "=========================================\n" +
    "Cas odeslani: " + response.getTimestamp() + "\n" +
    "Odpovedet zakaznikovi: " + (email !== "neuvedeno" ? email : "email neuveden");

  MailApp.sendEmail({
    to: "info@ezopeach.eu",
    subject: subject,
    body: body,
  });
}
