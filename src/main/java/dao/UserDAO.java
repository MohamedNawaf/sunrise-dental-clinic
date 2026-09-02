package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class UserDAO {

    // Check if the username and password match a record in the database
    public boolean validateUser(String username, String password) {
        String query = "SELECT * FROM tbl_users WHERE username = ? AND password_hash = ?";

        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, username);
            // Hash the entered password before comparing it with the database
            stmt.setString(2, hashPassword(password));

            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next(); // Returns true if a match is found
            }

        } catch (SQLException e) {
            System.err.println("Error validating user: " + e.getMessage());
        }

        return false;
    }

    // Helper method to encrypt the frontend password into SHA-256
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
            throw new RuntimeException("Error hashing password", e);
        }
    }
}