package com.relocompass.app

import com.relocompass.app.api.Errors
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ErrorsTest {

    @Test
    fun `string detail passes through`() {
        assertEquals("Invalid credentials", Errors.parse(401, """{"detail":"Invalid credentials"}"""))
    }

    @Test
    fun `422 validation list is flattened`() {
        val body = """
            {"detail":[
              {"type":"value_error","loc":["body","email"],"msg":"value is not a valid email address"},
              {"type":"string_too_short","loc":["body","password"],"msg":"String should have at least 6 characters"}
            ]}
        """.trimIndent()
        val msg = Errors.parse(422, body)
        assertTrue(msg.contains("email"))
        assertTrue(msg.contains("value is not a valid email address"))
        assertTrue(msg.contains("password"))
        assertTrue(msg.contains("at least 6 characters"))
    }

    @Test
    fun `garbage body falls back to friendly message`() {
        assertEquals("Please check the entered values", Errors.parse(422, "<html>gateway error</html>"))
    }

    @Test
    fun `null body falls back by code`() {
        assertEquals("Session expired — please log in again", Errors.parse(401, null))
        assertEquals("Server error — try again shortly", Errors.parse(500, ""))
    }

    @Test
    fun `conflict with detail string uses the detail`() {
        assertEquals(
            "You have already applied for this job",
            Errors.parse(409, """{"detail":"You have already applied for this job"}"""),
        )
    }

    @Test
    fun `conflict without body falls back`() {
        assertEquals("Already exists", Errors.parse(409, null))
    }
}
