package com.relocompass.app

import com.google.gson.Gson
import com.relocompass.app.api.AvailabilityResponse
import com.relocompass.app.api.CommunityHistory
import com.relocompass.app.api.CommunityRoomsResponse
import com.relocompass.app.api.DestinationsResponse
import com.relocompass.app.api.MatchResponse
import com.relocompass.app.api.VisaChecklist
import com.relocompass.app.api.WsEvent
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Phase 4 DTO contract tests — pin the exact JSON shapes the backend returns
 * for matching, visa, community, and housing (captured from the live API on
 * 2026-08-25). A backend rename that breaks the Android app fails here first.
 */
class Phase4DtoContractTest {

    private val gson = Gson()

    @Test
    fun `match response maps job score reasons and skills`() {
        val json = """
            {
              "matches": [
                {
                  "job": {
                    "id": 12, "title": "Backend Dev", "company": "Acme",
                    "description": "d", "location": "Berlin", "job_type": "full-time",
                    "visa_sponsorship": true, "experience_years": 2,
                    "is_sample": false, "is_active": true, "created_at": "2026-08-01T00:00:00"
                  },
                  "score": 87,
                  "reasons": ["Skills overlap: python", "Same city as your preference"],
                  "skills_matched": ["python", "sql"]
                }
              ],
              "total_scored": 3
            }
        """.trimIndent()
        val m = gson.fromJson(json, MatchResponse::class.java)
        assertEquals(1, m.matches.size)
        assertEquals(87, m.matches[0].score)
        assertEquals("Acme", m.matches[0].job.company)
        assertEquals(2, m.matches[0].skillsMatched.size)
        assertEquals(3, m.totalScored)
    }

    @Test
    fun `visa destinations map catalogue`() {
        val json = """
            { "destinations": [
              { "id": "canada", "label": "Canada",
                "visa_types": [ { "id": "study_permit", "label": "Study permit" } ],
                "official_sources": ["https://www.canada.ca/"] }
            ] }
        """.trimIndent()
        val d = gson.fromJson(json, DestinationsResponse::class.java)
        assertEquals("canada", d.destinations[0].id)
        assertEquals("study_permit", d.destinations[0].visaTypes[0].id)
        assertEquals(1, d.destinations[0].officialSources.size)
    }

    @Test
    fun `visa checklist maps phases items and totals`() {
        val json = """
            {
              "destination": "canada", "visa_type": "study_permit", "situation": "student",
              "checklist": [
                { "phase": "prepare", "label": "1 · Prepare documents",
                  "items": [
                    { "id": "passport", "label": "Valid passport", "phase": "prepare",
                      "note": "6+ months validity" }
                  ] }
              ],
              "total_items": 12,
              "official_sources": ["https://www.canada.ca/"],
              "disclaimer": "Guidance only."
            }
        """.trimIndent()
        val c = gson.fromJson(json, VisaChecklist::class.java)
        assertEquals(12, c.totalItems)
        assertEquals(1, c.checklist.size)
        assertEquals("passport", c.checklist[0].items[0].id)
        assertEquals("6+ months validity", c.checklist[0].items[0].note)
        assertEquals("student", c.situation)
    }

    @Test
    fun `community rooms and history map`() {
        val rooms = gson.fromJson(
            """{ "rooms": [ { "id": "global", "name": "🌍 Global", "description": "Hi!" } ] }""",
            CommunityRoomsResponse::class.java,
        )
        assertEquals("global", rooms.rooms[0].id)

        val history = gson.fromJson(
            """{ "room": "global", "messages": [
                 { "id": 5, "room": "global", "user_id": 9, "user_name": "Ada",
                   "content": "hello", "created_at": "2026-08-25T00:00:00" } ] }""",
            CommunityHistory::class.java,
        )
        assertEquals(1, history.messages.size)
        assertEquals("Ada", history.messages[0].userName)
        assertEquals(9, history.messages[0].userId)
    }

    @Test
    fun `ws event frames map`() {
        val history = gson.fromJson(
            """{"type":"history","messages":[{"id":1,"room":"jobs","user_id":2,"user_name":"Bob","content":"hi","created_at":null}]}""",
            WsEvent::class.java,
        )
        assertEquals("history", history.type)
        assertNotNull(history.messages)

        val presence = gson.fromJson("""{"type":"presence","count":3}""", WsEvent::class.java)
        assertEquals(3, presence.count)

        val message = gson.fromJson(
            """{"type":"message","id":9,"user_id":4,"user_name":"Eve","content":"yo","created_at":null,"room":"visas"}""",
            WsEvent::class.java,
        )
        assertEquals("message", message.type)
        assertEquals("Eve", message.userName)

        val error = gson.fromJson("""{"type":"error","detail":"slow down"}""", WsEvent::class.java)
        assertEquals("slow down", error.detail)
    }

    @Test
    fun `housing availability maps options`() {
        val json = """
            {
              "university": "TU Berlin",
              "provider": { "id": "demo", "label": "Demo University Housing" },
              "options": [
                { "provider": "demo", "university": "TU Berlin", "campus": null,
                  "kind": "dorm", "title": "Single room", "monthly_cost": 380.0,
                  "currency": "EUR", "available_from": "2026-09-24", "available_to": null,
                  "distance_km": 1.2, "meals_included": false, "url": null,
                  "notes": "Shared kitchen" }
              ],
              "count": 1
            }
        """.trimIndent()
        val a = gson.fromJson(json, AvailabilityResponse::class.java)
        assertEquals(1, a.count)
        assertEquals(380.0, a.options[0].monthlyCost, 0.001)
        assertTrue(a.options[0].distanceKm != null)
        assertEquals("Demo University Housing", a.provider.label)
    }
}
