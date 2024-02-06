const fs = require("fs").promises
const path = require("path")

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
    headers: phpSessionId ? { Cookie: `PHPSESSID=${phpSessionId}` } : {},
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

async function writeOutputToFile(data, filePath, sortBy) {
  try {
    data.sort((a, b) => b[sortBy].localeCompare(a[sortBy]))
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
    console.log("Output written to:", path.resolve(filePath))
  } catch (error) {
    console.error("Error writing to file:", error)
  }
}

;(async () => {
  await fetchData("init")

  const invoicesList = await fetchData("list/created")
  const invoicesOutput = await Promise.all(
    invoicesList.invoices.map(async invoice =>
      fetchData("status", invoice.code)
    )
  )

  await writeOutputToFile(invoicesOutput, "invoices.json", "invoice_number")

  const offersList = await fetchData("cp-list/created")
  const offersOutput = await Promise.all(
    offersList.offers.map(async offer => fetchData("cp-status", offer.code))
  )

  await writeOutputToFile(offersOutput, "offers.json", "offer_number")
})()
