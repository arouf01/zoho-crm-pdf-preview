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
    ZOHO.CRM.UI.Resize({ height: "800", width: "100%" });

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

    // Get Fields
    let {} = getDealsData;

    // For Mitarbeiter
    let { Vorname, Nachname, Strasse_Hausnummer, PLZ, Ort } =
      getMitarbeiterData;

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
        <td class="text-right px-4">253.80</td>
      </tr>
      <tr class="border-b">
        <td class="py-1 px-4">+ Bonus</td>
        <td></td><td></td>
        <td class="text-right px-4">0.00</td>
      </tr>
      <tr class="border-b font-semibold">
        <td class="py-1 px-4">BRUTTOLOHN I (gemäss Umsatzliste)</td>
        <td></td><td></td>
        <td class="text-right px-4">253.80</td>
      </tr>
      <tr class="border-b">
        <td class="py-1 px-4">./. Stornoreserve</td>
        <td class="text-right px-4">15%</td>
        <td></td>
        <td class="text-right px-4">-38.25</td>
      </tr>
      <tr class="border-b">
        <td class="py-1 px-4">./. Storno effektiv</td>
        <td></td><td></td>
        <td class="text-right px-4">-0.00</td>
      </tr>
      <tr class="border-b font-semibold">
        <td class="py-1 px-4">BRUTTOLOHN II (AHV-Lohn)</td>
        <td></td><td></td>
        <td class="text-right px-4">215.55</td>
      </tr>
      <tr class="border-b">
        <td class="py-1 px-4">./. AHV</td>
        <td class="text-right px-4">5.3%</td>
        <td class="text-right px-4">215.55</td>
        <td class="text-right px-4">-11.42</td>
      </tr>
      <tr class="border-b">
        <td class="py-1 px-4">./. ALV</td>
        <td class="text-right px-4">1.1%</td>
        <td class="text-right px-4">215.55</td>
        <td class="text-right px-4">-2.37</td>
      </tr>
      <tr class="border-b">
        <td class="py-1 px-4">./. NBU</td>
        <td class="text-right px-4">0%</td>
        <td class="text-right px-4">215.55</td>
        <td class="text-right px-4">-0.00</td>
      </tr>
      <tr class="border-b">
        <td class="py-1 px-4">./. BVG</td>
        <td class="text-right px-4">0%</td>
        <td class="text-right px-4">215.55</td>
        <td class="text-right px-4">-0.00</td>
      </tr>
      <tr class="border-b">
        <td class="py-1 px-4">./. KTG</td>
        <td class="text-right px-4">0%</td>
        <td class="text-right px-4">215.55</td>
        <td class="text-right px-4">-0.00</td>
      </tr>
      <tr class="border-b font-semibold">
        <td class="py-1 px-4">TOTAL Abzüge</td>
        <td></td><td></td>
        <td class="text-right px-4">-13.79</td>
      </tr>
      <tr class="border-b font-semibold">
        <td class="py-1 px-4">NETTOLOHN I</td>
        <td></td><td></td>
        <td class="text-right px-4">201.76</td>
      </tr>
      <tr>
        <td class="py-1 px-4">+ Kinderzulage</td>
        <td></td><td></td>
        <td class="text-right px-4">1.00</td>
      </tr>
      <tr>
        <td class="py-1 px-4">+ Spesen</td>
        <td></td><td></td>
        <td class="text-right px-4">0.00</td>
      </tr>
      <tr>
        <td class="py-1 px-4">./. Sonstiges</td>
        <td></td><td></td>
        <td class="text-right px-4">0.00</td>
      </tr>
      <tr class="font-semibold">
        <td class="py-1 px-4">NETTOLOHN II</td>
        <td></td><td></td>
        <td class="text-right px-4">202.76</td>
      </tr>
    </tbody>
  </table>

  <p class="mb-1">Auszahlung auf folgendes Konto: <strong>CH06 8080 8008 4576 0556 6</strong></p>

  <div class="mb-6 mt-4">
    <p>Storno diesen Monat: <strong>38.25</strong></p>
    <p>Saldo Stornokonto alt: <strong>7341.19</strong></p>
    <p>Saldo Stornokonto neu: <strong>7379.44</strong></p>
    <p>Punkte diesen Monat: <strong>5.64</strong></p>
    <p>Punkte Saldo alt: <strong>0.00</strong></p>
    <p>Punkte Saldo neu: <strong>5.64</strong></p>
    <p>Diff. zur nächsten Stufe: <strong>16000 (Wirtschaftsberater 5)</strong></p>
  </div>

  <footer class="text-sm border-t pt-2 text-center text-gray-700 mb-8">
    L&M Finance AG - Zugerstrasse 16 - 6330 Cham
  </footer>
`;

    document.getElementById("abrechnung").innerHTML = html;
  });

  ZOHO.embeddedApp.init();
});
