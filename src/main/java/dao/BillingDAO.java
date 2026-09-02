package dao;

import model.BillDTO;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Types;

public class BillingDAO {

    public BillDTO generateBill(String aptNumber) {
        BillDTO bill = new BillDTO();
        bill.appointmentNumber = aptNumber;

        String query = "{CALL sp_CalculateAndGenerateBill(?, ?, ?)}";

        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             CallableStatement stmt = conn.prepareCall(query)) {

            stmt.setString(1, aptNumber);

            stmt.registerOutParameter(2, Types.DECIMAL);
            stmt.registerOutParameter(3, Types.VARCHAR);

            stmt.execute();

            // Retrive values and set them to the DTO object to send to frontend
            bill.totalAmount = stmt.getDouble(2);
            bill.invoiceNumber = stmt.getString(3);
            bill.success = true;

        } catch (SQLException e) {
            System.err.println("Billing Error: " + e.getMessage());
            bill.success = false;
            bill.message = e.getMessage();
        }

        return bill;
    }
}