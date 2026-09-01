package dao;

import org.junit.jupiter.api.Test;
import java.sql.Connection;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class DatabaseConnectionTest {

    @Test
    public void testConnectionIsNotNull() {
        // TDD Step 1: Write the test first
        // We expect the getInstance() method to return a valid DatabaseConnection object
        // and getConnection() to return a valid, open java.sql.Connection.
        Connection conn = DatabaseConnection.getInstance().getConnection();

        // Assert that the connection is successfully established and not null
        assertNotNull(conn, "Database connection should not be null.");
    }
}