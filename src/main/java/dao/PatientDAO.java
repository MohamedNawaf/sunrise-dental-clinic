package dao;

import model.Patient;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class PatientDAO {

    // Method to fetch a patient from the database by ID
    public Patient getPatientById(int id) {
        Patient patient = null;
        String query = "SELECT * FROM tbl_patients WHERE patient_id = ?";

        // Get singleton database connection
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, id); // Set the ID parameter securely

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    // Map database result to Patient object
                    patient = new Patient(
                            rs.getInt("patient_id"),
                            rs.getString("full_name"),
                            rs.getString("address"),
                            rs.getString("contact_number"),
                            rs.getString("email")
                    );
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching patient: " + e.getMessage());
        }

        return patient;
    }
}