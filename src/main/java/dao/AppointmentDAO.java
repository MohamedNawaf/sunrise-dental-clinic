package dao;

import model.Appointment;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class AppointmentDAO {

    public boolean registerAppointment(Appointment apt) {
        String query = "INSERT INTO tbl_appointments (appointment_number, patient_id, dentist_id, treatment_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, apt.getAppointmentNumber());
            stmt.setInt(2, apt.getPatientId());
            stmt.setInt(3, apt.getDentistId());
            stmt.setInt(4, apt.getTreatmentId());
            stmt.setString(5, apt.getAppointmentDate());
            stmt.setString(6, apt.getAppointmentTime());
            stmt.setString(7, apt.getStatus());

            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0; // Returns true if insertion was successful

        } catch (SQLException e) {
            System.err.println("Error registering appointment: " + e.getMessage());
            return false;
        }
    }
}