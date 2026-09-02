package dao;

import model.AppointmentDTO;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class AppointmentDAOTest {

    @Test
    public void testRegisterAppointment() {
        AppointmentDAO dao = new AppointmentDAO();

        // To generate a Random number
        int randomNum = (int)(Math.random() * 100000);
        String uniqueAptNo = "APT-TEST-" + randomNum;

        // Populate data using the new AppointmentDTO
        AppointmentDTO newApt = new AppointmentDTO();
        newApt.appointmentNumber = uniqueAptNo;
        newApt.patientName = "Test Patient";
        newApt.contactNumber = "0711122334";
        newApt.address = "123 Test Road, Colombo";
        newApt.dentistId = 1;
        newApt.treatmentId = 1;
        newApt.appointmentDate = "2026-11-20";
        newApt.appointmentTime = "14:00:00";

        // Assert that the insertion returns true (success)
        boolean isRegistered = dao.registerAppointment(newApt);
        assertTrue(isRegistered, "Appointment should be successfully registered in the database");
    }
}