package model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class PatientTest {

    @Test
    public void testPatientEncapsulation() {
        // TDD Step 1: Create a mock patient object
        Patient patient = new Patient(1, "Kamal Gunaratne", "Colombo 03", "0778901234", "kamal.g@gmail.com");

        // Assert that the getters return the exact data we set
        assertEquals(1, patient.getPatientId(), "Patient ID should match");
        assertEquals("Kamal Gunaratne", patient.getFullName(), "Patient name should match");
        assertEquals("0778901234", patient.getContactNumber(), "Contact number should match");
    }
}