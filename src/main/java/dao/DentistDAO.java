package dao;

import model.DentistDTO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class DentistDAO {

    public boolean addDentist(DentistDTO dto) {
        String query = "INSERT INTO tbl_dentists (dentist_name, specialization, contact_number, is_active) VALUES (?, ?, ?, TRUE)";

        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, dto.dentistName);
            stmt.setString(2, dto.specialization);
            stmt.setString(3, dto.contactNumber);

            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            System.err.println("Error adding dentist: " + e.getMessage());
            return false;
        }
    }
}