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

    console.log(data);

    // Get Deals Details
    let getDealsDetails = await ZOHO.CRM.API.getRecord({
      Entity: `${data?.Entity}`,
      RecordID: `${data?.EntityId[0]}`,
    });

    // Get Deals Data
    let getDealsData = getDealsDetails?.data[0];

    // All getMitarbeiter Details
    let getMitarbeiterDetails = await ZOHO.CRM.API.getRecord({
      Entity: "Mitarbeiter1",
      RecordID: `${getDealsData?.Mitarbeiter?.id}`,
    });
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

    // Get Fields from Deal
    let {
      Provision_inkl_Storno,
      Punktewert_Kalk,
      Contact_Name,
      Gesellschaft,
      Closing_Date,
      Stornowert_in_CHF,
    } = getDealsData;

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
    let BRUTTOLOHNI = Provision_inkl_Storno + Bonus;
    let stornoreserve = parseFloat(
      ((Provision_inkl_Storno + Bonus) * 0.15).toFixed(2)
    );
    let stornoEffektiv = 0.0;
    let BRUTTOLOHNII = parseFloat(
      BRUTTOLOHNI - (stornoreserve + stornoEffektiv)
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
      AHVPercentage +
        ALVPercentage +
        NBUPercentage +
        BVGPercentage +
        KTGPercentage || 0.0;
    let NETTOLOHNI = (BRUTTOLOHNII - TOTALAbzüge).toFixed(2) || 0.0;

    // Total NETTOLOHN II
    let TotalNETTOLOHNII =
      parseFloat(Kinderzulage || 0) +
      parseFloat(Spesen || 0) +
      parseFloat(Sonstiges || 0);

    let NETTOLOHNII = parseFloat(NETTOLOHNI || 0) + TotalNETTOLOHNII;
    let TotalStornokonto = parseFloat(Total_Stornokonto) || 0.0;
    let SaldoStornokontoNeu =
      parseFloat((TotalStornokonto + stornoreserve).toFixed(2)) || 0.0;

    let PunktewertKalk = parseFloat(Punktewert_Kalk) || 0.0;
    let TotalPunkte = parseFloat(Total_Punkte) || 0.0;
    let PunkteSaldoNeu =
      parseFloat((PunktewertKalk + TotalPunkte).toFixed(2)) || 0.0;

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
        <td class="text-right px-4">${Provision_inkl_Storno || 0.0}</td>
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
        <td class="text-right px-4"> - ${stornoreserve}</td>
      </tr>
      <tr class="border-b">
        <td class="py-1 px-4">./. Storno effektiv</td>
        <td></td><td></td>
        <td class="text-right px-4"> - ${stornoEffektiv}</td>
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
    <p>Storno diesen Monat: <strong>${stornoreserve}</strong></p>
    <p>Saldo Stornokonto alt: <strong>${TotalStornokonto}</strong></p>
    <p>Saldo Stornokonto neu: <strong>${SaldoStornokontoNeu}</strong></p>
    <p>Punkte diesen Monat: <strong>${PunktewertKalk}</strong></p>
    <p>Punkte Saldo alt: <strong>${TotalPunkte}</strong></p>
    <p>Punkte Saldo neu: <strong>${PunkteSaldoNeu}</strong></p>
    <p>Diff. zur nächsten Stufe: <strong>${DifferenzZurNChstenStufe} (${N_chste_St_fe})</strong></p>
  </div>


<h2 class="text-lg font-semibold mb-2 mt-8">
  Übersicht provisionierte Verträge (Umsatzliste)
</h2>

<table class="table-fixed w-full mb-6 border border-collapse border-gray-400 text-sm break-words">
  <thead class="bg-gray-100">
    <tr>
      <th class="border px-2 py-1 text-left break-words w-1/6">Kontakt</th>
      <th class="border px-2 py-1 text-left break-words w-1/6">Gesellschaft</th>
      <th class="border px-2 py-1 text-left break-words w-1/6">Abschluss</th>
      <th class="border px-2 py-1 text-left break-words w-1/6">CHF/Punkt</th>
      <th class="border px-2 py-1 text-left break-words w-1/6">Storno</th>
      <th class="border px-2 py-1 text-left break-words w-1/6">Provision</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="border px-2 py-1 break-words">${
        Contact_Name?.name || "NA"
      }</td>
      <td class="border px-2 py-1 break-words">${
        Gesellschaft?.name || "NA"
      }</td>
      <td class="border px-2 py-1 break-words">${Closing_Date || "NA"}</td>
      <td class="border px-2 py-1 break-words">${PunktewertKalk}</td>
      <td class="border px-2 py-1 break-words">${Stornowert_in_CHF || 0.0}</td>
      <td class="border px-2 py-1 break-words">${
        Provision_inkl_Storno || 0.0
      }</td>
    </tr>
  </tbody>
  <tfoot class="font-semibold">
    <tr>
      <td class="border px-2 py-1 break-words" colspan="3">Total</td>
      <td class="border px-2 py-1 break-words">${PunktewertKalk}</td>
      <td class="border px-2 py-1 break-words">${Stornowert_in_CHF || 0.0}</td>
      <td class="border px-2 py-1 break-words">${
        Provision_inkl_Storno || 0.0
      }</td>
    </tr>
  </tfoot>
</table>


  <footer class="text-sm border-t pt-2 text-center text-gray-700 mb-8">
    L&M Finance AG - Zugerstrasse 16 - 6330 Cham
  </footer>
`;

    document.getElementById("abrechnung").innerHTML = html;
  });

  ZOHO.embeddedApp.init();
});
