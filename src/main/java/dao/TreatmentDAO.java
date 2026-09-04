package dao;

import model.TreatmentDTO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class TreatmentDAO {

    // 1. Add Treatment
    public boolean addTreatment(TreatmentDTO dto) {
        String query = "INSERT INTO tbl_treatments (treatment_name, description, treatment_cost, standard_consultation_fee, is_active) VALUES (?, ?, ?, ?, TRUE)";
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, dto.treatmentName);
            stmt.setString(2, dto.description);
            stmt.setDouble(3, dto.treatmentCost);
            stmt.setDouble(4, dto.standardConsultationFee);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 2. View All Active Treatments
    public List<TreatmentDTO> getAllTreatments() {
        List<TreatmentDTO> list = new ArrayList<>();
        String query = "SELECT treatment_id, treatment_name, description, treatment_cost, standard_consultation_fee FROM tbl_treatments WHERE is_active = TRUE";
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                TreatmentDTO dto = new TreatmentDTO();
                dto.id = rs.getInt("treatment_id");
                dto.treatmentName = rs.getString("treatment_name");
                dto.description = rs.getString("description");
                dto.treatmentCost = rs.getDouble("treatment_cost");
                dto.standardConsultationFee = rs.getDouble("standard_consultation_fee");
                list.add(dto);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    // 3. Update Treatment
    public boolean updateTreatment(TreatmentDTO dto) {
        String query = "UPDATE tbl_treatments SET treatment_name=?, description=?, treatment_cost=?, standard_consultation_fee=? WHERE treatment_id=?";
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, dto.treatmentName);
            stmt.setString(2, dto.description);
            stmt.setDouble(3, dto.treatmentCost);
            stmt.setDouble(4, dto.standardConsultationFee);
            stmt.setInt(5, dto.id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 4. Soft Delete Treatment
    public boolean deleteTreatment(int id) {
        String query = "UPDATE tbl_treatments SET is_active = FALSE WHERE treatment_id=?";
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}