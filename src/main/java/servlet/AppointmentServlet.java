package servlet;

import dao.AppointmentDAO;
import model.AppointmentDTO;
import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/appointments")
public class AppointmentServlet extends HttpServlet {

    private AppointmentDAO appointmentDAO = new AppointmentDAO();
    private Gson gson = new Gson();

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");

        // Frontend eken evana data tika AppointmentDTO ekata map kireema
        AppointmentDTO newApt = gson.fromJson(request.getReader(), AppointmentDTO.class);

        boolean isRegistered = appointmentDAO.registerAppointment(newApt);

        if (isRegistered) {
            response.setStatus(HttpServletResponse.SC_CREATED);
            response.getWriter().write("{\"message\": \"Appointment successfully registered\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"Failed to register appointment.\"}");
        }
    }
}