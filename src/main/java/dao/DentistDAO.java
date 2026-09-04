package dao;

import model.DentistDTO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class DentistDAO {

    // 1. Add Dentist
    public boolean addDentist(DentistDTO dto) {
        String query = "INSERT INTO tbl_dentists (dentist_name, specialization, contact_number, is_active) VALUES (?, ?, ?, TRUE)";
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, dto.dentistName);
            stmt.setString(2, dto.specialization);
            stmt.setString(3, dto.contactNumber);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 2. View All Active Dentists
    public List<DentistDTO> getAllDentists() {
        List<DentistDTO> list = new ArrayList<>();
        String query = "SELECT dentist_id, dentist_name, specialization, contact_number FROM tbl_dentists WHERE is_active = TRUE";
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                DentistDTO dto = new DentistDTO();
                dto.id = rs.getInt("dentist_id");
                dto.dentistName = rs.getString("dentist_name");
                dto.specialization = rs.getString("specialization");
                dto.contactNumber = rs.getString("contact_number");
                list.add(dto);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    // 3. Update Dentist
    public boolean updateDentist(DentistDTO dto) {
        String query = "UPDATE tbl_dentists SET dentist_name=?, specialization=?, contact_number=? WHERE dentist_id=?";
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, dto.dentistName);
            stmt.setString(2, dto.specialization);
            stmt.setString(3, dto.contactNumber);
            stmt.setInt(4, dto.id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 4. Soft Delete Dentist
    public boolean deleteDentist(int id) {
        String query = "UPDATE tbl_dentists SET is_active = FALSE WHERE dentist_id=?";
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