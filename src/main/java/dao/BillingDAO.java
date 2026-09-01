package dao;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Types;

public class BillingDAO {

    public String generateBill(String appointmentNumber) {
        String invoiceNumber = null;
        // Call the stored procedure: sp_CalculateAndGenerateBill(IN apt_no, OUT total, OUT inv_no)
        String query = "{CALL sp_CalculateAndGenerateBill(?, ?, ?)}";

        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             CallableStatement stmt = conn.prepareCall(query)) {

            // Set the IN parameter (Appointment Number)
            stmt.setString(1, appointmentNumber);

            // Register the OUT parameters (Total Amount and Invoice Number)
            stmt.registerOutParameter(2, Types.DECIMAL);
            stmt.registerOutParameter(3, Types.VARCHAR);

            // Execute the stored procedure in MySQL
            stmt.execute();

            // Retrieve the output values calculated by the database
            double totalAmount = stmt.getDouble(2);
            invoiceNumber = stmt.getString(3);

            System.out.println("Success! Bill Generated: " + invoiceNumber + " | Total Amount: LKR " + totalAmount);

        } catch (SQLException e) {
            System.err.println("Error generating bill: " + e.getMessage());
        }

        return invoiceNumber;
    }
}