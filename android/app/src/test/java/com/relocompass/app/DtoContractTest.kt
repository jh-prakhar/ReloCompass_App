package com.relocompass.app

import com.google.gson.Gson
import com.relocompass.app.api.Application
import com.relocompass.app.api.ChatRequest
import com.relocompass.app.api.ChatResponse
import com.relocompass.app.api.Job
import com.relocompass.app.api.TokenResponse
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * DTO JSON contract tests — these pin the field names the FastAPI backend
 * actually returns (snake_case) so a rename can't silently break the app.
 */
class DtoContractTest {

    private val gson = Gson()

    @Test
    fun `login response maps snake_case fields`() {
        val json = """
            {
              "access_token": "abc123",
              "token_type": "bearer",
              "user": {
                "id": 7,
                "name": "Ada Lovelace",
                "email": "ada@example.com",
                "role": "job_seeker",
                "is_active": true,
                "is_admin": false,
                "phone": null,
                "country": "Canada",
                "city": "Toronto",
                "bio": null
              }
            }
        """.trimIndent()
        val parsed = gson.fromJson(json, TokenResponse::class.java)
        assertEquals("abc123", parsed.accessToken)
        assertEquals("bearer", parsed.tokenType)
        assertEquals(7, parsed.user.id)
        assertEquals("job_seeker", parsed.user.role)
        assertEquals("Toronto", parsed.user.city)
        assertNull(parsed.user.bio)
    }

    @Test
    fun `job maps visa and type fields`() {
        val json = """
            {
              "id": 1, "title": "Data Analyst", "company": "Acme",
              "description": null, "location": "Melbourne", "job_type": "full-time",
              "visa_sponsorship": true, "experience_years": "2-4",
              "is_sample": false, "is_active": true
            }
        """.trimIndent()
        val job = gson.fromJson(json, Job::class.java)
        assertEquals(true, job.visaSponsorship)
        assertEquals("full-time", job.jobType)
        assertEquals("Melbourne", job.location)
        assertEquals("2-4", job.experienceYears)
    }

    @Test
    fun `application carries applicant only when present`() {
        val plain = gson.fromJson(
            """{"id":1,"job_id":5,"user_id":9,"status":"pending","cover_letter":"hi"}""",
            Application::class.java,
        )
        assertNull(plain.applicant)
        assertEquals(5, plain.jobId)

        val withApplicant = gson.fromJson(
            """{"id":2,"job_id":5,"user_id":9,"status":"shortlisted","cover_letter":null,
                "applicant":{"id":9,"name":"Bob","email":"b@x.com","role":"student"}}""",
            Application::class.java,
        )
        assertEquals("Bob", withApplicant.applicant?.name)
        assertEquals("shortlisted", withApplicant.status)
    }

    @Test
    fun `chat request serialises with snake_case keys`() {
        val json = gson.toJson(ChatRequest(message = "hi", sessionId = "s1", userContext = "student in Toronto"))
        assertTrue(json.contains("\"session_id\":\"s1\""))
        assertTrue(json.contains("\"user_context\":\"student in Toronto\""))
    }

    @Test
    fun `chat response parses sources and model`() {
        val json = """
            {"reply":"You need a study permit.","session_id":"s1",
             "sources":[{"name":"visa_guide.md","score":0.91}],"model_used":"gpt-4o-mini"}
        """.trimIndent()
        val parsed = gson.fromJson(json, ChatResponse::class.java)
        assertEquals("s1", parsed.sessionId)
        assertEquals(1, parsed.sources.size)
        assertEquals("visa_guide.md", parsed.sources[0]["name"])
        assertEquals("gpt-4o-mini", parsed.modelUsed)
    }

}
