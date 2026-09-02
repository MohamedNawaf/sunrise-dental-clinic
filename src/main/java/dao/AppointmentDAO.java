package dao;

import model.AppointmentDTO;
import java.sql.*;

public class AppointmentDAO {

    public boolean registerAppointment(AppointmentDTO dto) {
        String insertPatient = "INSERT INTO tbl_patients (full_name, contact_number, address) VALUES (?, ?, ?)";
        String insertAppt = "INSERT INTO tbl_appointments (appointment_number, patient_id, dentist_id, treatment_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?, ?, 'SCHEDULED')";

        Connection conn = null;
        try {
            conn = DatabaseConnection.getInstance().getConnection();

            // Auto-commit off karala Transaction eka patan ganeema
            conn.setAutoCommit(false);

            // 1. Mulinma Patient wa save kireema
            PreparedStatement pstmt1 = conn.prepareStatement(insertPatient, Statement.RETURN_GENERATED_KEYS);
            pstmt1.setString(1, dto.patientName);
            pstmt1.setString(2, dto.contactNumber);
            pstmt1.setString(3, dto.address);
            pstmt1.executeUpdate();

            // Save wunu Patient ge auto-generated ID eka ganeema
            ResultSet rs = pstmt1.getGeneratedKeys();
            int patientId = 0;
            if (rs.next()) {
                patientId = rs.getInt(1);
            } else {
                // Fallback (Samahara MySQL versions walata)
                try (Statement stmt = conn.createStatement();
                     ResultSet rs2 = stmt.executeQuery("SELECT LAST_INSERT_ID()")) {
                    if (rs2.next()) {
                        patientId = rs2.getInt(1);
                    }
                }
            }

            if (patientId == 0) {
                conn.rollback(); // ID eka awe nethnam wede nawaththanawa
                return false;
            }

            // 2. Aluthen gaththu patientId eka use karala Appointment eka save kireema
            PreparedStatement pstmt2 = conn.prepareStatement(insertAppt);
            pstmt2.setString(1, dto.appointmentNumber);
            pstmt2.setInt(2, patientId);
            pstmt2.setInt(3, dto.dentistId);
            pstmt2.setInt(4, dto.treatmentId);
            pstmt2.setString(5, dto.appointmentDate);
            pstmt2.setString(6, dto.appointmentTime);
            pstmt2.executeUpdate();

            // Okkoma hari nam database ekata save kireema (Commit)
            conn.commit();
            return true;

        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) { ex.printStackTrace(); }
            }
            System.err.println("Error registering appointment: " + e.getMessage());
            return false;
        } finally {
            if (conn != null) {
                try { conn.setAutoCommit(true); } catch (SQLException ex) { ex.printStackTrace(); }
            }
        }
    }
}