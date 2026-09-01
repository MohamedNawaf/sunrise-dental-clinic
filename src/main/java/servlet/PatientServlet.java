package servlet;

import dao.PatientDAO;
import model.Patient;
import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

// Endpoint eka define kireema
@WebServlet("/api/patients")
public class PatientServlet extends HttpServlet {

    private PatientDAO patientDAO = new PatientDAO();
    private Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // Frontend ekata connect wenna CORS enable kireema saha JSON output eka set kireema
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");

        // URL eken patient ID eka ganeema (e.g., ?id=1)
        String idParam = request.getParameter("id");

        if (idParam != null) {
            int patientId = Integer.parseInt(idParam);
            Patient patient = patientDAO.getPatientById(patientId);

            if (patient != null) {
                // Patient object eka JSON walata convert karala frontend ekata yawima
                response.getWriter().write(gson.toJson(patient));
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"error\": \"Patient not found\"}");
            }
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Patient ID is required\"}");
        }
    }
}