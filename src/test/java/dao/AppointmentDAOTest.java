package dao;

import model.Appointment;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class AppointmentDAOTest {

    @Test
    public void testRegisterAppointment() {
        AppointmentDAO dao = new AppointmentDAO();

        // To generate a Random number
        int randomNum = (int)(Math.random() * 100000);
        String uniqueAptNo = "APT-" + randomNum;

        Appointment newApt = new Appointment(0, uniqueAptNo, 1, 1, 1, "2026-11-20", "14:00:00", "SCHEDULED");

        // Assert that the insertion returns true (success)
        boolean isRegistered = dao.registerAppointment(newApt);
        assertTrue(isRegistered, "Appointment should be successfully registered in the database");
    }
}