package dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {
    // Singleton instance
    private static DatabaseConnection instance;
    private Connection connection;

    // Database configurations
    private static final String URL = "jdbc:mysql://127.0.0.1:3306/sunrise_dental_db";
    private static final String USER = "root";
    private static final String PASSWORD = "root";

    // Private constructor to prevent instantiation from outside
    private DatabaseConnection() {
        try {
            // Load MySQL Driver
            Class.forName("com.mysql.cj.jdbc.Driver");
            // Establish Connection
            this.connection = DriverManager.getConnection(URL, USER, PASSWORD);
        } catch (ClassNotFoundException | SQLException e) {
            System.err.println("Database Connection Failed: " + e.getMessage());
        }
    }

    // Public method to provide access to the singleton instance
    public static DatabaseConnection getInstance() {
        try {
            if (instance == null || instance.getConnection() == null || instance.getConnection().isClosed()) {
                instance = new DatabaseConnection();
            }
        } catch (SQLException e) {
            System.err.println("Error checking connection status: " + e.getMessage());
        }
        return instance;
    }

    // Method to get the actual Connection object
    public Connection getConnection() {
        return connection;
    }
}