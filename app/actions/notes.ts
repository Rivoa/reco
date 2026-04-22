"use server"

import { GoogleAuth } from "google-auth-library"

// Infrastructure Constants from Environment
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const BOUNCER_URL = process.env.R2_BOUNCER_URL?.endsWith("/")
  ? process.env.R2_BOUNCER_URL
  : `${process.env.R2_BOUNCER_URL}/`

/**
 * Generates an OAuth2 token.
 * Supports both Vercel (JSON string) and Local (keyFile).
 */
async function getAdminToken() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    : undefined

  const auth = new GoogleAuth({
    credentials,
    // Fallback for local development
    keyFile: !credentials
      ? process.env.GOOGLE_APPLICATION_CREDENTIALS
      : undefined,
    scopes: [
      "https://www.googleapis.com/auth/datastore",
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  })

  const client = await auth.getClient()
  const token = await client.getAccessToken()
  return token.token
}

/**
 * Retrieves pending notes from Firestore.
 */
export async function getPendingNotes() {
  try {
    const token = await getAdminToken()
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`

    const queryPayload = {
      structuredQuery: {
        from: [{ collectionId: "notes" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "isApproved" },
            op: "EQUAL",
            value: { booleanValue: false },
          },
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
    })

    if (!res.ok) throw new Error("REST API Query Failed")
    const data = await res.json()

    const notes = data
      .filter((item: any) => item.document)
      .map((item: any) => {
        const doc = item.document
        const id = doc.name.split("/").pop()
        const fields = doc.fields

        return {
          id,
          title: fields.title?.stringValue || "Untitled",
          univ: fields.univ?.stringValue || "N/A",
          dept: fields.dept?.stringValue || "N/A",
          subject: fields.subject?.stringValue || "N/A",
          module: fields.module?.stringValue || "N/A",
          r2Path: fields.r2Path?.stringValue || "",
          activeRecallQuiz:
            fields.activeRecallQuiz?.arrayValue?.values?.map((q: any) => ({
              difficulty: q.mapValue.fields.difficulty?.stringValue || "EASY",
              question: q.mapValue.fields.question?.stringValue || "",
              options:
                q.mapValue.fields.options?.arrayValue?.values?.map(
                  (opt: any) => opt.stringValue
                ) || [],
              correctIndex: parseInt(
                q.mapValue.fields.correctIndex?.integerValue || "0"
              ),
              explanation: q.mapValue.fields.explanation?.stringValue || "",
            })) || [],
        }
      })

    return { success: true, notes }
  } catch (error) {
    console.error("Firestore Fetch Error:", error)
    return {
      success: false,
      notes: [],
      error: "Failed to fetch verification queue.",
    }
  }
}

/**
 * Handles individual Note Approval or Rejection.
 */
export async function processNoteVerification(
  noteId: string,
  action: "APPROVE" | "REJECT"
) {
  try {
    const token = await getAdminToken()
    const docUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/notes/${noteId}`

    if (action === "APPROVE") {
      await fetch(`${docUrl}?updateMask.fieldPaths=isApproved`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: { isApproved: { booleanValue: true } },
        }),
      })
    } else {
      await fetch(docUrl, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "Transaction failed." }
  }
}

/**
 * Fetches raw content from R2 via the Bouncer Worker.
 */
export async function getNoteContentFromR2(r2Path: string) {
  try {
    const token = await getAdminToken()
    const url = `${BOUNCER_URL}${encodeURIComponent(r2Path)}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Admin-Secret": process.env.ADMIN_AUTH_SECRET as string,
      },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    })

    if (!response.ok) throw new Error(await response.text())

    const content = await response.text()
    return { success: true, content }
  } catch (error: any) {
    return { success: false, error: "R2 Connection Failed" }
  }
}

/**
 * Bulk approve all notes in a specific module.
 * Added 'course' to ensure precise filtering.
 */
export async function batchApproveModule(
  univ: string,
  course: string, // Added course parameter
  subject: string,
  module: string
) {
  try {
    const token = await getAdminToken()
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`

    const queryPayload = {
      structuredQuery: {
        from: [{ collectionId: "notes" }],
        where: {
          compositeFilter: {
            op: "AND",
            filters: [
              {
                fieldFilter: {
                  field: { fieldPath: "univ" },
                  op: "EQUAL",
                  value: { stringValue: univ },
                },
              },
              {
                // New Filter for Course
                fieldFilter: {
                  field: { fieldPath: "course" },
                  op: "EQUAL",
                  value: { stringValue: course },
                },
              },
              {
                fieldFilter: {
                  field: { fieldPath: "subject" },
                  op: "EQUAL",
                  value: { stringValue: subject },
                },
              },
              {
                fieldFilter: {
                  field: { fieldPath: "module" },
                  op: "EQUAL",
                  value: { stringValue: module },
                },
              },
              {
                fieldFilter: {
                  field: { fieldPath: "isApproved" },
                  op: "EQUAL",
                  value: { booleanValue: false },
                },
              },
            ],
          },
        },
      },
    }

    const res = await fetch(queryUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queryPayload),
    })

    const data = await res.json()
    const docIds = data
      .filter((item: any) => item.document)
      .map((item: any) => item.document.name.split("/").pop())

    // Parallelize individual patch requests
    await Promise.all(
      docIds.map((id: string) =>
        fetch(
          `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/notes/${id}?updateMask.fieldPaths=isApproved`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fields: { isApproved: { booleanValue: true } },
            }),
          }
        )
      )
    )

    return { success: true, count: docIds.length }
  } catch (error) {
    console.error("Batch Approval Error:", error)
    return { success: false }
  }
}
