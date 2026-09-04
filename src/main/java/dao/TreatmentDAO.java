package dao;

import model.TreatmentDTO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class TreatmentDAO {

    public boolean addTreatment(TreatmentDTO dto) {
        String query = "INSERT INTO tbl_treatments (treatment_name, description, treatment_cost, standard_consultation_fee) VALUES (?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, dto.treatmentName);
            stmt.setString(2, dto.description);
            stmt.setDouble(3, dto.treatmentCost);
            stmt.setDouble(4, dto.standardConsultationFee);

            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            System.err.println("Error adding treatment: " + e.getMessage());
            return false;
        }
    }
}