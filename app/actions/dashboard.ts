"use server"

import { GoogleAuth } from "google-auth-library"

const PROJECT_ID = process.env.PROJECT_ID

async function getAdminToken() {
  const jsonString = process.env.GOOGLE_SERVICE_ACCOUNT_JSON

  // Case 1: Vercel / Production (using the JSON string)
  if (jsonString) {
    try {
      // 1. Strip any potential extra quotes or whitespace
      const cleanedJson = jsonString.trim()
      const credentials = JSON.parse(cleanedJson)

      const auth = new GoogleAuth({
        credentials, // Use the parsed object
        keyFile: undefined, // Explicitly tell it NOT to look for a file
        scopes: [
          "https://www.googleapis.com/auth/datastore",
          "https://www.googleapis.com/auth/cloud-platform",
        ],
      })

      const client = await auth.getClient()
      const token = await client.getAccessToken()
      return token.token
    } catch (e) {
      console.error("❌ Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:", e)
      throw e
    }
  }

  // Case 2: Local Development (using service.json)
  const auth = new GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Path to file
    scopes: [
      "https://www.googleapis.com/auth/datastore",
      "https://www.googleapis.com/auth/cloud-platform",
    ],
  })

  const client = await auth.getClient()
  const token = await client.getAccessToken()
  return token.token
}
export async function getLiveDashboardStats() {
  try {
    const token = await getAdminToken()
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`

    const queryPayload = {
      structuredQuery: {
        from: [{ collectionId: "notes" }],
        select: {
          fields: [
            { fieldPath: "isApproved" },
            { fieldPath: "univ" },
            { fieldPath: "dept" },
            { fieldPath: "title" },
            { fieldPath: "subject" },
            { fieldPath: "module" },
          ],
        },
      },
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queryPayload),
      cache: "no-store",
    })

    if (!res.ok) throw new Error("Failed to fetch stats")
    const data = await res.json()

    let totalNotes = 0
    let pendingNotes = 0
    let approvedNotes = 0
    const univMap: Record<string, number> = {}
    const deptMap: Record<string, number> = {}
    const allNotes: any[] = []

    data.forEach((item: any) => {
      if (!item.document) return
      totalNotes++

      const fields = item.document.fields
      const isApproved = fields.isApproved?.booleanValue === true
      const univ = fields.univ?.stringValue || "Unknown"
      const dept = fields.dept?.stringValue || "Unknown"

      // Counters
      if (isApproved) approvedNotes++
      else pendingNotes++

      univMap[univ] = (univMap[univ] || 0) + 1
      deptMap[dept] = (deptMap[dept] || 0) + 1

      // Store note for the "Recent" list
      allNotes.push({
        id: item.document.name.split("/").pop(),
        title: fields.title?.stringValue || "Untitled Document",
        subject: fields.subject?.stringValue || "Unknown Subject",
        module: fields.module?.stringValue || "N/A",
        univ: univ,
        isApproved: isApproved,
      })
    })

    // Formatting
    const byUniversity = Object.entries(univMap)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalNotes > 0 ? Math.round((count / totalNotes) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    const byDepartment = Object.entries(deptMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Grab the last 6 added notes (reversing assumes default Firestore ordering)
    const recentNotes = allNotes.reverse().slice(0, 6)

    return {
      success: true,
      kpis: { totalNotes, pendingNotes, approvedNotes },
      byUniversity,
      byDepartment,
      recentNotes,
    }
  } catch (error) {
    console.error("Dashboard Stats Error:", error)
    return { success: false }
  }
}
