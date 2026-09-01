package model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class AppointmentTest {

    @Test
    public void testAppointmentDetails() {
        // TDD Step 1: Create a mock appointment object
        Appointment apt = new Appointment(0, "APT-2026-TEST", 1, 1, 2, "2026-10-15", "10:30:00", "SCHEDULED");

        // Assert that the appointment number matches
        assertEquals("APT-2026-TEST", apt.getAppointmentNumber(), "Appointment number should match");
        assertEquals("2026-10-15", apt.getAppointmentDate(), "Appointment date should match");
    }
}