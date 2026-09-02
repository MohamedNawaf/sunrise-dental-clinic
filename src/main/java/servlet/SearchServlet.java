package servlet;

import dao.DatabaseConnection;
import com.google.gson.JsonObject;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@WebServlet("/api/search")
public class SearchServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");

        String aptNo = request.getParameter("aptNo");

        if (aptNo == null || aptNo.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Appointment Number is required\"}");
            return;
        }

        String query = "SELECT * FROM vw_appointment_details WHERE appointment_number = ?";

        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, aptNo);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    JsonObject json = new JsonObject();
                    json.addProperty("patient_name", rs.getString("patient_name"));
                    json.addProperty("patient_contact", rs.getString("patient_contact"));
                    json.addProperty("patient_address", rs.getString("patient_address"));
                    json.addProperty("dentist_name", rs.getString("dentist_name"));
                    json.addProperty("treatment_name", rs.getString("treatment_name"));
                    json.addProperty("appointment_date", rs.getString("appointment_date"));
                    json.addProperty("appointment_time", rs.getString("appointment_time"));
                    json.addProperty("appointment_status", rs.getString("appointment_status"));

                    response.setStatus(HttpServletResponse.SC_OK);
                    response.getWriter().write(json.toString());
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    response.getWriter().write("{\"error\": \"Appointment not found\"}");
                }
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"Database error occurred\"}");
        }
    }
}