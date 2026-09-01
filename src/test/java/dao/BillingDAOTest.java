package dao;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class BillingDAOTest {

    @Test
    public void testCalculateAndGenerateBill() {
        BillingDAO billingDAO = new BillingDAO();

        // Test with the appointment number we inserted via the seed data script
        String invoiceNumber = billingDAO.generateBill("APT-2026-0001");

        // Assertions to verify the stored procedure worked correctly
        assertNotNull(invoiceNumber, "Invoice number should be generated and not null");
        assertTrue(invoiceNumber.startsWith("INV-"), "Invoice number should start with INV-");
    }
}