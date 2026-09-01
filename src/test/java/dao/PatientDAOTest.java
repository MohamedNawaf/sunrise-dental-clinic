package dao;

import model.Patient;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class PatientDAOTest {

    @Test
    public void testGetPatientById() {
        // TDD Step 1: Instantiate the DAO
        PatientDAO patientDAO = new PatientDAO();

        // Fetch patient with ID 1 (This should be 'Kamal Gunaratne' from our seed data)
        Patient patient = patientDAO.getPatientById(1);

        // Assertions to verify database retrieval
        assertNotNull(patient, "Patient object should not be null");
        assertEquals("Kamal Gunaratne", patient.getFullName(), "Patient name must match the database record");
        assertEquals("0778901234", patient.getContactNumber(), "Contact number must match");
    }
}