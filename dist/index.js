/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 17:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const fs = (__nccwpck_require__(147).promises)
const path = __nccwpck_require__(17)

const key = process.env.API_KEY
const email = process.env.EMAIL
const baseUrl = process.env.BASE_URL

let phpSessionId

async function fetchData(endpoint, code = "") {
  const data = JSON.stringify({ key, email, code })
  const url = `${baseUrl}/${endpoint}?data=${encodeURIComponent(data)}`
  const options = {
    method: "GET",
    credentials: "include",
    headers: {},
  }

  if (phpSessionId) {
    options.headers.Cookie = `PHPSESSID=${phpSessionId}`
  }

  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const setCookieHeader = response.headers.get("set-cookie")

    if (setCookieHeader) {
      const matches = setCookieHeader.match(/PHPSESSID=([^;]+)/)
      if (matches) {
        phpSessionId = matches[1]
      }
    }

    return await response.json()
  } catch (error) {
    console.error(error)
  }
}

;(async () => {
  await fetchData("init")

  const invoicesList = await fetchData("list/created")
  let invoicesOutput = []

  await Promise.all(
    invoicesList.invoices.map(async invoice =>
      invoicesOutput.push(await fetchData("status", invoice.code))
    )
  )

  const invoicesPath = "invoices.json"

  try {
    invoicesOutput.sort((a, b) =>
      b.invoice_number.localeCompare(a.invoice_number)
    )

    await fs.writeFile(invoicesPath, JSON.stringify(invoicesOutput, null, 2))

    console.log("Output written to:", __nccwpck_require__.ab + "invoices.json")
  } catch (error) {
    console.error("Error writing to file:", error)
  }

  const offersList = await fetchData("cp-list/created")
  let offersOutput = []

  await Promise.all(
    offersList.offers.map(async offer =>
      offersOutput.push(await fetchData("cp-status", offer.code))
    )
  )

  const offersPath = "offers.json"

  try {
    offersOutput.sort((a, b) => b.offer_number.localeCompare(a.offer_number))

    await fs.writeFile(offersPath, JSON.stringify(offersOutput, null, 2))

    console.log("Output written to:", __nccwpck_require__.ab + "offers.json")
  } catch (error) {
    console.error("Error writing to file:", error)
  }
})()

})();

module.exports = __webpack_exports__;
/******/ })()
;