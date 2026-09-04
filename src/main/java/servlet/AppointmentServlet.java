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
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
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

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // Headers tika meketath add karanna
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setContentType("application/json");

        model.AppointmentUpdateDTO updateData = gson.fromJson(request.getReader(), model.AppointmentUpdateDTO.class);

        if (appointmentDAO.updateAppointment(updateData)) {
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("{\"message\": \"Appointment updated\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"Failed to update appointment\"}");
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");

        String action = request.getParameter("action");

        if ("nextNumber".equals(action)) {
            String nextNumber = appointmentDAO.getNextAppointmentNumber();
            response.getWriter().write("{\"nextNumber\": \"" + nextNumber + "\"}");
        } else {
            java.util.List<model.AppointmentDetailsDTO> appointments = appointmentDAO.getAllAppointments();
            response.getWriter().write(gson.toJson(appointments));
        }
    }
}