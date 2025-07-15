// Load Zoho SDK if not already included
(function loadZohoSdk(callback) {
  if (typeof ZOHO === "undefined") {
    const script = document.createElement("script");
    script.src = "https://js.zohocdn.com/embeddedapp/v1.0/embeddedApp.js";
    script.onload = callback;
    document.head.appendChild(script);
  } else {
    callback();
  }
})(() => {
  ZOHO.embeddedApp.on("PageLoad", async (data) => {
    ZOHO.CRM.UI.Resize({ height: "90%", width: "70%" });

    // Loop for all the selected Deals
    let tbody = document.getElementById("dynamicTableBody");
    let sumPunkte = 0;
    let sumStorno = 0;
    let sumProvision = 0;

    let getSelectDeals = data?.EntityId;

    getSelectDeals.forEach(async (dealId) => {
      let getAllSelectedDeals = await ZOHO.CRM.API.getRecord({
        Entity: data?.Entity,
        RecordID: dealId,
      });

      let dealData = getAllSelectedDeals?.data[0];

      // Get fields from each deal
      let {
        Provision_inkl_Storno,
        Punktewert_Kalk,
        Contact_Name,
        Gesellschaft,
        Closing_Date,
        Stornowert_in_CHF,
      } = dealData;

      // Fallbacks and formatting
      let kontakt = Contact_Name?.name || "NA";
      let gesellschaft = Gesellschaft?.name || "NA";
      let abschluss = Closing_Date || "NA";
      let chfPunkt = parseFloat(Punktewert_Kalk || 0);
      let storno = parseFloat(Stornowert_in_CHF || 0);
      let provision = parseFloat(Provision_inkl_Storno || 0);

      // Append table row
      let row = document.createElement("tr");
      row.innerHTML = `
    <td class="border px-2 py-1 break-words">${kontakt}</td>
    <td class="border px-2 py-1 break-words">${gesellschaft}</td>
    <td class="border px-2 py-1 break-words">${abschluss}</td>
    <td class="border px-2 py-1 break-words">${chfPunkt.toFixed(2)}</td>
    <td class="border px-2 py-1 break-words">${storno.toFixed(2)}</td>
    <td class="border px-2 py-1 break-words">${provision.toFixed(2)}</td>
  `;
      tbody.appendChild(row);

      // Add to totals
      sumPunkte += chfPunkt;
      sumStorno += storno;
      sumProvision += provision;

      // Update footer totals (inside the loop so it's live-updated per row)
      document.getElementById("sumPunkte").textContent = sumPunkte.toFixed(2);
      document.getElementById("sumStorno").textContent = sumStorno.toFixed(2);
      document.getElementById("sumProvision").textContent =
        sumProvision.toFixed(2);
    });

    // Get The First Deal Details
    let getFirstDeal = await ZOHO.CRM.API.getRecord({
      Entity: `${data?.Entity}`,
      RecordID: `${data?.EntityId[0]}`,
    });

    // Get Deals Data
    let getFirstDealData = getFirstDeal?.data[0];

    // All getMitarbeiter Details
    let getMitarbeiterDetails = await ZOHO.CRM.API.getRecord({
      Entity: "Mitarbeiter1",
      RecordID: `${getFirstDealData?.Mitarbeiter?.id}`,
    });
    // console.log(getMitarbeiterDetails);

    // Get Mitarbeiter Data
    let getMitarbeiterData = getMitarbeiterDetails?.data[0];

    // Date For Top Right
    const getMothYear = () => {
      const getCurrntMonth = new Date().getMonth();
      const getCurrntYear = new Date().getFullYear();
      const monthList = [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember",
      ];
      return monthList[getCurrntMonth] + " " + getCurrntYear;
    };
    const getFullDateTime = () => {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      return `${day}.${month}.${year}`;
    };

    // For Fields Form Mitarbeiter
    let {
      Vorname,
      Nachname,
      Strasse_Hausnummer,
      PLZ,
      Ort,
      Bonus_Bemerkung,
      Bonus,
      AHV,
      ALV,
      NBU,
      BVG,
      KTG,
      Kinderzulage,
      Spesen,
      Sonstiges,
      IBAN_f_r_Auszahlungen,
      Total_Stornokonto,
      Total_Punkte,
      Differenz_zur_n_chsten_Stufe,
      N_chste_St_fe,
    } = getMitarbeiterData;

    /* Start Calculation */
    let BRUTTOLOHNI = (sumProvision + Bonus).toFixed(2);
    // let stornoreserve = parseFloat(((sumProvision + Bonus) * 0.15).toFixed(2));

    // get data from Storno effektiv
    const month = [
      "Januar",
      "Februar",
      "März",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Dezember",
    ][new Date().getMonth()];
    const year = new Date().getFullYear().toString();
    const list = getMitarbeiterData?.Storno_effektiv || [];

    const match = list.find((e) => e.Monat === month && e.Jahr === year);
    const stornoEffektiv = match ? parseFloat(match.Sornowert || 0) : 0.0;

    let BRUTTOLOHNII = parseFloat(
      BRUTTOLOHNI - (sumStorno + stornoEffektiv)
    ).toFixed(2);

    let AHVPercentage =
      parseFloat(((BRUTTOLOHNII * AHV) / 100).toFixed(2)) || 0.0;
    let ALVPercentage =
      parseFloat(((BRUTTOLOHNII * ALV) / 100).toFixed(2)) || 0.0;
    let NBUPercentage =
      parseFloat(((BRUTTOLOHNII * NBU) / 100).toFixed(2)) || 0.0;
    let BVGPercentage =
      parseFloat(((BRUTTOLOHNII * BVG) / 100).toFixed(2)) || 0.0;
    let KTGPercentage =
      parseFloat(((BRUTTOLOHNII * KTG) / 100).toFixed(2)) || 0.0;

    // Total TOTALAbzüge
    let TOTALAbzüge =
      (
        AHVPercentage +
        ALVPercentage +
        NBUPercentage +
        BVGPercentage +
        KTGPercentage
      ).toFixed(2) || 0.0;
    let NETTOLOHNI = (BRUTTOLOHNII - TOTALAbzüge).toFixed(2) || 0.0;

    // Total NETTOLOHN II
    let TotalNETTOLOHNII =
      parseFloat(Kinderzulage || 0) +
      parseFloat(Spesen || 0) +
      parseFloat(Sonstiges || 0);

    let NETTOLOHNII = parseFloat(NETTOLOHNI || 0) + TotalNETTOLOHNII;
    let TotalStornokonto = parseFloat(Total_Stornokonto) || 0.0;
    let SaldoStornokontoNeu =
      parseFloat((TotalStornokonto + sumStorno).toFixed(2)) || 0.0;

    let TotalPunkte = parseFloat(Total_Punkte) || 0.0;
    let PunkteSaldoNeu =
      parseFloat((sumPunkte + TotalPunkte).toFixed(2)) || 0.0;

    let DifferenzZurNChstenStufe =
      parseFloat(Differenz_zur_n_chsten_Stufe) || 0.0;
    /* End Calculation */

    // Inject Abrechnung HTML
    const html = `
  <section class="mb-6">
    <p class="mb-1 font-semibold">${Vorname} ${Nachname}</p>
    <p class="mb-1">${Strasse_Hausnummer}</p>
    <p class="mb-1">${PLZ} ${Ort}</p>
    <p class="text-right">Cham, ${getFullDateTime()}</p>
  </section>

  <h2 class="text-xl font-bold mb-4 border-b pb-1">Abrechnung ${getMothYear()}</h2>

  <table class="w-full mb-6 border border-collapse border-gray-300">
    <tbody>
      <tr class="border-b">
        <td class="py-1 px-4">Bezeichnung</td>
        <td class="py-1 px-4 text-right">%</td>
        <td class="py-1 px-4 text-right">Ansatz</td>
        <td class="py-1 px-4 text-right">Betrag</td>
      </tr>
      <tr class="border-b">
        <td class="py-1 px-4">Total gemäss Umsatzliste</td>
        <td></td><td></td>
        <td class="text-right px-4">${sumProvision.toFixed(2) || 0.0}</td>
      </tr>
      <tr class="border-b">
        <td class="py-1 px-4">+ Bonus ${Bonus_Bemerkung || "NA"}</td>
        <td></td><td></td>
        <td class="text-right px-4"> ${Bonus || 0.0}</td>
      </tr>
      <tr class="border-b font-semibold">
        <td class="py-1 px-4">BRUTTOLOHN I (gemäss Umsatzliste)</td>
        <td></td><td></td>
        <td class="text-right px-4">${BRUTTOLOHNI}</td>
      </tr>
      <tr class="border-b">
        <td class="py-1 px-4">./. Stornoreserve</td>
        <td class="text-right px-4">15%</td>
        <td></td>
        <td class="text-right px-4"> - ${sumStorno.toFixed(2)}</td>
      </tr>
      <tr class="border-b">
        <td class="py-1 px-4">./. Storno effektiv</td>
        <td></td><td></td>
        <td class="text-right px-4 text-red-500"> - ${stornoEffektiv}</td>
      </tr>
      <tr class="border-b font-semibold">
        <td class="py-1 px-4">BRUTTOLOHN II (AHV-Lohn)</td>
        <td></td><td></td>
        <td class="text-right px-4">${BRUTTOLOHNII}</td>
      </tr>
      <tr class="border-b">
        <td class="py-1 px-4">./. AHV</td>
        <td class="text-right px-4">${AHV}%</td>
        <td class="text-right px-4">${BRUTTOLOHNII}</td>
        <td class="text-right px-4"> - ${AHVPercentage}</td>
      </tr>
      <tr class="border-b">
        <td class="py-1 px-4">./. ALV</td>
        <td class="text-right px-4">${ALV}%</td>
        <td class="text-right px-4">${BRUTTOLOHNII}</td>
        <td class="text-right px-4"> - ${ALVPercentage}</td>
      </tr>
      <tr class="border-b">
        <td class="py-1 px-4">./. NBU</td>
        <td class="text-right px-4">${NBU}%</td>
        <td class="text-right px-4">${BRUTTOLOHNII}</td>
        <td class="text-right px-4"> - ${NBUPercentage}</td>
      </tr>
      <tr class="border-b">
        <td class="py-1 px-4">./. BVG</td>
        <td class="text-right px-4">${BVG}%</td>
        <td class="text-right px-4">${BRUTTOLOHNII}</td>
        <td class="text-right px-4"> - ${BVGPercentage}</td>
      </tr>
      <tr class="border-b">
        <td class="py-1 px-4">./. KTG</td>
        <td class="text-right px-4">${KTG}%</td>
        <td class="text-right px-4">${BRUTTOLOHNII}</td>
        <td class="text-right px-4"> - ${KTGPercentage}</td>
      </tr>
      <tr class="border-b font-semibold">
        <td class="py-1 px-4">TOTAL Abzüge</td>
        <td></td><td></td>
        <td class="text-right px-4"> - ${TOTALAbzüge}</td>
      </tr>
      <tr class="border-b font-semibold">
        <td class="py-1 px-4">NETTOLOHN I</td>
        <td></td><td></td>
        <td class="text-right px-4">${NETTOLOHNI}</td>
      </tr>
      <tr>
        <td class="py-1 px-4">+ Kinderzulage</td>
        <td></td><td></td>
        <td class="text-right px-4">${Kinderzulage || 0.0}</td>
      </tr>
      <tr>
        <td class="py-1 px-4"> + Spesen</td>
        <td></td><td></td>
        <td class="text-right px-4">${Spesen || 0.0}</td>
      </tr>
      <tr>
        <td class="py-1 px-4">./. Sonstiges</td>
        <td></td><td></td>
        <td class="text-right px-4">${Sonstiges || 0.0}</td>
      </tr>
      <tr class="font-semibold">
        <td class="py-1 px-4">NETTOLOHN II</td>
        <td></td><td></td>
        <td class="text-right px-4">${NETTOLOHNII}</td>
      </tr>
    </tbody>
  </table>

  <p class="mb-1">Auszahlung auf folgendes Konto: <strong>${IBAN_f_r_Auszahlungen}</strong></p>

  <div class="mb-6 mt-4">
    <p>Storno diesen Monat: <strong>${sumStorno}</strong></p>
    <p>Saldo Stornokonto alt: <strong>${TotalStornokonto}</strong></p>
    <p>Saldo Stornokonto neu: <strong>${SaldoStornokontoNeu}</strong></p>
    <p>Punkte diesen Monat: <strong>${sumPunkte.toFixed(2)}</strong></p>
    <p>Punkte Saldo alt: <strong>${TotalPunkte}</strong></p>
    <p>Punkte Saldo neu: <span class="text-red-500"><strong>${PunkteSaldoNeu}</strong></span></p>
    <p>Diff. zur nächsten Stufe: <strong>${DifferenzZurNChstenStufe || 0.0} (${
      N_chste_St_fe || "NA"
    })</strong></p>
  </div>

`;

    document.getElementById("abrechnung").innerHTML = html;
  });

  ZOHO.embeddedApp.init();
});
