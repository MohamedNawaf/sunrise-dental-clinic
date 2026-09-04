package dao;

import model.NewStaffDTO;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

public class StaffDAO {

    // 1. Add Staff
    public boolean addStaff(NewStaffDTO dto) {
        String query = "INSERT INTO tbl_users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, dto.username);
            stmt.setString(2, hashPassword(dto.password));
            stmt.setString(3, dto.fullName);
            stmt.setString(4, dto.role);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 2. View All Staff
    public List<NewStaffDTO> getAllStaff() {
        List<NewStaffDTO> list = new ArrayList<>();
        String query = "SELECT user_id, full_name, username, role FROM tbl_users";
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                NewStaffDTO dto = new NewStaffDTO();
                dto.id = rs.getInt("user_id");
                dto.fullName = rs.getString("full_name");
                dto.username = rs.getString("username");
                dto.role = rs.getString("role");
                list.add(dto);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    // 3. Update Staff (Password eka dila nethnam eka update wenne ne)
    public boolean updateStaff(NewStaffDTO dto) {
        boolean updatePassword = dto.password != null && !dto.password.trim().isEmpty();
        String query = updatePassword
                ? "UPDATE tbl_users SET full_name=?, role=?, username=?, password_hash=? WHERE user_id=?"
                : "UPDATE tbl_users SET full_name=?, role=?, username=? WHERE user_id=?";

        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, dto.fullName);
            stmt.setString(2, dto.role);
            stmt.setString(3, dto.username);
            if (updatePassword) {
                stmt.setString(4, hashPassword(dto.password));
                stmt.setInt(5, dto.id);
            } else {
                stmt.setInt(4, dto.id);
            }
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 4. Delete Staff
    public boolean deleteStaff(int id) {
        String query = "DELETE FROM tbl_users WHERE user_id=?";
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Password Encryption Helper
    private String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}