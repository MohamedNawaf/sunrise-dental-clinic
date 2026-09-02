package dao;

import model.BillDTO;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class BillingDAOTest {

    @Test
    public void testCalculateAndGenerateBill() {
        BillingDAO billingDAO = new BillingDAO();

        // Test with the appointment number we inserted via the seed data script
        BillDTO bill = billingDAO.generateBill("APT-2026-0001");

        // Assertions to verify the stored procedure worked correctly
        assertTrue(bill.success, "Bill generation should be successful");
        assertNotNull(bill.invoiceNumber, "Invoice number should be generated and not null");
        assertTrue(bill.invoiceNumber.startsWith("INV-"), "Invoice number should start with INV-");
    }
}